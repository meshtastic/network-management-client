import React from "react";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import { PencilIcon } from "@heroicons/react/24/outline";

export interface ITelemetryConfigPageProps {
  className?: string;
}

const TelemetryConfigPage = ({ className = "" }: ITelemetryConfigPageProps) => {
  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"Telemetry Configuration"}
        subtitle={"Configure Telemetry"}
        renderIcon={(c) => <PencilIcon className={c} />}
        onIconClick={() => alert("incomplete feature")}
      >
        Telemetry
      </ConfigTitlebar>
    </div>
  );
};

export default TelemetryConfigPage;
