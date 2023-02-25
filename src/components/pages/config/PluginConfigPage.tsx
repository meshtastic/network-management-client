import React, { useState } from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

import ConfigLayout from "@components/config/ConfigLayout";
import ConfigOption from "@components/config/ConfigOption";

export const PluginConfigOptions: { name: string; hash: string }[] = [
  { name: "Audio Configuration", hash: "audio" },
  { name: "Canned Message Configuration", hash: "canned_message" },
  {
    name: "External Notification Configuration",
    hash: "external_notification",
  },
  { name: "MQTT Configuration", hash: "mqtt" },
  { name: "Range Test Configuration", hash: "range_test" },
  { name: "Serial Module Configuration", hash: "serial_module" },
  { name: "Telemetry Configuration", hash: "telemetry" },
  { name: "Traceroute Configuration", hash: "traceroute" },
];

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
          <p className="m-auto text-base font-normal text-gray-700">
            {activeOption
              ? `Option "${activeOption}" selected`
              : "No option selected"}
          </p>
        </div>
      </ConfigLayout>
    </div>
  );
};

export default PluginConfigPage;
