import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

import ConfigLayout from "@components/config/ConfigLayout";
import ChannelDetailView from "@components/Messaging/ChannelDetailView";
import ChannelListElement from "@components/Messaging/ChannelListElement";

import { selectDeviceChannels } from "@features/device/deviceSelectors";

const MessagingPage = () => {
  const channels = useSelector(selectDeviceChannels());
  const [activeChannelIdx, setActiveChannelIdx] = useState<number | null>(null);

  return (
    <div className="flex-1">
      <ConfigLayout
        title="Messaging"
        backtrace={["Messaging"]}
        renderTitleIcon={(c) => <Cog6ToothIcon className={`${c}`} />}
        onTitleIconClick={() =>
          console.warn("Messaging title icon onClick not implemented")
        }
        renderOptions={() =>
          channels
            .filter((c) => c.config.role !== 0) // * ignore DISABLED role
            .map((c) => (
              <ChannelListElement
                key={c.config.index}
                setActiveChannel={setActiveChannelIdx}
                channel={c}
                isSelected={c.config.index === activeChannelIdx}
              />
            ))
        }
      >
        {activeChannelIdx != null && !!channels[activeChannelIdx] ? (
          <ChannelDetailView channel={channels[activeChannelIdx]} />
        ) : (
          <div className="flex flex-col justify-center align-middle w-full h-full bg-gray-100">
            <p className="m-auto text-base font-normal text-gray-700">
              No channels selected
            </p>
          </div>
        )}
      </ConfigLayout>
    </div>
  );
};

export default MessagingPage;
