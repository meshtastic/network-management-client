import { Save } from "lucide-react";
import { useMemo } from "react";
import type { FormEventHandler } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { v4 } from "uuid";
import { warn } from "tauri-plugin-log-api";

// import { ConfigInput } from "@components/config/ConfigInput";
import { ConfigSelect } from "@components/config/ConfigSelect";
import { ConfigTitlebar } from "@components/config/ConfigTitlebar";

import { selectGeneralConfigState } from "@features/appConfig/selectors";
import type { ColorMode } from "@features/appConfig/slice";
import { useAppConfigApi } from "@features/appConfig/api";

export interface IGeneralConfigPageProps {
  className?: string;
}

type GeneralConfigFormInput = {
  colorMode: ColorMode;
};

export const GeneralConfigPage = ({
  className = "",
}: IGeneralConfigPageProps) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const { colorMode } = useSelector(selectGeneralConfigState());

  const appConfigApi = useAppConfigApi();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GeneralConfigFormInput>({ defaultValues: { colorMode } });

  const handleSubmitSuccess = (data: GeneralConfigFormInput) => {
    appConfigApi.persistGeneralConfig({ colorMode: data.colorMode });
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
        title={t("applicationSettings.general.title")}
        subtitle={t("applicationSettings.general.description")}
        renderIcon={(c) => <Save strokeWidth={1.5} className={`${c}`} />}
        buttonTooltipText={t("applicationSettings.saveChanges")}
        buttonProps={{ type: "submit", form: formId }}
      >
        <form id={formId} onSubmit={handleFormSubmit}>
          <ConfigSelect
            text={t("applicationSettings.general.colorMode.title")}
            error={errors.colorMode?.message}
            {...register("colorMode")}
          >
            <option value="light">
              {t("applicationSettings.general.colorMode.light")}
            </option>
            <option value="dark">
              {t("applicationSettings.general.colorMode.dark")}
            </option>
            <option value="system">
              {t("applicationSettings.general.colorMode.system")}
            </option>
          </ConfigSelect>
        </form>
      </ConfigTitlebar>
    </div>
  );
};
