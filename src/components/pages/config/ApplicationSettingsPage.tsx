import { useState } from "react";
import { useTranslation } from "react-i18next";

import { i18next } from "@app/i18n";

import { ConfigLayout } from "@components/config/ConfigLayout";
import { ConfigOption } from "@components/config/ConfigOption";
import { GeneralConfigPage } from "@components/config/application/GeneralConfigPage";
import { MapConfigPage } from "@components/config/application/MapConfigPage";

import type { IAppConfigState } from "@features/appConfig/slice";
import { AboutPage } from "@components/config/application/About";

export const ApplicationSettingsOptions = {
  general: i18next.t("applicationSettings.options.general"),
  map: i18next.t("applicationSettings.options.map"),
  about: i18next.t("applicationSettings.options.about"),
};

const _ActiveOption = ({
  activeOption,
}: {
  activeOption: keyof IAppConfigState;
}) => {
  const { t } = useTranslation();

  switch (activeOption) {
    case "general":
      return <GeneralConfigPage />;
    case "map":
      return <MapConfigPage />;
    case "about":
      return <AboutPage />
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

export const ApplicationSettingsPage = () => {
  const { t } = useTranslation();

  const [activeOption, setActiveOption] =
    useState<keyof typeof ApplicationSettingsOptions>("general");

  return (
    <div className="flex-1">
      <ConfigLayout
        title={t("applicationSettings.title")}
        backtrace={[t("sidebar.applicationSettings")]}
        // Hides the title icon as the user doesn't need to take secondary action
        // to persist application settings after committing within a pane
        renderTitleIcon={() => <></>}
        titleIconTooltip={""}
        onTitleIconClick={() => null}
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
