import React, { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import NodeSearchInput from "@components/NodeSearch/NodeSearchInput";
import MapIconButton from "@components/Map/MapIconButton";

const Messages = () => {
  const [query, setQuery] = useState("");

  return (
    <div className="absolute left-9 top-9 w-96 p-4 flex flex-col gap-4">
      <div className="flex flex-row gap-4">
        <NodeSearchInput
          query={query}
          setQuery={setQuery}
          placeholder={"Search for messages"}
        />
        <MapIconButton
          className="p-3"
          type="submit"
          onClick={() => alert("Functionality not implemented")}
        >
          <MagnifyingGlassIcon className="w-6 h-6 text-gray-500" />
        </MapIconButton>
      </div>

      <div className="flex flex-col rounded-lg w-full h-auto bg-gray-100 drop-shadow justify-top overflow-y-auto"></div>
    </div>
  );
};

export default Messages;
