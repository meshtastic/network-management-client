import React, { useState } from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

import ConfigLayout from "@components/config/ConfigLayout";
import ConfigOption from "@components/config/ConfigOption";

import UserConfigPage from "@components/config/device/UserConfigPage";
import DeviceConfigPage from "@components/config/device/DeviceConfigPage";
import NetworkConfigPage from "@components/config/device/NetworkConfigPage";
import PowerConfigPage from "@components/config/device/PowerConfigPage";
import DisplayConfigPage from "@components/config/device/DisplayConfigPage";
import LoRaConfigPage from "@components/config/device/LoRaConfigPage";
import BluetoothConfigPage from "@components/config/device/BluetoothConfigPage";

export const RadioConfigOptions: { name: string; hash: string }[] = [
  { name: "User", hash: "user" },
  { name: "Device", hash: "device" },
  { name: "Power", hash: "power" },
  { name: "Network", hash: "network" },
  { name: "Display", hash: "display" },
  { name: "LoRa", hash: "lora" },
  { name: "Bluetooth", hash: "bluetooth" },
];

const switchActiveDetailView = (activeOption: string | null) => {
  switch (activeOption) {
    case "user":
      return <UserConfigPage />;
    case "device":
      return <DeviceConfigPage />;
    case "power":
      return <PowerConfigPage />;
    case "network":
      return <NetworkConfigPage />;
    case "display":
      return <DisplayConfigPage />;
    case "lora":
      return <LoRaConfigPage />;
    case "bluetooth":
      return <BluetoothConfigPage />;
    default:
      return (
        <p className="m-auto text-base font-normal text-gray-700">
          No option selected
        </p>
      );
  }
};

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
          {switchActiveDetailView(activeOption)}
        </div>
      </ConfigLayout>
    </div>
  );
};

export default RadioConfigPage;
