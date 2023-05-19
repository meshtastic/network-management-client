import React, { useState } from "react";
import { Construction } from "lucide-react";

import ConfigLayout from "@components/config/ConfigLayout";
import ConfigOption from "@components/config/ConfigOption";
import MapConfigPage from "@app/components/config/application/MapConfigPage";

export const ApplicationSettingsOptions = {
  map: "Map Settings",
};

const switchActiveOption = (activeOption: string) => {
  switch (activeOption) {
    case "map":
      return <MapConfigPage />;
    default:
      return (
        <div className="flex flex-col justify-center align-middle w-full h-full bg-gray-100">
          <p className="m-auto text-base font-normal text-gray-700">
            Unknown option selected
          </p>
        </div>
      );
  }
};

const ApplicationSettingsPage = () => {
  const [activeOption, setActiveOption] =
    useState<keyof typeof ApplicationSettingsOptions>("map");

  return (
    <div className="flex-1">
      <ConfigLayout
        title="Settings"
        backtrace={["Application Settings"]}
        renderTitleIcon={(c) => (
          <Construction strokeWidth={1.5} className={`${c}`} />
        )}
        titleIconTooltip="Unimplemented, work in progress"
        onTitleIconClick={() =>
          console.warn("Radio configuration title icon onClick not implemented")
        }
        renderOptions={() =>
          Object.entries(ApplicationSettingsOptions).map(([k, displayName]) => (
            <ConfigOption
              key={k}
              title={displayName}
              subtitle=""
              isActive={activeOption === k}
              onClick={() =>
                setActiveOption(k as keyof typeof ApplicationSettingsOptions)
              }
            />
          ))
        }
      >
        {switchActiveOption(activeOption)}
      </ConfigLayout>
    </div>
  );
};

export default ApplicationSettingsPage;
