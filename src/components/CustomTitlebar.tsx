import React from "react";
import { useTranslation } from "react-i18next";
import { WindowTitlebar } from "tauri-controls";

import MeshLogoLight from "@app/assets/Mesh_Logo_Light.svg";
import MeshLogoDark from "@app/assets/Mesh_Logo_Dark.svg";
import { useIsDarkMode } from "@utils/hooks";

export interface ICustomTitlebarProps {
  className?: string;
}

const CustomTitlebar = ({ className = "" }: ICustomTitlebarProps) => {
  const { t } = useTranslation();

  const isDarkMode = useIsDarkMode();

  return (
    <WindowTitlebar
      className={`z-[9999] w-screen bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 ${className}`}
    >
      <div className="flex flex-row ml-4 gap-2">
        <img
          className="my-auto h-3"
          src={isDarkMode ? MeshLogoLight : MeshLogoDark}
        />

        <p className="my-auto text-center font-medium text-xs text-gray-700 dark:text-gray-300">
          {t("general.clientName")}
        </p>
      </div>
    </WindowTitlebar>
  );
};

export default CustomTitlebar;
