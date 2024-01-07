import { RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DeepPartial, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import debounce from "lodash.debounce";

import ConfigInput from "@components/config/ConfigInput";
import ConfigSelect from "@components/config/ConfigSelect";
import ConfigTitlebar from "@components/config/ConfigTitlebar";

import {
  selectCurrentRadioConfig,
  selectEditedRadioConfig,
} from "@features/config/selectors";
import {
  BluetoothConfigInput,
  configSliceActions,
} from "@features/config/slice";

import { selectDevice } from "@features/device/selectors";
import { getDefaultConfigInput } from "@utils/form";

export interface IBluetoothConfigPageProps {
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parseBluetoothConfigInput = (
  d: DeepPartial<BluetoothConfigInput>,
): DeepPartial<BluetoothConfigInput> => ({
  ...d,
  fixedPin: d.fixedPin ? parseInt(d.fixedPin as unknown as string) : undefined,
  mode: d.mode ? parseInt(d.mode as unknown as string) : undefined,
});

const BluetoothConfigPage = ({ className = "" }: IBluetoothConfigPageProps) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const device = useSelector(selectDevice());

  const currentConfig = useSelector(selectCurrentRadioConfig());
  const editedConfig = useSelector(selectEditedRadioConfig());

  const [bluetoothDisabled, setBluetoothDisabled] = useState(
    !device?.config.bluetooth?.enabled ?? true,
  );

  const [fixedPinDisabled, setFixedPinDisabled] = useState(
    device?.config.bluetooth?.mode !== 1 ?? true,
  );

  const defaultValues = useMemo(
    () =>
      getDefaultConfigInput(
        device?.config.bluetooth ?? undefined,
        editedConfig.bluetooth ?? undefined,
      ),
    [],
  );

  const updateStateFlags = (d: DeepPartial<BluetoothConfigInput>) => {
    setBluetoothDisabled(!d.enabled);
    setFixedPinDisabled(d.mode !== 1);
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
  } = useForm<BluetoothConfigInput>({
    defaultValues,
  });

  const updateConfigHander = useMemo(
    () =>
      debounce(
        (d: DeepPartial<BluetoothConfigInput>) => {
          const data = parseBluetoothConfigInput(d);
          updateStateFlags(data);
          dispatch(configSliceActions.updateRadioConfig({ bluetooth: data }));
        },
        500,
        { leading: true },
      ),
    [],
  );

  useEffect(() => {
    return () => updateConfigHander.cancel();
  }, []);

  watch(updateConfigHander);

  const handleFormReset = () => {
    if (!currentConfig?.bluetooth) return;
    reset(currentConfig.bluetooth);
    dispatch(configSliceActions.updateRadioConfig({ bluetooth: null }));
  };

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={t("config.radio.bluetooth.title")}
        subtitle={t("config.radio.bluetooth.description")}
        renderIcon={(c) => <RotateCcw className={c} />}
        buttonTooltipText={t("config.discardChanges")}
        onIconClick={handleFormReset}
      >
        <div className="flex flex-col gap-6">
          <ConfigInput
            type="checkbox"
            text={t("config.radio.bluetooth.bluetoothEnabled")}
            error={errors.enabled?.message as string}
            {...register("enabled")}
          />

          <ConfigSelect
            text={t("config.radio.bluetooth.pairingMode.title")}
            disabled={bluetoothDisabled}
            {...register("mode")}
          >
            <option value="0">
              {t("config.radio.bluetooth.pairingMode.randomPin")}
            </option>
            <option value="1">
              {t("config.radio.bluetooth.pairingMode.fixedPin")}
            </option>
            <option value="2">
              {t("config.radio.bluetooth.pairingMode.noPin")}
            </option>
          </ConfigSelect>

          <ConfigInput
            type="number"
            text={t("config.radio.bluetooth.fixedPin")}
            disabled={bluetoothDisabled || fixedPinDisabled}
            error={errors.fixedPin?.message as string}
            {...register("fixedPin")}
          />
        </div>
      </ConfigTitlebar>
    </div>
  );
};

export default BluetoothConfigPage;
