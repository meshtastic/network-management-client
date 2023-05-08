import React, { useMemo /* useState */ } from "react";
import type { FormEventHandler } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, SubmitHandler, SubmitErrorHandler } from "react-hook-form";
import { Save } from "lucide-react";
import { v4 } from "uuid";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
// import ConfigLabel from "@components/config/ConfigLabel";
import ConfigInput from "@components/config/ConfigInput";

import {
  RemoteHardwareModuleConfigInput,
  configSliceActions,
} from "@features/config/configSlice";
import { selectDevice } from "@features/device/deviceSelectors";

export interface IRemoteHardwareConfigPageProps {
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parseRemoteHardwareModuleConfigInput = (
  d: RemoteHardwareModuleConfigInput
): RemoteHardwareModuleConfigInput => ({
  ...d,
});

const RemoteHardwareConfigPage = ({
  className = "",
}: IRemoteHardwareConfigPageProps) => {
  const dispatch = useDispatch();
  const device = useSelector(selectDevice());

  // const [moduleDisabled, setModuleDisabled] = useState(
  //   !device?.moduleConfig.remoteHardware?.enabled ?? true
  // );

  const {
    register,
    handleSubmit,
    reset,
    // watch,
    formState: { errors },
  } = useForm<RemoteHardwareModuleConfigInput>({
    defaultValues: device?.moduleConfig.remoteHardware ?? undefined,
  });

  // watch((d) => {
  //   setModuleDisabled(!d.enabled);
  // });

  const onValidSubmit: SubmitHandler<RemoteHardwareModuleConfigInput> = (d) => {
    const data = parseRemoteHardwareModuleConfigInput(d);
    dispatch(configSliceActions.updateModuleConfig({ remoteHardware: data }));
  };

  const onInvalidSubmit: SubmitErrorHandler<RemoteHardwareModuleConfigInput> = (
    errors
  ) => {
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
        title={"Remote Hardware Configuration"}
        subtitle={"Configure remote network hardware"}
        renderIcon={(c) => <Save className={c} />}
        buttonTooltipText="Stage changes for upload"
        buttonProps={{ type: "submit", form: formId }}
      >
        <form
          className="flex flex-col gap-6"
          id={formId}
          onSubmit={handleFormSubmit}
        >
          <ConfigInput
            type="checkbox"
            text="Remote Hardware Enabled"
            error={errors.enabled?.message}
            {...register("enabled")}
          />
        </form>
      </ConfigTitlebar>
    </div>
  );
};

export default RemoteHardwareConfigPage;
