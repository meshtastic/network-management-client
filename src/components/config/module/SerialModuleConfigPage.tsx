import React from "react";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import { PencilIcon } from "@heroicons/react/24/outline";

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
        renderIcon={(c) => <PencilIcon className={c} />}
        onIconClick={() => alert("incomplete feature")}
      >
        Serial module
      </ConfigTitlebar>
    </div>
  );
};

export default SerialModuleConfigPage;
