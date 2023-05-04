import React from "react";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import { PencilIcon } from "@heroicons/react/24/outline";

export interface IUserConfigPageProps {
  className?: string;
}

const UserConfigPage = ({ className = "" }: IUserConfigPageProps) => {
  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"User Configuration"}
        subtitle={"Configure device user persona"}
        renderIcon={(c) => <PencilIcon className={c} />}
        onIconClick={() => alert("incomplete feature")}
      >
        User
      </ConfigTitlebar>
    </div>
  );
};

export default UserConfigPage;
