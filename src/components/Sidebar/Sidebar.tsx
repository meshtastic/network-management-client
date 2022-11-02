import React, { useState } from "react";
import LogoWhiteSVG from "@app/assets/Mesh_Logo_White.svg";
import SidebarIcon from "@components/Sidebar/SidebarIcon";
import {
  ChatBubbleBottomCenterTextIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  Cog8ToothIcon,
} from "@heroicons/react/24/outline";

export enum ActiveTab {
  MAP,
  CHAT,
  INFO,
  SETTINGS,
}

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.MAP);

  return (
    <div className="h-screen flex flex-col justify-between shadow-lg">
      <div>
        <div className="flex bg-gray-800 w-14 h-14">
          <img src={LogoWhiteSVG} className="m-auto pl-2 pr-2 pt-3 pb-3"></img>{" "}
        </div>
        <div className="flex flex-col">
          <SidebarIcon
            isActive={activeTab == ActiveTab.MAP}
            setTabActive={() => setActiveTab(ActiveTab.MAP)}
            renderIcon={() => <MagnifyingGlassIcon className="" />}
          />
          <SidebarIcon
            isActive={activeTab == ActiveTab.CHAT}
            setTabActive={() => setActiveTab(ActiveTab.CHAT)}
            renderIcon={() => <ChatBubbleBottomCenterTextIcon className="" />}
          />
          <SidebarIcon
            isActive={activeTab == ActiveTab.INFO}
            setTabActive={() => setActiveTab(ActiveTab.INFO)}
            renderIcon={() => <DocumentTextIcon className="" />}
          />
        </div>
      </div>
      <SidebarIcon
        isActive={activeTab == ActiveTab.SETTINGS}
        setTabActive={() => setActiveTab(ActiveTab.SETTINGS)}
        renderIcon={() => <Cog8ToothIcon className="" />}
      />
    </div>
  );
};

export default Sidebar;
