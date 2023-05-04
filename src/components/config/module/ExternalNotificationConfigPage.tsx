import React from "react";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import { PencilIcon } from "@heroicons/react/24/outline";

export interface IExternalNotificationConfigPageProps {
  className?: string;
}

const ExternalNotificationConfigPage = ({
  className = "",
}: IExternalNotificationConfigPageProps) => {
  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"ExternalNotification Configuration"}
        subtitle={"Configure ExternalNotification"}
        renderIcon={(c) => <PencilIcon className={c} />}
        onIconClick={() => alert("incomplete feature")}
      >
        External notification
      </ConfigTitlebar>
    </div>
  );
};

export default ExternalNotificationConfigPage;
