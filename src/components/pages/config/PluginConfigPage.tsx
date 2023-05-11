import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Upload } from "lucide-react";

import type { app_protobufs_LocalModuleConfig } from "@app/bindings";

import ConfigLayout from "@components/config/ConfigLayout";
import ConfigOption from "@components/config/ConfigOption";

// import AudioConfigPage from "@components/config/module/AudioConfigPage";
import CannedMessageConfigPage from "@components/config/module/CannedMessageConfigPage";
import ExternalNotificationConfigPage from "@components/config/module/ExternalNotificationConfigPage";
import MQTTConfigPage from "@components/config/module/MQTTConfigPage";
import RangeTestConfigPage from "@components/config/module/RangeTestConfigPage";
import RemoteHardwareConfigPage from "@components/config/module/RemoteHardwareConfigPage";
import SerialModuleConfigPage from "@components/config/module/SerialModuleConfigPage";
import StoreAndForwardConfigPage from "@components/config/module/StoreAndForwardConfigPage";
import TelemetryConfigPage from "@components/config/module/TelemetryConfigPage";

import { requestCommitConfig } from "@features/config/configActions";
import type { IModuleConfigState } from "@features/config/configSlice";
import {
  selectCurrentModuleConfig,
  selectEditedModuleConfig,
} from "@features/config/configSelectors";

export const PluginConfigOptions: Record<keyof IModuleConfigState, string> = {
  // audio: "Audio",
  cannedMessage: "Canned Message",
  externalNotification: "External Notification",
  mqtt: "MQTT",
  rangeTest: "Range Test",
  remoteHardware: "Remote Hardware",
  serial: "Serial Module",
  storeForward: "Store and Forward",
  telemetry: "Telemetry",
};

const switchActiveDetailView = (
  activeOption: keyof IModuleConfigState | null
) => {
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
          No option selected
        </p>
      );
  }
};

const getNumberOfPendingChanges = (
  currentModuleConfig: app_protobufs_LocalModuleConfig | null,
  editedModuleConfig: IModuleConfigState,
  configKey: keyof IModuleConfigState
): number => {
  if (!currentModuleConfig) return -1;

  return Object.entries(editedModuleConfig?.[configKey] ?? {}).reduce(
    (accum, [editedConfigKey, editedConfigValue]) => {
      if (!editedConfigValue) return accum;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const currentFieldValue =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        (currentModuleConfig as Record<string, any>)?.[configKey]?.[
          editedConfigKey
        ] ?? null;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const editedFieldValue =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    0
  );
};

const PluginConfigPage = () => {
  const dispatch = useDispatch();

  const currentModuleConfig = useSelector(selectCurrentModuleConfig());
  const editedModuleConfig = useSelector(selectEditedModuleConfig());

  const [activeOption, setActiveOption] = useState<
    keyof IModuleConfigState | null
  >(null);

  return (
    <div className="flex-1">
      <ConfigLayout
        title="Module Config"
        backtrace={["Module Configuration"]}
        renderTitleIcon={(c) => <Upload className={`${c}`} />}
        titleIconTooltip="Upload config to device"
        onTitleIconClick={() => dispatch(requestCommitConfig(["module"]))}
        renderOptions={() =>
          Object.entries(PluginConfigOptions).map(([k, displayName]) => {
            // * This is a limitation of Object.entries typing
            const configKey = k as keyof IModuleConfigState;

            const pendingChanges = getNumberOfPendingChanges(
              currentModuleConfig,
              editedModuleConfig,
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

export default PluginConfigPage;
