import React, { useState } from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

import ConfigLayout from "@components/config/ConfigLayout";
import ConfigOption from "@components/config/ConfigOption";

import BluetoothConfigPage from "@components/config/device/BluetoothConfigPage";
import DeviceConfigPage from "@components/config/device/DeviceConfigPage";
import DisplayConfigPage from "@components/config/device/DisplayConfigPage";
import LoRaConfigPage from "@components/config/device/LoRaConfigPage";
import NetworkConfigPage from "@components/config/device/NetworkConfigPage";
import PositionConfigPage from "@components/config/device/PositionConfigPage";
import PowerConfigPage from "@components/config/device/PowerConfigPage";
import UserConfigPage from "@components/config/device/UserConfigPage";

export const RadioConfigOptions: { name: string; hash: string }[] = [
  { name: "Bluetooth", hash: "bluetooth" },
  { name: "Device", hash: "device" },
  { name: "Display", hash: "display" },
  { name: "LoRa", hash: "lora" },
  { name: "Network", hash: "network" },
  { name: "Position", hash: "position" },
  { name: "Power", hash: "power" },
  { name: "User", hash: "user" },
];

const switchActiveDetailView = (activeOption: string | null) => {
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
    case "user":
      return <UserConfigPage />;
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
