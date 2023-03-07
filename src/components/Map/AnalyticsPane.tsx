import React, { useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";

import ArticulationPoints from "@components/Map/algorithms/ArticulationPoints";
import MincutEdges from "@components/Map/algorithms/MinCutEdges";
import DiffusionSimulation from "@components/Map/algorithms/DiffusionSimulation";
import { useDispatch } from "react-redux";
import { deviceSliceActions } from "@app/features/device/deviceSlice";

const AnalyticsPane = () => {
  const dispatch = useDispatch();

  const handleClosePane = () => {
    dispatch(deviceSliceActions.setShowAlgosAccordion(false));
  };

  // create a list of nodes that are articulation points
  const articulationPoints = ["f578", "f572", "f574"];
  const mincutEdges = [
    ["f578", "f572"],
    ["f572", "f574"],
    ["f574", "f578"],
  ];
  const diffcen = new Map();

  const [isAPSet, setAP] = useState(false);
  const [isMCESet, setMCE] = useState(false);
  const [isDiffusionSet, setDiffusion] = useState(false);

  return (
    <Accordion.Root
      className="border-slate-300 border-065 rounded-lg drop-shadow-lg bg-white absolute top-24 right-9 w-96"
      type="single"
      collapsible
    >
      <div className="flex flex-row justify-between align-middle px-5 py-4">
        <h2 className="text-gray-700 text-lg font-semibold">
          Network Analytics
        </h2>
        <button type="button" onClick={handleClosePane}>
          <XMarkIcon className="w-6 h-6 text-gray-500" />
        </button>
      </div>

      {/* Articulation points tab */}
      <Accordion.Item
        className={
          "border-t border-gray-300 focus-within:shadow-mauve12 overflow-hidden first:rounded-t last:rounded-b focus-within:relative focus-within:z-10 focus-within:shadow-[0_0_0_2px]"
        }
        value="item-1"
      >
        <Accordion.Header className="flex data-[state=open]:border-b border-gray-300">
          <Accordion.Trigger
            className={
              "bg-slate-50 text-gray-700 hover:bg-gray=300 group flex h-[45px] flex-1 cursor-default items-center justify-between  px-5 text-[15px] leading-none outline-none"
            }
          >
            Articulation Points
            <ChevronDownIcon
              className="text-gray-700 w-4 h-4 ease-[cubic-bezier(0.87,_0,_0.13,_1)] transition-transform duration-300 group-data-[state=open]:rotate-180"
              aria-hidden
            />
          </Accordion.Trigger>
        </Accordion.Header>

        <Accordion.Content
          className={
            "text-gray-500 text-sm bg-mauve2 data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden text-[15px]"
          }
        >
          <div className="py-[15px] px-5">
            <ArticulationPoints
              articulationPoints={articulationPoints}
              isAPSet={isAPSet}
              setAP={setAP}
            />
          </div>
        </Accordion.Content>
      </Accordion.Item>

      {/* Mincut edges tab */}
      <Accordion.Item
        className={
          "border-t border-gray-300 focus-within:shadow-mauve12 overflow-hidden first:rounded-t last:rounded-b focus-within:relative focus-within:z-10 focus-within:shadow-[0_0_0_2px]"
        }
        value="item-2"
      >
        <Accordion.Header className="flex data-[state=open]:border-b border-gray-300">
          <Accordion.Trigger
            className={
              "bg-slate-50 text-gray-700 hover:bg-gray=300 group flex h-[45px] flex-1 cursor-default items-center justify-between  px-5 text-[15px] leading-none outline-none"
            }
          >
            Mincut Edges
            <ChevronDownIcon
              className="text-gray-700 w-4 h-4 ease-[cubic-bezier(0.87,_0,_0.13,_1)] transition-transform duration-300 group-data-[state=open]:rotate-180"
              aria-hidden
            />
          </Accordion.Trigger>
        </Accordion.Header>

        <Accordion.Content
          className={
            "text-gray-500 text-sm bg-mauve2 data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden text-[15px]"
          }
        >
          <div className="py-[15px] px-5">
            <MincutEdges
              edges={mincutEdges}
              isMincutSet={isMCESet}
              setMinCut={setMCE}
            />
          </div>
        </Accordion.Content>
      </Accordion.Item>

      {/* Diffusion simulation tab */}
      <Accordion.Item
        className={
          "border-t border-gray-300 focus-within:shadow-mauve12 overflow-hidden first:rounded-t last:rounded-b focus-within:relative focus-within:z-10 focus-within:shadow-[0_0_0_2px]"
        }
        value="item-3"
      >
        <Accordion.Header className="flex data-[state=open]:border-b border-gray-300">
          <Accordion.Trigger
            className={
              "bg-slate-50 text-gray-700 hover:bg-gray=300 group flex h-[45px] flex-1 cursor-default items-center justify-between  px-5 text-[15px] leading-none outline-none"
            }
          >
            Diffusion Simulation
            <ChevronDownIcon
              className="text-gray-700 w-4 h-4 ease-[cubic-bezier(0.87,_0,_0.13,_1)] transition-transform duration-300 group-data-[state=open]:rotate-180"
              aria-hidden
            />
          </Accordion.Trigger>
        </Accordion.Header>

        <Accordion.Content
          className={
            "text-gray-500 text-sm bg-mauve2 data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden text-[15px]"
          }
        >
          <div className="py-[15px] px-5">
            <DiffusionSimulation
              diffusionCentrality={diffcen}
              isDiffusionSet={isDiffusionSet}
              setDiffusion={setDiffusion}
            />
          </div>
        </Accordion.Content>
      </Accordion.Item>

      {/* Predicted network state tab */}
      <Accordion.Item
        className={
          "border-t border-gray-300 focus-within:shadow-mauve12 overflow-hidden first:rounded-t last:rounded-b focus-within:relative focus-within:z-10 focus-within:shadow-[0_0_0_2px]"
        }
        value="item-4"
      >
        <Accordion.Header className="flex data-[state=open]:border-b border-gray-300">
          <Accordion.Trigger
            className={
              "bg-slate-50 text-gray-700 hover:bg-gray=300 group flex h-[45px] flex-1 cursor-default items-center justify-between  px-5 text-[15px] leading-none outline-none"
            }
          >
            Predicted Network State
            <ChevronDownIcon
              className="text-gray-700 w-4 h-4 ease-[cubic-bezier(0.87,_0,_0.13,_1)] transition-transform duration-300 group-data-[state=open]:rotate-180"
              aria-hidden
            />
          </Accordion.Trigger>
        </Accordion.Header>

        <Accordion.Content
          className={
            "text-gray-500 text-sm bg-mauve2 data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden text-[15px]"
          }
        >
          <div className="py-[15px] px-5">
            When we have enough training data, we can use AI predict the network
            state!
          </div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
};

export default AnalyticsPane;
