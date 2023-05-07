import React, { useState } from "react";
import { Upload } from "lucide-react";

import ConfigLayout from "@components/config/ConfigLayout";
import ConfigOption from "@components/config/ConfigOption";

import AudioConfigPage from "@components/config/module/AudioConfigPage";
import CannedMessageConfigPage from "@components/config/module/CannedMessageConfigPage";
import ExternalNotificationConfigPage from "@components/config/module/ExternalNotificationConfigPage";
import MQTTConfigPage from "@components/config/module/MQTTConfigPage";
import RangeTestConfigPage from "@components/config/module/RangeTestConfigPage";
import SerialModuleConfigPage from "@components/config/module/SerialModuleConfigPage";
import TelemetryConfigPage from "@components/config/module/TelemetryConfigPage";
// import TracerouteConfigPage from "@components/config/module/TracerouteConfigPage";

import type { IModuleConfigState } from "@features/config/configSlice";

export const PluginConfigOptions: Record<keyof IModuleConfigState, string> = {
  audio: "Audio",
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
    case "audio":
      return <AudioConfigPage />;
    case "cannedMessage":
      return <CannedMessageConfigPage />;
    case "externalNotification":
      return <ExternalNotificationConfigPage />;
    case "mqtt":
      return <MQTTConfigPage />;
    case "rangeTest":
      return <RangeTestConfigPage />;
    case "serial":
      return <SerialModuleConfigPage />;
    case "telemetry":
      return <TelemetryConfigPage />;
    // case "traceroute":
    //   return <TracerouteConfigPage />;
    default:
      return (
        <p className="m-auto text-base font-normal text-gray-700">
          No option selected
        </p>
      );
  }
};

const PluginConfigPage = () => {
  const [activeOption, setActiveOption] = useState<
    keyof IModuleConfigState | null
  >(null);

  return (
    <div className="flex-1">
      <ConfigLayout
        title="Plugin Config"
        backtrace={["Plugin Configuration"]}
        renderTitleIcon={(c) => <Upload className={`${c}`} />}
        titleIconTooltip="Upload config to device"
        onTitleIconClick={() =>
          console.warn(
            "Plugin configuration title icon onClick not implemented"
          )
        }
        renderOptions={() =>
          Object.entries(PluginConfigOptions).map(([k, displayName]) => {
            // * This is a limitation of Object.entries typing
            const configKey = k as keyof IModuleConfigState;

            return (
              <ConfigOption
                key={configKey}
                title={displayName}
                subtitle="0 unsaved changes"
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
