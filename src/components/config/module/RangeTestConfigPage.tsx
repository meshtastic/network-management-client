import { RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { type DeepPartial, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import debounce from "lodash.debounce";

// import ConfigLabel from "@components/config/ConfigLabel";
import { ConfigInput } from "@components/config/ConfigInput";
import { ConfigTitlebar } from "@components/config/ConfigTitlebar";

import {
  selectCurrentModuleConfig,
  selectEditedModuleConfig,
} from "@features/config/selectors";
import {
  type RangeTestModuleConfigInput,
  configSliceActions,
} from "@features/config/slice";

import { selectDevice } from "@features/device/selectors";
import { getDefaultConfigInput } from "@utils/form";

export interface IRangeTestConfigPageProps {
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parseRangeTestModuleConfigInput = (
  d: DeepPartial<RangeTestModuleConfigInput>,
): DeepPartial<RangeTestModuleConfigInput> => ({
  ...d,
  sender: parseInt(d.sender as unknown as string),
});

export const RangeTestConfigPage = ({
  className = "",
}: IRangeTestConfigPageProps) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const device = useSelector(selectDevice());

  const currentConfig = useSelector(selectCurrentModuleConfig());
  const editedConfig = useSelector(selectEditedModuleConfig());

  const [moduleDisabled, setModuleDisabled] = useState(
    device?.moduleConfig.rangeTest?.enabled ?? true,
  );

  const defaultValues = useMemo(
    () =>
      getDefaultConfigInput(
        device?.moduleConfig.rangeTest ?? undefined,
        editedConfig.rangeTest ?? undefined,
      ),
    [device, editedConfig],
  );

  const updateStateFlags = (d: DeepPartial<RangeTestModuleConfigInput>) => {
    setModuleDisabled(!d.enabled);
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
    if (!currentConfig?.rangeTest) return;
    reset(currentConfig.rangeTest);
    dispatch(configSliceActions.updateModuleConfig({ rangeTest: null }));
  };

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={t("config.module.rangeTest.title")}
        subtitle={t("config.module.rangeTest.description")}
        renderIcon={(c) => <RotateCcw className={c} />}
        buttonTooltipText={t("config.discardChanges")}
        onIconClick={handleFormReset}
      >
        <div className="flex flex-col gap-6">
          <ConfigInput
            type="checkbox"
            text={t("config.module.rangeTest.rangeTestEnabled")}
            error={errors.enabled?.message as string}
            {...register("enabled")}
          />

          <ConfigInput
            type="number"
            text={t("config.module.rangeTest.senderTransmitInterval")}
            disabled={moduleDisabled}
            error={errors.sender?.message as string}
            {...register("sender")}
          />

          <ConfigInput
            type="checkbox"
            text={t("config.module.rangeTest.saveToFs")}
            disabled={moduleDisabled}
            error={errors.save?.message as string}
            {...register("save")}
          />
        </div>
      </ConfigTitlebar>
    </div>
  );
};
