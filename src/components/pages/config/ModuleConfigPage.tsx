import { Upload } from "lucide-react";
import { useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import type { meshtastic_protobufs_LocalModuleConfig } from "@app/bindings";
import { i18next } from "@app/i18n";

import { ConfigLayout } from "@components/config/ConfigLayout";
import { ConfigOption } from "@components/config/ConfigOption";

// import { AudioConfigPage } from "@components/config/module/AudioConfigPage";
import { CannedMessageConfigPage } from "@components/config/module/CannedMessageConfigPage";
import { ExternalNotificationConfigPage } from "@components/config/module/ExternalNotificationConfigPage";
import { MQTTConfigPage } from "@components/config/module/MQTTConfigPage";
import { RangeTestConfigPage } from "@components/config/module/RangeTestConfigPage";
import { RemoteHardwareConfigPage } from "@components/config/module/RemoteHardwareConfigPage";
import { SerialModuleConfigPage } from "@components/config/module/SerialModuleConfigPage";
import { StoreAndForwardConfigPage } from "@components/config/module/StoreAndForwardConfigPage";
import { TelemetryConfigPage } from "@components/config/module/TelemetryConfigPage";

import { requestCommitConfig } from "@features/config/actions";
import {
  selectCurrentModuleConfig,
  selectEditedModuleConfig,
} from "@features/config/selectors";
import type { IModuleConfigState } from "@features/config/slice";

export const ModuleConfigOptions: Record<keyof IModuleConfigState, string> = {
  // audio: i18next.t('config.module.options.audio'),
  cannedMessage: i18next.t("config.module.options.cannedMessage"),
  externalNotification: i18next.t("config.module.options.externalNotification"),
  mqtt: i18next.t("config.module.options.mqtt"),
  rangeTest: i18next.t("config.module.options.rangeTest"),
  remoteHardware: i18next.t("config.module.options.remoteHardware"),
  serial: i18next.t("config.module.options.serial"),
  storeForward: i18next.t("config.module.options.storeAndForward"),
  telemetry: i18next.t("config.module.options.telemetry"),
};

const _ActiveDetailView = ({
  activeOption,
}: {
  activeOption: keyof IModuleConfigState;
}) => {
  const { t } = useTranslation();

  switch (activeOption) {
    // case "audio":
    //   return <AudioConfigPage />;
    case "cannedMessage":
      return <CannedMessageConfigPage />;
    case "externalNotification":
      return <ExternalNotificationConfigPage />;
    case "mqtt":
      return <MQTTConfigPage />;
    case "rangeTest":
      return <RangeTestConfigPage />;
    case "remoteHardware":
      return <RemoteHardwareConfigPage />;
    case "serial":
      return <SerialModuleConfigPage />;
    case "storeForward":
      return <StoreAndForwardConfigPage />;
    case "telemetry":
      return <TelemetryConfigPage />;
    default:
      return (
        <p className="m-auto text-base font-normal text-gray-700">
          {t("config.unknownOption")}
        </p>
      );
  }
};

const getNumberOfPendingChanges = (
  currentModuleConfig: meshtastic_protobufs_LocalModuleConfig | null,
  editedModuleConfig: IModuleConfigState,
  configKey: keyof IModuleConfigState,
): number => {
  if (!currentModuleConfig) return -1;

  return Object.entries(editedModuleConfig?.[configKey] ?? {}).reduce(
    (accum, [editedConfigKey, editedConfigValue]) => {
      if (editedConfigValue === undefined) return accum; // ! Need to allow falsy values

      const currentFieldValue =
        (currentModuleConfig as Record<string, any>)?.[configKey]?.[
          editedConfigKey
        ] ?? null;

      const editedFieldValue =
        (editedModuleConfig?.[configKey] as Record<string, any>)?.[
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

export const ModuleConfigPage = () => {
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const currentModuleConfig = useSelector(selectCurrentModuleConfig());
  const editedModuleConfig = useSelector(selectEditedModuleConfig());

  const { configKey } = useParams();

  const [activeOption, setActiveOption] =
    useState<keyof IModuleConfigState>("cannedMessage");

  useLayoutEffect(() => {
    if (!configKey) return;
    setActiveOption(configKey as keyof IModuleConfigState);
  }, [configKey]);

  return (
    <div className="flex-1">
      <ConfigLayout
        title={t("config.module.title")}
        backtrace={[t("sidebar.configureModules")]}
        renderTitleIcon={(c) => <Upload strokeWidth={1.5} className={`${c}`} />}
        titleIconTooltip={t("config.uploadChanges")}
        onTitleIconClick={() => dispatch(requestCommitConfig(["module"]))}
        renderOptions={() =>
          Object.entries(ModuleConfigOptions).map(([k, displayName]) => {
            // * This is a limitation of Object.entries typing
            const configKey = k as keyof IModuleConfigState;

            const pendingChanges = getNumberOfPendingChanges(
              currentModuleConfig,
              editedModuleConfig,
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
