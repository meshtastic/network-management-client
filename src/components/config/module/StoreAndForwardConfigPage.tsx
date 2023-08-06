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
  StoreForwardModuleConfigInput,
  configSliceActions,
} from "@features/config/slice";
import {
  selectCurrentModuleConfig,
  selectEditedModuleConfig,
} from "@features/config/selectors";

import { selectDevice } from "@features/device/selectors";
import { getDefaultConfigInput } from "@utils/form";

export interface IStoreAndForwardConfigPageProps {
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parseStoreAndForwardModuleConfigInput = (
  d: DeepPartial<StoreForwardModuleConfigInput>
): DeepPartial<StoreForwardModuleConfigInput> => ({
  ...d,
  records: parseInt(d.records as unknown as string),
  historyReturnMax: parseInt(d.historyReturnMax as unknown as string),
  historyReturnWindow: parseInt(d.historyReturnWindow as unknown as string),
});

const StoreAndForwardConfigPage = ({
  className = "",
}: IStoreAndForwardConfigPageProps) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const device = useSelector(selectDevice());

  const currentConfig = useSelector(selectCurrentModuleConfig());
  const editedConfig = useSelector(selectEditedModuleConfig());

  const [moduleDisabled, setModuleDisabled] = useState(
    !device?.moduleConfig.serial?.enabled ?? true
  );

  const defaultValues = useMemo(
    () =>
      getDefaultConfigInput(
        device?.moduleConfig.storeForward ?? undefined,
        editedConfig.storeForward ?? undefined
      ),
    []
  );

  const updateStateFlags = (d: DeepPartial<StoreForwardModuleConfigInput>) => {
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
  } = useForm<StoreForwardModuleConfigInput>({
    defaultValues,
  });

  const updateConfigHander = useMemo(
    () =>
      debounce(
        (d: DeepPartial<StoreForwardModuleConfigInput>) => {
          const data = parseStoreAndForwardModuleConfigInput(d);
          updateStateFlags(data);
          dispatch(
            configSliceActions.updateModuleConfig({ storeForward: data })
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
    if (!currentConfig?.storeForward) return;
    reset(currentConfig.storeForward);
    dispatch(configSliceActions.updateModuleConfig({ storeForward: null }));
  };

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={t("config.module.storeAndForward.title")}
        subtitle={t("config.module.storeAndForward.description")}
        renderIcon={(c) => <RotateCcw className={c} />}
        buttonTooltipText={t("config.discardChanges")}
        onIconClick={handleFormReset}
      >
        <div className="flex flex-col gap-6">
          <ConfigInput
            type="checkbox"
            text={t("config.module.storeAndForward.sfEnabled")}
            error={errors.enabled?.message}
            {...register("enabled")}
          />

          <ConfigInput
            type="checkbox"
            text={t("config.module.storeAndForward.heartbeatBroadcastEnabled")}
            disabled={moduleDisabled}
            error={errors.heartbeat?.message}
            {...register("heartbeat")}
          />

          <ConfigInput
            type="number"
            text={t("config.module.storeAndForward.storedRecords")}
            disabled={moduleDisabled}
            error={errors.records?.message}
            {...register("records")}
          />

          <ConfigInput
            type="number"
            text={t("config.module.storeAndForward.maxRecordsReturn")}
            disabled={moduleDisabled}
            error={errors.historyReturnMax?.message}
            {...register("historyReturnMax")}
          />

          <ConfigInput
            type="number"
            text={t("config.module.storeAndForward.returnWindow")}
            disabled={moduleDisabled}
            error={errors.historyReturnWindow?.message}
            {...register("historyReturnWindow")}
          />
        </div>
      </ConfigTitlebar>
    </div>
  );
};

export default StoreAndForwardConfigPage;
