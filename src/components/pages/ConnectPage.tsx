import React, { FormEventHandler, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { open } from "@tauri-apps/api/shell";
import {
  ArrowPathIcon,
  EllipsisHorizontalCircleIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import * as Tabs from "@radix-ui/react-tabs";

import Hero_Image from "@app/assets/onboard_hero_image.jpg";
import Meshtastic_Logo from "@app/assets/Mesh_Logo_Black.png";

import ConnectTab from "@components/connection/ConnectTab";
import SerialPortOption from "@components/Onboard/SerialPortOption";

import { selectConnectionStatus } from "@features/connection/connectionSelectors";
import { connectionSliceActions } from "@features/connection/connectionSlice";
import {
  requestAutoConnectPort,
  requestAvailablePorts,
  requestConnectToDevice,
  requestDisconnectFromAllDevices,
} from "@features/device/deviceActions";
import {
  selectAutoConnectPort,
  selectAvailablePorts,
} from "@features/device/deviceSelectors";
import { requestSliceActions } from "@features/requests/requestReducer";

import { ConnectionType } from "@utils/connections";

import "@components/SplashScreen/SplashScreen.css";

const getFullSocketAddress = (address: string, port: string) =>
  `${address}:${port}`;

export interface IOnboardPageProps {
  unmountSelf: () => void;
}

const ConnectPage = ({ unmountSelf }: IOnboardPageProps) => {
  const dispatch = useDispatch();
  const availableSerialPorts = useSelector(selectAvailablePorts());
  const autoConnectPort = useSelector(selectAutoConnectPort());

  const [selectedPortName, setSelectedPortName] = useState("");
  const [socketAddress, setSocketAddress] = useState("");
  const [socketPort, setSocketPort] = useState("4403");
  const [isScreenActive, setScreenActive] = useState(true);

  // autoConnectPort takes priority over selectedPortName if it exists
  const activePort = autoConnectPort ?? selectedPortName;

  const activePortState = useSelector(selectConnectionStatus(activePort)) ?? {
    status: "IDLE",
  };

  const activeSocketState = useSelector(
    selectConnectionStatus(getFullSocketAddress(socketAddress, socketPort))
  ) ?? {
    status: "IDLE",
  };

  const requestPorts = () => {
    dispatch(requestAvailablePorts());
  };

  const handleSocketConnect: FormEventHandler = (e) => {
    e.preventDefault();

    dispatch(
      requestConnectToDevice({
        params: {
          type: ConnectionType.TCP,
          socketAddress: getFullSocketAddress(socketAddress, socketPort),
        },
        setPrimary: true,
      })
    );
  };

  const refreshPorts = () => {
    dispatch(
      requestSliceActions.clearRequestState({
        name: requestConnectToDevice.type,
      })
    );
    dispatch(connectionSliceActions.clearAllConnectionState());
    requestPorts();
  };

  const handlePortSelected = (portName: string) => {
    setSelectedPortName(portName);
    dispatch(
      requestConnectToDevice({
        params: { type: ConnectionType.SERIAL, portName },
        setPrimary: true,
      })
    );
  };

  const openExternalLink = (url: string) => () => {
    void open(url);
  };

  useEffect(() => {
    dispatch(requestDisconnectFromAllDevices());
    dispatch(requestAutoConnectPort());
    requestPorts();
  }, []);

  // Wait to allow user to recognize serial connection succeeded
  useEffect(() => {
    if (
      activePortState.status !== "SUCCESSFUL" &&
      activeSocketState.status !== "SUCCESSFUL"
    )
      return;

    const delayHandle = setTimeout(() => {
      setScreenActive(false);
    }, 600);

    return () => {
      clearTimeout(delayHandle);
    };
  }, [activePortState, activeSocketState]);

  // Move to main page upon successful port connection (need to trigger when port is succesfully connected)
  useEffect(() => {
    if (isScreenActive) return;

    const unmountHandle = setTimeout(() => {
      unmountSelf();
    }, 900);

    return () => {
      clearTimeout(unmountHandle);
    };
  }, [isScreenActive, unmountSelf]);

  return (
    <div
      className="landing-screen-opacity-transition absolute flex flex-row h-screen w-screen z-40 bg-white"
      style={{ opacity: isScreenActive ? 1 : 0 }}
    >
      <div className="flex flex-col flex-1 py-24 overflow-auto no-gutter">
        <div className="flex justify-center">
          <div className="h-1/8">
            <img
              className="w-11/12 h-11/12 text-gray-800"
              src={Meshtastic_Logo}
            ></img>
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <h1 className="text-4xl font-semibold leading-10 text-gray-800">
            Connect a radio
          </h1>
        </div>

        <div className="flex justify-center mt-5">
          <h2 className="text-base leading-6 font-normal text-gray-500 pl-40 pr-40 text-center">
            Connect a supported Meshtastic radio to your computer via USB serial
            or via TCP over Ethernet or WiFi. For more detailed instructions,{" "}
            <button
              type="button"
              onClick={() =>
                void open("https://meshtastic.org/docs/introduction")
              }
              className="hover:cursor-pointer hover:text-gray-600 underline"
            >
              click here
            </button>
            .
          </h2>
        </div>

        <div className="flex justify-center mt-5">
          <Tabs.Root className="w-3/5" defaultValue={ConnectionType.SERIAL}>
            <Tabs.List
              className="flex flex-row"
              aria-label="Choose a connection type"
            >
              <ConnectTab
                label="Serial"
                tooltip="Connect to your radio via a USB serial cable"
                value={ConnectionType.SERIAL}
              />
              <ConnectTab
                label="TCP"
                tooltip="Connect to your radio via Ethernet or WiFi"
                value={ConnectionType.TCP}
              />
            </Tabs.List>

            <Tabs.Content value={ConnectionType.SERIAL}>
              <div className="flex flex-col mt-4">
                <div className="flex flex-col gap-4">
                  {availableSerialPorts?.length ? (
                    availableSerialPorts.map((portName) => (
                      <SerialPortOption
                        key={portName}
                        name={portName}
                        connectionState={
                          activePort === portName
                            ? activePortState
                            : { status: "IDLE" }
                        }
                        onClick={handlePortSelected}
                      />
                    ))
                  ) : (
                    <p className="text-base leading-6 font-normal text-gray-500 pl-40 pr-40 text-center">
                      No ports detected.
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="flex flex-row justify-center align-middle mx-auto gap-4 mt-5"
                onClick={() => refreshPorts()}
              >
                <ArrowPathIcon className="text-gray-400 w-6 h-6 hover:cursor-pointer" />
                <p className="my-auto text-gray-500">Refresh ports</p>
              </button>
            </Tabs.Content>

            <Tabs.Content value={ConnectionType.TCP}>
              <form
                className="flex flex-col gap-4 mt-4"
                onSubmit={handleSocketConnect}
              >
                <input
                  className="flex-1 border border-gray-400 rounded-lg px-5 py-4 text-gray-700 placeholder:text-gray-400 h-full bg-transparent focus:outline-none disabled:cursor-wait"
                  type="text"
                  enterKeyHint="go"
                  placeholder="IP address or host name"
                  value={socketAddress}
                  onChange={(e) => setSocketAddress(e.target.value)}
                  disabled={activeSocketState.status === "PENDING"}
                />

                <input
                  className="flex-1 border border-gray-400 rounded-lg px-5 py-4 text-gray-700 placeholder:text-gray-400 h-full bg-transparent focus:outline-none disabled:cursor-wait"
                  type="text"
                  placeholder="Port"
                  value={socketPort}
                  onChange={(e) => setSocketPort(e.target.value)}
                  disabled={activeSocketState.status === "PENDING"}
                />

                <button
                  className="flex flex-row flex-1 justify-center gap-3 border rounded-lg border-gray-400 mx-auto px-5 py-4 hover:bg-gray-50 hover:border-gray-500 hover:shadow-lg disabled:cursor-wait"
                  disabled={activeSocketState.status === "PENDING"}
                  type="submit"
                >
                  {activeSocketState.status === "PENDING" ? (
                    <>
                      <EllipsisHorizontalCircleIcon className="w-6 h-6 text-gray-500" />
                      <p className="text-gray-700">Connecting...</p>
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-6 h-6 text-gray-500" />
                      <p className="text-gray-700">Connect</p>
                    </>
                  )}
                </button>

                {activeSocketState.status === "FAILED" && (
                  <div>
                    <p className="pl-6 pr-2 ml-4 text-sm leading-5 font-light text-red-600 my-1">
                      {activeSocketState.message}
                    </p>
                  </div>
                )}
              </form>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </div>

      <div className="flex-1 relative">
        <img
          className="w-full h-full object-cover object-center bg-gray-700"
          src={Hero_Image}
        />
        <p className="landing-screen-opacity-transition absolute bottom-3 right-3 text-right text-sm text-gray-600">
          Photo by{" "}
          <button
            className="hover:underline"
            onClick={openExternalLink(
              "https://unsplash.com/@jordansteranka?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
            )}
          >
            Jordan Steranka
          </button>{" "}
          on{" "}
          <button
            className="hover:underline"
            onClick={openExternalLink(
              "https://unsplash.com/photos/snpFW42KR8I?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
            )}
          >
            Unsplash
          </button>
        </p>
      </div>
    </div>
  );
};
export default ConnectPage;
