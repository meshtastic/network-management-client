import React from "react";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import { Save } from "lucide-react";

export interface ITelemetryConfigPageProps {
  className?: string;
}

const TelemetryConfigPage = ({ className = "" }: ITelemetryConfigPageProps) => {
  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"Telemetry Configuration"}
        subtitle={"Configure Telemetry"}
        renderIcon={(c) => <Save className={c} />}
        buttonTooltipText="Stage changes for upload"
        onIconClick={() => alert("This feature is not complete.")}
      >
        Telemetry
      </ConfigTitlebar>
    </div>
  );
};

export default TelemetryConfigPage;
