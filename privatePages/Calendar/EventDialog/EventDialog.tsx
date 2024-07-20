import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { format } from "@eGroupAI/utils/dateUtils";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import dynamic from "next/dynamic";
import useConfirmLeaveDialog from "utils/useConfirmLeaveDialog";
import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";
import { useAppDispatch } from "redux/configureAppStore";

import { SNACKBAR } from "components/App";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";

import { makeStyles } from "@mui/styles";
import { useSelector } from "react-redux";
import useOrgEvent from "utils/useOrgEvent";
import {
  DynamicValueType,
  Granularity,
  ScheduleEventFormInput,
} from "interfaces/form";
import {
  OrganizationColumn,
  ColumnTemplate,
  OptionType,
  OrganizationCalendar,
  OrganizationEvent,
  OrganizationTag,
  UploadFile,
} from "interfaces/entities";
import { ColumnType, OrganizationMember } from "@eGroupAI/typings/apis";

import EditIcon from "@mui/icons-material/Edit";

import Dialog from "@eGroupAI/material/Dialog";
import Box from "@eGroupAI/material/Box";
import Grid from "@eGroupAI/material/Grid";
import CircularProgress from "@eGroupAI/material/CircularProgress";
import Typography from "@eGroupAI/material/Typography";
import IconButton from "@eGroupAI/material/IconButton";
import TagGroup from "@eGroupAI/material/TagGroup";
import Tag from "@eGroupAI/material/Tag";
import { DialogActions, DialogTitle } from "@eGroupAI/material";
import { Divider } from "@mui/material";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { getValues } from "redux/eventDialog/selectors";
import {
  InitialState,
  initialState,
  setDynamicColumnTargetList,
  setFiles,
  setMembers,
  setStates,
  setValues,
} from "redux/eventDialog";

import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import DialogFullPageContainer from "components/DialogFullPageContainer/DialogFullPageContainer";
import DynamicFieldsForm from "components/DynamicFieldsForm/DynamicFieldsForm";

import { ServiceModuleValue } from "interfaces/utils";
import useOrgDynamicColumns from "utils/useOrgDynamicColumns";
import getOrgColumnGroupByGroup from "utils/getOrgColumnsGroupByGroup";
import useOrgDynamicColumnTemplatesFilterSearch from "utils/useOrgDynamicColumnTemplatesFilterSearch";
import { RemarkValues, Values } from "components/DynamicField";

import { AxiosPromise } from "axios";
import {
  CreateOrgEventApiPayload,
  UpdateOrgEventApiPayload,
} from "interfaces/payloads";
import useUpdateUserApiPayload from "utils/useUpdateUserApiPayload";
import { useSettingsContext } from "minimal/components/settings";
import clsx from "clsx";

import TagsSection from "components/EventDialog/TagsSection";
import OrgPartnerSection from "components/EventDialog/OrgPartnerSection";
import UsersSection from "components/EventDialog/UsersSection";
import FilesSection, {
  FilesSectionRef,
} from "components/EventDialog/FilesSection";
import MembersSection from "components/EventDialog/MembersSection";

import useGetLoginId from "utils/useGetLoginId";
import useMemberInfo from "@eGroupAI/hooks/apis/useMemberInfo";

import { getLocalDateString } from "../utils";
import EventForm, {
  FORM,
  defaultValues as formDefaultValues,
} from "./EventForm";

export const EVENT_COLUMN_FORM = "event-columns-form";

const FroalaEditorView = dynamic(
  async () => {
    const values = await Promise.all([
      import("react-froala-wysiwyg/FroalaEditorView"),
    ]);
    return values[0];
  },
  {
    loading: () => <div />,
    ssr: false,
  }
);

const getMinutes = (time: number, granularity: Granularity): number => {
  if (granularity === "hours") {
    return time * 60;
  }
  if (granularity === "days") {
    return time * 1440;
  }
  if (granularity === "weeks") {
    return time * 10800;
  }
  return time;
};

export const DIALOG = "CALENDAR_EVENT_DIALOG";

