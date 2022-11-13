import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  ChatBubbleBottomCenterTextIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  Cog8ToothIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import LogoWhiteSVG from "@app/assets/Mesh_Logo_White.svg";

import SidebarIcon from "@components/Sidebar/SidebarIcon";
import { selectAllDevices } from "@app/features/device/deviceSelectors";
import { createDeviceAction } from "@features/device/deviceActions";
import { invoke } from "@tauri-apps/api/tauri";
import { selectAllNodes } from "@app/features/device/deviceSelectors";
import type { INode } from "@features/device/deviceSlice";
import { generateDemoData, generateNeighborInfo } from "./DemoData";
import type { Protobuf } from "@meshtastic/meshtasticjs/dist/";
import type { NeighborInfo, Neighbor } from "./NeighborInfo";
import { selectActiveSidebarPanel } from "@features/panels/panelsSelectors";
import {
  ActiveSidebarPanel,
  panelsSliceActions,
} from "@features/panels/panelsSlice";

const Sidebar = () => {
  const dispatch = useDispatch();
  const devices = useSelector(selectAllDevices());
  const nodes = useSelector(selectAllNodes());
  const activeSidebarPanel = useSelector(selectActiveSidebarPanel());

  // Logging only, no necessary functionality
  useEffect(() => {
    console.log(devices);
  }, [devices]);

  const requestDeviceConnection = () => {
    const id = 1;
    dispatch(createDeviceAction(id));
  };

  const requestArticulationPoint = () => {
    const nbrInfoList: NeighborInfo[] = generateNeighborInfo(nodes);
    console.log("Sending test command with neighbors...");
    console.log(nbrInfoList);
    invoke("run_articulation_point", {
      nodes: nbrInfoList,
    })
      .then((res) => {
        console.log(res);
      })
      .catch(console.error);
  };
  const requestGlobalMincut = () => {
    const nodeList: INode[] = generateDemoData();
    const nbrInfoList: NeighborInfo[] = generateNeighborInfo(nodeList);
    console.log("Sending test command with neighbors...");
    console.log(nbrInfoList);
    invoke("run_global_mincut", {
      nodes: nbrInfoList,
    })
      .then((res) => {
        console.log(res);
      })
      .catch(console.error);
  };
  const requestStoerWagner = () => {
    const nodeList: INode[] = generateDemoData();
    const nbrInfoList: NeighborInfo[] = generateNeighborInfo(nodeList);
    console.log("Sending test command with neighbors...");
    console.log(nbrInfoList);
    invoke("run_stoer_wagner", {
      nodes: nbrInfoList,
    })
      .then((res) => {
        console.log(res);
      })
      .catch(console.error);
  };
  const setActivePane = (panel: ActiveSidebarPanel) => {
    dispatch(panelsSliceActions.setActiveSidebarPanel(panel));
  };

  return (
    <div className="h-screen flex flex-col justify-between shadow-lg">
      <div>
        <div className="flex bg-gray-800 w-14 h-14">
          <img src={LogoWhiteSVG} className="m-auto pl-2 pr-2 pt-3 pb-3"></img>{" "}
        </div>
        <div className="flex flex-col">
          <SidebarIcon
            isActive={activeSidebarPanel === "map"}
            onClick={() => setActivePane("map")}
            renderIcon={() => <MagnifyingGlassIcon className="" />}
          />
          <SidebarIcon
            isActive={activeSidebarPanel == "chat"}
            onClick={() => setActivePane("chat")}
            renderIcon={() => <ChatBubbleBottomCenterTextIcon className="" />}
          />
          <SidebarIcon
            isActive={activeSidebarPanel == "info"}
            onClick={() => setActivePane("info")}
            renderIcon={() => <DocumentTextIcon className="" />}
          />
          <SidebarIcon
            isActive={activeSidebarPanel == "none"}
            onClick={requestDeviceConnection}
            renderIcon={() => <LinkIcon className="" />}
          />
          <SidebarIcon
            isActive={activeSidebarPanel == "info"}
            onClick={requestArticulationPoint}
            renderIcon={() => <LinkIcon className="" />}
          />
          <SidebarIcon
            isActive={activeSidebarPanel == "info"}
            onClick={requestGlobalMincut}
            renderIcon={() => <LinkIcon className="" />}
          />
          <SidebarIcon
            isActive={activeSidebarPanel == "info"}
            onClick={requestStoerWagner}
            renderIcon={() => <LinkIcon className="" />}
          />
        </div>
      </div>
      <SidebarIcon
        isActive={activeSidebarPanel == "settings"}
        onClick={() => setActivePane("settings")}
        renderIcon={() => <Cog8ToothIcon className="" />}
      />
    </div>
  );
};

export default Sidebar;
