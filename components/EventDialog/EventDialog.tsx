import React, {
  FC,
  useEffect,
  useMemo,
  useCallback,
  useState,
  useRef,
} from "react";

import { AxiosPromise } from "axios";
import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import { SNACKBAR } from "components/App";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";

import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { useSelector } from "react-redux";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { useAppDispatch } from "redux/configureAppStore";
import useConfirmLeaveDialog from "utils/useConfirmLeaveDialog";

import Box from "@eGroupAI/material/Box";
import Grid from "@eGroupAI/material/Grid";
import Divider from "@eGroupAI/material/Divider";
import Dialog from "@eGroupAI/material/Dialog";
import useWordLibrary from "@eGroupAI/hooks/useWordLibrary";
import DialogFullPageContainer from "components/DialogFullPageContainer";
import DialogConfirmButton from "components/DialogConfirmButton";
import DialogCloseButton from "components/DialogCloseButton";

import { getStates, getValues } from "redux/eventDialog/selectors";
import { ServiceModuleValue } from "interfaces/utils";
import {
  OrganizationTag,
  ColumnTemplate,
  OrganizationColumn,
  UploadFile,
} from "interfaces/entities";
import {
  CreateOrgEventApiPayload,
  UpdateOrgEventApiPayload,
} from "interfaces/payloads";

import { DynamicValueType } from "interfaces/form";
import { OptionType } from "components/InfoEditDialog";
import { RemarkValues, Values } from "components/DynamicField";
import DynamicFieldsForm from "components/DynamicFieldsForm";

import { ColumnType, OrganizationMember } from "@eGroupAI/typings/apis";
import useOrgDynamicColumns from "utils/useOrgDynamicColumns";
import useOrgDynamicColumnTemplatesFilterSearch from "utils/useOrgDynamicColumnTemplatesFilterSearch";
import getOrgColumnGroupByGroup from "utils/getOrgColumnsGroupByGroup";
import useUpdateUserApiPayload from "utils/useUpdateUserApiPayload";

import { CircularProgress } from "@mui/material";

import {
  setValues,
  setStates,
  initialState,
  InitialState,
  setDynamicColumnTargetList,
  setMembers,
  setFiles,
} from "redux/eventDialog";
import { useSettingsContext } from "minimal/components/settings";
import clsx from "clsx";

import EventForm, { FORM, EventFormProps } from "./EventForm";
import TagsSection from "./TagsSection";
import OrgPartnerSection from "./OrgPartnerSection";
import UsersSection from "./UsersSection";
import MembersSection from "./MembersSection";
import FilesSection, { FilesSectionRef } from "./FilesSection";

export const DIALOG = "EventDialog";

export const EVENT_COLUMN_FORM = "event-columns-form";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
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

export interface EventDialogProps {
  organizationId: string;
  organizationEventId?: string;
  defaultValues?: InitialState["values"];
  onSubmit?: EventFormProps["onSubmit"];
  formValidated?: boolean;
  columnFormValidated?: boolean;
  setFormValidated?: React.Dispatch<React.SetStateAction<boolean>>;
  setColumnFormValidated?: React.Dispatch<React.SetStateAction<boolean>>;
  loading?: boolean;
  onClose?: () => void;
  uploadComponentRef?: React.RefObject<FilesSectionRef>;
  isFileUploadOnSubmitForm?: boolean;
}

