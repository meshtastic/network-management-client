import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, DeepPartial } from "react-hook-form";
import { RotateCcw } from "lucide-react";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import ConfigLabel from "@components/config/ConfigLabel";
import ConfigInput from "@components/config/ConfigInput";

import {
  NetworkConfigInput,
  configSliceActions,
} from "@features/config/configSlice";
import {
  selectCurrentRadioConfig,
  selectEditedRadioConfig,
} from "@features/config/configSelectors";

import { selectDevice } from "@features/device/deviceSelectors";
import { getDefaultConfigInput } from "@utils/form";

export interface INetworkConfigPageProps {
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parseNetworkConfigInput = (
  d: DeepPartial<NetworkConfigInput>
): DeepPartial<NetworkConfigInput> => ({
  ...d,
  addressMode: parseInt(d.addressMode as unknown as string),
});

const NetworkConfigPage = ({ className = "" }: INetworkConfigPageProps) => {
  const dispatch = useDispatch();
  const device = useSelector(selectDevice());

  const currentConfig = useSelector(selectCurrentRadioConfig());
  const editedConfig = useSelector(selectEditedRadioConfig());

  const [wifiDisabled, setWifiDisabled] = useState(
    !device?.config.network?.wifiEnabled ?? true
  );

  const [ethDisabled, setEthDisabled] = useState(
    !device?.config.network?.ethEnabled ?? true
  );

  const defaultValues = useMemo(
    () =>
      getDefaultConfigInput(
        device?.config.network ?? undefined,
        editedConfig.network ?? undefined
      ),
    []
  );

  const updateStateFlags = (d: DeepPartial<NetworkConfigInput>) => {
    setWifiDisabled(!d.wifiEnabled);
    setEthDisabled(!d.ethEnabled);
  };

  useEffect(() => {
    if (!defaultValues) return;
    updateStateFlags(defaultValues);
  }, [defaultValues]);

  const {
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm<NetworkConfigInput>({
    defaultValues,
  });

  watch((d) => {
    const data = parseNetworkConfigInput(d);
    updateStateFlags(data);
    dispatch(configSliceActions.updateRadioConfig({ network: data }));
  });

  const handleFormReset = () => {
    if (!currentConfig?.network) return;
    reset(currentConfig.network);
    dispatch(configSliceActions.updateRadioConfig({ network: null }));
  };

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"Network Configuration"}
        subtitle={"Configure device network connection"}
        renderIcon={(c) => <RotateCcw className={c} />}
        buttonTooltipText="Discard pending changes"
        onIconClick={handleFormReset}
      >
        <div className="flex flex-col gap-6">
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
        </div>
      </ConfigTitlebar>
    </div>
  );
};

export default NetworkConfigPage;
