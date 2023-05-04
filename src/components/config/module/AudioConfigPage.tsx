import React from "react";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import { PencilIcon } from "@heroicons/react/24/outline";

export interface IAudioConfigPageProps {
  className?: string;
}

const AudioConfigPage = ({ className = "" }: IAudioConfigPageProps) => {
  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"Audio Configuration"}
        subtitle={"Configure Audio"}
        renderIcon={(c) => <PencilIcon className={c} />}
        onIconClick={() => alert("incomplete feature")}
      >
        Audio
      </ConfigTitlebar>
    </div>
  );
};

export default AudioConfigPage;