const EventDialog: FC<EventDialogProps> = function (props) {
  const {
    organizationId,
    organizationEventId,
    defaultValues,
    onSubmit,
    setColumnFormValidated,
    loading,
    onClose,
    uploadComponentRef,
    isFileUploadOnSubmitForm = true,
  } = props;
  const classes = useStyles(props);
  const settings = useSettingsContext();
  const theme = useTheme();

  const { openSnackbar } = useReduxSnackbar<SnackbarProps>(SNACKBAR);

  const { wordLibrary } = useWordLibrary();
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const { isDirty } = useSelector(getStates);
  const values = useSelector(getValues);
  const [tagValues, setTagValues] = useState<OrganizationTag[] | undefined>(
    undefined
  );
  const eventFormSubmitBtn = useRef<HTMLInputElement | null>(null);
  const eventColumnFormSubmitBtn = useRef<HTMLInputElement | null>(null);

  const dispatch = useAppDispatch();
  const editing = useMemo(
    () => organizationEventId !== undefined,
    [organizationEventId]
  );

  const { data: orgColumns } = useOrgDynamicColumns(
    {
      organizationId,
    },
    {
      columnTable: "ORGANIZATION_EVENT",
    },
    undefined,
    !isOpen
  );

  const { data: colTempList, isValidating } =
    useOrgDynamicColumnTemplatesFilterSearch(
      {
        organizationId,
      },
      undefined,
      { serviceModuleValue: ServiceModuleValue.EVENT },
      undefined,
      !isOpen
    );

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
    if (isOpen && defaultValues) {
      dispatch(setValues(defaultValues));
    }
  }, [defaultValues, dispatch, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      dispatch(setValues(initialState.values));
      dispatch(setStates(initialState.states));
    }
  }, [dispatch, isOpen]);

  const handleClose = () => {
    closeDialog();
    if (onClose) {
      onClose();
    }
    setSelectedColumnsTemplate(undefined);
    setColumnValues({});
    setRelatedTargetId(undefined);
    setRemarkValues({});
    setColumnErrors({});
    setTagValues(undefined);

    if (setColumnFormValidated) setColumnFormValidated(false);
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedColumnsTemplate(undefined);
      setColumnValues({});
      setRelatedTargetId(undefined);
      setRemarkValues({});
      setColumnErrors({});
      setTagValues(undefined);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }
  }, [isOpen]);

  const closeConfirm = useConfirmLeaveDialog({
    shouldOpen: isDirty,
    handleClose,
    onConfirm: handleClose,
  });

  const handleSetDynamicTemplate = useCallback(
    async (value?: string) => {
      const tempMember: OrganizationMember[] = [];
      const defloginId = defaultValues?.organizationMemberList?.map(
        (item) => item.member.loginId
      );

      values.organizationMemberList
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
      getOrgDynamicColumnTemplate,
      dispatch,
      organizationId,
      values.organizationMemberList,
      defaultValues?.organizationMemberList,
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

  const onSubmitValidateColumns = async (e) => {
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

  return (
    <Dialog
      open={isOpen}
      onClose={() => closeConfirm()}
      maxWidth="md"
      fullWidth
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
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
        {wordLibrary?.event ?? "事件"}
        {editing
          ? `${wordLibrary?.edit ?? "編輯"}`
          : `${wordLibrary?.add ?? "新增"}`}
      </DialogTitle>
      <DialogFullPageContainer>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <EventForm
              loading={isValidating}
              isDialogOpen={isOpen}
              dynTemplateList={!colTempList ? [] : colTempList?.source}
              selectedTemplate={selectedColumnTemplate}
              onChangeDynamicTemplate={handleSetDynamicTemplate}
              onSubmit={onSubmit}
            />
          </Grid>
          {selectedColumnTemplate &&
            limitedColumns &&
            limitedColumns.length !== 0 && (
              <>
                <Grid item xs={12}>
                  <form
                    onSubmit={onSubmitValidateColumns}
                    id={EVENT_COLUMN_FORM}
                  >
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
            )}
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
            <OrgPartnerSection partnerList={values.organizationPartnerList} />
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <UsersSection userList={values.organizationUserList} />
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
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <MembersSection memberList={values.organizationMemberList} />
          </Grid>
        </Grid>
      </DialogFullPageContainer>
      <DialogActions>
        <Box flexGrow={1} />
        <DialogCloseButton
          disabled={loading || isChecking}
          onClick={() => closeConfirm()}
        />
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
          loading={loading || isChecking}
          disabled={loading}
          onClick={handleClickConfirmBtn}
        >
          {wordLibrary?.save ?? "儲存"}
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default EventDialog;
