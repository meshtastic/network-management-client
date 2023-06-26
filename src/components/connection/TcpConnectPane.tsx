import React from "react";
import type { FormEventHandler } from "react";
import {
  EllipsisHorizontalCircleIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";

import ConnectionInput from "@components/connection/ConnectionInput";
import type { RequestStatus } from "@features/requests/requestReducer";

export interface ITcpConnectPaneProps {
  socketAddress: string;
  setSocketAddress: (socketAddress: string) => void;
  socketPort: string;
  setSocketPort: (socketPort: string) => void;
  activeSocketState: RequestStatus;
  handleSocketConnect: FormEventHandler;
}

const TcpConnectPane = ({
  socketAddress,
  setSocketAddress,
  socketPort,
  setSocketPort,
  activeSocketState,
  handleSocketConnect,
}: ITcpConnectPaneProps) => {
  return (
    <form className="flex flex-col gap-4 mt-4" onSubmit={handleSocketConnect}>
      <ConnectionInput
        type="text"
        enterKeyHint="go"
        placeholder="IP address or host name"
        value={socketAddress}
        onChange={(e) => setSocketAddress(e.target.value)}
        disabled={activeSocketState.status === "PENDING"}
      />

      <ConnectionInput
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
  );
};

export default TcpConnectPane;
