import React, { useMemo } from "react";
import type { FormEventHandler } from "react";
import { useSelector } from "react-redux";
import { useForm, SubmitHandler, SubmitErrorHandler } from "react-hook-form";
import { Save } from "lucide-react";
import { v4 } from "uuid";

import type { app_protobufs_User } from "@bindings/index";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
// import ConfigLabel from "@components/config/ConfigLabel";
import ConfigInput from "@components/config/ConfigInput";
import {
  selectConnectedDeviceNodeId,
  selectDevice,
} from "@features/device/deviceSelectors";

export interface IUserConfigPageProps {
  className?: string;
}

type UserConfigInput = Pick<
  app_protobufs_User,
  "shortName" | "longName" | "isLicensed"
>;

const UserConfigPage = ({ className = "" }: IUserConfigPageProps) => {
  const device = useSelector(selectDevice());
  const connectedNodeId = useSelector(selectConnectedDeviceNodeId());

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserConfigInput>({
    defaultValues: connectedNodeId
      ? device?.nodes[connectedNodeId].data.user ?? undefined
      : undefined,
  });

  const onValidSubmit: SubmitHandler<UserConfigInput> = (d) => {
    // See https://github.com/react-hook-form/react-hook-form/issues/10378
    const data: UserConfigInput = {
      ...d,
    };

    console.log("data", data);
  };

  const onInvalidSubmit: SubmitErrorHandler<UserConfigInput> = (errors) => {
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
        title={"User Configuration"}
        subtitle={"Configure device user persona"}
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
            type="text"
            text="Short User Name"
            error={errors.shortName?.message}
            {...register("shortName")}
          />

          <ConfigInput
            type="text"
            text="Long User Name"
            error={errors.longName?.message}
            {...register("longName")}
          />

          <ConfigInput
            type="checkbox"
            text="Is User Licensed"
            error={errors.isLicensed?.message}
            {...register("isLicensed")}
          />
        </form>
      </ConfigTitlebar>
    </div>
  );
};

export default UserConfigPage;
