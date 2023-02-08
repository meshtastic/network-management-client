import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Hero_Image from "@app/assets/onboard_hero_image.jpg";
import Meshtastic_Logo from "@app/assets/Mesh_Logo_Black.png";
import SerialPortOption from "@components/Onboard/SerialPortOption";

import "@components/SplashScreen/SplashScreen.css";

import {
  requestAvailablePorts,
  requestConnectToDevice,
} from "@features/device/deviceActions";
import { selectAvailablePorts } from "@features/device/deviceSelectors";

import { selectRequestStateByName } from "@features/requests/requestSelectors";
import type { IRequestState } from "@features/requests/requestReducer";

export interface IOnboardPageProps {
  unmountSelf: () => void;
}

const OnboardPage = ({ unmountSelf }: IOnboardPageProps) => {
  const dispatch = useDispatch();
  const availableSerialPorts = useSelector(selectAvailablePorts());
  const [selectedPortName, setSelectedPortName] = useState("");
  const [isScreenActive, setScreenActive] = useState(true);

  const activePortState: IRequestState = useSelector(
    selectRequestStateByName(requestConnectToDevice.type)
  ) ?? { status: "IDLE" };

  useEffect(() => {
    dispatch(requestAvailablePorts());
  }, []);

  const handlePortSelected = (portName: string) => {
    setSelectedPortName(portName);
    dispatch(requestConnectToDevice(portName));
  };

  // Wait to allow user to recognize serial connection succeeded
  useEffect(() => {
    if (activePortState.status !== "SUCCESSFUL") return;

    const delayHandle = setTimeout(() => {
      setScreenActive(false);
    }, 1200);

    return () => {
      clearTimeout(delayHandle);
    };
  }, [activePortState, unmountSelf]);

  // Move to main page upon successful port connection (need to trigger when port is succesfully connected)
  useEffect(() => {
    if (isScreenActive) return;

    const unmountHandle = setTimeout(() => {
      unmountSelf();
    }, 900);

    return () => {
      clearTimeout(unmountHandle);
    };
  }, [activePortState, unmountSelf]);

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
            <a
              href="https://meshtastic.org/docs/introduction"
              className="hover:cursor-pointer hover:text-gray-600 underline"
            >
              click here
            </a>
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
                    selectedPortName === portName
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
      </div>

      <div className="flex-1">
        <img
          className="w-full h-full object-cover object-center"
          src={Hero_Image}
        ></img>
      </div>
    </div>
  );
};
export default OnboardPage;
