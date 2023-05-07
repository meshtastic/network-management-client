import React from "react";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import { Save } from "lucide-react";

export interface IAudioConfigPageProps {
  className?: string;
}

const AudioConfigPage = ({ className = "" }: IAudioConfigPageProps) => {
  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"Audio Configuration"}
        subtitle={"Configure Audio"}
        renderIcon={(c) => <Save className={c} />}
        buttonTooltipText="Stage changes for upload"
        onIconClick={() => alert("This feature is not complete.")}
      >
        Audio
      </ConfigTitlebar>
    </div>
  );
};

export default AudioConfigPage;
