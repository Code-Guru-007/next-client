import React, {
  useContext,
  useEffect,
  FC,
  Dispatch,
  SetStateAction,
  useState,
} from "react";

import { CarouselEditFormInput } from "interfaces/form";
import { useSelector } from "react-redux";
import useSetFormIsDirty, { SetFormIsDirty } from "utils/useSetFormIsDirty";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { OrganizationMediaSlider } from "interfaces/entities";
import { KeyedMutator } from "swr";
import { AxiosResponse } from "axios";

import { useForm, Controller } from "react-hook-form";
import Grid from "@eGroupAI/material/Grid";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import FormField from "components/FormField";
import Form from "components/Form";
import useOrgMediaSlider from "utils/useOrgMediaSlider";
import { useBoolean } from "minimal/hooks/use-boolean";
import CarouselManagementContext from "../CarouselManagement/CarouselManagementContext";

export const FORM = "CarouselEditForm";
export interface CarouselEditFormProps {
  onSubmit: (
    values: CarouselEditFormInput,
    mutate: KeyedMutator<AxiosResponse<OrganizationMediaSlider>>,
    closeEditDialog?: () => void
  ) => void;
  setFormIsDirty?: SetFormIsDirty;
  setFormValues?: Dispatch<SetStateAction<CarouselEditFormInput>>;
}

const CarouselEditForm: FC<CarouselEditFormProps> = function (props) {
  const organizationId = useSelector(getSelectedOrgId);
  const { onSubmit, setFormIsDirty, setFormValues } = props;
  const wordLibrary = useSelector(getWordLibrary);
  const { selectedItem, selectedLocale, closeEditDialog } = useContext(
    CarouselManagementContext
  );
  const error1 = useBoolean();
  const [helperTxt1, setHelperTxt1] = useState<string | undefined>();

  const error2 = useBoolean();
  const [helperTxt2, setHelperTxt2] = useState<string | undefined>();

  const { control, handleSubmit, reset, formState } =
    useForm<CarouselEditFormInput>({
      defaultValues: {
        organizationMediaSliderTitle: "",
        organizationMediaSliderDescription: "",
        organizationMediaSliderLinkURL: "",
      },
    });

  useSetFormIsDirty({
    isDirty: formState.isDirty,
    setFormIsDirty,
  });

  const { data, mutate, isValidating } = useOrgMediaSlider(
    {
      organizationId,
      organizationMediaSliderId: selectedItem?.ids.organizationMediaSliderId,
    },
    {
      locale: selectedLocale,
    }
  );

  useEffect(() => {
    reset({
      organizationMediaSliderTitle: data?.organizationMediaSliderTitle,
      organizationMediaSliderDescription:
        data?.organizationMediaSliderDescription,
      organizationMediaSliderLinkURL: data?.organizationMediaSliderLinkURL,
    });
  }, [data, reset]);

  return (
    <Form
      id={FORM}
      onSubmit={handleSubmit((values) => {
        onSubmit(values, mutate, closeEditDialog);
      })}
      loading={isValidating}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <Controller
            control={control}
            name="organizationMediaSliderTitle"
            render={({ field: { value, onChange } }) => (
              <FormField
                primary="標題 *"
                TextFieldProps={{
                  onChange: (e) => {
                    if (setFormValues) {
                      setFormValues((val) => ({
                        ...val,
                        organizationMediaSliderTitle: e.target.value,
                      }));
                    }
                    onChange(e);
                    if (e.target.value) {
                      error1.onFalse();
                      setHelperTxt1("");
                    } else {
                      error1.onTrue();
                    }
                  },
                  required: true,
                  value,
                  onInvalid: () => {
                    error1.onTrue();
                    setHelperTxt1("此為必填欄位。");
                  },
                  error: error1.value,
                  helperText: helperTxt1,
                  placeholder: "輸入標題名稱",
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={12}>
          <Controller
            control={control}
            name="organizationMediaSliderDescription"
            render={({ field: { value, onChange } }) => (
              <FormField
                primary={`${wordLibrary?.description ?? "描述"} *`}
                TextFieldProps={{
                  onChange: (e) => {
                    if (setFormValues) {
                      setFormValues((val) => ({
                        ...val,
                        organizationMediaSliderDescription: e.target.value,
                      }));
                    }
                    onChange(e);
                    if (e.target.value) {
                      error2.onFalse();
                      setHelperTxt2("");
                    } else {
                      error2.onTrue();
                    }
                  },
                  required: true,
                  value,
                  onInvalid: () => {
                    error2.onTrue();
                    setHelperTxt2("此為必填欄位。");
                  },
                  error: error2.value,
                  helperText: helperTxt2,
                  placeholder: "輸入描述",
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={12}>
          <Controller
            control={control}
            name="organizationMediaSliderLinkURL"
            render={({ field: { value, onChange } }) => (
              <FormField
                primary="連結 URL"
                TextFieldProps={{
                  onChange: (e) => {
                    if (setFormValues) {
                      setFormValues((val) => ({
                        ...val,
                        organizationMediaSliderLinkURL: e.target.value,
                      }));
                    }
                    onChange(e);
                  },
                  value,
                  placeholder: "輸入連結 URL",
                }}
              />
            )}
          />
        </Grid>
      </Grid>
    </Form>
  );
};

export default CarouselEditForm;
