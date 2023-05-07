import React from "react";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import { Save } from "lucide-react";

export interface IMQTTConfigPageProps {
  className?: string;
}

const MQTTConfigPage = ({ className = "" }: IMQTTConfigPageProps) => {
  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"MQTT Configuration"}
        subtitle={"Configure MQTT"}
        renderIcon={(c) => <Save className={c} />}
        buttonTooltipText="Stage changes for upload"
        onIconClick={() => alert("This feature is not complete.")}
      >
        MQTT
      </ConfigTitlebar>
    </div>
  );
};

export default MQTTConfigPage;
