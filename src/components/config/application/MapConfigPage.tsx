import React, { useMemo } from "react";
import type { FormEventHandler } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { v4 } from "uuid";

import ConfigTitlebar from "@components/config/ConfigTitlebar";
import ConfigInput from "@components/config/ConfigInput";
import { selectMapState } from "@features/map/mapSelectors";
import { mapSliceActions } from "@features/map/mapSlice";

export interface IMapConfigPageProps {
  className?: string;
}

type MapConfigFormInput = {
  style: string;
};

const MapConfigPage = ({ className = "" }: IMapConfigPageProps) => {
  const dispatch = useDispatch();
  const { config } = useSelector(selectMapState());

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MapConfigFormInput>({ defaultValues: { style: config.style } });

  const handleSubmitSuccess = (data: MapConfigFormInput) => {
    dispatch(mapSliceActions.updateConfig(data));
  };

  const handleFormSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    void handleSubmit(handleSubmitSuccess, console.warn)(e);
  };

  const formId = useMemo(() => v4(), []);

  return (
    <div className={`${className} flex-1 h-screen`}>
      <ConfigTitlebar
        title="Map Settings"
        subtitle="Edit application map settings"
        renderIcon={(c) => <Save className={`${c}`} />}
        buttonTooltipText="Save changes"
        buttonProps={{ type: "submit", form: formId }}
      >
        <form id={formId} onSubmit={handleFormSubmit}>
          <ConfigInput
            type="url"
            text="Mapbox Map Style"
            error={errors.style?.message}
            {...register("style")}
          />
        </form>
      </ConfigTitlebar>
    </div>
  );
};

export default MapConfigPage;
