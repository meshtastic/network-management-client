import React from "react";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import { PencilIcon } from "@heroicons/react/24/outline";

export interface IBluetoothConfigPageProps {
  className?: string;
}

const BluetoothConfigPage = ({ className = "" }: IBluetoothConfigPageProps) => {
  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"Bluetooth Configuration"}
        subtitle={"Configure device bluetooth connection"}
        renderIcon={(c) => <PencilIcon className={c} />}
        onIconClick={() => alert("incomplete feature")}
      >
        Bluetooth
      </ConfigTitlebar>
    </div>
  );
};

export default BluetoothConfigPage;
