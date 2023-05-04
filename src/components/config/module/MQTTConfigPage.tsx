import React from "react";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import { PencilIcon } from "@heroicons/react/24/outline";

export interface IMQTTConfigPageProps {
  className?: string;
}

const MQTTConfigPage = ({ className = "" }: IMQTTConfigPageProps) => {
  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"MQTT Configuration"}
        subtitle={"Configure MQTT"}
        renderIcon={(c) => <PencilIcon className={c} />}
        onIconClick={() => alert("incomplete feature")}
      >
        MQTT
      </ConfigTitlebar>
    </div>
  );
};

export default MQTTConfigPage;
