import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import React, { FormEventHandler, useState } from "react";

export interface IMessagingInputProps {
  onSubmit: (message: string) => void;
  placeholder?: string;
  className?: string;
}

const MessagingInput = ({
  onSubmit,
  placeholder = "",
  className = "",
}: IMessagingInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    onSubmit(message);
    setMessage("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`${className} flex flex-row bg-white rounded-lg gap-3 border border-gray-200`}
    >
      <input
        type="text"
        placeholder={placeholder}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="rounded-l-lg flex-1 pl-4 text-sm font-normal text-gray-700 placeholder:text-sm placeholder:font-normal placeholder:text-gray-300"
      />
      <div className="my-2 w-[1px] bg-gray-200" />
      <button type="submit" className="py-2 pr-3">
        <PaperAirplaneIcon className="w-6 h-6 text-gray-400" />
      </button>
    </form>
  );
};

export default MessagingInput;
