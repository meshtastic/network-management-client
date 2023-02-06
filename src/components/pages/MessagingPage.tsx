import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

import NavigationBacktrace from "@components/NavigationBacktrace";
import ChannelListElement from "@components/Messaging/ChannelListElement";
import ChannelDetailView from "@components/Messaging/ChannelDetailView";

import { selectDeviceChannels } from "@features/device/deviceSelectors";

const MessagingPage = () => {
  const channels = useSelector(selectDeviceChannels());
  const [activeChannelIdx, setActiveChannelIdx] = useState<number | null>(null);

  return (
    <div className="flex flex-row w-full h-screen">
      <div className="flex flex-col w-96 shadow-lg">
        <div className="flex justify-center align-middle px-9 h-20 border-b border-gray-100">
          <NavigationBacktrace
            className="my-auto mr-auto"
            levels={["Messaging"]}
          />
        </div>

        <div className="flex flex-col flex-1 px-9 py-6">
          <div className="flex flex-row justify-between align-middle mb-6">
            <h1 className="text-4xl leading-10 font-semibold text-gray-700">
              Messaging
            </h1>
            <button
              type="button"
              className="cursor-pointer"
              onClick={() => alert("not implemented")}
            >
              <Cog6ToothIcon className="w-6 h-6 text-gray-400 my-auto" />
            </button>
          </div>

          <div className="flex flex-col flex-1 gap-3">
            {channels
              .filter((c) => c.config.role !== 0) // * ignore DISABLED role
              .map((c) => (
                <ChannelListElement
                  key={c.config.index}
                  setActiveChannel={setActiveChannelIdx}
                  channel={c}
                  isSelected={c.config.index === activeChannelIdx}
                />
              ))}
          </div>
        </div>
      </div>

      <div className="flex-1">
        {activeChannelIdx != null && !!channels[activeChannelIdx] ? (
          <ChannelDetailView channel={channels[activeChannelIdx]} />
        ) : (
          <div className="flex flex-col justify-center align-middle w-full h-full bg-gray-100">
            <p className="m-auto text-base font-normal text-gray-700">
              No channels selected
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingPage;
