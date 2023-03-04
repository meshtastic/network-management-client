import React from 'react';
import classNames from 'classnames';
import * as Accordion from '@radix-ui/react-accordion';
import { ShareIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import ArticulationPoints from './algorithms/ArticulationPoints';
import MincutEdges from './algorithms/MinCutEdges';
import DiffusionSimulation from './algorithms/DiffusionSimulation';
const {useEffect, useState } = React;

const AccordionDemo = () => {
  // create a list of nodes that are articulation points
  const articulationPoints = ['f578', 'f572', 'f574'];
  const mincutEdges = [['f578', 'f572'], ['f572', 'f574'], ['f574', 'f578']];
  const diffcen = new Map();

  // create dummy setAlgorithm function that takes in a boolean
  const setAlgorithmB = (checked: boolean) => {
    console.log(checked);
  };

  const [isAPSet, setAP] = useState(false)
  const [isMCESet, setMCE] = useState(false)
  const [isDiffusionSet, setDiffusion] = useState(false)
  
  return (
    <Accordion.Root
      className="border-slate-300 border-065 rounded-lg drop-shadow-lg bg-white absolute top-24 right-9 w-96"
      type="single"
      collapsible
    >
      <Header>Accordion</Header>
      <AccordionItem value="item-1">
        <AccordionTrigger>
          Articulation Points
        </AccordionTrigger>
        <AccordionContent>
          <ArticulationPoints articulationPoints={articulationPoints} isAPSet={isAPSet} setAP={setAP} />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-2">
        <AccordionTrigger>
          Mincut Edges
        </AccordionTrigger>
        <AccordionContent>
          <MincutEdges edges={mincutEdges} isMincutSet={isMCESet} setMinCut={setMCE} />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-3">
        <AccordionTrigger>
          Diffusion Simulation
        </AccordionTrigger>
        <AccordionContent>
          <DiffusionSimulation diffusionCentrality={diffcen} isDiffusionSet={isDiffusionSet} setDiffusion={setDiffusion} />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-4">
        <AccordionTrigger>
          Predicted Network State
        </AccordionTrigger>
        <AccordionContent>
          Yes! You can animate the Accordion with CSS or JavaScript.
        </AccordionContent>
      </AccordionItem>
    </Accordion.Root>
  );
};

const Header = () => (
  <div className="flex items-center justify-between px-5 py-4">
    <div className='flex items-left space-x-4'>
      <ShareIcon className="w-6 h-6 text-gray-700"/>
      <h2 className="text-gray-700 text-lg font-semibold">Network</h2>
    </div>
  </div>
);

const AccordionItem = React.forwardRef(({ children, className, ...props }, forwardedRef) => (
  <Accordion.Item
    className={classNames(
      'focus-within:shadow-mauve12 mt-px overflow-hidden first:mt-0 first:rounded-t last:rounded-b focus-within:relative focus-within:z-10 focus-within:shadow-[0_0_0_2px]',
      className
    )}
    {...props}
    ref={forwardedRef}
  >
    {children}
  </Accordion.Item>
));

const AccordionTrigger = React.forwardRef(({ children, className, ...props }, forwardedRef) => (
  <Accordion.Header className="flex">
    <Accordion.Trigger
      className={classNames(
        'border-065 border-gray-300 bg-slate-50 text-gray-700 hover:bg-gray=300 group flex h-[45px] flex-1 cursor-default items-center justify-between bg-white px-5 text-[15px] leading-none outline-none',
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      {children}
      <ChevronDownIcon
        className="text-gray-700 w-4 h-4 ease-[cubic-bezier(0.87,_0,_0.13,_1)] transition-transform duration-300 group-data-[state=open]:rotate-180"
        aria-hidden
      />
    </Accordion.Trigger>
  </Accordion.Header>
));

const AccordionContent = React.forwardRef(({ children, className, ...props }, forwardedRef) => (
  <Accordion.Content
    className={classNames(
      'text-gray-500 text-sm bg-mauve2 data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden text-[15px]',
      className
    )}
    {...props}
    ref={forwardedRef}
  >
    <div className="py-[15px] px-5">{children}</div>
  </Accordion.Content>
));


export default AccordionDemo;
