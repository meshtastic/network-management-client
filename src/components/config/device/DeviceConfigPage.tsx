import React from "react";
import type { FormEventHandler } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

import type {
  app_device_MeshChannel,
  app_protobufs_Channel,
  app_protobufs_ChannelSettings,
} from "@bindings/index";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import { PencilIcon } from "@heroicons/react/24/outline";

export interface IDeviceConfigPageProps {
  className?: string;
}

type ChannelSettingsInputs = Omit<
  app_protobufs_ChannelSettings,
  "id" | "channelNum"
> &
  Pick<app_protobufs_Channel, "role">;

const DeviceConfigPage = ({ className = "" }: IDeviceConfigPageProps) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ChannelSettingsInputs>({});

  const onSubmit: SubmitHandler<ChannelSettingsInputs> = (data) => {
    console.log("data", data);
  };

  console.log("form update", watch());

  const test: ChannelSettingsInputs = {
    downlinkEnabled: false,
    name: "test",
    psk: [],
    role: 0,
    uplinkEnabled: false,
  };

  const handleFormSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    handleSubmit(onSubmit, (e) => console.warn("invalid", e))(e).catch(
      console.error
    );
  };

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"Device Configuration"}
        subtitle={"Configure device"}
        renderIcon={(c) => <PencilIcon className={c} />}
        onIconClick={() => alert("incomplete feature")}
      >
        Device
      </ConfigTitlebar>
    </div>
  );
};

export default DeviceConfigPage;
