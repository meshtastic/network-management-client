import React from "react";

export interface ISidebarIconProps {
  renderIcon: () => JSX.Element;
  isActive: boolean;
  setTabActive: () => void;
}

const SidebarIcon = (props: ISidebarIconProps) => {
  return (
    <button
      type="button"
      className={`relative hover:bg-blue-50 w-14 h-14 ${
        props.isActive ? "bg-blue-50" : ""
      }`}
      onClick={() => {
        props.setTabActive();
      }}
    >
      <div className="opacity-50 m-4">{props.renderIcon()}</div>
      {props.isActive && (
        <span className="absolute bg-blue-400 h-full top-0 right-0 w-1" />
      )}
    </button>
  );
};

export default SidebarIcon;
