import React from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import {
  ChatBubbleBottomCenterTextIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  Cog8ToothIcon,
  RadioIcon,
} from "@heroicons/react/24/outline";

import LogoWhiteSVG from "@app/assets/Mesh_Logo_White.svg";
import SidebarIcon from "@components/Sidebar/SidebarIcon";

const Sidebar = () => {
  const location = useLocation();
  const navigateTo = useNavigate();

  return (
    <div className="h-screen flex flex-col justify-between shadow-lg">
      <div>
        <div className="flex bg-gray-800 w-14 h-14">
          <img src={LogoWhiteSVG} className="m-auto pl-2 pr-2 pt-3 pb-3"></img>{" "}
        </div>
        <div className="flex flex-col">
          <SidebarIcon
            isActive={location.pathname === "/" && !location.hash}
            onClick={() => navigateTo("/")}
            renderIcon={() => <MagnifyingGlassIcon className="w-6" />}
          />
          <SidebarIcon
            isActive={
              location.pathname === "/" && location.hash === "#messages"
            }
            onClick={() => navigateTo("/#messages")}
            renderIcon={() => (
              <ChatBubbleBottomCenterTextIcon className="w-6" />
            )}
          />
          <SidebarIcon
            isActive={location.pathname === "/info"}
            onClick={() => navigateTo("/info")}
            renderIcon={() => <DocumentTextIcon className="w-6" />}
          />
        </div>
      </div>
      <SidebarIcon
        isActive={location.pathname === "/" && location.hash === "#settings"}
        onClick={() => navigateTo("/#settings")}
        renderIcon={() => <Cog8ToothIcon className="w-6" />}
      />
    </div>
  );
};

export default Sidebar;
