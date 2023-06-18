import React from "react";
import * as Tabs from "@radix-ui/react-tabs";

export interface IConnectTabProps {
  value: string;
  label: string;
  tooltip: string;
  className?: string;
}

const ConnectTab = ({
  value,
  label,
  // tooltip,
  className = "",
}: IConnectTabProps) => {
  return (
    <Tabs.Trigger
      className={`flex flex-row align-middle gap-2 px-8 py-4 border-gray-500 text-gray-500 data-[state=active]:border-b-2 data-[state=active]:text-gray-700 ${className}`}
      value={value}
    >
      <p>{label}</p>
      {/* TODO - add tooltip support, bug with radix tooltip */}
      {/* <DefaultTooltip text={tooltip}>
        <div className="m-auto">
          <QuestionMarkCircledIcon />
        </div>
      </DefaultTooltip> */}
    </Tabs.Trigger>
  );
};

export default ConnectTab;
