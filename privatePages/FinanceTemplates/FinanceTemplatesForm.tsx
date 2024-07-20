import React, { FC, useEffect } from "react";

import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import useTab from "@eGroupAI/hooks/useTab";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { FinanceTemplatesFormInput } from "interfaces/form";
import { OrganizationFinanceType } from "interfaces/utils";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import Tabs from "@eGroupAI/material/Tabs";
import Tab from "@eGroupAI/material/Tab";
import Box from "@eGroupAI/material/Box";
import IconButton from "components/IconButton/StyledIconButton";
import Typography from "@eGroupAI/material/Typography";
import Button from "@eGroupAI/material/Button";
import Grid from "@eGroupAI/material/Grid";
import DeleteIcon from "@mui/icons-material/Delete";
import TextField from "components/TextField";
import Form from "components/Form";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import useSetFormIsDirty, { SetFormIsDirty } from "utils/useSetFormIsDirty";

export const FORM = "FinanceTemplatesForm";

const useStyles = makeStyles((theme) => ({
  tabError: {
    "& .MuiButtonBase-root": {
      color: theme.palette.error.main,
    },
    "& .MuiTabs-indicator": {
      backgroundColor: theme.palette.error.main,
    },
  },
}));

export interface FinanceTemplatesFormProps {
  onSubmit: (values: FinanceTemplatesFormInput) => void;
  defaultValues?: Partial<FinanceTemplatesFormInput>;
  organizationFinanceTemplateId?: string;
  setFormIsDirty?: SetFormIsDirty;
  editable?: boolean;
}

const FinanceTemplatesForm: FC<FinanceTemplatesFormProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const {
    defaultValues,
    onSubmit,
    organizationFinanceTemplateId,
    setFormIsDirty,
    editable,
  } = props;
  const classes = useStyles();
  const organizationId = useSelector(getSelectedOrgId);
  const { value: tabValue, handleChange } = useTab(
    "FinanceTemplatesDialog",
    OrganizationFinanceType.INCOME
  );
  const { control, handleSubmit, register, reset, formState } =
    useForm<FinanceTemplatesFormInput>({
      defaultValues: {
        organizationFinanceTemplateName: "",
        organizationFinanceTemplateDescription: "",
        organizationFinanceColumnList: [
          {
            organizationFinanceColumnName: "",
            organizationFinanceType: OrganizationFinanceType.INCOME,
          },
          {
            organizationFinanceColumnName: "",
            organizationFinanceType: OrganizationFinanceType.INCOME,
          },
          {
            organizationFinanceColumnName: "",
            organizationFinanceType: OrganizationFinanceType.INCOME,
          },
          {
            organizationFinanceColumnName: "",
            organizationFinanceType: OrganizationFinanceType.INCOME,
          },
          {
            organizationFinanceColumnName: "",
            organizationFinanceType: OrganizationFinanceType.INCOME,
          },
          {
            organizationFinanceColumnName: "",
            organizationFinanceType: OrganizationFinanceType.EXPENDITURE,
          },
          {
            organizationFinanceColumnName: "",
            organizationFinanceType: OrganizationFinanceType.EXPENDITURE,
          },
          {
            organizationFinanceColumnName: "",
            organizationFinanceType: OrganizationFinanceType.EXPENDITURE,
          },
          {
            organizationFinanceColumnName: "",
            organizationFinanceType: OrganizationFinanceType.EXPENDITURE,
          },
          {
            organizationFinanceColumnName: "",
            organizationFinanceType: OrganizationFinanceType.EXPENDITURE,
          },
        ],
      },
    });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "organizationFinanceColumnList",
  });
  const { excute: deleteOrgFinanceTemplateColumn } = useAxiosApiWrapper(
    apis.org.deleteOrgFinanceTemplateColumn
  );
  const hasError = Object.keys(formState.errors).length > 0;

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  useSetFormIsDirty({
    isDirty: formState.isDirty,
    setFormIsDirty,
  });

  return (
    <Form id={FORM} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Controller
            control={control}
            name="organizationFinanceTemplateName"
            render={({ field }) => (
              <TextField
                {...field}
                label={wordLibrary?.["template name"] ?? "範本名稱"}
                fullWidth
                disabled={!editable}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            control={control}
            name="organizationFinanceTemplateDescription"
            render={({ field }) => (
              <TextField
                {...field}
                label={wordLibrary?.["template description"] ?? "範本描述"}
                fullWidth
                multiline
                minRows={4}
                disabled={!editable}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Tabs
            value={tabValue}
            onChange={(_, v) => handleChange(v)}
            centered
            className={clsx(hasError && classes.tabError)}
          >
            <Tab
              label={wordLibrary?.income ?? "收入"}
              value={OrganizationFinanceType.INCOME}
            />
            <Tab
              label={wordLibrary?.expenditure ?? "支出"}
              value={OrganizationFinanceType.EXPENDITURE}
            />
          </Tabs>
        </Grid>
        {hasError && (
          <Grid item xs={12}>
            <Typography color="error" align="center" variant="body2">
              {wordLibrary?.["both income and expense fields are required"] ??
                "收入支出欄位皆為必填"}
            </Typography>
          </Grid>
        )}
        {fields.map((el, index) => (
          <Grid
            item
            xs={12}
            key={el.id}
            sx={{
              display:
                el.organizationFinanceType !== tabValue ? "none" : "block",
            }}
          >
            <Box display="flex" alignItems="center">
              <input
                type="hidden"
                {...register(
                  `organizationFinanceColumnList.${index}.organizationFinanceColumnId`
                )}
              />
              <input
                type="hidden"
                {...register(
                  `organizationFinanceColumnList.${index}.organizationFinanceType`
                )}
                value={el.organizationFinanceType}
              />
              <Controller
                control={control}
                name={`organizationFinanceColumnList.${index}.organizationFinanceColumnName`}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={wordLibrary?.["field name"] ?? "欄位名稱"}
                    sx={{ flex: 1 }}
                    error={hasError}
                    disabled={!editable}
                  />
                )}
              />
              {editable && (
                <IconButton
                  onClick={async () => {
                    if (
                      el.organizationFinanceColumnId &&
                      organizationFinanceTemplateId
                    ) {
                      try {
                        await deleteOrgFinanceTemplateColumn({
                          organizationId,
                          organizationFinanceTemplateId,
                          organizationFinanceColumnId:
                            el.organizationFinanceColumnId,
                        });
                        remove(index);
                      } catch (error) {
                        apis.tools.createLog({
                          function: "deleteOrgFinanceTemplateColumn: error",
                          browserDescription: window.navigator.userAgent,
                          jsonData: {
                            data: error,
                            deviceInfo: getDeviceInfo(),
                          },
                          level: "ERROR",
                        });
                      }
                    } else {
                      remove(index);
                    }
                  }}
                  disabled={!editable}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          </Grid>
        ))}
        <Grid item xs={12}>
          {editable && (
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              onClick={() => {
                append({
                  organizationFinanceColumnName: "",
                  organizationFinanceType: tabValue,
                });
              }}
            >
              {wordLibrary?.["add field"] ?? "新增欄位"}
            </Button>
          )}
        </Grid>
      </Grid>
    </Form>
  );
};

export default FinanceTemplatesForm;
