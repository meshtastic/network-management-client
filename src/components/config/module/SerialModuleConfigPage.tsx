import React from "react";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import { Save } from "lucide-react";

export interface ISerialModuleConfigPageProps {
  className?: string;
}

const SerialModuleConfigPage = ({
  className = "",
}: ISerialModuleConfigPageProps) => {
  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"SerialModule Configuration"}
        subtitle={"Configure SerialModule"}
        renderIcon={(c) => <Save className={c} />}
        buttonTooltipText="Stage changes for upload"
        onIconClick={() => alert("This feature is not complete.")}
      >
        Serial module
      </ConfigTitlebar>
    </div>
  );
};

export default SerialModuleConfigPage;
