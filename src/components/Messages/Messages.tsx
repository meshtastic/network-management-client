import React, { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import MessageText from "@components/Messages/MessageText";
import NodeSearchInput from "@components/NodeSearch/NodeSearchInput";
import MapIconButton from "@components/Map/MapIconButton";

const previewText =
  "We've been trying to reach you concerning your Meshtastic's extended warranty. You should've received a notice in the mail about your Meshtastic's extended warranty eligibility. Since we've not gotten a response, we're giving you a final courtesy call before we close out your file. Press 2 to be removed and placed on our do-not-call list. To speak to someone about possibly extending or reinstating your Meshtastic's warranty, press 1 to speak with a warranty specialist.";
const name = "Mr. Meshtastic";

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

      <div className="flex flex-col rounded-lg w-full h-auto bg-gray-100 drop-shadow justify-top overflow-y-auto">
        <MessageText name={name} preview={previewText} />
        <hr className="mx-8 text-gray-500 border bg-gray-700" />
        <MessageText name={name} preview={previewText} />
      </div>
    </div>
  );
};

export default Messages;
