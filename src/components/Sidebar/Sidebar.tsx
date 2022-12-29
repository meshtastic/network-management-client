import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import {
  ChatBubbleBottomCenterTextIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  Cog8ToothIcon,
  LinkIcon,
  PowerIcon,
  BeakerIcon,
} from "@heroicons/react/24/outline";

import LogoWhiteSVG from "@app/assets/Mesh_Logo_White.svg";
import SidebarIcon from "@components/Sidebar/SidebarIcon";

import {
  requestConnectToDevice,
  requestDisconnectFromDevice,
} from "@features/device/deviceActions";
// import type { NeighborInfo, Neighbor } from "./NeighborInfo";
import { selectDeviceConnected } from "@features/device/deviceSelectors";

const Sidebar = () => {
  const dispatch = useDispatch();
  const isDeviceConnected = !!useSelector(selectDeviceConnected());

  const location = useLocation();
  const navigateTo = useNavigate();

  const handleDeviceConnectionRequest = () => {
    if (!isDeviceConnected) {
      dispatch(requestConnectToDevice());
    } else {
      dispatch(requestDisconnectFromDevice());
    }
  };

  const requestArticulationPoint = () => {
    // const nbrInfoList: NeighborInfo[] = generateNeighborInfo(nodes);
    // console.log("Sending command with input...");
    // console.log(nbrInfoList);
    // invoke("run_articulation_point", {
    //   nodes: nbrInfoList,
    // })
    //   .then((res) => {
    //     console.log(res);
    //   })
    //   .catch(console.error);
  };

  const requestGlobalMincut = () => {
    // const nodeList: INode[] = generateDemoData();
    // const nbrInfoList: NeighborInfo[] = generateNeighborInfo(nodes);
    // console.log("Sending test command with neighbors...");
    // console.log(nbrInfoList);
    // invoke("run_global_mincut", {
    //   nodes: nbrInfoList,
    // })
    //   .then((res) => {
    //     console.log(res);
    //   })
    //   .catch(console.error);
  };

  const requestStoerWagner = () => {
    // const nodeList: INode[] = generateDemoData();
    // const nbrInfoList: NeighborInfo[] = generateNeighborInfo(nodes);
    // console.log("Sending test command with neighbors...");
    // console.log(nbrInfoList);
    // invoke("run_stoer_wagner", {
    //   nodes: nbrInfoList,
    // })
    //   .then((res) => {
    //     console.log(res);
    //   })
    //   .catch(console.error);
  };

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
          <SidebarIcon
            isActive={location.pathname === "/serial-connect"}
            onClick={handleDeviceConnectionRequest}
            renderIcon={() =>
              isDeviceConnected ? (
                <PowerIcon className="w-6" />
              ) : (
                <LinkIcon className="w-6" />
              )
            }
          />
          {/* <SidebarIcon
            isActive={activeSidebarPanel == "algo"}
            onClick={requestArticulationPoint}
            renderIcon={() => <BeakerIcon className="w-6" />}
          />
          <SidebarIcon
            isActive={activeSidebarPanel == "algo"}
            onClick={requestGlobalMincut}
            renderIcon={() => <BeakerIcon className="w-6" />}
          />
          <SidebarIcon
            isActive={activeSidebarPanel == "algo"}
            onClick={requestStoerWagner}
            renderIcon={() => <BeakerIcon className="w-6" />}
          /> */}
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
