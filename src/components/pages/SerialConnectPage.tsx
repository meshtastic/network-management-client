import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";

import {
  requestAvailablePorts,
  requestConnectToDevice,
  requestDisconnectFromDevice,
} from "@features/device/deviceActions";

import {
  selectActiveSerialPort,
  selectAvailablePorts,
  selectDeviceConnected,
} from "@app/features/device/deviceSelectors";

const EMPTY_PORT_VALUE = "None";

const SerialConnectPage = () => {
  const availableSerialPorts = useSelector(selectAvailablePorts());
  const isDeviceConnected = useSelector(selectDeviceConnected());
  const activeSerialPort = useSelector(selectActiveSerialPort());

  const [selectedPort, setSelectedPort] = useState<string>(EMPTY_PORT_VALUE);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(requestAvailablePorts());
  }, [dispatch]);

  const connectToPort = (port: string) => {
    if (selectedPort === EMPTY_PORT_VALUE) return;
    dispatch(requestConnectToDevice(port));
  };

  const disconnectFromPort = () => {
    if (!isDeviceConnected) return;
    dispatch(requestDisconnectFromDevice());
  };

  return (
    <div>
      <p>Available Ports:</p>
      <select
        value={selectedPort}
        onChange={(e) => setSelectedPort(e.target.value)}
      >
        <option value={EMPTY_PORT_VALUE}>----</option>
        {availableSerialPorts?.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        )) ?? null}
      </select>

      <div>
        {!isDeviceConnected ? (
          <button type="button" onClick={() => connectToPort(selectedPort)}>
            {selectedPort !== EMPTY_PORT_VALUE
              ? `Connect to device on port "${selectedPort}"`
              : "No port selected"}
          </button>
        ) : (
          <button type="button" onClick={() => disconnectFromPort()}>
            Disconnect from port {activeSerialPort}
          </button>
        )}
      </div>

      <p>
        <NavLink to="/">Back to map</NavLink>
      </p>
    </div>
  );
};

export default SerialConnectPage;
