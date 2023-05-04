import React from "react";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import { PencilIcon } from "@heroicons/react/24/outline";

export interface IRangeTestConfigPageProps {
  className?: string;
}

const RangeTestConfigPage = ({ className = "" }: IRangeTestConfigPageProps) => {
  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"RangeTest Configuration"}
        subtitle={"Configure RangeTest"}
        renderIcon={(c) => <PencilIcon className={c} />}
        onIconClick={() => alert("incomplete feature")}
      >
        Range test
      </ConfigTitlebar>
    </div>
  );
};

export default RangeTestConfigPage;
