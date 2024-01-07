import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useForm, DeepPartial } from "react-hook-form";
import { RotateCcw } from "lucide-react";

import debounce from "lodash.debounce";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
// import ConfigLabel from "@components/config/ConfigLabel";
import ConfigInput from "@components/config/ConfigInput";

import {
  RemoteHardwareModuleConfigInput,
  configSliceActions,
} from "@features/config/slice";
import {
  selectCurrentModuleConfig,
  selectEditedModuleConfig,
} from "@features/config/selectors";

import { selectDevice } from "@features/device/selectors";
import { getDefaultConfigInput } from "@utils/form";

export interface IRemoteHardwareConfigPageProps {
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parseRemoteHardwareModuleConfigInput = (
  d: DeepPartial<RemoteHardwareModuleConfigInput>
): DeepPartial<RemoteHardwareModuleConfigInput> => ({
  ...d,
});

const RemoteHardwareConfigPage = ({
  className = "",
}: IRemoteHardwareConfigPageProps) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const device = useSelector(selectDevice());

  const currentConfig = useSelector(selectCurrentModuleConfig());
  const editedConfig = useSelector(selectEditedModuleConfig());

  // const [moduleDisabled, setModuleDisabled] = useState(
  //   !device?.moduleConfig.remoteHardware?.enabled ?? true
  // );

  const defaultValues = useMemo(
    () =>
      getDefaultConfigInput(
        device?.moduleConfig.remoteHardware ?? undefined,
        editedConfig.remoteHardware ?? undefined
      ),
    []
  );

  const updateStateFlags = (
    d: DeepPartial<RemoteHardwareModuleConfigInput>
  ) => {
    return d; // TODO placeholder
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
  } = useForm<RemoteHardwareModuleConfigInput>({
    defaultValues: device?.moduleConfig.remoteHardware ?? undefined,
  });

  const updateConfigHander = useMemo(
    () =>
      debounce(
        (d: DeepPartial<RemoteHardwareModuleConfigInput>) => {
          const data = parseRemoteHardwareModuleConfigInput(d);
          updateStateFlags(data);
          dispatch(
            configSliceActions.updateModuleConfig({ remoteHardware: data })
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
    if (!currentConfig?.remoteHardware) return;
    reset(currentConfig.remoteHardware);
    dispatch(configSliceActions.updateModuleConfig({ remoteHardware: null }));
  };

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={t("config.module.remoteHardware.title")}
        subtitle={t("config.module.remoteHardware.description")}
        renderIcon={(c) => <RotateCcw className={c} />}
        buttonTooltipText={t("config.discardChanges")}
        onIconClick={handleFormReset}
      >
        <div className="flex flex-col gap-6">
          <ConfigInput
            type="checkbox"
            text={t("config.module.remoteHardware.remoteHardwareEnabled")}
            error={errors.enabled?.message as string}
            {...register("enabled")}
          />
        </div>
      </ConfigTitlebar>
    </div>
  );
};

export default RemoteHardwareConfigPage;
