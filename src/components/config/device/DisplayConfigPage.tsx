import React, { useMemo } from "react";
import type { FormEventHandler } from "react";
import { useSelector } from "react-redux";
import { useForm, SubmitHandler, SubmitErrorHandler } from "react-hook-form";
import { Save } from "lucide-react";
import { v4 } from "uuid";

import type { app_protobufs_config_DisplayConfig } from "@bindings/index";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import ConfigLabel from "@components/config/ConfigLabel";
import ConfigInput from "@components/config/ConfigInput";
import { selectDevice } from "@features/device/deviceSelectors";

export interface IDisplayConfigPageProps {
  className?: string;
}

type DisplayConfigInput = app_protobufs_config_DisplayConfig;

const DisplayConfigPage = ({ className = "" }: IDisplayConfigPageProps) => {
  const device = useSelector(selectDevice());

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DisplayConfigInput>({
    defaultValues: device?.config.display ?? undefined,
  });

  const onValidSubmit: SubmitHandler<DisplayConfigInput> = (d) => {
    // See https://github.com/react-hook-form/react-hook-form/issues/10378
    const data: DisplayConfigInput = {
      ...d,
      autoScreenCarouselSecs: parseInt(
        d.autoScreenCarouselSecs as unknown as string
      ),
      screenOnSecs: parseInt(d.screenOnSecs as unknown as string),
      displaymode: parseInt(d.displaymode as unknown as string),
      gpsFormat: parseInt(d.gpsFormat as unknown as string),
      oled: parseInt(d.oled as unknown as string),
      units: parseInt(d.units as unknown as string),
    };

    console.log("data", data);
  };

  const onInvalidSubmit: SubmitErrorHandler<DisplayConfigInput> = (errors) => {
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
        title={"Display Configuration"}
        subtitle={"Configure device display"}
        renderIcon={(c) => <Save className={c} />}
        buttonProps={{ type: "submit", form: formId }}
      >
        <form
          className="flex flex-col gap-6"
          id={formId}
          onSubmit={handleFormSubmit}
        >
          <ConfigInput
            type="number"
            text="Screen Auto Scroll (seconds)"
            error={errors.autoScreenCarouselSecs?.message}
            {...register("autoScreenCarouselSecs")}
          />

          <ConfigInput
            type="checkbox"
            text="Force North to Screen Top"
            error={errors.compassNorthTop?.message}
            {...register("compassNorthTop")}
          />

          <ConfigLabel text="displaymode" error={errors.displaymode?.message}>
            <select {...register("displaymode")}>
              <option value="0">Default</option>
              <option value="1">Two Color</option>
              <option value="2">Inverted</option>
              <option value="3">Color</option>
            </select>
          </ConfigLabel>

          <ConfigInput
            type="checkbox"
            text="Flip Screen"
            error={errors.flipScreen?.message}
            {...register("flipScreen")}
          />

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

          <ConfigInput
            type="checkbox"
            text="Bold Heading"
            error={errors.headingBold?.message}
            {...register("headingBold")}
          />

          <ConfigLabel text="oled" error={errors.oled?.message}>
            <select {...register("oled")}>
              <option value="0">OLED Auto</option>
              <option value="1">OLED SSD1306</option>
              <option value="2">OLED SH1106</option>
              <option value="3">OLED SH1107</option>
            </select>
          </ConfigLabel>

          <ConfigInput
            type="number"
            text="Screen On Duration (sec)"
            error={errors.screenOnSecs?.message}
            {...register("screenOnSecs")}
          />

          <ConfigLabel text="units" error={errors.units?.message}>
            <select {...register("units")}>
              <option value="0">Metric</option>
              <option value="1">Imperial</option>
            </select>
          </ConfigLabel>

          <ConfigInput
            type="checkbox"
            text="Wake on Tap or Motion"
            error={errors.wakeOnTapOrMotion?.message}
            {...register("wakeOnTapOrMotion")}
          />

          {/* <input type="submit" /> */}
        </form>
      </ConfigTitlebar>
    </div>
  );
};

export default DisplayConfigPage;
