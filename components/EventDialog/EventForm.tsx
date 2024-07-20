import React, { FC, useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useTheme } from "@mui/styles";
import { CircularProgress, useMediaQuery } from "@mui/material";
import { toDate, format } from "@eGroupAI/utils/dateUtils";
import { useAppDispatch } from "redux/configureAppStore";
import { ServiceModuleValue } from "interfaces/utils";
import { ColumnTemplate } from "interfaces/entities";

import Grid from "@eGroupAI/material/Grid";
import InputAdornment from "@eGroupAI/material/InputAdornment";
import Autocomplete from "@mui/material/Autocomplete";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import TextField from "@mui/material/TextField";
import Avatar from "components/Avatar";
import NewDateRangePicker from "components/NewDateRangePicker";
import FroalaEditor from "components/FroalaEditor";
import { getValues } from "redux/eventDialog/selectors";
import { InitialState, Payload, setStates, setValue } from "redux/eventDialog";
import { useBoolean } from "minimal/hooks/use-boolean";

export const FORM = "EventForm";

export interface EventFormProps {
  isDialogOpen?: boolean;
  dynTemplateList?: ColumnTemplate[];
  selectedTemplate?: ColumnTemplate;
  onChangeDynamicTemplate?: (value?: string) => void;
  onSubmit?: (values?: InitialState["values"]) => Promise<void> | void;
  loading?: boolean;
}

