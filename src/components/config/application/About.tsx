import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { ConfigTitlebar } from "@components/config/ConfigTitlebar";

import { getVersion } from "@tauri-apps/api/app";

export interface IMapConfigPageProps {
    className?: string;
}

export const AboutPage = ({ className = "" }: IMapConfigPageProps) => {
    const { t } = useTranslation();

    const [version, setVersion] = useState("");

    useEffect(() => {
        getVersion().then(setVersion);
    }, []);

    return (
        <div className={`${className} flex-1 h-screen`}>
            <ConfigTitlebar
                title={t("applicationSettings.about.title")}
                subtitle={t("applicationSettings.about.description")}
                renderIcon={() => <></>}
                buttonTooltipText={t("applicationSettings.saveChanges")}
            >
                <div>
                    <h2 className="m-0 mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {t("applicationSettings.about.versionNumber")}
                    </h2>
                    <p className="px-3 py-1 text-base font-normal text-gray-700 dark:text-gray-300">
                        {version}
                    </p>
                </div>
            </ConfigTitlebar>
        </div>
    );
};
