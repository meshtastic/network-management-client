import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { open } from "@tauri-apps/api/shell";
import { ArrowPathIcon, LinkIcon } from "@heroicons/react/24/outline";

import Hero_Image from "@app/assets/onboard_hero_image.jpg";
import Meshtastic_Logo from "@app/assets/Mesh_Logo_Black.png";
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

import "@components/SplashScreen/SplashScreen.css";

export interface IOnboardPageProps {
  unmountSelf: () => void;
}

const ConnectPage = ({ unmountSelf }: IOnboardPageProps) => {
  const dispatch = useDispatch();
  const availableSerialPorts = useSelector(selectAvailablePorts());
  const autoConnectPort = useSelector(selectAutoConnectPort());

  const [selectedPortName, setSelectedPortName] = useState("");
  const [enteredSocketAddress, setEnteredSocketAddress] = useState("");
  const [isScreenActive, setScreenActive] = useState(true);

  // autoConnectPort takes priority over selectedPortName if it exists
  const activePort = autoConnectPort ?? selectedPortName;

  const activePortState = useSelector(selectConnectionStatus(activePort)) ?? {
    status: "IDLE",
  };

  const activeSocketState = useSelector(
    selectConnectionStatus(enteredSocketAddress)
  ) ?? {
    status: "IDLE",
  };

  const requestPorts = () => {
    dispatch(requestAvailablePorts());
  };

  const handleSocketConnect = () => {
    const address = enteredSocketAddress.includes(":")
      ? enteredSocketAddress
      : enteredSocketAddress + ":4403";
    setEnteredSocketAddress(address);

    dispatch(
      requestConnectToDevice({ socketAddress: address, setPrimary: true })
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
    dispatch(requestConnectToDevice({ portName: portName, setPrimary: true }));
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
      <div className="flex flex-col flex-1">
        <div className="flex justify-center">
          <div className="h-1/8">
            <img
              className="w-11/12 h-11/12 mt-44 text-gray-800"
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
          <h1 className="text-base leading-6 font-normal text-gray-500 pl-40 pr-40 text-center">
            Connect a supported Meshtastic radio to your computer via USB
            Serial. For more detailed instructions,{" "}
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
          </h1>
        </div>

        <div className="mt-10 flex flex-col">
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
          className="flex flex-row justify-center align-middle gap-4 mt-5"
          onClick={() => refreshPorts()}
        >
          <ArrowPathIcon className="text-gray-400 w-6 h-6 hover:cursor-pointer" />
          <p className="my-auto text-gray-500">Refresh ports</p>
        </button>

        <div className="flex py-5 px-5 justify-center">
          <div className="max-w-2xl w-full flex items-center">
            <div className="flex-grow border-t border-gray-400" />
            <span className="flex-shrink mx-4 text-gray-400">Or</span>
            <div className="flex-grow border-t border-gray-400" />
          </div>
        </div>

        <div className="flex justify-center">
          <div className="flex flex-row bg-white rounded-lg border max-w-lg w-full border-gray-400 hover:bg-gray-50 hover:border-gray-500 hover:shadow-lg">
            <input
              className="flex-1 px-8 py-6 text-gray-600 placeholder:text-gray-400 h-full bg-transparent focus:outline-none"
              type="text"
              enterKeyHint="go"
              placeholder="IP address or host name"
              value={enteredSocketAddress}
              onChange={(event) => setEnteredSocketAddress(event.target.value)}
            />
            <div className="my-5 w-[1px] bg-gray-400" />
            <button
              type="submit"
              className="px-5"
              onClick={handleSocketConnect}
            >
              <LinkIcon className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <img
          className="w-full h-full object-cover object-center"
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
