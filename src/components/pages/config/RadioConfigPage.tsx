import React, { useState } from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

import ConfigLayout from "@components/config/ConfigLayout";
import ConfigOption from "@components/config/ConfigOption";

export const RadioConfigOptions: { name: string; hash: string }[] = [
  { name: "User Configuration", hash: "user" },
  { name: "Device Configuration", hash: "device" },
  { name: "Power Configuration", hash: "power" },
  { name: "Network Configuration", hash: "network" },
  { name: "Display Configuration", hash: "display" },
  { name: "LoRa Configuration", hash: "lora" },
  { name: "Bluetooth Configuration", hash: "bluetooth" },
];

const RadioConfigPage = () => {
  const [activeOption, setActiveOption] = useState<string | null>(null);

  return (
    <div className="flex-1">
      <ConfigLayout
        title="Radio Config"
        backtrace={["Radio Configuration"]}
        renderTitleIcon={(c) => <QuestionMarkCircleIcon className={`${c}`} />}
        onTitleIconClick={() =>
          console.warn("Radio configuration title icon onClick not implemented")
        }
        renderOptions={() =>
          RadioConfigOptions.map(({ name, hash }) => (
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

export default RadioConfigPage;
