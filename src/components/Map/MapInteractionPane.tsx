import { Lightbulb } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { MapOverlayButton } from "@components/Map/MapOverlayButton";
import { selectInfoPane } from "@features/ui/selectors";
import { uiSliceActions } from "@features/ui/slice";

export const MapInteractionPane = () => {
  const dispatch = useDispatch();
  const accordionShown = useSelector(selectInfoPane()) === "algos";

  const handleClickStacks = () => {
    dispatch(uiSliceActions.setInfoPane(accordionShown ? null : "algos"));
  };

  return (
    <div className="absolute top-9 right-9 flex gap-4">
      <MapOverlayButton
        selected={accordionShown}
        onClick={handleClickStacks}
        tooltipText="Show algorithm pane"
        tooltipProps={{ side: "left" }}
      >
        <Lightbulb
          strokeWidth={1.5}
          className={`w-6 h-6 ${
            accordionShown ? "text-gray-200" : "text-gray-400"
          }`}
        />
      </MapOverlayButton>
    </div>
  );
};
