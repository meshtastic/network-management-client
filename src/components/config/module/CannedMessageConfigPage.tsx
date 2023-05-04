import React from "react";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import { PencilIcon } from "@heroicons/react/24/outline";

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
        renderIcon={(c) => <PencilIcon className={c} />}
        onIconClick={() => alert("incomplete feature")}
      >
        Canned message
      </ConfigTitlebar>
    </div>
  );
};

export default CannedMessageConfigPage;
