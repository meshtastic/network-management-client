import React from 'react';
import classNames from 'classnames';
import { LastRan, AlgorithmSelector } from './CommonComps';
import { DiffSimTotalChartTimeline } from './Chart';

export interface DiffusionSimulationInterface {
  diffusionCentrality: Map<string, Map<string, Map<string, number>>>;
  isDiffusionSet: boolean;
  setDiffusion: (checked: boolean) => void;
}

const DiffusionSimulation = ({
  diffusionCentrality,
  isDiffusionSet,
  setDiffusion,
}: DiffusionSimulationInterface) => {
  return (
    <div>
      <AlgorithmSelector
        algorithm="Diffusion Simulation"
        isSet={isDiffusionSet}
        setAlgorithm={setDiffusion}
      />
      <p>
        Explain what diffusion simulation is. Maybe propose
        suggested actions to take (message these nodes)
        with standard messages.
      </p>
      <DiffSimTotalChartTimeline />
      <LastRan lastRanMinutes={5} />
      <div className='flex'>
        // create a dropdown for source node, a dropdown for destination node, and a textfield for the time
        // use the values to extract value from diffusionCentrality hashmap and display it
        
        
      </div>
    </div>
  );
};

export default DiffusionSimulation;