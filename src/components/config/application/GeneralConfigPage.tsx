import React, { useMemo } from "react";
import type { FormEventHandler } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { v4 } from "uuid";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
// import ConfigInput from "@components/config/ConfigInput";
import ConfigSelect from "@components/config/ConfigSelect";

import { requestPersistGeneralConfig } from "@features/appConfig/appConfigActions";
import { selectGeneralConfigState } from "@features/appConfig/appConfigSelectors";
import type { ColorMode } from "@features/appConfig/appConfigSlice";

export interface IGeneralConfigPageProps {
  className?: string;
}

type GeneralConfigFormInput = {
  colorMode: ColorMode;
};

const GeneralConfigPage = ({ className = "" }: IGeneralConfigPageProps) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const { colorMode } = useSelector(selectGeneralConfigState());

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GeneralConfigFormInput>({ defaultValues: { colorMode } });

  const handleSubmitSuccess = (data: GeneralConfigFormInput) => {
    dispatch(requestPersistGeneralConfig({ colorMode: data.colorMode }));
  };

  const handleFormSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    void handleSubmit(handleSubmitSuccess, console.warn)(e);
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

export default GeneralConfigPage;
