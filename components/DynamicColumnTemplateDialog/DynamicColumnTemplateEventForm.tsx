import React, { FC, useMemo, useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { FormProvider, Controller, useFormContext } from "react-hook-form";

import Typography from "@eGroupAI/material/Typography";
import Grid from "@eGroupAI/material/Grid";
import TextField from "@mui/material/TextField";
import Stepper from "@eGroupAI/material/Stepper";
import Step from "@eGroupAI/material/Step";
import StepButton from "@eGroupAI/material/StepButton";
import Box from "@eGroupAI/material/Box";
import Autocomplete from "@eGroupAI/material/Autocomplete";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import Button from "@mui/material/Button";

import useOrgTagGroups from "utils/useOrgTagGroups";
import useOrgTagsByGroups from "utils/useOrgTagsByGroups";
import useOrgMembers from "utils/useOrgMembers";

import Form from "components/Form";
import FroalaEditor from "components/FroalaEditor";
import TagAutocomplete from "components/TagAutocomplete";
import { getGlobalLocale } from "components/PrivateLayout/selectors";

import { ServiceModuleValue } from "interfaces/utils";
import { DynamicColumnTemplateEventFormInput } from "interfaces/form";
import useReduxSteps from "utils/useReduxSteps";
import { OrganizationColumn } from "interfaces/entities";
import { EachRowState } from "@eGroupAI/material-module/DataTable";

import DynamicColumnMiniTable from "./DynamicColumnMiniTable";

export const FORM = "DynamicColumnTemplateEventForm";

interface Props {
  selectedColumnList?: OrganizationColumn[];
  isLoading?: boolean;
  serviceModuleValue: ServiceModuleValue;
  columnTable: string;
}

const DynamicColumnTemplateEventForm: FC<Props> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);

  const steps = [
    `${wordLibrary?.["select field"] ?? "選擇欄位"}`,
    `${wordLibrary?.setting ?? "設定"}`,
  ];

  const { selectedColumnList, isLoading, columnTable, serviceModuleValue } =
    props;

  const organizationId = useSelector(getSelectedOrgId);
  const methods = useFormContext<DynamicColumnTemplateEventFormInput>();
  const { control, setValue } = methods;

  const { setActiveStep, activeStep = 0 } = useReduxSteps(
    "DynamicColumnTemplateSteps"
  );
  const handleStep = (step: number) => () => {
    setActiveStep(step);
  };

  const locale = useSelector(getGlobalLocale);
  const [query, setQuery] = useState("");

  const { data } = useOrgTagGroups(
    {
      organizationId,
    },
    {
      locale,
      serviceModuleValue,
    }
  );
  const tags = useOrgTagsByGroups(data?.source);

  const { data: orgMembers, isValidating } = useOrgMembers(
    {
      organizationId,
    },
    {
      query,
    }
  );

  const defaultCheckedRowIds = useMemo(
    () => selectedColumnList?.map((c) => c.columnId),
    [selectedColumnList]
  );

  const [tempRowState, setTempRowState] = useState<
    EachRowState<OrganizationColumn>
  >({});

  const [tempCheckedRowIds, setTempCheckedRowIds] = useState<
    string[] | undefined
  >(defaultCheckedRowIds);

  useEffect(() => {
    setTempCheckedRowIds(() =>
      Object.values(tempRowState)
        .filter((row) => row?.checked)
        .map((rowData) => rowData?.data?.columnId || "")
    );
  }, [tempRowState]);
  const renderMiniTable = () =>
    !isLoading && (
      <DynamicColumnMiniTable
        organizationId={organizationId}
        onChangeSelectedColumns={(columnIds) => {
          const list = columnIds.map((id) => ({
            columnId: id,
          }));
          setValue("organizationColumnList", list);
        }}
        defaultCheckedRowIds={tempCheckedRowIds}
        onEachRowStateChange={(state) => {
          setTempRowState(state);
        }}
        columnTable={columnTable}
      />
    );

  const handleDaysIntervalChange = (e) => {
    const regex = /^[0-9\b]+$/;
    if (e.target.value === "" || regex.test(e.target.value)) {
      setValue(
        "organizationColumnTemplateEventEndDaysInterval",
        e.target.value
      );
    }
  };
  const [content, setContent] = useState("");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const chipArray = [
    `{{${
      wordLibrary?.["Year of event creation (Gregorian calendar)"] ??
      "事件建立年(西元)"
    }}}`,
    `{{${
      wordLibrary?.["Year of event creation (Minguo calendar)"] ??
      "事件建立年(民國)"
    }}}`,
    `{{${wordLibrary?.["Month of event creation"] ?? "事件建立月"}}}`,
    `{{${wordLibrary?.["Day of event creation"] ?? "事件建立日"}}}`,
    `{{${
      wordLibrary?.["Name of the member creating the event"] ?? "事件建立者名稱"
    }}}`,
    `{{${
      wordLibrary?.["Name of the CRM-User for the event"] ?? "事件個人客戶名稱"
    }}}`,
    `{{${
      wordLibrary?.["Name of the CRM-Partner for the event"] ??
      "事件單位客戶名稱"
    }}}`,
  ];

  const handleEventButtonClick = (id) => {
    if (outerDivRef.current) {
      outerDivRef.current.focus();
      const placeholderRegex = /\{\{(.*?)\}\}/g;
      const matches = outerDivRef.current.innerHTML.match(placeholderRegex);
      let values: string[] = [];
      if (matches) {
        values = matches.map((m) => m.substring(0, m.length));
      }
      const matchingIndices = values.map((value) => chipArray.indexOf(value));
      if (!matchingIndices.includes(id)) {
        const newSpan = document.createElement("span");
        newSpan.contentEditable = "false";
        newSpan.style.backgroundColor = "#fff2cc";
        newSpan.style.border = "1px solid #ffa500";
        newSpan.style.borderRadius = "8px";
        newSpan.style.marginTop = "3px";
        newSpan.style.padding = "2px";
        newSpan.style.display = "inline";
        newSpan.style.color = "black";
        const textNode = document.createTextNode(chipArray[id] || "");
        newSpan.appendChild(textNode);

        const spaceNode = document.createTextNode("\u00A0");
        const selection = window.getSelection();

        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents(); // Remove any existing content in the range
          // if (range.startOffset > 0) {
          //   const textNode = document.createTextNode("\u00A0");
          //   range.insertNode(textNode);
          // }
          range.collapse(false);
          // Append newSpan and spaceNode only to outerDivRef.current
          // if (range.startContainer === outerDivRef.current) {
          // range.insertNode(spaceNode);
          range.insertNode(newSpan);
          range.setStartAfter(newSpan);
          // }
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          outerDivRef.current.appendChild(spaceNode);
          outerDivRef.current.appendChild(newSpan);
        }

        setValue(
          "organizationColumnTemplateSubstituteName",
          outerDivRef.current.textContent || ""
        );
        outerDivRef.current.focus();
      }
    }
  };

  const outerDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const placeholderRegex = /\{\{(.*?)\}\}/g;
    let replacedValue = content;
    let match = placeholderRegex.exec(content);
    while (match !== null) {
      const placeholder = match[0];
      if (placeholder) {
        if (chipArray.includes(placeholder)) {
          const chip = `<span contenteditable="false" style="background-color: #fff2cc; border: 1px solid #ffa500; margin-top: 3px; border-radius: 8px;color:black; padding: 2px;">${placeholder}</span>`;
          replacedValue = replacedValue.replace(placeholder, chip);
        }
      }

      match = placeholderRegex.exec(content);
    }
    if (outerDivRef.current)
      if (outerDivRef.current.innerHTML === "")
        outerDivRef.current.innerHTML = replacedValue;
  }, [chipArray, content]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const froalaElement = document.querySelector(".fr-element.fr-view");
      if (froalaElement) {
        froalaElement.setAttribute("id", "default-event-description-editor");
      }
    });
    observer.observe(document, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <FormProvider {...methods}>
      <Form id={FORM}>
        <Box marginBottom={2}>
          <Stepper nonLinear activeStep={activeStep}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepButton
                  color="inherit"
                  onClick={handleStep(index)}
                  id={`event-template-step-button-${index}`}
                  data-tid={`event-template-step-button-${index}`}
                >
                  {label}
                </StepButton>
              </Step>
            ))}
          </Stepper>
        </Box>
        <Grid container spacing={2}>
          {activeStep === 0 && (
            <Grid item xs={12}>
              {renderMiniTable()}
            </Grid>
          )}
          {activeStep === 1 && (
            <>
              <Grid item xs={12}>
                <Controller
                  control={control}
                  name="organizationColumnTemplateTitle"
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      {...field}
                      placeholder={
                        wordLibrary?.["event template name"] ?? "事件範本名稱"
                      }
                      id="event-template-name-input"
                      data-tid="event-template-name-input"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography
                  component="h5"
                  color="textSecondary"
                  sx={{ marginLeft: "15px" }}
                >
                  {wordLibrary?.["default event name"] ?? "預設事件名稱"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Controller
                  control={control}
                  name="organizationColumnTemplateSubstituteName"
                  render={({ field }) => {
                    setContent(field.value);
                    return (
                      <>
                        <div
                          id="event-default-name-input"
                          data-tid="event-default-name-input"
                          ref={outerDivRef}
                          contentEditable
                          style={{
                            minHeight: "50px",
                            borderRadius: "8px",
                            border: "1px solid rgba(145, 158, 171, 0.2)",
                            width: "100%",
                            padding: "17px 30px 16px 30px",
                            lineHeight: "2",
                          }}
                          onInput={(e) => {
                            setValue(
                              "organizationColumnTemplateSubstituteName",
                              e.currentTarget.textContent ?? ""
                            );
                          }}
                        />
                      </>
                    );
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  sx={{ marginRight: 2, marginBottom: 1 }}
                  onClick={() => handleEventButtonClick(0)}
                  id="event-default-name-button-gregorian-year"
                  data-tid="event-default-name-button-gregorian-year"
                >
                  {wordLibrary?.[
                    "Year of event creation (Gregorian calendar)"
                  ] ?? "事件建立年(西元)"}
                </Button>
                <Button
                  variant="outlined"
                  sx={{ marginRight: 2, marginBottom: 1 }}
                  onClick={() => handleEventButtonClick(1)}
                  id="event-default-name-button-minguo-year"
                  data-tid="event-default-name-button-minguo-year"
                >
                  {wordLibrary?.["Year of event creation (Minguo calendar)"] ??
                    "事件建立年(民國)"}
                </Button>
                <Button
                  variant="outlined"
                  sx={{ marginRight: 2, marginBottom: 1 }}
                  onClick={() => handleEventButtonClick(2)}
                  id="event-default-name-button-month"
                  data-tid="event-default-name-button-month"
                >
                  {wordLibrary?.["Month of event creation"] ?? "事件建立月"}
                </Button>
                <Button
                  variant="outlined"
                  sx={{ marginRight: 2, marginBottom: 1 }}
                  onClick={() => handleEventButtonClick(3)}
                  id="event-default-name-button-day"
                  data-tid="event-default-name-button-day"
                >
                  {wordLibrary?.["Day of event creation"] ?? "事件建立日"}
                </Button>
                <Button
                  variant="outlined"
                  sx={{ marginRight: 2, marginBottom: 1 }}
                  onClick={() => handleEventButtonClick(4)}
                  id="event-default-name-button-member"
                  data-tid="event-default-name-button-member"
                >
                  {wordLibrary?.["Name of the member creating the event"] ??
                    "事件建立者名稱"}
                </Button>
                <Button
                  variant="outlined"
                  sx={{ marginRight: 2, marginBottom: 1 }}
                  onClick={() => handleEventButtonClick(5)}
                  id="event-default-name-button-user"
                  data-tid="event-default-name-button-user"
                >
                  {wordLibrary?.["Name of the CRM-User for the event"] ??
                    "事件個人客戶名稱"}
                </Button>
                <Button
                  variant="outlined"
                  sx={{ marginRight: 2, marginBottom: 1 }}
                  onClick={() => handleEventButtonClick(6)}
                  id="event-default-name-button-partner"
                  data-tid="event-default-name-button-partner"
                >
                  {wordLibrary?.["Name of the CRM-Partner for the event"] ??
                    "事件單位客戶名稱"}
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Controller
                  control={control}
                  name="organizationColumnTemplateDescription"
                  render={({ field }) => (
                    <FroalaEditor
                      filePathType={serviceModuleValue}
                      model={field.value}
                      onModelChange={(model) => {
                        field.onChange(model);
                      }}
                      config={{
                        toolbarSticky: true,
                        heightMin: 150,
                        placeholderText:
                          wordLibrary?.["default event description"] ??
                          "預設事件敘述",
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography
                  component="h5"
                  color="textSecondary"
                  sx={{ marginLeft: "15px" }}
                >
                  {wordLibrary?.["default start-end interval in days"] ??
                    "預設開始結束間隔天數"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Controller
                  control={control}
                  name="organizationColumnTemplateEventEndDaysInterval"
                  render={({ field }) => (
                    <TextField
                      type="number"
                      fullWidth
                      {...field}
                      onChange={(e) => handleDaysIntervalChange(e)}
                      placeholder={
                        wordLibrary?.["please enter a number"] ?? "請填寫數字"
                      }
                      id="event-duration-input-interval"
                      data-tid="event-duration-input-interval"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  control={control}
                  name="organizationTagList"
                  render={({ field }) => (
                    <TagAutocomplete
                      value={tags?.filter(
                        (tag) =>
                          field.value.findIndex(
                            (el) => el.tagId === tag.tagId
                          ) !== -1
                      )}
                      serviceModuleValue={serviceModuleValue}
                      onChange={(e, value) => {
                        const list = value.map((el) => ({
                          tagId: el.tagId,
                        }));
                        setValue("organizationTagList", list);
                      }}
                      id="event-tag-input"
                      data-tid="event-tag-input"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  control={control}
                  name="organizationMemberList"
                  render={({ field: { value } }) => (
                    <Autocomplete
                      multiple
                      size="medium"
                      loading={isValidating}
                      disableCloseOnSelect
                      options={orgMembers?.source || []}
                      renderInput={(params) => (
                        <TextField
                          variant="outlined"
                          placeholder={
                            wordLibrary?.["select organization members"] ??
                            "選擇單位成員"
                          }
                          {...params}
                        />
                      )}
                      isOptionEqualToValue={(option, value) =>
                        option.member.memberName === value.member.memberName
                      }
                      getOptionLabel={(option) => option.member.memberName}
                      noOptionsText="查無單位成員"
                      value={value}
                      onInputChange={(_, v) => {
                        setQuery(v);
                      }}
                      onChange={(_, value) => {
                        setValue("organizationMemberList", value);
                      }}
                      id="event-member-input"
                      data-tid="event-member-input"
                    />
                  )}
                />
              </Grid>
            </>
          )}
        </Grid>
      </Form>
    </FormProvider>
  );
};

export default DynamicColumnTemplateEventForm;
