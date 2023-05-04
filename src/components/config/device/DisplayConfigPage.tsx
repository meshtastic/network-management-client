import React from "react";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import { PencilIcon } from "@heroicons/react/24/outline";

export interface IDisplayConfigPageProps {
  className?: string;
}

const DisplayConfigPage = ({ className = "" }: IDisplayConfigPageProps) => {
  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"Display Configuration"}
        subtitle={"Configure device display"}
        renderIcon={(c) => <PencilIcon className={c} />}
        onIconClick={() => alert("incomplete feature")}
      >
        Display
      </ConfigTitlebar>
    </div>
  );
};

export default DisplayConfigPage;
