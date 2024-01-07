import { useTranslation } from "react-i18next";

import MeshLogoDark from "@app/assets/Mesh_Logo_Dark.svg";
import MeshLogoLight from "@app/assets/Mesh_Logo_Light.svg";

import { useIsDarkMode } from "@utils/hooks";

import "@components/Sidebar/Sidebar.css";

export interface IMeshLogoProps {
  isSidebarExpanded: boolean;
}

const SidebarLogo = ({ isSidebarExpanded }: IMeshLogoProps) => {
  const { t } = useTranslation();

  const { isDarkMode } = useIsDarkMode();

  return (
    <div className="flex flex-row justify-start align-middle h-20 p-4 border-b border-gray-100 dark:border-gray-700">
      <img
        alt="Mesh Logo"
        className="my-auto p-3 bg-gray-700 dark:bg-gray-200 rounded-lg h-12 w-12"
        src={isDarkMode ? MeshLogoDark : MeshLogoLight}
      />
      <div
        className="sidebar-opacity-transition my-auto pl-4 whitespace-nowrap"
        style={isSidebarExpanded ? { opacity: 1 } : { opacity: 0 }}
      >
        <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">
          {t("general.meshtastic")}
        </p>
        <p className="text-gray-400 dark:text-gray-400 text-xs font-normal">
          {t("general.networkManagement")}
        </p>
      </div>
    </div>
  );
};

export default SidebarLogo;
