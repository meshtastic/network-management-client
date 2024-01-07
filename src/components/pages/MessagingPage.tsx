import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useSelector } from "react-redux";

import ChannelDetailView from "@components/Messaging/ChannelDetailView";
import ChannelListElement from "@components/Messaging/ChannelListElement";
import ConfigLayout from "@components/config/ConfigLayout";

import { selectDeviceChannels } from "@features/device/selectors";
import { AppRoutes } from "@utils/routing";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const MessagingPage = () => {
  const { t } = useTranslation();

  const channels = useSelector(selectDeviceChannels());
  const [activeChannelIdx, setActiveChannelIdx] = useState<number | null>(
    channels[0]?.config.index ?? null,
  );

  const navigateTo = useNavigate();

  return (
    <div className="flex-1">
      <ConfigLayout
        title={t("messaging.title")}
        backtrace={[t("sidebar.messaging")]}
        renderTitleIcon={(c) => <Cog6ToothIcon className={`${c}`} />}
        titleIconTooltip={t("messaging.configureChannels")}
        onTitleIconClick={() => navigateTo(AppRoutes.CONFIGURE_CHANNELS)}
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
          <div className="flex flex-col justify-center align-middle w-full h-full bg-gray-100 dark:bg-gray-700">
            <p className="m-auto text-base font-normal text-gray-700 dark:text-gray-300">
              {t("messaging.noChannelsSelected")}
            </p>
          </div>
        )}
      </ConfigLayout>
    </div>
  );
};

export default MessagingPage;
