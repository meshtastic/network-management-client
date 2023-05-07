import React from "react";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import { Save } from "lucide-react";

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
        renderIcon={(c) => <Save className={c} />}
        buttonTooltipText="Stage changes for upload"
        onIconClick={() => alert("This feature is not complete.")}
      >
        Traceroute
      </ConfigTitlebar>
    </div>
  );
};

export default TracerouteConfigPage;
