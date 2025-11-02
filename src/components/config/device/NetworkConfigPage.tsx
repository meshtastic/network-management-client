import { RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { type DeepPartial, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import debounce from "lodash.debounce";

import { ConfigInput } from "@components/config/ConfigInput";
import { ConfigSelect } from "@components/config/ConfigSelect";
import { ConfigTitlebar } from "@components/config/ConfigTitlebar";

import {
  selectCurrentRadioConfig,
  selectEditedRadioConfig,
} from "@features/config/selectors";
import {
  type NetworkConfigInput,
  configSliceActions,
} from "@features/config/slice";

import { selectDevice } from "@features/device/selectors";
import { getDefaultConfigInput } from "@utils/form";

export interface INetworkConfigPageProps {
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parseNetworkConfigInput = (
  d: DeepPartial<NetworkConfigInput>,
): DeepPartial<NetworkConfigInput> => ({
  ...d,
  addressMode: parseInt(d.addressMode as unknown as string),
});

export const NetworkConfigPage = ({
  className = "",
}: INetworkConfigPageProps) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const device = useSelector(selectDevice());

  const currentConfig = useSelector(selectCurrentRadioConfig());
  const editedConfig = useSelector(selectEditedRadioConfig());

  const [wifiDisabled, setWifiDisabled] = useState(
    device?.config.network?.wifiEnabled ?? true,
  );

  const [ethDisabled, setEthDisabled] = useState(
    device?.config.network?.ethEnabled ?? true,
  );

  const defaultValues = useMemo(
    () =>
      getDefaultConfigInput(
        device?.config.network ?? undefined,
        editedConfig.network ?? undefined,
      ),
    [device, editedConfig],
  );

  const updateStateFlags = (d: DeepPartial<NetworkConfigInput>) => {
    setWifiDisabled(!d.wifiEnabled);
    setEthDisabled(!d.ethEnabled);
  };

  useEffect(() => {
    if (!defaultValues) return;
    updateStateFlags(defaultValues);
  }, [updateStateFlags, defaultValues]);

  const {
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm<NetworkConfigInput>({
    defaultValues,
  });

  const updateConfigHander = useMemo(
    () =>
      debounce(
        (d: DeepPartial<NetworkConfigInput>) => {
          const data = parseNetworkConfigInput(d);
          updateStateFlags(data);
          dispatch(configSliceActions.updateRadioConfig({ network: data }));
        },
        500,
        { leading: true },
      ),
    [dispatch, updateStateFlags],
  );

  watch(updateConfigHander);

  // Cancel handlers when unmounting
  useEffect(() => {
    return () => updateConfigHander.cancel();
  }, [updateConfigHander]);

  const handleFormReset = () => {
    if (!currentConfig?.network) return;
    reset(currentConfig.network);
    dispatch(configSliceActions.updateRadioConfig({ network: null }));
  };

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={t("config.radio.network.title")}
        subtitle={t("config.radio.network.description")}
        renderIcon={(c) => <RotateCcw className={c} />}
        buttonTooltipText={t("config.discardChanges")}
        onIconClick={handleFormReset}
      >
        <div className="flex flex-col gap-6">
          <ConfigInput
            type="checkbox"
            text={t("config.radio.network.wifiEnabled")}
            error={errors.wifiEnabled?.message as string}
            {...register("wifiEnabled")}
          />

          <ConfigInput
            disabled={wifiDisabled}
            type="text"
            text={t("config.radio.network.wifiSsid")}
            error={errors.wifiSsid?.message as string}
            {...register("wifiSsid")}
          />

          <ConfigInput
            disabled={wifiDisabled}
            type="text"
            text={t("config.radio.network.wifiPsk")}
            error={errors.wifiPsk?.message as string}
            {...register("wifiPsk")}
          />

          <ConfigInput
            type="checkbox"
            text={t("config.radio.network.ethEnabled")}
            error={errors.ethEnabled?.message as string}
            {...register("ethEnabled")}
          />

          <ConfigSelect
            text={t("config.radio.network.addressMode.title")}
            disabled={ethDisabled}
            {...register("addressMode")}
          >
            <option value="0">
              {t("config.radio.network.addressMode.dhcp")}
            </option>
            <option disabled value="1">
              {t("config.radio.network.addressMode.static")}
            </option>
          </ConfigSelect>

          <ConfigInput
            disabled={wifiDisabled && ethDisabled}
            type="text"
            text={t("config.radio.network.ntpServerAddress")}
            error={errors.ntpServer?.message as string}
            {...register("ntpServer")}
          />

          {/* TODO IPv4 Config */}
          {/* TODO Log Server Config */}
        </div>
      </ConfigTitlebar>
    </div>
  );
};
