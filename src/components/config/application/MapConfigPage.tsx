import React, { useMemo } from "react";
import type { FormEventHandler } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { v4 } from "uuid";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import ConfigInput from "@components/config/ConfigInput";

import { requestPersistMapConfig } from "@features/appConfig/actions";
import { selectMapConfigState } from "@features/appConfig/selectors";

export interface IMapConfigPageProps {
  className?: string;
}

type MapConfigFormInput = {
  style: string;
};

const MapConfigPage = ({ className = "" }: IMapConfigPageProps) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const { style } = useSelector(selectMapConfigState());

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MapConfigFormInput>({ defaultValues: { style } });

  const handleSubmitSuccess = (data: MapConfigFormInput) => {
    dispatch(requestPersistMapConfig({ style: data.style }));
  };

  const handleFormSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    void handleSubmit(handleSubmitSuccess, console.warn)(e);
  };

  const formId = useMemo(() => v4(), []);

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title={t("applicationSettings.map.title")}
        subtitle={t("applicationSettings.map.description")}
        renderIcon={(c) => <Save strokeWidth={1.5} className={`${c}`} />}
        buttonTooltipText={t("applicationSettings.saveChanges")}
        buttonProps={{ type: "submit", form: formId }}
      >
        <form id={formId} onSubmit={handleFormSubmit}>
          <ConfigInput
            type="url"
            text={t("applicationSettings.map.mapboxStyle")}
            error={errors.style?.message}
            {...register("style")}
          />
        </form>
      </ConfigTitlebar>
    </div>
  );
};

export default MapConfigPage;
