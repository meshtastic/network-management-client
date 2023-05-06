import React, { useState } from "react";
import { Construction } from "lucide-react";

import ConfigLayout from "@components/config/ConfigLayout";
import ConfigOption from "@components/config/ConfigOption";
import MapConfigPage from "@app/components/config/application/MapConfigPage";

export const ApplicationSettingsOptions: { name: string; hash: string }[] = [
  { name: "Map", hash: "map" },
];

const switchActiveOption = (activeOption: string | null) => {
  switch (activeOption) {
    case "map":
      return <MapConfigPage />;
    default:
      return (
        <div className="flex flex-col justify-center align-middle w-full h-full bg-gray-100">
          <p className="m-auto text-base font-normal text-gray-700">
            No option selected
          </p>
        </div>
      );
  }
};

const ApplicationSettingsPage = () => {
  const [activeOption, setActiveOption] = useState<string | null>(null);

  return (
    <div className="flex-1">
      <ConfigLayout
        title="Settings"
        backtrace={["Application Settings"]}
        renderTitleIcon={(c) => <Construction className={`${c}`} />}
        titleIconTooltip="Unimplemented, work in progress"
        onTitleIconClick={() =>
          console.warn("Radio configuration title icon onClick not implemented")
        }
        renderOptions={() =>
          ApplicationSettingsOptions.map(({ name, hash }) => (
            <ConfigOption
              key={hash}
              title={name}
              subtitle="0 unsaved changes"
              isActive={activeOption === hash}
              onClick={() =>
                setActiveOption(activeOption !== hash ? hash : null)
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
