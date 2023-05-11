import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Upload } from "lucide-react";

import ConfigLayout from "@components/config/ConfigLayout";
import ConfigOption from "@components/config/ConfigOption";

import BluetoothConfigPage from "@components/config/device/BluetoothConfigPage";
import DeviceConfigPage from "@components/config/device/DeviceConfigPage";
import DisplayConfigPage from "@components/config/device/DisplayConfigPage";
import LoRaConfigPage from "@components/config/device/LoRaConfigPage";
import NetworkConfigPage from "@components/config/device/NetworkConfigPage";
import PositionConfigPage from "@components/config/device/PositionConfigPage";
import PowerConfigPage from "@components/config/device/PowerConfigPage";
// import UserConfigPage from "@components/config/device/UserConfigPage";

import {
  selectCurrentRadioConfig,
  selectEditedRadioConfig,
} from "@features/config/configSelectors";
import { requestCommitConfig } from "@features/config/configActions";
import type { IRadioConfigState } from "@features/config/configSlice";
import type { app_protobufs_LocalConfig } from "@app/bindings";

export const RadioConfigOptions: Record<keyof IRadioConfigState, string> = {
  bluetooth: "Bluetooth",
  device: "Device",
  display: "Display",
  lora: "LoRa",
  network: "Network",
  position: "Position",
  power: "Power",
  // user: "User",
};

const switchActiveDetailView = (
  activeOption: keyof IRadioConfigState | null
) => {
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
    // case "user":
    //   return <UserConfigPage />;
    default:
      return (
        <p className="m-auto text-base font-normal text-gray-700">
          No option selected
        </p>
      );
  }
};

const getNumberOfPendingChanges = (
  currentRadioConfig: app_protobufs_LocalConfig | null,
  editedRadioConfig: IRadioConfigState,
  configKey: keyof IRadioConfigState
): number => {
  if (!currentRadioConfig) return -1;

  return Object.entries(editedRadioConfig?.[configKey] ?? {}).reduce(
    (accum, [editedConfigKey, editedConfigValue]) => {
      if (!editedConfigValue) return accum;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const currentFieldValue =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        (currentRadioConfig as Record<string, any>)?.[configKey]?.[
          editedConfigKey
        ] ?? null;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const editedFieldValue =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    0
  );
};

const RadioConfigPage = () => {
  const dispatch = useDispatch();

  const currentRadioConfig = useSelector(selectCurrentRadioConfig());
  const editedRadioConfig = useSelector(selectEditedRadioConfig());

  const [activeOption, setActiveOption] = useState<
    keyof IRadioConfigState | null
  >(null);

  return (
    <div className="flex-1">
      <ConfigLayout
        title="Radio Config"
        backtrace={["Radio Configuration"]}
        renderTitleIcon={(c) => <Upload className={`${c}`} />}
        titleIconTooltip="Upload config to device"
        onTitleIconClick={() => dispatch(requestCommitConfig(["radio"]))}
        renderOptions={() =>
          Object.entries(RadioConfigOptions).map(([k, displayName]) => {
            // * This is a limitation of Object.entries typing
            const configKey = k as keyof IRadioConfigState;

            const pendingChanges = getNumberOfPendingChanges(
              currentRadioConfig,
              editedRadioConfig,
              configKey
            );

            return (
              <ConfigOption
                key={configKey}
                title={displayName}
                subtitle={`${pendingChanges} pending changes`}
                isActive={activeOption === configKey}
                onClick={() =>
                  setActiveOption(activeOption !== configKey ? configKey : null)
                }
              />
            );
          })
        }
      >
        <div className="flex flex-col justify-center align-middle w-full h-full bg-gray-100">
          {switchActiveDetailView(activeOption)}
        </div>
      </ConfigLayout>
    </div>
  );
};

export default RadioConfigPage;