const EventForm: FC<EventFormProps> = function (props) {
  const {
    isDialogOpen = false,
    dynTemplateList,
    selectedTemplate,
    onChangeDynamicTemplate,
    onSubmit,
    loading = false,
  } = props;

  const dispatch = useAppDispatch();
  const wordLibrary = useSelector(getWordLibrary);
  const values = useSelector(getValues);
  const selectedPartners = values.organizationPartnerList || [];
  const selectedUsers = values.organizationUserList || [];
  const selectedMembers = values.organizationMemberList || [];

  const theme = useTheme();
  const isDownLg = useMediaQuery(theme.breakpoints.down("lg"));
  const [dynTemplateDescr, setDynTemplateDescr] = useState<string>("");
  const [eventTitle, setEventTitle] = useState<string>("");
  const [eventAddress, setEventAddress] = useState<string>("");
  const [eventDescr, setEventDescr] = useState<string>("");
  const [eventStartDateString, setEventStartDateString] = useState<
    string | null | undefined
  >(values.organizationEventStartDate);
  const [eventEndDateString, setEventEndDateString] = useState<
    string | null | undefined
  >(values.organizationEventEndDate);

  const handelChangeDynamicTemplate = (value: ColumnTemplate | null) => {
    if (onChangeDynamicTemplate) {
      onChangeDynamicTemplate(value?.organizationColumnTemplateId);
    }
  };

  const handleChange = (name: Payload["name"], objValue: string) => {
    if (isDialogOpen)
      dispatch(
        setValue({
          name,
          value: objValue,
          states: {
            isDirty: true,
          },
        })
      );
  };

  const handleDateTimeChange = useCallback(
    (dateRange) => {
      if (dateRange[0] && isDialogOpen) {
        setEventStartDateString(dateRange[0]?.toISOString());
        dispatch(
          setValue({
            name: "organizationEventStartDate",
            value: dateRange[0].toISOString(),
            states: {
              isDirty: true,
            },
          })
        );
      }
      if (dateRange[1] && isDialogOpen) {
        setEventEndDateString(dateRange[1]?.toISOString());
        dispatch(
          setValue({
            name: "organizationEventEndDate",
            value: dateRange[1].toISOString(),
            states: {
              isDirty: true,
            },
          })
        );
      }
    },
    [dispatch, isDialogOpen]
  );

  const getEndDateFromTimeInterval = (startDate) => {
    let increDay: number =
      selectedTemplate?.organizationColumnTemplateEventEndDaysInterval || 0;
    if (increDay === 0) {
      increDay = 1;
    }

    const oneDay = 1000 * 60 * 60 * 24;
    const currentDayInMilli = new Date(startDate).getTime();

    const endDate = new Date(currentDayInMilli + oneDay * increDay);
    setEventEndDateString(format(endDate, "yyyy-MM-dd"));
    return endDate.toISOString();
  };

  useEffect(() => {
    if (selectedTemplate) {
      setEventTitle(selectedTemplate?.organizationColumnTemplateSubstituteName);
      handleChange(
        "organizationEventTitle",
        selectedTemplate?.organizationColumnTemplateSubstituteName
      );
      handleChange("organizationEventAddress", "");
      handleChange("organizationEventDescription", "");

      setDynTemplateDescr(
        selectedTemplate?.organizationColumnTemplateDescription
      );

      if (selectedTemplate?.organizationColumnTemplateDescription) {
        setEventDescr(selectedTemplate.organizationColumnTemplateDescription);
      }

      setEventEndDateString(getEndDateFromTimeInterval(eventStartDateString));
      handleChange(
        "organizationEventEndDate",
        getEndDateFromTimeInterval(eventStartDateString)
      );

      setEventAddress("");
      setEventDescr("");
    } else {
      setEventTitle("");
      setDynTemplateDescr("");
      setEventEndDateString(eventEndDateString);
      handleChange(
        "organizationEventEndDate",
        getEndDateFromTimeInterval(eventStartDateString)
      );
      setEventAddress("");
      setEventDescr("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate]);

  useEffect(() => {
    if (selectedTemplate)
      if (selectedTemplate.organizationColumnTemplateSubstituteName) {
        const regex = /{{(.*?)}}/g;
        const matches =
          selectedTemplate.organizationColumnTemplateSubstituteName.match(
            regex
          );
        if (matches) {
          const extractedStrings = matches.map((match) => match.slice(2, -2));
          extractedStrings.forEach((extractedString) => {
            if (
              extractedString.localeCompare(
                wordLibrary?.["Name of the member creating the event"] ??
                  "事件建立者名稱"
              ) === 0
            ) {
              const joinedMemberNames =
                selectedMembers
                  ?.map((member) => member.member.memberName)
                  .join(", ") || "";
              if (joinedMemberNames !== "") {
                setEventTitle((prev) => {
                  const newTitle = prev.replace(
                    `{{${
                      wordLibrary?.["Name of the member creating the event"] ??
                      "事件建立者名稱"
                    }}}`,
                    joinedMemberNames
                  );
                  handleChange("organizationEventTitle", newTitle);
                  return newTitle;
                });
              }
            }
          });
        }
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMembers.length]);

  useEffect(() => {
    if (selectedTemplate)
      if (selectedTemplate.organizationColumnTemplateSubstituteName) {
        const regex = /{{(.*?)}}/g;
        const matches =
          selectedTemplate.organizationColumnTemplateSubstituteName.match(
            regex
          );
        if (matches) {
          const extractedStrings = matches.map((match) => match.slice(2, -2));
          extractedStrings.forEach((extractedString) => {
            if (
              extractedString.localeCompare(
                wordLibrary?.["Name of the CRM-User for the event"] ??
                  "事件個人客戶名稱"
              ) === 0
            ) {
              const joinedUserNames =
                selectedUsers
                  ?.map((member) => member.organizationUserNameZh)
                  .join(", ") || "";
              if (joinedUserNames !== "") {
                setEventTitle((prev) => {
                  const newTitle = prev.replace(
                    `{{${
                      wordLibrary?.["Name of the CRM-User for the event"] ??
                      "事件個人客戶名稱"
                    }}}`,
                    joinedUserNames
                  );
                  handleChange("organizationEventTitle", newTitle);
                  return newTitle;
                });
              }
            }
          });
        }
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUsers.length]);

  useEffect(() => {
    if (selectedTemplate)
      if (selectedTemplate.organizationColumnTemplateSubstituteName) {
        const regex = /{{(.*?)}}/g;
        const matches =
          selectedTemplate.organizationColumnTemplateSubstituteName.match(
            regex
          );
        if (matches) {
          const extractedStrings = matches.map((match) => match.slice(2, -2));
          extractedStrings.forEach((extractedString) => {
            if (
              extractedString.localeCompare(
                wordLibrary?.["Name of the CRM-Partner for the event"] ??
                  "事件單位客戶名稱"
              ) === 0
            ) {
              const joinedPartnerNames =
                selectedPartners
                  ?.map((member) => member.organizationPartnerNameZh)
                  .join(", ") || "";
              if (joinedPartnerNames !== "") {
                setEventTitle((prev) => {
                  const newTitle = prev.replace(
                    `{{${
                      wordLibrary?.["Name of the CRM-Partner for the event"] ??
                      "事件單位客戶名稱"
                    }}}`,
                    joinedPartnerNames
                  );
                  handleChange("organizationEventTitle", newTitle);
                  return newTitle;
                });
              }
            }
          });
        }
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPartners.length]);

  useEffect(() => {
    if (selectedTemplate)
      if (selectedTemplate.organizationColumnTemplateSubstituteName) {
        const regex = /{{(.*?)}}/g;
        const matches =
          selectedTemplate.organizationColumnTemplateSubstituteName.match(
            regex
          );
        if (matches) {
          const extractedStrings = matches.map((match) => match.slice(2, -2));
          extractedStrings.forEach((extractedString) => {
            if (
              extractedString.localeCompare(
                wordLibrary?.["Year of event creation (Gregorian calendar)"] ??
                  "事件建立年(西元)"
              ) === 0
            ) {
              setEventTitle((prev) => {
                const currentYear = new Date().getFullYear();
                const newTitle = prev.replace(
                  `{{${
                    wordLibrary?.[
                      "Year of event creation (Gregorian calendar)"
                    ] ?? "事件建立年(西元)"
                  }}}`,
                  `${currentYear}`
                );
                handleChange("organizationEventTitle", newTitle);
                return newTitle;
              });
            }
            if (
              extractedString.localeCompare(
                wordLibrary?.["Year of event creation (Minguo calendar)"] ??
                  "事件建立年(民國)"
              ) === 0
            ) {
              setEventTitle((prev) => {
                const currentYear = new Date().getFullYear() - 1911;
                const newTitle = prev.replace(
                  `{{${
                    wordLibrary?.["Year of event creation (Minguo calendar)"] ??
                    "事件建立年(民國)"
                  }}}`,
                  `${currentYear}`
                );
                handleChange("organizationEventTitle", newTitle);
                return newTitle;
              });
            }
            if (
              extractedString.localeCompare(
                wordLibrary?.["Month of event creation"] ?? "事件建立月"
              ) === 0
            ) {
              setEventTitle((prev) => {
                const currentMonth = new Date().getMonth() + 1;
                const newTitle = prev.replace(
                  `{{${
                    wordLibrary?.["Month of event creation"] ?? "事件建立月"
                  }}}`,
                  `${currentMonth}`
                );
                handleChange("organizationEventTitle", newTitle);
                return newTitle;
              });
            }
            if (
              extractedString.localeCompare(
                wordLibrary?.["Day of event creation"] ?? "事件建立日"
              ) === 0
            ) {
              setEventTitle((prev) => {
                const currentDay = new Date().getDate();
                const newTitle = prev.replace(
                  `{{${
                    wordLibrary?.["Day of event creation"] ?? "事件建立日"
                  }}}`,
                  `${currentDay}`
                );
                handleChange("organizationEventTitle", newTitle);
                return newTitle;
              });
            }
            if (
              extractedString.localeCompare(
                wordLibrary?.["Name of the member creating the event"] ??
                  "事件建立者名稱"
              ) === 0
            ) {
              const joinedMemberNames =
                selectedMembers
                  ?.map((member) => member.member.memberName)
                  .join(", ") || "";
              if (joinedMemberNames !== "") {
                setEventTitle((prev) => {
                  const newTitle = prev.replace(
                    `{{${
                      wordLibrary?.["Name of the member creating the event"] ??
                      "事件建立者名稱"
                    }}}`,
                    joinedMemberNames
                  );
                  handleChange("organizationEventTitle", newTitle);
                  return newTitle;
                });
              }
            }
            if (
              extractedString.localeCompare(
                wordLibrary?.["Name of the CRM-User for the event"] ??
                  "事件個人客戶名稱"
              ) === 0
            ) {
              const joinedUserNames =
                selectedUsers
                  ?.map((member) => member.organizationUserNameZh)
                  .join(", ") || "";
              if (joinedUserNames !== "") {
                setEventTitle((prev) => {
                  const newTitle = prev.replace(
                    `{{${
                      wordLibrary?.["Name of the CRM-User for the event"] ??
                      "事件個人客戶名稱"
                    }}}`,
                    joinedUserNames
                  );
                  handleChange("organizationEventTitle", newTitle);
                  return newTitle;
                });
              }
            }
            if (
              extractedString.localeCompare(
                wordLibrary?.["Name of the CRM-Partner for the event"] ??
                  "事件單位客戶名稱"
              ) === 0
            ) {
              const joinedPartnerNames =
                selectedPartners
                  ?.map((member) => member.organizationPartnerNameZh)
                  .join(", ") || "";
              if (joinedPartnerNames !== "") {
                setEventTitle((prev) => {
                  const newTitle = prev.replace(
                    `{{${
                      wordLibrary?.["Name of the CRM-Partner for the event"] ??
                      "事件單位客戶名稱"
                    }}}`,
                    joinedPartnerNames
                  );
                  handleChange("organizationEventTitle", newTitle);
                  return newTitle;
                });
              }
            }
          });
        }
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate]);

  useEffect(() => {
    if (dynTemplateDescr !== "") {
      setEventDescr(dynTemplateDescr);
    }
  }, [dynTemplateDescr]);
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const froalaElement = document.querySelector(".fr-element.fr-view");
      if (froalaElement) {
        froalaElement.setAttribute("id", "event-description-editor");
      }
    });
    observer.observe(document, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  const eventTitleErr = useBoolean();
  const [eventTitleHelperTxt, setEventTitleHelperTxt] = useState<string>("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        dispatch(
          setStates({
            isDirty: false,
          })
        );
        if (onSubmit) {
          onSubmit(values);
        }
      }}
      id={FORM}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Autocomplete
            onChange={(event: any, newValue: ColumnTemplate | null) => {
              handelChangeDynamicTemplate(newValue);
            }}
            options={dynTemplateList || []}
            isOptionEqualToValue={(option, value) =>
              option.organizationColumnTemplateId ===
              value.organizationColumnTemplateId
            }
            loading={loading}
            loadingText={<CircularProgress size={20} />}
            getOptionLabel={(option) => option.organizationColumnTemplateTitle}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                label={wordLibrary?.["event template"] ?? "事件範本"}
              />
            )}
            id="event-template-input"
            data-tid="event-template-input"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={wordLibrary?.["event name"] ?? "事件名稱"}
            fullWidth
            placeholder={
              wordLibrary?.["please fill in the event name"] ?? "請填寫事件名稱"
            }
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            onBlur={(e) =>
              handleChange("organizationEventTitle", e.target.value)
            }
            required
            error={!eventTitle && eventTitleErr.value}
            onInvalid={() => {
              const errorMsg = "";
              if (!eventTitle) {
                const errorMsg = `${
                  wordLibrary?.["this is a required field"] ?? "此為必填欄位"
                }`;
                eventTitleErr.onTrue();
                setEventTitleHelperTxt(errorMsg);
              } else {
                eventTitleErr.onFalse();
                setEventTitleHelperTxt(errorMsg);
              }
            }}
            helperText={!eventTitle && eventTitleHelperTxt}
            id="event-name-input"
            data-tid="event-name-input"
          />
        </Grid>
        <Grid item xs={12}>
          <NewDateRangePicker
            required
            showTime
            fullWidth={!!isDownLg}
            defaultStartDate={toDate(eventStartDateString)}
            defaultStartTime={format(eventStartDateString, "HH:mm")}
            defaultEndDate={toDate(eventEndDateString)}
            endDate={toDate(eventEndDateString)}
            defaultEndTime={format(eventEndDateString, "HH:mm")}
            onChange={handleDateTimeChange}
            enableOnBlurChange
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={wordLibrary?.address ?? "地址"}
            fullWidth
            placeholder={wordLibrary?.["fill in address"] ?? "填寫地址"}
            value={eventAddress}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Avatar
                    src="/events/map.png"
                    style={{ width: "2rem", height: "2rem" }}
                  />
                </InputAdornment>
              ),
            }}
            onChange={(e) => setEventAddress(e.target.value)}
            onBlur={(e) =>
              handleChange("organizationEventAddress", e.target.value)
            }
            id="event-address-input"
            data-tid="event-address-input"
          />
        </Grid>
        <Grid item xs={12}>
          <FroalaEditor
            filePathType={ServiceModuleValue.EVENT}
            model={eventDescr}
            onModelChange={(model) => {
              setEventDescr(model);
              if (isDialogOpen)
                dispatch(
                  setValue({
                    name: "organizationEventDescription",
                    value: model,
                    states: {
                      isDirty: true,
                    },
                  })
                );
            }}
            config={{
              toolbarSticky: true,
              heightMin: 300,
              placeholderText: wordLibrary?.["event description"] ?? "事件敘述",
              quickInsertEnabled: false,
              imageOutputSize: false,
            }}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default EventForm;
