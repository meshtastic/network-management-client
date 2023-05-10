import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, DeepPartial } from "react-hook-form";
import { RotateCcw } from "lucide-react";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
// import ConfigLabel from "@components/config/ConfigLabel";
import ConfigInput from "@components/config/ConfigInput";

import {
  RemoteHardwareModuleConfigInput,
  configSliceActions,
} from "@features/config/configSlice";
import {
  selectCurrentModuleConfig,
  selectEditedModuleConfig,
} from "@features/config/configSelectors";

import { selectDevice } from "@features/device/deviceSelectors";
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

  watch((d) => {
    const data = parseRemoteHardwareModuleConfigInput(d);
    updateStateFlags(data);
    dispatch(configSliceActions.updateModuleConfig({ remoteHardware: data }));
  });

  const handleFormReset = () => {
    if (!currentConfig?.remoteHardware) return;
    reset(currentConfig.remoteHardware);
    dispatch(configSliceActions.updateModuleConfig({ remoteHardware: null }));
  };

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"Remote Hardware Configuration"}
        subtitle={"Configure remote network hardware"}
        renderIcon={(c) => <RotateCcw className={c} />}
        buttonTooltipText="Discard pending changes"
        onIconClick={handleFormReset}
      >
        <div className="flex flex-col gap-6">
          <ConfigInput
            type="checkbox"
            text="Remote Hardware Enabled"
            error={errors.enabled?.message}
            {...register("enabled")}
          />
        </div>
      </ConfigTitlebar>
    </div>
  );
};

export default RemoteHardwareConfigPage;
