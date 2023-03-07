import React from "react";
import { LastRan, AlgorithmSelector } from "./CommonComps";
import { DiffSimTotalChartTimeline } from "./Chart";

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
      This score between source node a and destination node b is the expected number of times a will be able to communicate with b in selected T periods.
      </p>
      <DiffSimTotalChartTimeline />
      <LastRan lastRanMinutes={5} />
      <div className="flex">
        {/*create a dropdown for source node, a dropdown for destination node, and a textfield for the time
          use the values to extract value from diffusionCentrality hashmap and display it */}
      </div>
    </div>
  );
};

export default DiffusionSimulation;
