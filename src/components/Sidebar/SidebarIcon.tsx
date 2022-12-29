import React from "react";

export interface ISidebarIconProps {
  isActive: boolean;
  renderIcon: () => JSX.Element;
  onClick: () => void;
}

const SidebarIcon = ({ isActive, renderIcon, onClick }: ISidebarIconProps) => {
  return (
    <button
      type="button"
      className={`relative hover:bg-blue-50 w-14 h-14 ${
        isActive ? "bg-blue-50" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex text-gray-500 m-4">{renderIcon()}</div>
      {isActive && (
        <span className="absolute bg-blue-400 h-full top-0 right-0 w-1" />
      )}
    </button>
  );
};

export default SidebarIcon;
