import React from "react";

import type { app_device_MeshChannel } from "@bindings/index";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import { PencilIcon } from "@heroicons/react/24/outline";
import { getChannelName } from "@app/utils/messaging";

export interface IChannelConfigDetailProps {
  channel: app_device_MeshChannel;
  className?: string;
}

const ChannelConfigDetail = ({
  channel,
  className = "",
}: IChannelConfigDetailProps) => {
  const channelName = getChannelName(channel);

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"Channel Configuration"}
        subtitle={`Configure channel "${channelName}"`}
        renderIcon={(c) => <PencilIcon className={c} />}
        onIconClick={() => alert("incomplete feature")}
      >
        Channel {channel.config.index}
      </ConfigTitlebar>
    </div>
  );
};

export default ChannelConfigDetail;
