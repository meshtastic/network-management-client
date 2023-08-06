import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useForm, DeepPartial } from "react-hook-form";
import { RotateCcw } from "lucide-react";

import debounce from "lodash.debounce";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import ConfigInput from "@components/config/ConfigInput";
import ConfigSelect from "@components/config/ConfigSelect";

import { DisplayConfigInput, configSliceActions } from "@features/config/slice";
import {
  selectCurrentRadioConfig,
  selectEditedRadioConfig,
} from "@features/config/selectors";

import { selectDevice } from "@features/device/selectors";
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
  const { t } = useTranslation();

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
        title={t("config.radio.display.title")}
        subtitle={t("config.radio.display.description")}
        renderIcon={(c) => <RotateCcw className={c} />}
        buttonTooltipText={t("config.discardChanges")}
        onIconClick={handleFormReset}
      >
        <div className="flex flex-col gap-6">
          <ConfigInput
            type="number"
            text={t("config.radio.display.autoScrollInterval")}
            error={errors.autoScreenCarouselSecs?.message}
            {...register("autoScreenCarouselSecs")}
          />

          <ConfigInput
            type="checkbox"
            text={t("config.radio.display.forceNorthToTop")}
            error={errors.compassNorthTop?.message}
            {...register("compassNorthTop")}
          />

          <ConfigSelect
            text={t("config.radio.display.displayMode.title")}
            {...register("displaymode")}
          >
            <option value="0">
              {t("config.radio.display.displayMode.default")}
            </option>
            <option value="1">
              {t("config.radio.display.displayMode.twoColor")}
            </option>
            <option value="2">
              {t("config.radio.display.displayMode.inverted")}
            </option>
            <option value="3">
              {t("config.radio.display.displayMode.color")}
            </option>
          </ConfigSelect>

          <ConfigInput
            type="checkbox"
            text={t("config.radio.display.flipScreen")}
            error={errors.flipScreen?.message}
            {...register("flipScreen")}
          />

          <ConfigSelect
            text={t("config.radio.display.gpsFormat.title")}
            {...register("gpsFormat")}
          >
            <option value="0">
              {t("config.radio.display.gpsFormat.decimal")}
            </option>
            <option value="1">{t("config.radio.display.gpsFormat.dms")}</option>
            <option value="2">{t("config.radio.display.gpsFormat.utm")}</option>
            <option value="3">
              {t("config.radio.display.gpsFormat.mgrs")}
            </option>
            <option value="4">{t("config.radio.display.gpsFormat.olc")}</option>
            <option value="5">
              {t("config.radio.display.gpsFormat.osgr")}
            </option>
          </ConfigSelect>

          <ConfigInput
            type="checkbox"
            text={t("config.radio.display.boldHeading")}
            error={errors.headingBold?.message}
            {...register("headingBold")}
          />

          <ConfigSelect
            text={t("config.radio.display.oledConfig.title")}
            {...register("oled")}
          >
            <option value="0">
              {t("config.radio.display.oledConfig.autoDetect")}
            </option>
            <option value="1">
              {t("config.radio.display.oledConfig.ssd1306")}
            </option>
            <option value="2">
              {t("config.radio.display.oledConfig.sh1106")}
            </option>
            <option value="3">
              {t("config.radio.display.oledConfig.sh1107")}
            </option>
          </ConfigSelect>

          <ConfigInput
            type="number"
            text={t("config.radio.display.screenOnDuration")}
            error={errors.screenOnSecs?.message}
            {...register("screenOnSecs")}
          />

          <ConfigSelect
            text={t("config.radio.display.units.title")}
            {...register("units")}
          >
            <option value="0">{t("config.radio.display.units.metric")}</option>
            <option value="1">
              {t("config.radio.display.units.imperial")}
            </option>
          </ConfigSelect>

          <ConfigInput
            type="checkbox"
            text={t("config.radio.display.wakeOnMotion")}
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
