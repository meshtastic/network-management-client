import React from "react";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import { Save } from "lucide-react";

export interface IRangeTestConfigPageProps {
  className?: string;
}

const RangeTestConfigPage = ({ className = "" }: IRangeTestConfigPageProps) => {
  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"RangeTest Configuration"}
        subtitle={"Configure RangeTest"}
        renderIcon={(c) => <Save className={c} />}
        buttonTooltipText="Stage changes for upload"
        onIconClick={() => alert("This feature is not complete.")}
      >
        Range test
      </ConfigTitlebar>
    </div>
  );
};

export default RangeTestConfigPage;
