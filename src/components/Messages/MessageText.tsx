import React from "react";
import MapNodeIcon from "@components/Map/MapNodeIcon";

export interface Message {
  name: string;
  preview: string;
}

const MessageText = (
  { name, preview }: Message,
  { size, state, isBase }: MapNodeIcon
) => {
  return (
    <div className="p-5 hover:bg-gray-200 text-serif">
      <div>
        <div className="bg-red flex flex-row">
          <div className="">
            <MapNodeIcon
              size={"sm"}
              state={"error"}
              isBase={false}
              className="drop-shadow-lg"
            />
          </div>
          <div className="text-xl pl-1 flex">{name}</div>
          <div className="ml-[20%] text-lg">
            <div>{"(2 min. ago)"}</div>
          </div>
        </div>
      </div>
      <div className="text-lg mt-[2%] truncate">{preview} </div>
    </div>
  );
};

export default MessageText;
