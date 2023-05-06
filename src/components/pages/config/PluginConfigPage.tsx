import React, { useState } from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

import ConfigLayout from "@components/config/ConfigLayout";
import ConfigOption from "@components/config/ConfigOption";

import AudioConfigPage from "@components/config/module/AudioConfigPage";
import CannedMessageConfigPage from "@components/config/module/CannedMessageConfigPage";
import ExternalNotificationConfigPage from "@components/config/module/ExternalNotificationConfigPage";
import MQTTConfigPage from "@components/config/module/MQTTConfigPage";
import RangeTestConfigPage from "@components/config/module/RangeTestConfigPage";
import SerialModuleConfigPage from "@components/config/module/SerialModuleConfigPage";
import TelemetryConfigPage from "@components/config/module/TelemetryConfigPage";
import TracerouteConfigPage from "@components/config/module/TracerouteConfigPage";

export const PluginConfigOptions: { name: string; hash: string }[] = [
  // { name: "Audio", hash: "audio" },
  // { name: "Canned Message", hash: "canned_message" },
  // {
  //   name: "External Notification",
  //   hash: "external_notification",
  // },
  { name: "MQTT", hash: "mqtt" },
  { name: "Range Test", hash: "range_test" },
  { name: "Serial Module", hash: "serial_module" },
  { name: "Store and Forward", hash: "store_and_forward" },
  { name: "Telemetry", hash: "telemetry" },

  // * This wouldn't make sense, no config options
  // { name: "Traceroute", hash: "traceroute" },
];

const switchActiveDetailView = (activeOption: string | null) => {
  switch (activeOption) {
    case "audio":
      return <AudioConfigPage />;
    case "canned_message":
      return <CannedMessageConfigPage />;
    case "external_notification":
      return <ExternalNotificationConfigPage />;
    case "mqtt":
      return <MQTTConfigPage />;
    case "range_test":
      return <RangeTestConfigPage />;
    case "serial_module":
      return <SerialModuleConfigPage />;
    case "telemetry":
      return <TelemetryConfigPage />;
    case "traceroute":
      return <TracerouteConfigPage />;
    default:
      return (
        <p className="m-auto text-base font-normal text-gray-700">
          No option selected
        </p>
      );
  }
};

const PluginConfigPage = () => {
  const [activeOption, setActiveOption] = useState<string | null>(null);

  return (
    <div className="flex-1">
      <ConfigLayout
        title="Plugin Config"
        backtrace={["Plugin Configuration"]}
        renderTitleIcon={(c) => <QuestionMarkCircleIcon className={`${c}`} />}
        onTitleIconClick={() =>
          console.warn(
            "Plugin configuration title icon onClick not implemented"
          )
        }
        renderOptions={() =>
          PluginConfigOptions.map(({ name, hash }) => (
            <ConfigOption
              key={hash}
              title={name}
              subtitle="0 unsaved changes"
              isActive={activeOption === hash}
              onClick={() =>
                setActiveOption(activeOption !== hash ? hash : null)
              }
            />
          ))
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
