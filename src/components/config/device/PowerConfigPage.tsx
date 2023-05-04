import React from "react";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import { PencilIcon } from "@heroicons/react/24/outline";

export interface IPowerConfigPageProps {
  className?: string;
}

const PowerConfigPage = ({ className = "" }: IPowerConfigPageProps) => {
  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"Power Configuration"}
        subtitle={"Configure device power settings"}
        renderIcon={(c) => <PencilIcon className={c} />}
        onIconClick={() => alert("incomplete feature")}
      >
        Power
      </ConfigTitlebar>
    </div>
  );
};

export default PowerConfigPage;
