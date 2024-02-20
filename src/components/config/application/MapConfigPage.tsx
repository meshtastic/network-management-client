import { Save } from "lucide-react";
import { useMemo } from "react";
import type { FormEventHandler } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { v4 } from "uuid";
import { warn } from "tauri-plugin-log-api";

import { ConfigInput } from "@components/config/ConfigInput";
import { ConfigTitlebar } from "@components/config/ConfigTitlebar";

import { selectMapConfigState } from "@features/appConfig/selectors";
import { useAppConfigApi } from "@features/appConfig/api";

export interface IMapConfigPageProps {
  className?: string;
}

type MapConfigFormInput = {
  style: string;
};

export const MapConfigPage = ({ className = "" }: IMapConfigPageProps) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const { style } = useSelector(selectMapConfigState());

  const appConfigApi = useAppConfigApi();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MapConfigFormInput>({ defaultValues: { style } });

  const handleSubmitSuccess = (data: MapConfigFormInput) => {
    appConfigApi.persistMapConfig({ style: data.style });
  };

  const handleFormSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    handleSubmit(handleSubmitSuccess, (err) => {
      warn(`Encountered error submitting form: ${err}`);
    })(e);
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
