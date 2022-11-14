import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import MessageText from "@components/Messages/MessageText";

const previewText =
  "We've been trying to reach you concerning your Meshtastic's extended warranty. You should've received a notice in the mail about your Meshtastic's extended warranty eligibility. Since we've not gotten a response, we're giving you a final courtesy call before we close out your file. Press 2 to be removed and placed on our do-not-call list. To speak to someone about possibly extending or reinstating your Meshtastic's warranty, press 1 to speak with a warranty specialist.";
const name = "Mr. Meshtastic";

function Messages() {
  return (
    <div className="absolute left-9 top-9 w-96 h-[90%] flex flex-col gap-5">
      <div className="flex gap-4">
        <input
          className="w-full h-full px-4 py-3 default-overlay font-sans text-base font-normal text-gray-500 placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:text-gray-300"
          type="text"
          placeholder="Search for messages"
        />
        <div className="bg-white hover:bg-gray-200 rounded-lg p-3">
          <MagnifyingGlassIcon className="w-6 h-6 text-gray-500" />
        </div>
      </div>
      <div className="flex flex-col rounded-lg w-full h-auto bg-gray-100 drop-shadow justify-top overflow-y-auto">
        <MessageText name={name} preview={previewText} />
        <hr className="mx-8 text-gray-500 border bg-gray-700" />
        <MessageText name={name} preview={previewText} />
      </div>
    </div>
  );
}

export default Messages;
