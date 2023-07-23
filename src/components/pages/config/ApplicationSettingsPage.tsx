import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Construction } from "lucide-react";

import i18next from "@app/i18n";

import ConfigLayout from "@components/config/ConfigLayout";
import ConfigOption from "@components/config/ConfigOption";
import MapConfigPage from "@components/config/application/MapConfigPage";

export const ApplicationSettingsOptions = {
  map: i18next.t("applicationSettings.options.map"),
};

const _ActiveOption = ({ activeOption }: { activeOption: string }) => {
  const { t } = useTranslation();

  switch (activeOption) {
    case "map":
      return <MapConfigPage />;
    default:
      return (
        <div className="flex flex-col justify-center align-middle w-full h-full bg-gray-100">
          <p className="m-auto text-base font-normal text-gray-700">
            {t("applicationSettings.unknownOption")}
          </p>
        </div>
      );
  }
};

const ApplicationSettingsPage = () => {
  const { t } = useTranslation();

  const [activeOption, setActiveOption] =
    useState<keyof typeof ApplicationSettingsOptions>("map");

  return (
    <div className="flex-1">
      <ConfigLayout
        title={t("applicationSettings.title")}
        backtrace={[t("sidebar.applicationSettings")]}
        renderTitleIcon={(c) => (
          <Construction strokeWidth={1.5} className={`${c}`} />
        )}
        titleIconTooltip={t("general.wip")}
        onTitleIconClick={() => console.warn(t("general.wip"))}
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
        <_ActiveOption activeOption={activeOption} />
      </ConfigLayout>
    </div>
  );
};

export default ApplicationSettingsPage;
