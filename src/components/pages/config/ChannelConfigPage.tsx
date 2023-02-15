import React, { useState } from "react";
import { useSelector } from "react-redux";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

import ConfigLayout from "@components/config/ConfigLayout";
import ConfigOption from "@components/config/ConfigOption";

import { selectDeviceChannels } from "@features/device/deviceSelectors";
import { getChannelName } from "@utils/messaging";

const ChannelConfigPage = () => {
  const channels = useSelector(selectDeviceChannels());
  const [activeChannel, setActiveChannel] = useState<number | null>(null);

  return (
    <div className="flex-1">
      <ConfigLayout
        title="Channel Config"
        backtrace={["Channel Configuration"]}
        renderTitleIcon={(c) => <QuestionMarkCircleIcon className={`${c}`} />}
        onTitleIconClick={() =>
          console.warn(
            "Channel configuration title icon onClick not implemented"
          )
        }
        renderOptions={() =>
          channels
            .filter((c) => c.config.role !== 0) // * ignore DISABLED role
            .map((c) => (
              <ConfigOption
                key={c.config.index}
                title={getChannelName(c)}
                subtitle="0 unsaved changes"
                isActive={activeChannel === c.config.index}
                onClick={() =>
                  setActiveChannel(
                    activeChannel !== c.config.index ? c.config.index : null
                  )
                }
              />
            ))
        }
      >
        <div className="flex flex-col justify-center align-middle w-full h-full bg-gray-100">
          <p className="m-auto text-base font-normal text-gray-700">
            {activeChannel != null
              ? `Channel ${activeChannel} selected`
              : "No channel selected"}
          </p>
        </div>
      </ConfigLayout>
    </div>
  );
};

export default ChannelConfigPage;
