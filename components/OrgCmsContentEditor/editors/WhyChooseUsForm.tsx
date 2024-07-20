import React, { FC } from "react";

import { FormProvider } from "react-hook-form";

import Grid from "@eGroupAI/material/Grid";
import Form from "components/Form";
import OrgMediaFieldArray from "components/OrgMediaFieldArray";
import { ServiceModuleValue } from "interfaces/utils";
import useCmsContentForm from "./useCmsContentForm";
import { CmsContentFormProps } from "../typings";

export const FORM = "WhyChooseUsForm";

const WhyChooseUsForm: FC<CmsContentFormProps> = function (props) {
  const { onSubmit, cmsContentId, setFormIsDirty, selectedLocale } = props;
  const { mutate, isValidating, handleDeleteItem, handleSortItem, methods } =
    useCmsContentForm({
      setFormIsDirty,
      cmsContentId: cmsContentId || "",
      selectedLocale,
    });
  const { handleSubmit } = methods;

  return (
    <FormProvider {...methods}>
      <Form
        id={FORM}
        onSubmit={handleSubmit((values) => {
          onSubmit(values, mutate);
        })}
        loading={isValidating}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <OrgMediaFieldArray
              filePathType={ServiceModuleValue.CMS}
              targetId={cmsContentId}
              maxFields={3}
              enableTitle
              onDeleteItemClick={handleDeleteItem}
              onItemOrderChange={handleSortItem}
            />
          </Grid>
        </Grid>
      </Form>
    </FormProvider>
  );
};

export default WhyChooseUsForm;
