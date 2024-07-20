import React, { FC } from "react";

import { Controller } from "react-hook-form";
import { makeStyles } from "@mui/styles";
import { ServiceModuleValue } from "interfaces/utils";

import Grid from "@eGroupAI/material/Grid";
import Form from "components/Form";
import FormFieldLabel from "components/FormFieldLabel";
import FroalaEditor from "components/FroalaEditor";
import useCmsContentForm from "./useCmsContentForm";
import { CmsContentFormProps } from "../typings";

export const FORM = "ProductDescriptionForm";

const useStyles = makeStyles(() => ({
  editor: {
    "& .fr-toolbar": {
      top: 0,
      position: "sticky",
      zIndex: 1000,
    },
  },
}));

const ProductDescriptionForm: FC<CmsContentFormProps> = function (props) {
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
  const { handleSubmit, control } = methods;

  return (
    <Form
      id={FORM}
      onSubmit={handleSubmit(async (values) => {
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
              <FormFieldLabel>
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
                    placeholderText: "編輯產品描述",
                  }}
                />
              </FormFieldLabel>
            )}
          />
        </Grid>
      </Grid>
    </Form>
  );
};

export default ProductDescriptionForm;
