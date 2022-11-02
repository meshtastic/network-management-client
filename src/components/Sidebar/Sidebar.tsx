import React, { useState } from "react";
import whiteLogo from "@app/assets/Mesh_Logo_White.png";
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
    <div className="h-screen flex flex-col justify-between w-14">
      <div>
        {/* Logo */}
        <div className="bg-gray-800 ">
          <img src={whiteLogo} className="pl-2 pr-2 pt-3 pb-3"></img>{" "}
          {/* adam will fix svg logo cause its nuts bro */}
        </div>
        <div className="flex flex-col">
          {/* Magnifying glass */}
          <SidebarIcon
            isActive={activeTab == ActiveTab.MAP}
            setTabActive={() => setActiveTab(ActiveTab.MAP)}
            renderIcon={() => <MagnifyingGlassIcon className="" />}
          />
          {/* ChatBubble */}
          <SidebarIcon
            isActive={activeTab == ActiveTab.CHAT}
            setTabActive={() => setActiveTab(ActiveTab.CHAT)}
            renderIcon={() => <ChatBubbleBottomCenterTextIcon className="" />}
          />
          {/* Document */}
          <SidebarIcon
            isActive={activeTab == ActiveTab.INFO}
            setTabActive={() => setActiveTab(ActiveTab.INFO)}
            renderIcon={() => <DocumentTextIcon className="" />}
          />
        </div>
      </div>
      <div>
        {/* Settings */}
        <SidebarIcon
          isActive={activeTab == ActiveTab.SETTINGS}
          setTabActive={() => setActiveTab(ActiveTab.SETTINGS)}
          renderIcon={() => <Cog8ToothIcon className="" />}
        />
      </div>
    </div>
  );
};

export default Sidebar;
