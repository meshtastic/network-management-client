import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, DeepPartial } from "react-hook-form";
import { RotateCcw } from "lucide-react";

import debounce from "lodash.debounce";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
// import ConfigLabel from "@components/config/ConfigLabel";
import ConfigInput from "@components/config/ConfigInput";

import {
  RangeTestModuleConfigInput,
  configSliceActions,
} from "@features/config/configSlice";
import {
  selectCurrentModuleConfig,
  selectEditedModuleConfig,
} from "@features/config/configSelectors";

import { selectDevice } from "@features/device/deviceSelectors";
import { getDefaultConfigInput } from "@utils/form";

export interface IRangeTestConfigPageProps {
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parseRangeTestModuleConfigInput = (
  d: DeepPartial<RangeTestModuleConfigInput>
): DeepPartial<RangeTestModuleConfigInput> => ({
  ...d,
  sender: parseInt(d.sender as unknown as string),
});

const RangeTestConfigPage = ({ className = "" }: IRangeTestConfigPageProps) => {
  const dispatch = useDispatch();
  const device = useSelector(selectDevice());

  const currentConfig = useSelector(selectCurrentModuleConfig());
  const editedConfig = useSelector(selectEditedModuleConfig());

  const [moduleDisabled, setModuleDisabled] = useState(
    !device?.moduleConfig.rangeTest?.enabled ?? true
  );

  const defaultValues = useMemo(
    () =>
      getDefaultConfigInput(
        device?.moduleConfig.rangeTest ?? undefined,
        editedConfig.rangeTest ?? undefined
      ),
    []
  );

  const updateStateFlags = (d: DeepPartial<RangeTestModuleConfigInput>) => {
    setModuleDisabled(!d.enabled);
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
  } = useForm<RangeTestModuleConfigInput>({
    defaultValues: device?.moduleConfig.rangeTest ?? undefined,
  });

  const updateConfigHander = useMemo(
    () =>
      debounce(
        (d: DeepPartial<RangeTestModuleConfigInput>) => {
          const data = parseRangeTestModuleConfigInput(d);
          updateStateFlags(data);
          dispatch(configSliceActions.updateModuleConfig({ rangeTest: data }));
        },
        500,
        { leading: true }
      ),
    []
  );

  useEffect(() => {
    return () => updateConfigHander.cancel();
  }, []);

  watch(updateConfigHander);

  const handleFormReset = () => {
    if (!currentConfig?.rangeTest) return;
    reset(currentConfig.rangeTest);
    dispatch(configSliceActions.updateModuleConfig({ rangeTest: null }));
  };

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"RangeTest Configuration"}
        subtitle={"Configure range test module"}
        renderIcon={(c) => <RotateCcw className={c} />}
        buttonTooltipText="Discard pending changes"
        onIconClick={handleFormReset}
      >
        <div className="flex flex-col gap-6">
          <ConfigInput
            type="checkbox"
            text="Range Test Enabled"
            error={errors.enabled?.message}
            {...register("enabled")}
          />

          <ConfigInput
            type="number"
            text="Sender Transmit Interval (sec, 0 = disabled)"
            disabled={moduleDisabled}
            error={errors.sender?.message}
            {...register("sender")}
          />

          <ConfigInput
            type="checkbox"
            text="Save to File System (ESP32 Only)"
            disabled={moduleDisabled}
            error={errors.save?.message}
            {...register("save")}
          />
        </div>
      </ConfigTitlebar>
    </div>
  );
};

export default RangeTestConfigPage;
