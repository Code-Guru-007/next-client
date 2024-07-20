import React, { FC } from "react";

import { Controller, FormProvider } from "react-hook-form";
import { makeStyles } from "@mui/styles";

import Grid from "@eGroupAI/material/Grid";
import Form from "components/Form";
import FormFieldLabel from "components/FormFieldLabel";
import FroalaEditor from "components/FroalaEditor";
import { ServiceModuleValue } from "interfaces/utils";
import wordLibrary from "redux/wordLibrary";
import useCmsContentForm from "./useCmsContentForm";
import { CmsContentFormProps } from "../typings";

export const FORM = "ProductArticleForm";

const useStyles = makeStyles(() => ({
  editor: {
    "& .fr-toolbar": {
      top: 0,
      position: "sticky",
      zIndex: 1000,
    },
  },
}));

const ProductArticleForm: FC<CmsContentFormProps> = function (props) {
  const classes = useStyles();
  const {
    onSubmit,
    cmsContentId,
    setFormIsDirty,
    selectedLocale,
    handleClose,
  } = props;
  const { mutate, isValidating, methods } = useCmsContentForm({
    setFormIsDirty,
    cmsContentId: cmsContentId || "",
    selectedLocale,
  });
  const { control, handleSubmit } = methods;

  return (
    <FormProvider {...methods}>
      <Form
        id={FORM}
        onSubmit={handleSubmit((values) => {
          onSubmit(values, mutate, handleClose);
        })}
        loading={isValidating}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              control={control}
              name="organizationCmsContentDescription"
              render={({ field: { value, onChange } }) => (
                <FormFieldLabel primary="說明">
                  <FroalaEditor
                    filePathType={ServiceModuleValue.CMS}
                    className={classes.editor}
                    model={value}
                    onModelChange={(model) => {
                      onChange(model);
                    }}
                    config={{
                      toolbarSticky: true,
                      heightMin: 300,
                      placeholderText:
                        wordLibrary?.["edit description"] ?? "編輯說明",
                    }}
                  />
                </FormFieldLabel>
              )}
            />
          </Grid>
        </Grid>
      </Form>
    </FormProvider>
  );
};

export default ProductArticleForm;
