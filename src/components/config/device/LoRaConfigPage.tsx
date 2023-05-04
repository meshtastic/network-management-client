import React from "react";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import { PencilIcon } from "@heroicons/react/24/outline";

export interface ILoRaConfigPageProps {
  className?: string;
}

const LoRaConfigPage = ({ className = "" }: ILoRaConfigPageProps) => {
  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"LoRa Configuration"}
        subtitle={"Configure device LoRa connection"}
        renderIcon={(c) => <PencilIcon className={c} />}
        onIconClick={() => alert("incomplete feature")}
      >
        LoRa
      </ConfigTitlebar>
    </div>
  );
};

export default LoRaConfigPage;
