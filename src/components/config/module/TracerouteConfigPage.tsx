import React from "react";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import { PencilIcon } from "@heroicons/react/24/outline";

export interface ITracerouteConfigPageProps {
  className?: string;
}

const TracerouteConfigPage = ({
  className = "",
}: ITracerouteConfigPageProps) => {
  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"Traceroute Configuration"}
        subtitle={"Configure Traceroute"}
        renderIcon={(c) => <PencilIcon className={c} />}
        onIconClick={() => alert("incomplete feature")}
      >
        Traceroute
      </ConfigTitlebar>
    </div>
  );
};

export default TracerouteConfigPage;
