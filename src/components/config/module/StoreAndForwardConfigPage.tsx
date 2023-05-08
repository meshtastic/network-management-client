import React, { useMemo, useState } from "react";
import type { FormEventHandler } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, SubmitHandler, SubmitErrorHandler } from "react-hook-form";
import { Save } from "lucide-react";
import { v4 } from "uuid";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
// import ConfigLabel from "@components/config/ConfigLabel";
import ConfigInput from "@components/config/ConfigInput";

import {
  StoreForwardModuleConfigInput,
  configSliceActions,
} from "@features/config/configSlice";
import { selectDevice } from "@features/device/deviceSelectors";

export interface IStoreAndForwardConfigPageProps {
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parseStoreAndForwardModuleConfigInput = (
  d: StoreForwardModuleConfigInput
): StoreForwardModuleConfigInput => ({
  ...d,
  records: parseInt(d.records as unknown as string),
  historyReturnMax: parseInt(d.historyReturnMax as unknown as string),
  historyReturnWindow: parseInt(d.historyReturnWindow as unknown as string),
});

const StoreAndForwardConfigPage = ({
  className = "",
}: IStoreAndForwardConfigPageProps) => {
  const dispatch = useDispatch();
  const device = useSelector(selectDevice());

  const [moduleDisabled, setModuleDisabled] = useState(
    !device?.moduleConfig.serial?.enabled ?? true
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<StoreForwardModuleConfigInput>({
    defaultValues: device?.moduleConfig.storeForward ?? undefined,
  });

  watch((d) => {
    setModuleDisabled(!d.enabled);
  });

  const onValidSubmit: SubmitHandler<StoreForwardModuleConfigInput> = (d) => {
    const data = parseStoreAndForwardModuleConfigInput(d);
    dispatch(configSliceActions.updateModuleConfig({ storeForward: data }));
  };

  const onInvalidSubmit: SubmitErrorHandler<StoreForwardModuleConfigInput> = (
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
        title={"Store and Forward Configuration (UNSTABLE)"}
        subtitle={"Configure packet storage and forwarding"}
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
            text="Store and Forward Enabled"
            error={errors.enabled?.message}
            {...register("enabled")}
          />

          <ConfigInput
            type="checkbox"
            text="Heartbeat Broadcast Enabled"
            disabled={moduleDisabled}
            error={errors.heartbeat?.message}
            {...register("heartbeat")}
          />

          <ConfigInput
            type="number"
            text="Stored Records"
            disabled={moduleDisabled}
            error={errors.records?.message}
            {...register("records")}
          />

          <ConfigInput
            type="number"
            text="Max Records to Return"
            disabled={moduleDisabled}
            error={errors.historyReturnMax?.message}
            {...register("historyReturnMax")}
          />

          <ConfigInput
            type="number"
            text="History Return Window (sec)"
            disabled={moduleDisabled}
            error={errors.historyReturnWindow?.message}
            {...register("historyReturnWindow")}
          />
        </form>
      </ConfigTitlebar>
    </div>
  );
};

export default StoreAndForwardConfigPage;
