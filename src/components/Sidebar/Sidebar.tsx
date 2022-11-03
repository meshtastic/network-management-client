import React, { useEffect, useState } from "react";
import LogoWhiteSVG from "@app/assets/Mesh_Logo_White.svg";
import SidebarIcon from "@components/Sidebar/SidebarIcon";
import {
  ChatBubbleBottomCenterTextIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  Cog8ToothIcon,
} from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import { selectAllDevices } from "@app/features/device/deviceSelectors";
import { deviceActions } from "@app/features/device/deviceSlice";
import { ISerialConnection, Types, Protobuf } from "@meshtastic/meshtasticjs";

export enum ActiveTab {
  MAP,
  CHAT,
  INFO,
  SETTINGS,
}



export const subscribeAll = (
  connection: Types.ConnectionType
) => {
  connection.setLogLevel(Protobuf.LogRecord_Level.TRACE);

  // onLogEvent
  // onMeshHeartbeat

  connection.onDeviceMetadataPacket.subscribe((metadataPacket) => {
    console.log('metadataPacket', metadataPacket);
  });

  connection.onRoutingPacket.subscribe((routingPacket) => {
    console.log('routingPacket', routingPacket);
  });

  connection.onTelemetryPacket.subscribe((telemetryPacket) => {
    console.log('telemetryPacket', telemetryPacket);
  });

  connection.onDeviceStatus.subscribe((status) => {
    console.log('status', status);
  });

  connection.onWaypointPacket.subscribe((waypoint) => {
    console.log('waypoint', waypoint);
  });

  connection.onMyNodeInfo.subscribe((nodeInfo) => {
    console.log('myNodeInfo', nodeInfo);
  });

  connection.onUserPacket.subscribe((user) => {
    console.log('user', user);
  });

  connection.onPositionPacket.subscribe((position) => {
    console.log('position', position);
  });


  connection.onNodeInfoPacket.subscribe((nodeInfo) => {
    console.log('nodeInfoPacket', nodeInfo);
  });

  connection.onChannelPacket.subscribe((channel) => {
    console.log('channel', channel);
  });

  connection.onConfigPacket.subscribe((config) => {
    console.log('configPacket', config);
  });

  connection.onModuleConfigPacket.subscribe((moduleConfig) => {
    console.log('moduleConfigPacket', moduleConfig);
  });

  connection.onMessagePacket.subscribe((messagePacket) => {
    console.log('messagePacket', messagePacket);
  });
};

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.MAP);
  const [serialConnection, setSerialConnection] = useState<ISerialConnection | null>(null);

  const dispatch = useDispatch();
  const devices = useSelector(selectAllDevices());

  useEffect(() => { console.log(devices); }, [devices])

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
          <SidebarIcon
            isActive={activeTab == ActiveTab.INFO}
            setTabActive={() => {
              void navigator.serial.requestPort().then((port) => {
                const id = 1;
                dispatch(deviceActions.createDevice(id));
                const connection = new ISerialConnection(id);
                connection.connect({ port, baudRate: undefined, concurrentLogOutput: true }).then(() => {
                  setSerialConnection(connection);
                  subscribeAll(connection);
                }).catch(console.error)
              });
            }}
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
