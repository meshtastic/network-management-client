import React, { useMemo, useState } from "react";
import type { FormEventHandler } from "react";
import { useSelector } from "react-redux";
import { useForm, SubmitHandler, SubmitErrorHandler } from "react-hook-form";
import { Save } from "lucide-react";
import { v4 } from "uuid";

import type { app_protobufs_config_NetworkConfig } from "@bindings/index";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import ConfigLabel from "@components/config/ConfigLabel";
import ConfigInput from "@components/config/ConfigInput";
import { selectDevice } from "@features/device/deviceSelectors";

export interface INetworkConfigPageProps {
  className?: string;
}

type NetworkConfigInput = app_protobufs_config_NetworkConfig;

const NetworkConfigPage = ({ className = "" }: INetworkConfigPageProps) => {
  const device = useSelector(selectDevice());

  const [wifiDisabled, setWifiDisabled] = useState(
    !device?.config.network?.wifiEnabled ?? true
  );

  const [ethDisabled, setEthDisabled] = useState(
    !device?.config.network?.ethEnabled ?? true
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<NetworkConfigInput>({
    defaultValues: device?.config.network ?? undefined,
  });

  watch((d) => {
    setWifiDisabled(!d.wifiEnabled);
    setEthDisabled(!d.ethEnabled);
  });

  const onValidSubmit: SubmitHandler<NetworkConfigInput> = (d) => {
    // See https://github.com/react-hook-form/react-hook-form/issues/10378
    const data: NetworkConfigInput = {
      ...d,
      addressMode: parseInt(d.addressMode as unknown as string),
    };

    console.log("data", data);
  };

  const onInvalidSubmit: SubmitErrorHandler<NetworkConfigInput> = (errors) => {
    console.warn("errors", errors);
  };

  const handleFormSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    handleSubmit(onValidSubmit, onInvalidSubmit)(e).catch(console.error);
  };

  const formId = useMemo(() => v4(), []);

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"Network Configuration"}
        subtitle={"Configure device network connection"}
        renderIcon={(c) => <Save className={c} />}
        buttonProps={{ type: "submit", form: formId }}
      >
        <form
          className="flex flex-col gap-6"
          id={formId}
          onSubmit={handleFormSubmit}
        >
          <ConfigInput
            type="checkbox"
            text="WiFi Enabled"
            error={errors.wifiEnabled?.message}
            {...register("wifiEnabled")}
          />

          <ConfigInput
            disabled={wifiDisabled}
            type="text"
            text="WiFi SSID"
            error={errors.wifiSsid?.message}
            {...register("wifiSsid")}
          />

          <ConfigInput
            disabled={wifiDisabled}
            type="text"
            text="WiFi SSID"
            error={errors.wifiSsid?.message}
            {...register("wifiSsid")}
          />

          <ConfigInput
            type="checkbox"
            text="Ethernet Enabled"
            error={errors.ethEnabled?.message}
            {...register("ethEnabled")}
          />

          <ConfigLabel text="Address Mode" error={errors.addressMode?.message}>
            <select disabled={ethDisabled} {...register("addressMode")}>
              <option value="0">DHCP</option>
              <option disabled value="1">
                Static IP
              </option>
            </select>
          </ConfigLabel>

          <ConfigInput
            disabled={wifiDisabled && ethDisabled}
            type="text"
            text="NTP Server"
            error={errors.ntpServer?.message}
            {...register("ntpServer")}
          />

          {/* TODO IPv4 Config */}
          {/* TODO Log Server Config */}
        </form>
      </ConfigTitlebar>
    </div>
  );
};

export default NetworkConfigPage;
