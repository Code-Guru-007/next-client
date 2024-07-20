import React, { FC } from "react";

import FormFieldLabel, { FormFieldLabelProps } from "components/FormFieldLabel";
import TextField, { TextFieldProps } from "@mui/material/TextField";

export interface FormFieldProps extends FormFieldLabelProps {
  TextFieldProps?: TextFieldProps;
  testId?: string;
}

const FormField: FC<FormFieldProps> = function (props) {
  const { TextFieldProps, testId, ...other } = props;
  return (
    <FormFieldLabel {...other}>
      <TextField variant="outlined" {...TextFieldProps} data-tid={testId} />
    </FormFieldLabel>
  );
};

export default FormField;
