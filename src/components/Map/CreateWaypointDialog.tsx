import React, { ChangeEventHandler, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { LngLat } from "react-map-gl";

import moment from "moment";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";
import { X } from "lucide-react";

import type { app_protobufs_Waypoint } from "@bindings/index";

import ConnectionInput from "@components/connection/ConnectionInput";
import { requestSendWaypoint } from "@features/device/deviceActions";
import {
  selectDeviceChannels,
  selectPrimaryDeviceKey,
} from "@features/device/deviceSelectors";

import { dateTimeLocalFormatString } from "@utils/form";
import { formatLocation } from "@utils/map";
import { getChannelName } from "@utils/messaging";

import "@components/Map/MapView.css";

export interface ICreateWaypointDialogProps {
  lngLat: LngLat;
  closeDialog: () => void;
}

const WAYPOINT_NAME_MAX_LEN = 30;
const WAYPOINT_DESC_MAX_LEN = 100;

const CreateWaypointDialog = ({
  lngLat,
  closeDialog,
}: ICreateWaypointDialogProps) => {
  const dispatch = useDispatch();
  const primaryDeviceKey = useSelector(selectPrimaryDeviceKey());
  const deviceChannels = useSelector(selectDeviceChannels());

  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<{ value: string; isValid: boolean }>({
    value: "",
    isValid: true,
  });

  const handleNameChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { value } = e.target;
    const isValid = value.length <= WAYPOINT_NAME_MAX_LEN;
    setName({ value, isValid });

    if (!isValid && nameRef.current) {
      console.warn("setting name invalid");
      nameRef.current.setCustomValidity(
        `Entered name too long (${value.length}/${WAYPOINT_NAME_MAX_LEN})`
      );
    }

    if (isValid && nameRef.current) {
      console.warn("setting name valid");
      nameRef.current.setCustomValidity(""); // Make input valid
    }
  };

  const descRef = useRef<HTMLInputElement>(null);
  const [desc, setDesc] = useState<{
    value: string;
    isValid: boolean;
  }>({ value: "", isValid: true });

  const handleDescChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { value } = e.target;
    const isValid = value.length <= WAYPOINT_DESC_MAX_LEN;
    setDesc({ value, isValid });

    if (!isValid && descRef.current) {
      console.warn("setting desc invalid");
      descRef.current.setCustomValidity(
        `Entered description too long (${value.length}/${WAYPOINT_DESC_MAX_LEN})`
      );
    }

    if (isValid && descRef.current) {
      console.warn("setting desc valid");
      descRef.current.setCustomValidity(""); // Make input valid
    }
  };

  const [expireTime, setExpireTime] = useState<string>(
    moment().add(1, "years").format(dateTimeLocalFormatString)
  );

  const [channelNum, setChannelNum] = useState(0);

  const handleSubmit = () => {
    const createdWaypoint: app_protobufs_Waypoint = {
      id: 0, // New waypoint
      latitudeI: Math.round(lngLat.lat * 1e7),
      longitudeI: Math.round(lngLat.lng * 1e7),
      name: name.value,
      description: desc.value,
      expire: moment(expireTime).valueOf() / 1000, // secs since epoch
      lockedTo: 0, // Not locked
      icon: 0, // No icon
    };

    if (!primaryDeviceKey) {
      console.warn("No primary device key port, not creating waypoint");
      return;
    }

    dispatch(
      requestSendWaypoint({
        deviceKey: primaryDeviceKey,
        waypoint: createdWaypoint,
        channel: channelNum,
      })
    );

    closeDialog();
  };

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-gray-900/[0.4]" />
      <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white default-overlay w-[480px] flex flex-col gap-4 p-6">
        <div className="flex flex-col">
          <Dialog.Title className="text-base font-medium text-gray-700">
            Create Waypoint
          </Dialog.Title>

          <Dialog.Description className="text-sm font-normal text-gray-500">
            Create a new waypoint at ({formatLocation(lngLat.lat)},{" "}
            {formatLocation(lngLat.lng)}).
          </Dialog.Description>
        </div>

        <fieldset className="">
          <label className="flex flex-col flex-1">
            <p
              className={`flex flex-row justify-between ${
                name.isValid ? "text-gray-600" : "text-red-500"
              }`}
            >
              <span>Name</span>
              <span>
                ({name.value.length}/{WAYPOINT_NAME_MAX_LEN})
              </span>
            </p>

            <ConnectionInput
              className="w-full invalid:border-red-400 invalid:text-red-400"
              placeholder="Enter a title"
              value={name.value}
              onChange={handleNameChange}
              ref={nameRef}
            />
          </label>
        </fieldset>

        <fieldset className="">
          <label className="flex flex-col flex-1">
            <p
              className={`flex flex-row justify-between ${
                desc.isValid ? "text-gray-600" : "text-red-500"
              }`}
            >
              <span>Description</span>
              <span>
                ({desc.value.length}/{WAYPOINT_DESC_MAX_LEN})
              </span>
            </p>

            <ConnectionInput
              className="w-full invalid:border-red-400 invalid:text-red-400"
              placeholder="Enter a description"
              value={desc.value}
              onChange={handleDescChange}
              ref={descRef}
            />
          </label>
        </fieldset>

        <fieldset className="">
          <label className="">
            <p className="text-gray-600">Expire Time</p>
            <ConnectionInput
              className="w-full"
              type="datetime-local"
              min={moment().format(dateTimeLocalFormatString)}
              value={expireTime}
              onChange={(e) => setExpireTime(e.target.value)}
            />
          </label>
        </fieldset>

        <fieldset className="">
          <label className="">
            <p className="text-gray-600">Device Channel</p>
            <Select.Root
              value={`${channelNum}`}
              onValueChange={(e) => setChannelNum(parseInt(e))}
            >
              <Select.Trigger
                className="flex-1 border px-5 py-4 border-gray-400 rounded-lg text-gray-700 h-full bg-transparent focus:outline-none disabled:cursor-wait inline-flex items-center justify-center"
                aria-label="Channels"
                asChild
              >
                <button>
                  <Select.Value
                    placeholder="Select a channel..."
                    defaultValue={0}
                  />
                  <Select.Icon className="ml-2">
                    <ChevronDownIcon />
                  </Select.Icon>
                </button>
              </Select.Trigger>

              <Select.Portal>
                <Select.Content className="">
                  <Select.ScrollUpButton className="flex items-center justify-center h-6">
                    <ChevronUpIcon />
                  </Select.ScrollUpButton>

                  <Select.Viewport className="bg-white p-2 rounded-lg shadow-lg">
                    <Select.Group>
                      {deviceChannels.map((c) => (
                        <Select.Item
                          key={c.config.index}
                          value={`${c.config.index}`}
                          className={`relative flex items-center select-none h-6 pl-7 pr-5 py-4 text-gray-700 cursor-pointer radix-disabled:cursor-default radix-disabled:opacity-50`}
                          disabled={c.config.role === 0} // DISABLED role
                        >
                          <Select.ItemText>{getChannelName(c)}</Select.ItemText>
                          <Select.ItemIndicator className="absolute left-0 w-6 inline-flex items-center justify-center">
                            <CheckIcon />
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Viewport>

                  <Select.ScrollDownButton className="flex items-center justify-center h-6">
                    <ChevronDownIcon />
                  </Select.ScrollDownButton>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </label>
        </fieldset>

        <div className="flex flex-row gap-4 justify-end mt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!(name.isValid && desc.isValid)}
            className=" text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed"
          >
            Create waypoint
          </button>

          <Dialog.Close asChild>
            <button className="text-gray-600">Cancel</button>
          </Dialog.Close>
        </div>

        <Dialog.Close asChild>
          <button
            className="absolute top-6 right-6 w-6 h-6 text-gray-500"
            aria-label="Close"
          >
            <X strokeWidth={1.5} />
          </button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
};

export default CreateWaypointDialog;
