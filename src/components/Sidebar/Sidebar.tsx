import React from "react";
import whiteLogo from "@app/assets/Mesh_Logo_White.png";
import SidebarIcon from "@components/Sidebar/SidebarIcon";
import {
  ChatBubbleBottomCenterTextIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  Cog8ToothIcon,
} from "@heroicons/react/24/outline";

const Sidebar = () => {
  return (
    <div className="h-screen flex flex-col justify-between">
      <div>
        <div className="bg-gray-800">
          <img src={whiteLogo} className="w-10 h-10 p-1"></img>
        </div>
        <div className="flex flex-col">
          {/* Magnifying glass */}
          <SidebarIcon
            renderIcon={() => <MagnifyingGlassIcon className="" />}
          />
          {/* ChatBubble */}
          <SidebarIcon
            renderIcon={() => <ChatBubbleBottomCenterTextIcon className="" />}
          />
          {/* Document */}
          <SidebarIcon renderIcon={() => <DocumentTextIcon className="" />} />
        </div>
      </div>
      <div>
        {/* Settings */}
        <SidebarIcon renderIcon={() => <Cog8ToothIcon className="" />} />
      </div>
    </div>
  );
};

export default Sidebar;
