import React from "react";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
export interface IDataComponent {
  header: string;
  category: string;
  data: string;
}

const DataComponent = ({ header, category, data }: IDataComponent) => {
  switch (header) {
    case "Name":
      switch (data) {
        case "(empty)":
          return (
            <div className="text-gray-500 text-sm leading-5 font-normal">
              <i>{data}</i>
            </div>
          );
        default:
          return (
            <div className="text-gray-500 text-sm leading-5 font-normal">
              {data}
            </div>
          );
      }
    case "ID":
      return (
        <div className="text-gray-500 text-sm leading-5 font-normal">
          {data}
        </div>
      );

    case "Role":
      switch (category) {
        case "Primary":
          return (
            <div className="border border-solid rounded-md text-blue-500 text-xs bg-blue-100 border-blue-300 pl-2 pr-2 pt-1 pb-1 text-center">
              primary
            </div>
          );
        case "Secondary":
          return (
            <div className="border border-solid rounded-md text-indigo-500 text-xs bg-indigo-100 border-indigo-300 pl-2 pr-2 pt-1 pb-1 text-center">
              secondary
            </div>
          );
        case "Disabled":
          return (
            <div className="border border-solid rounded-md text-gray-500 text-xs bg-gray-100 border-gray-300 pl-2 pr-2 pt-1 pb-1 text-center">
              disabled
            </div>
          );
        default:
          return <div></div>;
      }

    case "Encryption":
      switch (category) {
        case "Enabled":
          return (
            <div className="border border-solid rounded-md text-green-600 text-xs bg-green-100 border-green-300 pl-2 pr-2 pt-1 pb-1 text-center">
              enabled
            </div>
          );
        case "Disabled":
          return (
            <div className="border border-solid rounded-md text-gray-500 text-xs bg-gray-100 border-gray-300 pl-2 pr-2 pt-1 pb-1 text-center">
              disabled
            </div>
          );
        default:
          return <div></div>;
      }

    case "Uplink":
      switch (category) {
        case "Enabled":
          return (
            <div className="border border-solid rounded-md text-green-600 text-xs bg-green-100 border-green-300 pl-2 pr-2 pt-1 pb-1 text-center">
              enabled
            </div>
          );
        case "Disabled":
          return (
            <div className="border border-solid rounded-md text-gray-500 text-xs bg-gray-100 border-gray-300 pl-2 pr-2 pt-1 pb-1 text-center">
              disabled
            </div>
          );
        default:
          return <div></div>;
      }

    case "Downlink":
      switch (category) {
        case "Enabled":
          return (
            <div className="border border-solid rounded-md text-green-600 text-xs bg-green-100 border-green-300 pl-2 pr-2 pt-1 pb-1 text-center">
              enabled
            </div>
          );
        case "Disabled":
          return (
            <div className="border border-solid rounded-md text-gray-500 text-xs bg-gray-100 border-gray-300 pl-2 pr-2 pt-1 pb-1 text-center">
              disabled
            </div>
          );
        default:
          return <div></div>;
      }

    case "PSK":
      switch (category) {
        case "Empty":
          return (
            <div className="text-gray-500 text-sm leading-5 font-normal">
              <i>(empty)</i>
            </div>
          );
        case "NotEmpty":
          return (
            <div className="flex flex-row">
              <div className="text-xs leading-4 font-semibold mt-1 text-center">
                ••••••••••••••••
              </div>
              <div className="ml-2">
                <DocumentDuplicateIcon className="w-6 h-6 text-gray-400 hover:cursor-pointer" />
              </div>
            </div>
          );
        default:
          return <div></div>;
      }

    default:
      return <div></div>;
  }
};

export default DataComponent;
