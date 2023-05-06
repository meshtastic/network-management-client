import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Upload } from "lucide-react";

import type { app_device_MeshChannel } from "@bindings/index";

import ConfigLayout from "@components/config/ConfigLayout";
import ConfigOption from "@components/config/ConfigOption";
import ChannelConfigDetail from "@components/config/channel/ChannelConfigDetail";

import { selectDeviceChannels } from "@features/device/deviceSelectors";
import { getChannelName } from "@utils/messaging";

const ChannelConfigPage = () => {
  const channels = useSelector(selectDeviceChannels());
  const [activeChannel, setActiveChannel] =
    useState<app_device_MeshChannel | null>(null);

  return (
    <div className="flex-1">
      <ConfigLayout
        title="Channel Config"
        backtrace={["Channel Configuration"]}
        renderTitleIcon={(c) => <Upload className={`${c}`} />}
        titleIconTooltip="Upload config to device"
        onTitleIconClick={() =>
          console.warn(
            "Channel configuration title icon onClick not implemented"
          )
        }
        renderOptions={() =>
          channels.map((c) => (
            <ConfigOption
              key={c.config.index}
              title={getChannelName(c) || `Channel ${c.config.index}`}
              subtitle="0 unsaved changes"
              isActive={activeChannel?.config.index === c.config.index}
              onClick={() =>
                setActiveChannel(
                  activeChannel?.config.index !== c.config.index ? c : null
                )
              }
            />
          ))
        }
      >
        {activeChannel ? (
          <ChannelConfigDetail channel={activeChannel} />
        ) : (
          <div className="flex flex-col justify-center align-middle w-full h-full bg-gray-100">
            <p className="m-auto text-base font-normal text-gray-700"></p>
          </div>
        )}
      </ConfigLayout>
    </div>
  );
};

export default ChannelConfigPage;
