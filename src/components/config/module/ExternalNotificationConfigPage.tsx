import React from "react";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import { Save } from "lucide-react";

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
        renderIcon={(c) => <Save className={c} />}
        buttonTooltipText="Stage changes for upload"
        onIconClick={() => alert("This feature is not complete.")}
      >
        External notification
      </ConfigTitlebar>
    </div>
  );
};

export default ExternalNotificationConfigPage;
