import React from 'react';

import BaseIcon from '@app/assets/map-nodes/Size=Medium, State=Nominal, IsBase=True.svg'
import NominalNodeIcon from '@app/assets/map-nodes/Size=Medium, State=Nominal, IsBase=False.svg'
import SelectedNodeIcon from '@app/assets/map-nodes/Size=Large, State=Selected, IsBase=False.svg'
import WarningNodeIcon from '@app/assets/map-nodes/Size=Medium, State=Warning, IsBase=False.svg'
import ErrorNodeIcon from '@app/assets/map-nodes/Size=Medium, State=Error, IsBase=False.svg'

export type NodeState = 'nominal' | 'selected' | 'warning' | 'error';

export interface IMapNodeIconProps {
  size: 'sm' | 'med' | 'lg';
  state: NodeState;
  isBase: boolean;
}

const MapNodeIcon = ({ size, state, isBase, }: IMapNodeIconProps) => {
  if (isBase) return <img src={BaseIcon} />;

  switch (state) {
    case 'selected':
      return <img src={SelectedNodeIcon} />;

    case 'warning':
      return <img src={WarningNodeIcon} />;

    case 'error':
      return <img src={ErrorNodeIcon} />;

    // Nominal
    default:
      return <img src={NominalNodeIcon} />;
  }
};

export default MapNodeIcon;
