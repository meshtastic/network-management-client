import React from "react";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import { Save } from "lucide-react";

export interface ICannedMessageConfigPageProps {
  className?: string;
}

const CannedMessageConfigPage = ({
  className = "",
}: ICannedMessageConfigPageProps) => {
  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"CannedMessage Configuration"}
        subtitle={"Configure CannedMessage"}
        renderIcon={(c) => <Save className={c} />}
        buttonTooltipText="Stage changes for upload"
        onIconClick={() => alert("This feature is not complete.")}
      >
        Canned message
      </ConfigTitlebar>
    </div>
  );
};

export default CannedMessageConfigPage;
