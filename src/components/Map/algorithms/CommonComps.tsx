import { CheckIcon } from "@heroicons/react/24/outline";
import * as Checkbox from "@radix-ui/react-checkbox";

const LastRan = ({ lastRanMinutes }: { lastRanMinutes: number }) => {
  return (
    <div className="flex space-x-4">
      <p>Last Ran: {lastRanMinutes} minutes ago</p>
    </div>
  );
};

export interface AlgorithmSelectorProps {
  algorithm: string;
  isSet: boolean;
  setAlgorithm: (checked: boolean) => void;
}

// component AlgorithmSelector receives the state and name of the algorithm and
// sets the state of the algorithm to true when user selects it
const AlgorithmSelector = ({ isSet, setAlgorithm }: AlgorithmSelectorProps) => {
  return (
    <div className="flex space-x-4 pb-3">
      <Checkbox.Root
        className="shadow-gray-100 hover:bg-gray-50 border-065 flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-[4px] bg-white shadow-[0_2px_10px] outline-none focus:shadow-[0_0_0_2px_black]"
        checked={isSet}
        onCheckedChange={setAlgorithm}
      >
        <Checkbox.Indicator className="text-violet11">
          <CheckIcon className="w-5 h-5" />
        </Checkbox.Indicator>
      </Checkbox.Root>
      <p>{isSet ? "Active" : "Inactive"}</p>
    </div>
  );
};

export { LastRan, AlgorithmSelector };
