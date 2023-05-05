import React, { useMemo } from "react";
import type { FormEventHandler } from "react";
import { useSelector } from "react-redux";
import { useForm, SubmitHandler, SubmitErrorHandler } from "react-hook-form";
import { Save } from "lucide-react";
import { v4 } from "uuid";

import type { app_protobufs_config_DisplayConfig } from "@bindings/index";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import { selectDevice } from "@features/device/deviceSelectors";
import ConfigLabel from "../ConfigLabel";

export interface IDisplayConfigPageProps {
  className?: string;
}

type FormInputType = {
  enumField: number;
};

const ReproCase = () => {
  const { register, handleSubmit } = useForm<FormInputType>();

  const handleFormSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    handleSubmit(onValidSubmit, onInvalidSubmit)(e).catch(console.error);
  };

  const onValidSubmit: SubmitHandler<FormInputType> = (data) => {
    // If the `select` field has been changed, the `enumField` value will be
    // a `string` type but the `data` parameter is still cast as `{ enumField: number; }`
    console.log("data", data);
  };

  const onInvalidSubmit: SubmitErrorHandler<FormInputType> = (error) => {
    console.warn("error", error);
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <select {...register("enumField")}>
        <option value={0}>Option 1</option>
        <option value={1}>Option 2</option>
        <option value={2}>Option 3</option>
      </select>

      <input type="submit" />
    </form>
  );
};

export default ReproCase;

type DisplayConfigInput = app_protobufs_config_DisplayConfig;

const DisplayConfigPage = ({ className = "" }: IDisplayConfigPageProps) => {
  const device = useSelector(selectDevice());

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<DisplayConfigInput>({
    defaultValues: device?.config.display ?? undefined,
  });

  const onValidSubmit: SubmitHandler<DisplayConfigInput> = (data) => {
    console.log("data", data);
  };

  const onInvalidSubmit: SubmitErrorHandler<DisplayConfigInput> = (errors) => {
    console.warn("errors", errors);
  };

  console.log("form update", watch());

  const handleFormSubmit: FormEventHandler = (e) => {
    e.preventDefault();

    console.log("form submit");
    handleSubmit(onValidSubmit, onInvalidSubmit)(e).catch(console.error);
  };

  const formId = useMemo(() => v4(), []);

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"Display Configuration"}
        subtitle={"Configure device display"}
        renderIcon={(c) => <Save className={c} />}
        buttonProps={{ type: "submit", form: formId }}
      >
        <form id={formId} onSubmit={handleFormSubmit}>
          <ConfigLabel
            text="autoScreenCarouselSecs"
            error={errors.autoScreenCarouselSecs?.message}
          >
            <input
              type="number"
              defaultValue={0}
              {...register("autoScreenCarouselSecs")}
            />
          </ConfigLabel>

          <ConfigLabel
            text="compassNorthTop"
            error={errors.compassNorthTop?.message}
          >
            <input type="checkbox" {...register("compassNorthTop")} />
          </ConfigLabel>

          <ConfigLabel text="displaymode" error={errors.displaymode?.message}>
            <select {...register("displaymode")}>
              <option value="0">Default</option>
              <option value="1">Two Color</option>
              <option value="2">Inverted</option>
              <option value="3">Color</option>
            </select>
          </ConfigLabel>

          <ConfigLabel text="flipScreen" error={errors.flipScreen?.message}>
            <input type="checkbox" {...register("flipScreen")} />
          </ConfigLabel>

          <ConfigLabel text="gpsFormat" error={errors.gpsFormat?.message}>
            <select {...register("gpsFormat")}>
              <option value="0">Decimal</option>
              <option value="1">DMS</option>
              <option value="2">UTM</option>
              <option value="3">MGRS</option>
              <option value="4">OLC</option>
              <option value="5">OSGR</option>
            </select>
          </ConfigLabel>

          <ConfigLabel text="headingBold" error={errors.headingBold?.message}>
            <input type="checkbox" {...register("headingBold")} />
          </ConfigLabel>

          <ConfigLabel text="oled" error={errors.oled?.message}>
            <select {...register("oled")}>
              <option value="0">OLED Auto</option>
              <option value="1">OLED SSD1306</option>
              <option value="2">OLED SH1106</option>
              <option value="3">OLED SH1107</option>
            </select>
          </ConfigLabel>

          <ConfigLabel text="screenOnSecs" error={errors.screenOnSecs?.message}>
            <input
              type="number"
              defaultValue={0}
              {...register("screenOnSecs")}
            />
          </ConfigLabel>

          <ConfigLabel text="units" error={errors.units?.message}>
            <select {...register("units")}>
              <option value="0">Metric</option>
              <option value="1">Imperial</option>
            </select>
          </ConfigLabel>

          <ConfigLabel
            text="wakeOnTapOrMotion"
            error={errors.wakeOnTapOrMotion?.message}
          >
            <input type="checkbox" {...register("wakeOnTapOrMotion")} />
          </ConfigLabel>

          {/* <input type="submit" /> */}
        </form>
      </ConfigTitlebar>
    </div>
  );
};

// export default DisplayConfigPage;
