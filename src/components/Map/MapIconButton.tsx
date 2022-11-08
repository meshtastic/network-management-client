import React, { ReactNode } from 'react';

export interface IMapIconButtonProps {
  children: ReactNode;
  onClick: () => void;
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'];
  className?: string;
}

const MapIconButton = ({ children, onClick, type = "button", className = "" }: IMapIconButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${className} bg-white rounded-lg border-gray-100 shadow-lg`}
    >
      {children}
    </button>
  )
};

export default MapIconButton;
