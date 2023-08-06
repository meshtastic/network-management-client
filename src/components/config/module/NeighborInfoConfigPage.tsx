import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useForm, DeepPartial } from "react-hook-form";
import { RotateCcw } from "lucide-react";

import debounce from "lodash.debounce";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
// import ConfigLabel from "@components/config/ConfigLabel";
import ConfigInput from "@components/config/ConfigInput";

import {
  NeighborInfoConfigInput,
  configSliceActions,
} from "@features/config/slice";
import {
  selectCurrentModuleConfig,
  selectEditedModuleConfig,
} from "@features/config/selectors";

import { selectDevice } from "@features/device/selectors";
import { getDefaultConfigInput } from "@utils/form";

export interface INeighborInfoConfigPageProps {
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parseNeighborInfoModuleConfigInput = (
  d: DeepPartial<NeighborInfoConfigInput>
): DeepPartial<NeighborInfoConfigInput> => ({
  ...d,
  updateInterval: parseInt(d.updateInterval as unknown as string),
});

const NeighborInfoConfigPage = ({
  className = "",
}: INeighborInfoConfigPageProps) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const device = useSelector(selectDevice());

  const currentConfig = useSelector(selectCurrentModuleConfig());
  const editedConfig = useSelector(selectEditedModuleConfig());

  const [moduleDisabled, setModuleDisabled] = useState(
    !device?.moduleConfig.neighborInfo?.enabled ?? true
  );

  const defaultValues = useMemo(
    () =>
      getDefaultConfigInput(
        device?.moduleConfig.neighborInfo ?? undefined,
        editedConfig.neighborInfo ?? undefined
      ),
    []
  );

  const updateStateFlags = (d: DeepPartial<NeighborInfoConfigInput>) => {
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
  } = useForm<NeighborInfoConfigInput>({
    defaultValues,
  });

  const updateConfigHander = useMemo(
    () =>
      debounce(
        (d: DeepPartial<NeighborInfoConfigInput>) => {
          const data = parseNeighborInfoModuleConfigInput(d);
          updateStateFlags(data);
          dispatch(
            configSliceActions.updateModuleConfig({ neighborInfo: data })
          );
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
    if (!currentConfig?.neighborInfo) return;
    reset(currentConfig.neighborInfo);
    dispatch(configSliceActions.updateModuleConfig({ neighborInfo: null }));
  };

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={t("config.module.neighborInfo.title")}
        subtitle={t("config.module.neighborInfo.description")}
        renderIcon={(c) => <RotateCcw className={c} />}
        buttonTooltipText={t("config.discardChanges")}
        onIconClick={handleFormReset}
      >
        <div className="flex flex-col gap-6">
          <ConfigInput
            type="checkbox"
            text="Enable Neighbor Info Packet"
            error={errors.enabled?.message}
            {...register("enabled")}
          />

          <ConfigInput
            type="number"
            text={t("config.module.neighborInfo.updateInterval")}
            disabled={moduleDisabled}
            error={errors.updateInterval?.message}
            {...register("updateInterval")}
          />
        </div>
      </ConfigTitlebar>
    </div>
  );
};

export default NeighborInfoConfigPage;