const useStyles = makeStyles((theme) => ({
  tagGroup: {
    marginBottom: theme.spacing(1),
  },
  actions: {
    display: "flex",
    gap: 8,
  },
  loader: {
    position: "absolute",
    padding: 15,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  showLoader: {
    display: "flex",
  },
  lightOpacity: {
    background: "rgba(255,255,255,0.6)",
  },
  darkOpacity: {
    background: "rgba(33, 43, 54, 0.6)",
  },
}));

export type DefaultOrgEvent = Omit<
  OrganizationEvent,
  | "organizationEventCreateDate"
  | "organizationEventId"
  | "organizationEventIsOpen"
  | "organizationEventUpdateDate"
  | "organizationCalendarEventTargetId"
  | "isReviewing"
  | "updater"
  | "creator"
  | "hasReviewPermission"
>;

export interface EventDialogProps {
  organizationId: string;
  organizationEventId?: string;
  editingMode?: "create" | "update";
  orgCalendars?: OrganizationCalendar[];
  members?: OrganizationMember[];
  defaultOrgEvent?: DefaultOrgEvent;
  /**
   * Event fired after submit success.
   */
  onSubmitSuccess?: (values: OrganizationEvent) => void;
  hideEdit?: boolean;
  displayTimeFormat?: string;
  isFileUploadOnSubmitForm?: boolean;
}

const EventDialog: FC<EventDialogProps> = (props) => {
  const classes = useStyles();
  const {
    organizationId,
    organizationEventId,
    editingMode = "create",
    orgCalendars,
    members,
    onSubmitSuccess,
    defaultOrgEvent,
    hideEdit,
    displayTimeFormat = "PP pp",
    isFileUploadOnSubmitForm = true,
  } = props;

  const settings = useSettingsContext();

  const isCreate = editingMode === "create";

  const uploadComponentRef = useRef<FilesSectionRef>(null);
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const [formIsDirty, setFormIsDirty] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const wordLibrary = useSelector(getWordLibrary);
  const storeValues = useSelector(getValues);

  const [tagValues, setTagValues] = useState<OrganizationTag[] | undefined>(
    undefined
  );
  const { openSnackbar } = useReduxSnackbar<SnackbarProps>(SNACKBAR);

  const {
    data: orgEvent = defaultOrgEvent,
    isValidating,
    mutate,
  } = useOrgEvent({
    organizationId,
    organizationEventId,
  });

  const lid = useGetLoginId();
  const { data: member } = useMemberInfo();

  const defaultStoreValues: Omit<
    InitialState["values"],
    | "organizationTitle"
    | "organizationEventAddress"
    | "organizationEventDescription"
    | "organizationEventStartDate"
    | "organizationEventEndDate"
  > = useMemo(
    () => ({
      uploadFileList: [],
      organizationMemberList: orgEvent?.organizationMemberList || [
        {
          member: { ...member, loginId: lid },
        } as OrganizationMember,
      ],
      organizationTagList: [],
      organizationUserList: [],
      organizationPartnerList: [],
      dynamicColumnTargetList: [],
    }),
    [lid, member, orgEvent?.organizationMemberList]
  );

  const { excute: createOrgEvent, isLoading: isCreating } = useAxiosApiWrapper(
    apis.org.createOrgEvent,
    "Create"
  );
  const { excute: updateOrgEvent, isLoading: isUpdating } = useAxiosApiWrapper(
    apis.org.updateOrgEvent,
    "Update"
  );

  const { excute: createOrgFileTarget, isLoading: isUploadFileTargeting } =
    useAxiosApiWrapper(apis.org.createOrgFileTarget, "Create");

  const { data: orgColumns } = useOrgDynamicColumns(
    {
      organizationId,
    },
    {
      columnTable: "ORGANIZATION_EVENT",
    }
  );

  const { data: colTempList } = useOrgDynamicColumnTemplatesFilterSearch(
    {
      organizationId,
    },
    undefined,
    { serviceModuleValue: ServiceModuleValue.EVENT },
    undefined,
    false
  );

  const eventFormSubmitBtn = useRef<HTMLInputElement | null>(null);
  const eventColumnFormSubmitBtn = useRef<HTMLInputElement | null>(null);
  const dispatch = useAppDispatch();

  //  --- start of Dynamic Column Fields States ...
  const [selectedColumnTemplate, setSelectedColumnsTemplate] = useState<
    ColumnTemplate | undefined
  >(undefined);
  const [columnValues, setColumnValues] = useState<Values>({});
  const [relatedTargetId, setRelatedTargetId] = useState<string | undefined>(
    undefined
  );
  const [remarkValues, setRemarkValues] = useState<RemarkValues>({});
  const [columnErrors, setColumnErrors] = useState<{
    [name: string]: string | undefined;
  }>({});

  const [dynamicOptions, setDynamicOptions] = useState<{
    [name: string]: OptionType[] | undefined;
  }>({});
  //  --- End of Dynamic Column Fields States ...

  useEffect(() => {
    selectedColumnTemplate?.organizationColumnList?.map((el) => {
      const column = orgColumns?.source.find(
        (orgCol) => orgCol.columnId === el.columnId
      );
      const elOption = column?.organizationOptionList?.map((o) => ({
        optionId: o.organizationOptionId,
        label: o.organizationOptionName,
        value: o.organizationOptionName,
        nextColumnId: o.organizationOptionNextColumnId,
      }));

      setDynamicOptions((prev) => ({
        ...prev,
        [el.columnId]: elOption,
      }));
      return null;
    });
  }, [orgColumns?.source, selectedColumnTemplate?.organizationColumnList]);

  const limitedColumns = useMemo(
    () =>
      selectedColumnTemplate?.organizationColumnList.map(
        (selCol) =>
          orgColumns?.source.find(
            (orgCol) => orgCol.columnId === selCol.columnId
          ) as OrganizationColumn
      ),
    [orgColumns?.source, selectedColumnTemplate?.organizationColumnList]
  );

  const columnsGroupByGroup = useMemo(
    () => getOrgColumnGroupByGroup(limitedColumns),
    [limitedColumns]
  );

  const { excute: checkUniqueValue, isLoading: isChecking } =
    useAxiosApiWrapper(apis.org.checkUniqueValue, "None");

  const { excute: getOrgDynamicColumnTemplate, isLoading: isColumnFetching } =
    useAxiosApiWrapper(apis.org.getOrgDynamicColumnTemplate, "None");

  useEffect(() => {
    if (isOpen) {
      if (isCreate) {
        setIsEditing(true);
      } else {
        setIsEditing(false);
      }
    }
  }, [isCreate, isOpen]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    if (isCreate) {
      setSelectedColumnsTemplate(undefined);
      closeDialog();
    } else {
      setIsEditing(false);
    }
  };

  const handleSubmitForm = (values: ScheduleEventFormInput) => {
    if (!organizationId) return;
    if (isCreate) {
      createOrgEvent({
        organizationId,
        organizationEventTitle: values.organizationEventTitle,
        organizationEventDescription: values.organizationEventDescription,
        organizationEventAddress: values.organizationEventAddress,
        organizationEventStartDate: new Date(
          values.organizationEventStartDate
        ).toISOString(),
        organizationEventEndDate: new Date(
          values.organizationEventEndDate
        ).toISOString(),
        recurrence: values.recurrence ? [values.recurrence] : undefined,
        reminders: values.reminders
          ? {
              overrides: values.reminders.map((el) => ({
                method: el.method,
                minutes: getMinutes(el.minutes, el.granularity),
              })),
            }
          : undefined,
        dynamicColumnTargetList: storeValues.dynamicColumnTargetList || [],
        uploadFileList: storeValues.uploadFileList?.length
          ? storeValues.uploadFileList.map((el) => ({
              uploadFileId: el.uploadFileId,
            }))
          : undefined,
        organizationMemberList: storeValues.organizationMemberList?.length
          ? storeValues.organizationMemberList.map((el) => ({
              member: {
                loginId: el.member.loginId,
              },
            }))
          : undefined,
        organizationTagList: storeValues.organizationTagList?.length
          ? storeValues.organizationTagList.map((el) => ({
              tagId: el.tagId,
            }))
          : undefined,
        organizationUserList: storeValues.organizationUserList?.length
          ? storeValues.organizationUserList.map((el) => ({
              organizationUserId: el.organizationUserId,
            }))
          : undefined,
        organizationPartnerList: storeValues.organizationPartnerList?.length
          ? storeValues.organizationPartnerList.map((el) => ({
              organizationPartnerId: el.organizationPartnerId,
            }))
          : undefined,
      })
        .then((res) => {
          if (
            uploadComponentRef.current?.isFileUploadOnSubmitForm &&
            uploadComponentRef.current?.selectedFile &&
            uploadComponentRef.current?.selectedFile.length !== 0
          ) {
            uploadComponentRef.current
              ?.handleUploadFileOnSubmit(res.data.organizationEventId)
              .then(() => {
                closeDialog();
              })
              .catch(() => {});
          } else if (
            !uploadComponentRef.current?.isFileUploadOnSubmitForm &&
            res.data.uploadFileList &&
            res.data.uploadFileList.length &&
            res.data.uploadFileList.length > 0
          ) {
            createOrgFileTarget({
              organizationId,
              uploadFileId: res.data.uploadFileList[0].uploadFileId || "",
              uploadFileTargetList: [
                {
                  targetId: res.data.organizationCalendarEventId,
                  uploadFile: {
                    uploadFilePathType: ServiceModuleValue.EVENT,
                  },
                },
              ],
            })
              .then(() => {
                closeDialog();
              })
              .catch(() => {});
          } else {
            closeDialog();
          }
          if (onSubmitSuccess) {
            onSubmitSuccess(res.data);
          }
        })
        .finally(() => {});
    } else if (!isCreate && organizationEventId) {
      updateOrgEvent({
        organizationId,
        organizationEventId,
        organizationEventTitle: values.organizationEventTitle,
        organizationEventDescription: values.organizationEventDescription,
        organizationEventAddress: values.organizationEventAddress,
        organizationEventStartDate: new Date(
          values.organizationEventStartDate
        ).toISOString(),
        organizationEventEndDate: new Date(
          values.organizationEventEndDate
        ).toISOString(),
        recurrence: values.recurrence ? [values.recurrence] : undefined,
        reminders: values.reminders
          ? {
              overrides: values.reminders?.map((el) => ({
                method: el.method,
                minutes: getMinutes(el.minutes, el.granularity),
              })),
            }
          : undefined,
      })
        .then((res) => {
          if (onSubmitSuccess) {
            onSubmitSuccess(res.data);
          }
          mutate();
        })
        .finally(() => {
          closeDialog();
        });
    }
  };

  useEffect(() => {
    if (isOpen && defaultStoreValues) {
      dispatch(setValues({ ...initialState.values, ...defaultStoreValues }));
    }
  }, [defaultStoreValues, dispatch, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      dispatch(setValues(initialState.values));
      dispatch(setStates(initialState.states));
    }
  }, [dispatch, isOpen]);

  const handleCloseDialog = () => {
    setSelectedColumnsTemplate(undefined);
    setColumnValues({});
    setRelatedTargetId(undefined);
    setRemarkValues({});
    setColumnErrors({});
    setTagValues(undefined);
    closeDialog();
  };

  const closeConfirm = useConfirmLeaveDialog({
    shouldOpen: formIsDirty,
    handleClose: handleCloseDialog,
    onConfirm: handleCloseDialog,
  });

  const defaultFormValues: ScheduleEventFormInput = useMemo(() => {
    if (orgEvent) {
      return {
        organizationCalendarId:
          orgEvent.organizationCalendar.organizationCalendarId,
        organizationEventTitle: orgEvent.organizationEventTitle,
        organizationEventAddress: orgEvent.organizationEventAddress,
        organizationEventStartDate: getLocalDateString(
          orgEvent.organizationEventStartDate.split(".")[0] ?? ""
        ),
        organizationEventEndDate: getLocalDateString(
          orgEvent.organizationEventEndDate.split(".")[0] ?? ""
        ),
        organizationEventDescription: orgEvent.organizationEventDescription,
        recurrence: orgEvent?.recurrence ? orgEvent.recurrence[0] : undefined,
        reminders: orgEvent.reminders?.overrides?.map((el) => ({
          ...el,
          granularity: "minutes",
        })),
      };
    }
    return formDefaultValues;
  }, [orgEvent]);

  const handleSetDynamicTemplate = useCallback(
    async (value?: string) => {
      const tempMember: OrganizationMember[] = [];
      const defloginId = defaultStoreValues?.organizationMemberList?.map(
        (item) => item.member.loginId
      );

      members
        ?.filter((item) => item.member.loginId === defloginId?.toString())
        .map((el) => tempMember.push(el));

      if (!value) {
        setSelectedColumnsTemplate(undefined);
        setTagValues(undefined);
      } else {
        const { data: selectedTemplate } = await getOrgDynamicColumnTemplate({
          organizationId,
          organizationColumnTemplateId: value,
        });

        setSelectedColumnsTemplate(selectedTemplate);
        const tmeplateTags = selectedTemplate?.organizationTagTargetList?.map(
          (tag) => tag.organizationTag
        );
        setTagValues(tmeplateTags);

        selectedTemplate.organizationMemberList?.map((item) => {
          if (item.member.loginId !== defloginId?.toString()) {
            tempMember.push(item);
          }
          return tempMember;
        });
      }

      dispatch(
        setMembers({
          orgMemberList: tempMember,
          states: {
            isDirty: true,
          },
        })
      );
    },
    [
      defaultStoreValues?.organizationMemberList,
      members,
      dispatch,
      getOrgDynamicColumnTemplate,
      organizationId,
    ]
  );

  const handleChange = useCallback((name: string, value?: DynamicValueType) => {
    setColumnValues((val) => ({
      ...val,
      [name]: value?.value,
    }));
    setRelatedTargetId(value?.targetId);
  }, []);

  const handleChangeRemark = useCallback(
    (
      type: ColumnType,
      colId: string,
      optionId: string,
      optionName: string,
      value?: string
    ) => {
      const remarkOfCol = remarkValues[colId] || [];
      const idx = remarkOfCol?.findIndex(
        (el) => el.organizationOptionId === optionId
      );
      if (type === ColumnType.CHOICE_MULTI) {
        if (idx === -1) {
          remarkOfCol?.push({
            organizationOptionId: optionId,
            organizationOptionName: optionName,
            columnTargetValueRemark: value,
          });
        } else if (remarkOfCol && idx >= 0) {
          remarkOfCol[idx] = {
            organizationOptionId: optionId,
            organizationOptionName: optionName,
            columnTargetValueRemark: value,
          };
        }
      }
      if (
        type === ColumnType.CHOICE_ONE ||
        type === ColumnType.CHOICE_ONE_DROPDOWN
      ) {
        remarkOfCol[0] = {
          organizationOptionId: optionId,
          organizationOptionName: optionName,
          columnTargetValueRemark: value,
        };
      }
      setRemarkValues((prev) => ({
        ...prev,
        [colId]: remarkOfCol || [],
      }));
    },
    [remarkValues]
  );

  const handleErrors = useCallback((name: string, error?: string) => {
    setColumnErrors((err) => ({
      ...err,
      [name]: error,
    }));
  }, []);

  const checkValid = () => {
    const isValid =
      Object.values(columnErrors).filter((v) => typeof v !== "undefined")
        .length === 0;
    if (!isValid) {
      const validErrElementName = Object.keys(columnErrors).filter(
        (key) => typeof columnErrors[key] !== "undefined"
      )[0];
      document
        .getElementsByName(validErrElementName || "")[0]
        ?.scrollIntoView({ behavior: "smooth" });

      openSnackbar({
        message: "請正確填寫內容",
        severity: "error",
      });
    }
    return isValid;
  };

  const getUpdatePayload = useUpdateUserApiPayload(
    undefined,
    orgColumns?.source
  );

  const uniqueValueCheck = async (
    payload: Omit<
      UpdateOrgEventApiPayload,
      "organizationId" | "organizationEventId"
    >
  ) => {
    let isUnique = true;
    const { dynamicColumnTargetList } = payload;
    const promises = dynamicColumnTargetList?.reduce<AxiosPromise[]>((a, b) => {
      const column = selectedColumnTemplate?.organizationColumnList?.find(
        (col) => col.columnId === b.organizationColumn.columnId
      );
      if (column && column.isUniqueValue === 1) {
        return [
          ...a,
          checkUniqueValue({
            organizationId,
            columnId: b.organizationColumn.columnId,
            columnTargetValue: b.columnTargetValue as string,
          }),
        ];
      }
      return a;
    }, []);

    if (promises) {
      const resp = await Promise.all(promises);
      resp.forEach((el) => {
        const columnId = el?.config?.url?.split("/")[3];
        if (columnId && !el.data) {
          setColumnErrors({
            ...columnErrors,
            [columnId]: "必須為唯一值",
          });
          isUnique = false;
        }
      });
    }
    if (!isUnique) {
      openSnackbar({
        message: "請輸入唯一值",
        severity: "error",
      });
    }
    return isUnique;
  };

  const handleSubmitColumns = async (e) => {
    e.preventDefault();
    const isValid = checkValid();
    if (isValid) {
      const payload: Omit<
        CreateOrgEventApiPayload,
        | "organizationId"
        | "organizationEventId"
        | "organizationEventTitle"
        | "organizationEventAddress"
        | "organizationEventStartDate"
        | "organizationEventEndDate"
      > = getUpdatePayload(
        columnValues,
        undefined,
        relatedTargetId,
        remarkValues,
        organizationEventId
      );
      const isUniqueValueValid = await uniqueValueCheck(payload);
      if (isUniqueValueValid) {
        await dispatch(
          setDynamicColumnTargetList({
            dynamicColumnTargetList: payload.dynamicColumnTargetList,
            states: {
              isDirty: true,
            },
          })
        );
        eventFormSubmitBtn.current?.click();
      }
    }
  };

  const handleUploadFinish = async (uploadFiles?: UploadFile[]) => {
    await dispatch(
      setFiles({
        uploadFileList: uploadFiles || [],
        states: {
          isDirty: true,
        },
      })
    );
  };

  const RenderDynamicFields = () => {
    if (selectedColumnTemplate && limitedColumns && limitedColumns.length !== 0)
      return (
        <>
          <Grid item xs={12} sx={{ marginTop: 1 }}>
            <form onSubmit={handleSubmitColumns} id={EVENT_COLUMN_FORM}>
              <DynamicFieldsForm
                isNotInifinitive
                orgColumns={orgColumns?.source}
                limitedColumns={limitedColumns}
                orgColumnsGroupByGroup={columnsGroupByGroup}
                values={columnValues}
                errors={columnErrors}
                handleChange={handleChange}
                handleErrors={handleErrors}
                dynamicOptions={dynamicOptions}
                handleChangeRemark={handleChangeRemark}
                isOpen={isOpen}
                remarkValues={remarkValues}
              />
            </form>
          </Grid>
        </>
      );
    return <></>;
  };

  const renderContent = () => {
    if (isValidating) {
      return (
        <Box
          display="flex"
          alignItems="center"
          padding={3}
          justifyContent="center"
        >
          <CircularProgress />
        </Box>
      );
    }
    return (
      <>
        {isEditing ? (
          <>
            <EventForm
              defaultValues={defaultFormValues}
              onSubmit={handleSubmitForm}
              setFormIsDirty={setFormIsDirty}
              dynTemplateList={!colTempList ? [] : colTempList?.source}
              selectedTemplate={selectedColumnTemplate}
              onChangeDynamicTemplate={handleSetDynamicTemplate}
              RenderDynamicFields={RenderDynamicFields}
            />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <TagsSection
                  isDialogOpen={isOpen}
                  targetId={organizationEventId}
                  tagValues={tagValues}
                />
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <OrgPartnerSection
                  partnerList={storeValues.organizationPartnerList}
                />
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <UsersSection userList={storeValues.organizationUserList} />
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <FilesSection
                  ref={uploadComponentRef}
                  onFileUploadFinish={handleUploadFinish}
                  isFileUploadOnSubmitForm={isFileUploadOnSubmitForm}
                />
              </Grid>
              <Grid item xs={12}>
                <MembersSection
                  memberList={storeValues.organizationMemberList}
                />
              </Grid>
            </Grid>
          </>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="caption">日曆</Typography>
              <Typography variant="body1">
                {
                  orgCalendars?.find(
                    (cal) =>
                      cal.organizationCalendarId ===
                        orgEvent?.organizationCalendar.organizationCalendarId ||
                      cal.isOAuthCalendar === 1
                  )?.organizationCalendarName
                }
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption">活動標題</Typography>
              <Typography variant="body1">
                {orgEvent?.organizationEventTitle ?? ""}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption">活動內容</Typography>
              <FroalaEditorView
                model={orgEvent?.organizationEventDescription}
              />
            </Grid>
            {orgEvent?.organizationMemberList &&
              orgEvent.organizationMemberList.length > 0 && (
                <Grid item xs={12}>
                  <TagGroup name="邀請對象" className={classes.tagGroup}>
                    {orgEvent.organizationMemberList.map((member) => (
                      <Tag key={member.member.loginId}>
                        {members?.find(
                          (el) => el.member.loginId === member.member.loginId
                        )?.member.memberName ?? ""}
                      </Tag>
                    ))}
                  </TagGroup>
                </Grid>
              )}
            {orgEvent?.organizationEventStartDate && (
              <Grid item xs={12}>
                <Typography variant="caption">開始時間</Typography>
                <Typography variant="body1">
                  {format(
                    orgEvent.organizationEventStartDate,
                    displayTimeFormat
                  )}
                </Typography>
              </Grid>
            )}
            {orgEvent?.organizationEventEndDate && (
              <Grid item xs={12}>
                <Typography variant="caption">結束時間</Typography>
                <Typography variant="body1">
                  {format(orgEvent.organizationEventEndDate, displayTimeFormat)}
                </Typography>
              </Grid>
            )}
          </Grid>
        )}
      </>
    );
  };

  const handleClickConfirmBtn = () => {
    if (
      selectedColumnTemplate &&
      limitedColumns &&
      limitedColumns.length !== 0
    ) {
      eventColumnFormSubmitBtn.current?.click();
    } else {
      eventFormSubmitBtn.current?.click();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={closeDialog}
      maxWidth="md"
      fullWidth
      disableEnforceFocus
    >
      <div
        className={clsx(
          classes.loader,
          isColumnFetching && classes.showLoader,
          {
            [classes.lightOpacity]: settings.themeMode === "light",
            [classes.darkOpacity]: settings.themeMode !== "light",
          }
        )}
      >
        <CircularProgress />
      </div>
      <DialogTitle onClickClose={() => closeConfirm()}>
        <Typography variant="h4" color="text">
          {isEditing ? (
            <>
              {typeof orgEvent?.organizationEventTitle !== "undefined"
                ? `${wordLibrary?.edit ?? "編輯"}${
                    orgEvent?.organizationEventTitle
                  }`
                : "新增活動"}
            </>
          ) : (
            orgEvent?.organizationEventTitle
          )}
        </Typography>
        <Box flexGrow={1} />
        <div className={classes.actions}>
          {!isEditing && !hideEdit && (
            <IconButton size="medium" onClick={handleEditClick}>
              <EditIcon />
            </IconButton>
          )}
        </div>
      </DialogTitle>
      <DialogFullPageContainer>{renderContent()}</DialogFullPageContainer>
      {isEditing && (
        <DialogActions>
          <DialogCloseButton
            sx={{ mr: 1 }}
            onClick={handleCancelClick}
            disabled={
              isCreating || isUpdating || isChecking || isUploadFileTargeting
            }
          >
            {wordLibrary?.cancel ?? "取消"}
          </DialogCloseButton>
          <input
            type="submit"
            style={{ display: "none" }}
            ref={eventFormSubmitBtn}
            form={FORM}
          />
          <input
            type="submit"
            style={{ display: "none" }}
            ref={eventColumnFormSubmitBtn}
            form={EVENT_COLUMN_FORM}
          />
          <DialogConfirmButton
            loading={
              isCreating || isUpdating || isChecking || isUploadFileTargeting
            }
            onClick={handleClickConfirmBtn}
          >
            {wordLibrary?.save ?? "儲存"}
          </DialogConfirmButton>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default EventDialog;
