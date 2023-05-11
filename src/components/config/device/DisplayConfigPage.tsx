import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, DeepPartial } from "react-hook-form";
import { RotateCcw } from "lucide-react";

import debounce from "lodash.debounce";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import ConfigLabel from "@components/config/ConfigLabel";
import ConfigInput from "@components/config/ConfigInput";

import {
  DisplayConfigInput,
  configSliceActions,
} from "@features/config/configSlice";
import {
  selectCurrentRadioConfig,
  selectEditedRadioConfig,
} from "@features/config/configSelectors";

import { selectDevice } from "@features/device/deviceSelectors";
import { getDefaultConfigInput } from "@utils/form";

export interface IDisplayConfigPageProps {
  className?: string;
}

// See https://github.com/react-hook-form/react-hook-form/issues/10378
const parseDisplayConfigInput = (
  d: DeepPartial<DisplayConfigInput>
): DeepPartial<DisplayConfigInput> => ({
  ...d,
  autoScreenCarouselSecs: parseInt(
    d.autoScreenCarouselSecs as unknown as string
  ),
  screenOnSecs: parseInt(d.screenOnSecs as unknown as string),
  displaymode: parseInt(d.displaymode as unknown as string),
  gpsFormat: parseInt(d.gpsFormat as unknown as string),
  oled: parseInt(d.oled as unknown as string),
  units: parseInt(d.units as unknown as string),
});

const DisplayConfigPage = ({ className = "" }: IDisplayConfigPageProps) => {
  const dispatch = useDispatch();
  const device = useSelector(selectDevice());

  const currentConfig = useSelector(selectCurrentRadioConfig());
  const editedConfig = useSelector(selectEditedRadioConfig());

  const defaultValues = useMemo(
    () =>
      getDefaultConfigInput(
        device?.config.display ?? undefined,
        editedConfig.display ?? undefined
      ),
    []
  );

  const {
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm<DisplayConfigInput>({
    defaultValues,
  });

  const updateConfigHander = useMemo(
    () =>
      debounce(
        (d: DeepPartial<DisplayConfigInput>) => {
          const data = parseDisplayConfigInput(d);
          dispatch(configSliceActions.updateRadioConfig({ display: data }));
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
    if (!currentConfig?.display) return;
    reset(currentConfig.display);
    dispatch(configSliceActions.updateRadioConfig({ display: null }));
  };

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={"Display Configuration"}
        subtitle={"Configure device display"}
        renderIcon={(c) => <RotateCcw className={c} />}
        buttonTooltipText="Discard pending changes"
        onIconClick={handleFormReset}
      >
        <div className="flex flex-col gap-6">
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
        </div>
      </ConfigTitlebar>
    </div>
  );
};

export default DisplayConfigPage;
