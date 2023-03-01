import React, { useState, FormEventHandler } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { Waypoint } from "@bindings/protobufs/Waypoint";

import WaypointIcon from "@app/components/Waypoints/WaypointIcon";
import WaypointMenu from "@app/components/Waypoints/WaypointMenu";

import { requestNewWaypoint } from "@features/device/deviceActions";
import { selectDevice } from "@features/device/deviceSelectors";
import { Input } from "@material-tailwind/react";

import { Marker } from "react-map-gl";

//// Just for now, so that we can test
const WaypointForm = () => {
  const dispatch = useDispatch();
  const nodles = useSelector(selectDevice());
  const [id, setID] = useState(0);
  const [name, setName] = useState("No name");
  const [desc, setDesc] = useState("No desc");
  const [long, setLong] = useState(0);
  const [lat, setLat] = useState(0);

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    const newWaypoint: Waypoint = {
      id: id, // No idea how to come up with this
      latitudeI: Math.round(34 * 1e7),
      longitudeI: Math.round(56 * 1e7),
      expire: 1708116114, // 2024 2/16
      lockedTo: 0, // Protobuf need updating
      name: name,
      description: desc,
      icon: 128529, // -_- emoji
    };

    dispatch(requestNewWaypoint({ waypoint: newWaypoint, channel: 0 }));

    console.log(nodles ? nodles.waypoints : "nowo waypowoints");

    setID(id + 1);
  };

  return (
    <div className="overflow-y-scroll h-4/5 mt-2">
      <form onSubmit={handleSubmit}>
        <label className="pl-[4%] pl-2 text-xl"> Name </label>
        <div className="pl-[6%] pr-[8%] font-sans text-sm pb-12">
          <Input
            type="text"
            size="lg"
            value={id}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <label className="flex pl-[4%] pt-[6%] pl-2 text-xl">Device Name</label>
        <div className="pl-[6%] pr-[8%] font-sans text-sm pb-12">
          <Input
            type="number"
            size="lg"
            value={lat}
            onChange={(e) => setLat(e.target.valueAsNumber)}
          />
        </div>
        <label className="flex pl-[4%] pt-[6%] pl-2 text-xl">Device Name</label>
        <div className="pl-[6%] pr-[8%] font-sans text-sm pb-12">
          <Input
            type="number"
            size="lg"
            value={long}
            onChange={(e) => setLong(e.target.valueAsNumber)}
          />
        </div>
        <div className="flex justify-center pt-[6%] pb-[3%]">
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  );
};

export default WaypointForm;
