import React, { useEffect } from "react";
import type { FormEventHandler } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { PencilIcon } from "@heroicons/react/24/outline";

import type {
  app_device_MeshChannel,
  app_protobufs_Channel,
  app_protobufs_ChannelSettings,
} from "@bindings/index";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import { getChannelName } from "@utils/messaging";

export interface IChannelConfigDetailProps {
  channel: app_device_MeshChannel;
  className?: string;
}

type ChannelSettingsInputs = Omit<
  app_protobufs_ChannelSettings,
  "id" | "channelNum"
> &
  Pick<app_protobufs_Channel, "role">;

const ChannelConfigDetail = ({
  channel,
  className = "",
}: IChannelConfigDetailProps) => {
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

  // Reset form on channel switch
  useEffect(() => {
    reset();
  }, [channel.config.index]);

  const channelName = getChannelName(channel);

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
        title={"Channel Configuration"}
        subtitle={`Configure channel "${channelName}"`}
        renderIcon={(c) => <PencilIcon className={c} />}
        onIconClick={() => alert("incomplete feature")}
      >
        <form onSubmit={handleFormSubmit}>
          <input
            type="checkbox"
            defaultChecked={channel.config.settings?.downlinkEnabled ?? false}
            {...register("downlinkEnabled")}
          />
          {errors.downlinkEnabled?.message}

          <input
            type="checkbox"
            defaultChecked={channel.config.settings?.uplinkEnabled ?? false}
            {...register("uplinkEnabled")}
          />
          {errors.uplinkEnabled?.message}

          <input type="submit" />
        </form>
      </ConfigTitlebar>
    </div>
  );
};

export default ChannelConfigDetail;
