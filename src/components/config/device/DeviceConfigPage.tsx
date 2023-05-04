import React from "react";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import { PencilIcon } from "@heroicons/react/24/outline";

export interface IDeviceConfigPageProps {
  className?: string;
}

const DeviceConfigPage = ({ className = "" }: IDeviceConfigPageProps) => {
  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"Device Configuration"}
        subtitle={"Configure device"}
        renderIcon={(c) => <PencilIcon className={c} />}
        onIconClick={() => alert("incomplete feature")}
      >
        Device
      </ConfigTitlebar>
    </div>
  );
};

export default DeviceConfigPage;
