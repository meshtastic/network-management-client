import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Hero_Image from "@app/assets/onboard_hero_image.jpg";
import Meshtastic_Logo from "@app/assets/Mesh_Logo_Black.png";
import SerialPortOption from "../Onboard/SerialPortOption";

import { requestAvailablePorts } from "@features/device/deviceActions";
import { selectAvailablePorts } from "@app/features/device/deviceSelectors";


type PortState = "IDLE" | "PENDING" | "SUCCESS" | "FAILURE";
type PortType = { name: string; state: PortState };

export interface IOnboardPageProps {
  unmountSelf: () => void;
}

const OnboardPage = ({ unmountSelf }: IOnboardPageProps) => {

  const availableSerialPorts = useSelector(selectAvailablePorts());  
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(requestAvailablePorts());
  }, [dispatch]);

  const activePorts = availableSerialPorts?.map((port) : PortType => ({
    name: port,
    state: "IDLE",
  }));

  // Move to main page upon successful port connection (need to trigger when port is succesfully connected)
  const portSuccessfullyConnected = () => {
    unmountSelf();
  };

  return (
    <div className="flex flex-row h-screen w-screen absolute z-40 bg-white">
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
            {activePorts ? (
              activePorts.map((port) => (
                  <SerialPortOption
                    key={port.name}
                    name={port.name}
                    state={port.state}
                    connection_error={"Null."}
                    onSuccess={portSuccessfullyConnected}
                  />
                ))
            ) : (
              <p className="text-base leading-6 font-normal text-gray-500 pl-40 pr-40 text-center"> No ports detected. </p>
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
