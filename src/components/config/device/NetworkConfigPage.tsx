import React from "react";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import { PencilIcon } from "@heroicons/react/24/outline";

export interface INetworkConfigPageProps {
  className?: string;
}

const NetworkConfigPage = ({ className = "" }: INetworkConfigPageProps) => {
  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"Network Configuration"}
        subtitle={"Configure device network connection"}
        renderIcon={(c) => <PencilIcon className={c} />}
        onIconClick={() => alert("incomplete feature")}
      >
        Network
      </ConfigTitlebar>
    </div>
  );
};

export default NetworkConfigPage;
