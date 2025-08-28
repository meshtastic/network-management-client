import { Upload } from "lucide-react";
import { useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import type { meshtastic_protobufs_LocalConfig } from "@app/bindings";
import { i18next } from "@app/i18n";

import { ConfigLayout } from "@components/config/ConfigLayout";
import { ConfigOption } from "@components/config/ConfigOption";

import { BluetoothConfigPage } from "@components/config/device/BluetoothConfigPage";
import { DeviceConfigPage } from "@components/config/device/DeviceConfigPage";
import { DisplayConfigPage } from "@components/config/device/DisplayConfigPage";
import { LoRaConfigPage } from "@components/config/device/LoRaConfigPage";
import { NetworkConfigPage } from "@components/config/device/NetworkConfigPage";
import { PositionConfigPage } from "@components/config/device/PositionConfigPage";
import { PowerConfigPage } from "@components/config/device/PowerConfigPage";

import { useConfigApi } from "@features/config/api";
import {
  selectCurrentRadioConfig,
  selectEditedRadioConfig,
} from "@features/config/selectors";
import type { IRadioConfigState } from "@features/config/slice";

export const RadioConfigOptions: Record<keyof IRadioConfigState, string> = {
  bluetooth: i18next.t("config.radio.options.bluetooth"),
  device: i18next.t("config.radio.options.device"),
  display: i18next.t("config.radio.options.display"),
  lora: i18next.t("config.radio.options.lora"),
  network: i18next.t("config.radio.options.network"),
  position: i18next.t("config.radio.options.position"),
  power: i18next.t("config.radio.options.power"),
};

const _ActiveDetailView = ({
  activeOption,
}: {
  activeOption: keyof IRadioConfigState;
}) => {
  const { t } = useTranslation();

  switch (activeOption) {
    case "bluetooth":
      return <BluetoothConfigPage />;
    case "device":
      return <DeviceConfigPage />;
    case "display":
      return <DisplayConfigPage />;
    case "lora":
      return <LoRaConfigPage />;
    case "network":
      return <NetworkConfigPage />;
    case "position":
      return <PositionConfigPage />;
    case "power":
      return <PowerConfigPage />;
    default:
      return (
        <p className="m-auto text-base font-normal text-gray-700">
          {t("config.unknownOption")}
        </p>
      );
  }
};

const getNumberOfPendingChanges = (
  currentRadioConfig: meshtastic_protobufs_LocalConfig | null,
  editedRadioConfig: IRadioConfigState,
  configKey: keyof IRadioConfigState,
): number => {
  if (!currentRadioConfig) return -1;

  return Object.entries(editedRadioConfig?.[configKey] ?? {}).reduce(
    (accum, [editedConfigKey, editedConfigValue]) => {
      if (editedConfigValue === undefined) return accum; // ! Need to allow falsy values

      const currentFieldValue =
        // biome-ignore lint/suspicious/noExplicitAny: Need any for getting current config
        (currentRadioConfig as Record<string, any>)?.[configKey]?.[
          editedConfigKey
        ] ?? null;

      const editedFieldValue =
        // biome-ignore lint/suspicious/noExplicitAny: Need any for getting current config
        (editedRadioConfig?.[configKey] as Record<string, any>)?.[
          editedConfigKey
        ] ?? null;

      if (
        // Need [] === [] to be true
        JSON.stringify(currentFieldValue) !== JSON.stringify(editedFieldValue)
      ) {
        return accum + 1;
      }

      return accum;
    },
    0,
  );
};

export const RadioConfigPage = () => {
  const { t } = useTranslation();

  useDispatch();

  const currentRadioConfig = useSelector(selectCurrentRadioConfig());
  const editedRadioConfig = useSelector(selectEditedRadioConfig());

  const configApi = useConfigApi();

  const { configKey } = useParams();

  const [activeOption, setActiveOption] =
    useState<keyof IRadioConfigState>("bluetooth");

  useLayoutEffect(() => {
    if (!configKey) return;
    setActiveOption(configKey as keyof IRadioConfigState);
  }, [configKey]);

  return (
    <div className="flex-1">
      <ConfigLayout
        title={t("config.radio.title")}
        backtrace={[t("sidebar.configureRadio")]}
        renderTitleIcon={(c) => <Upload strokeWidth={1.5} className={`${c}`} />}
        titleIconTooltip={t("config.uploadChanges")}
        onTitleIconClick={() => configApi.commitConfig(["radio"])}
        renderOptions={() =>
          Object.entries(RadioConfigOptions).map(([k, displayName]) => {
            // * This is a limitation of Object.entries typing
            const configKey = k as keyof IRadioConfigState;

            const pendingChanges = getNumberOfPendingChanges(
              currentRadioConfig,
              editedRadioConfig,
              configKey,
            );

            return (
              <ConfigOption
                key={configKey}
                title={displayName}
                subtitle={t("config.numPendingChanges", {
                  numChanges: pendingChanges,
                })}
                isActive={activeOption === configKey}
                onClick={() => setActiveOption(configKey)}
              />
            );
          })
        }
      >
        <div className="flex flex-col justify-center align-middle w-full h-full bg-gray-100">
          <_ActiveDetailView activeOption={activeOption} />
        </div>
      </ConfigLayout>
    </div>
  );
};
