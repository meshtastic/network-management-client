import React from "react";

export interface ISidebarIcon {
  renderIcon: () => JSX.Element;
}

const SidebarIcon = (props: ISidebarIcon) => {
  return (
    <button
      type="button"
      className=" hover:bg-blue-50 p-5"
    >
      <div className="opacity-50">{props.renderIcon()}</div>
    </button>
  );
};

export default SidebarIcon;
