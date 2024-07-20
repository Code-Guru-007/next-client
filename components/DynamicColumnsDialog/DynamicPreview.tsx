/* eslint-disable no-param-reassign */
import React, { FC, useEffect, useMemo, useState } from "react";
import { Grid, Box } from "@eGroupAI/material";
import { ColumnType } from "@eGroupAI/typings/apis";
import { Values } from "interfaces/entities";
import useOrgDynamicColumns from "utils/useOrgDynamicColumns";
import DynamicField from "components/DynamicField/DynamicField";
import {
  DynamicColumnsFormInput,
  DynamicValueType,
  OrgColumnFormInput,
} from "interfaces/form";

interface DynamicPreviewProps {
  defaultValues?: DynamicColumnsFormInput;
  previewValue?: DynamicColumnsFormInput;
  organizationId?: string;
}

const DynamicPreview: FC<DynamicPreviewProps> = function (props) {
  const { defaultValues, previewValue, organizationId } = props;
  const [values, setValues] = useState<OrgColumnFormInput | undefined>(
    defaultValues?.organizationColumnList[0]
  );
  const [dynamicValue, setDynamicValue] = useState<Values>({});

  const [selectedNextColumnIds, setSelectedNextColumnIds] = useState<{
    [parentKey: string]: string | undefined;
  }>({});

  const options = useMemo(
    () =>
      values?.organizationOptionList?.map((li) => ({
        optionId: li.organizationOptionId || "",
        label: li.organizationOptionName || "",
        value: li.organizationOptionName || "",
        nextColumnId: li.organizationOptionNextColumnId,
      })),
    [values]
  );
  useEffect(() => {
    if (previewValue) {
      setValues(previewValue?.organizationColumnList[0]);
    }
  }, [previewValue]);

  const { data } = useOrgDynamicColumns({
    organizationId,
  });

  const nextColumns = useMemo(() => {
    if (
      values?.columnType !== ColumnType.CHOICE_ONE &&
      ColumnType.CHOICE_ONE_DROPDOWN !== values?.columnType
    )
      return undefined;
    return data?.source.filter(
      (d) =>
        values?.organizationOptionList?.find(
          (el) => el.organizationOptionNextColumnId === d.columnId
        ) !== undefined
    );
  }, [data, values]);

  const selectedNextColumn = useMemo(
    () =>
      nextColumns?.find(
        (next) => next.columnId === Object.values(selectedNextColumnIds)[0]
      ),
    [nextColumns, selectedNextColumnIds]
  );

  const handleChange = (name: string, value?: DynamicValueType) => {
    setDynamicValue((val) => ({
      ...val,
      [name]: value?.value,
    }));
  };

  return (
    <Grid
      item
      xs={12}
      key={values?.columnName}
      sx={{ "& .MuiTypography-root": { padding: "6px 0px" } }}
    >
      {values ? (
        <DynamicField
          name={values.columnId || ""}
          type={values.columnType}
          label={values.columnName}
          fullWidth
          isEditor={values.isEditor === 1}
          editorTemplateContent={values.columnEditorTemplateContent}
          min={values.columnNumberMin}
          max={values.columnNumberMax}
          hasValidator={values.hasValidator === 1}
          validator={values.columnValidatorRegex}
          hasRemark={values.hasValueRemark === 1}
          requiredRemark={values.isRequiredValueRemark === 1}
          required={values.isRequired === 1}
          numberUnit={values.columnNumberUnit}
          numberDecimal={values.columnNumberOfDecimal}
          isRelatedServiceModule={values.isRelatedServiceModule === 1}
          columnRelatedServiceModuleValue={
            values.columnRelatedServiceModuleValue
          }
          hasNextColumn={values.hasNextColumn === 1}
          setSelectedNextColumnIds={setSelectedNextColumnIds}
          handleChange={handleChange}
          value={dynamicValue[values.columnId || ""]}
          options={options}
          preview
          maxOptionBeSelected={values.maxOptionBeSelected}
          minOptionBeSelected={values.minOptionBeSelected}
        />
      ) : (
        " "
      )}
      {nextColumns && selectedNextColumnIds && selectedNextColumn && (
        <Box style={{ padding: "10px 0 0 30px" }}>
          <DynamicField
            name={selectedNextColumn.columnId || ""}
            type={selectedNextColumn.columnType}
            label={selectedNextColumn.columnName}
            fullWidth
            isEditor={selectedNextColumn.isEditor === 1}
            editorTemplateContent={
              selectedNextColumn.columnEditorTemplateContent
            }
            min={selectedNextColumn.columnNumberMin}
            max={selectedNextColumn.columnNumberMax}
            hasValidator={selectedNextColumn.hasValidator === 1}
            validator={selectedNextColumn.columnValidatorRegex}
            hasRemark={selectedNextColumn.hasValueRemark === 1}
            requiredRemark={selectedNextColumn.isRequiredValueRemark === 1}
            required={selectedNextColumn.isRequired === 1}
            numberUnit={selectedNextColumn.columnNumberUnit}
            numberDecimal={selectedNextColumn.columnNumberOfDecimal}
            isRelatedServiceModule={
              selectedNextColumn.isRelatedServiceModule === 1
            }
            columnRelatedServiceModuleValue={
              selectedNextColumn.columnRelatedServiceModuleValue
            }
            hasNextColumn={selectedNextColumn.hasNextColumn === 1}
            setSelectedNextColumnIds={setSelectedNextColumnIds}
            handleChange={handleChange}
            value={dynamicValue[selectedNextColumn.columnId || ""]}
            options={selectedNextColumn.organizationOptionList?.map((op) => ({
              optionId: op.organizationOptionId || "",
              label: op.organizationOptionName || "",
              value: op.organizationOptionName || "",
              nextColumnId: op.organizationOptionNextColumnId,
            }))}
            preview
          />
        </Box>
      )}
    </Grid>
  );
};

export default React.memo(DynamicPreview);
