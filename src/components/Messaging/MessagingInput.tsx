import { DefaultTooltip } from "@components/DefaultTooltip";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { FormEventHandler, useState } from "react";

export interface IMessagingInputProps {
  onSubmit: (message: string) => void;
  placeholder?: string;
  className?: string;
}

export const MessagingInput = ({
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
      className={`${className} flex flex-row bg-white dark:bg-gray-800 rounded-lg gap-3 border h-12 border-gray-200 dark:border-gray-500`}
    >
      <input
        type="text"
        placeholder={placeholder}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="rounded-l-lg flex-1 pl-4 text-sm font-normal bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 placeholder:text-sm placeholder:font-normal placeholder:text-gray-300 dark:placeholder:text-gray-500"
      />
      <div className="my-2 w-[1px] bg-gray-200 dark:bg-gray-500" />
      <DefaultTooltip text="Send message to channel">
        <button type="submit" className="py-2 pr-3">
          <PaperAirplaneIcon className="w-6 h-6 text-gray-400 dark:text-gray-400" />
        </button>
      </DefaultTooltip>
    </form>
  );
};
