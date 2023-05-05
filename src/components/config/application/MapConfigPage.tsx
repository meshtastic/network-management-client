import React from "react";
import { Save } from "lucide-react";
import ConfigTitlebar from "@components/config/ConfigTitlebar";

export interface IMapConfigPageProps {
  className?: string;
}

const MapConfigPage = ({ className = "" }: IMapConfigPageProps) => {
  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title="Map Settings"
        subtitle="Edit application map settings"
        renderIcon={(c) => <Save className={`${c}`} />}
        onIconClick={() => alert("incomplete feature")}
      >
        Hi!
      </ConfigTitlebar>
    </div>
  );
};

export default MapConfigPage;
