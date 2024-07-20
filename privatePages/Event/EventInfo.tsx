import React, {
  FC,
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import clsx from "clsx";

import { makeStyles } from "@mui/styles";
import Stack from "@mui/material/Stack";
import ListItemText from "@mui/material/ListItemText";
import { IconButton } from "@mui/material";
import Popover from "@eGroupAI/material/Popover";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import ColumnDescription from "components/ColumnDescription";

import ArticleIcon from "@mui/icons-material/Article";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";
import MapsUgcOutlinedIcon from "@mui/icons-material/MapsUgcOutlined";

import Typography from "@eGroupAI/material/Typography";
import Grid from "@eGroupAI/material/Grid";
import Box from "@eGroupAI/material/Box";
import Divider from "@eGroupAI/material/Divider";
import CircularProgress from "@eGroupAI/material/CircularProgress";
import { Button, Fab } from "@eGroupAI/material";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { ColumnType } from "@eGroupAI/typings/apis";
import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import DynamicFieldWithAction from "components/DynamicField/DynamicFieldWithAction";
import EditSection from "components/EditSection";
import Avatar from "components/Avatar";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import TagAutocompleteWithAction from "components/TagAutocompleteWithAction";
import FroalaEditor from "components/FroalaEditor";
import FroalaEditorView from "components/FroalaEditorView";
import GroupLabel from "components/GroupLabel";
import TargetCommentForm from "components/TargetComment/TargetCommentForm";
import TargetCommentList from "components/TargetComment/TargetCommentList";
import CommentDialog, { DIALOG } from "components/CommentDialog";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import TagDrawer from "components/TagDrawer";

import { OrganizationEvent } from "interfaces/entities";
import { UpdateOrgEventApiPayload } from "interfaces/payloads";
import parseDynamicColumnValue from "utils/parseDynamicColumnValue";
import useOrgTagGroups from "utils/useOrgTagGroups";
import useOrgTagsByGroups from "utils/useOrgTagsByGroups";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useTargetComments from "utils/useTargetComments";
import apis from "utils/apis";
import getOrgColumnGroupByGroup from "utils/getOrgColumnsGroupByGroup";
import useOrgDynamicColumns from "utils/useOrgDynamicColumns";
import useOrgRoleTargetAuth from "utils/useOrgRoleTargetAuth";
import useUpdateEventApiPayload from "utils/useUpdateEventApiPayload";
import { ServiceModuleValue, Table } from "interfaces/utils";
import { useSettingsContext } from "minimal/components/settings";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

import { RecordTarget } from "./EventInfoHistoryDialog";
import EventContentDrawer from "./EventContentDrawer";

const useStyles = makeStyles(() => ({
  titleTextField: {
    alignItems: "center",
    marginRight: 2,
    "& .MuiTypography-root": {
      fontSize: "24px",
      zIndex: 1,
    },
  },
  textTitle: {
    padding: "8px 0 8px 0",
  },
  editSectionContainer: {
    borderRadius: 0,
    boxShadow: "none",
    marginBottom: 0,
    borderBottom: "1px solid #EEEEEE",
  },
  headerEditSectionContainer: {
    borderRadius: 0,
    boxShadow: "none",
  },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: "none",
    alignItems: "flex-start",
    justifyContent: "center",
    zIndex: 999,
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
  smsIcon: {
    position: "fixed",
    bottom: 90,
  },
  articleIcon: {
    position: "fixed",
    bottom: 160,
  },
  right: {
    right: 20,
  },
  left: {
    left: 20,
  },
  tagIcon: {
    position: "fixed",
    bottom: 230,
  },
}));

interface EventInfoProps {
  data?: OrganizationEvent;
  onShowHistoryDialog?: (record?: RecordTarget) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdateEvent?: (values: { [key: string]: any }) => void;
  isMutating?: boolean;
  loading?: boolean;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
}

export type OptionType = {
  optionId: string;
  label: string;
  value: string;
};

const EventInfo: FC<EventInfoProps> = function (props) {
  const {
    data,
    onShowHistoryDialog,
    onUpdateEvent,
    isMutating = false,
    loading = false,
    readable = false,
    writable = false,
    deletable = false,
  } = props;
  const classes = useStyles();
  const settings = useSettingsContext();
  const rtl = settings.themeDirection === "rtl";
  const wordLibrary = useSelector(getWordLibrary);
  const organizationId = useSelector(getSelectedOrgId);
  const router = useRouter();
  const organizationEventId = router.query.eventId as string;
  const locale = useSelector(getGlobalLocale);
  const { openDialog: openCommentDialog } = useReduxDialog(DIALOG);
  const [descr, setDescr] = useState<string>("");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const commentTargetIdRef = useRef<string>("");

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>, dsc) => {
    setDescr(dsc);
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const { organizationEventDescription } = data || {};

  const { data: orgColumns } = useOrgDynamicColumns(
    {
      organizationId,
    },
    {
      columnTable: "ORGANIZATION_EVENT",
    }
  );

  const { data: targetRoles } = useOrgRoleTargetAuth(
    {
      organizationId,
    },
    {
      serviceModuleValue: ServiceModuleValue.EVENT,
    }
  );

  const getUpdatePayload = useUpdateEventApiPayload(
    data?.dynamicColumnTargetList,
    orgColumns?.source
  );

  const { excute: updateOrgEvent } = useAxiosApiWrapper(
    apis.org.updateOrgEvent,
    "Update"
  );

  const [contentModel, setContentModel] = useState<string | undefined>(
    organizationEventDescription
  );

  const contentRef = useRef<HTMLDivElement>(null);

  const orgColumnsGroupByGroup = useMemo(
    () => getOrgColumnGroupByGroup(orgColumns?.source),
    [orgColumns?.source]
  );

  const defaultValues = useMemo(() => {
    if (!data) return {};
    const dynamics = data.dynamicColumnTargetList?.reduce((a, b) => {
      const uploadFileName = data.uploadFileList?.find(
        (el) => el.uploadFileId === b.columnTargetValue
      )?.uploadFileName;
      return {
        ...a,
        [b.organizationColumn.columnId]: { ...b, uploadFileName },
      };
    }, {});
    return {
      ...dynamics,
    };
  }, [data]);

  const [values, setValues] = useState(defaultValues);

  useEffect(() => {
    setValues(defaultValues);
  }, [defaultValues]);

  const [dynamicOptions, setDynamicOptions] = useState<{
    [name: string]: OptionType[] | undefined;
  }>({});

  useEffect(() => {
    orgColumns?.source.map((el) => {
      const elOption = el.organizationOptionList?.map((o) => ({
        optionId: o.organizationOptionId,
        label: o.organizationOptionName,
        value: o.organizationOptionName,
      }));

      setDynamicOptions((prev) => ({
        ...prev,
        [el.columnId]: elOption,
      }));
      return null;
    });
  }, [orgColumns?.source]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const froalaElement = document.querySelector(
        ".fr-element.fr-view.fr-element-scroll-visible"
      );
      if (froalaElement) {
        froalaElement.setAttribute("id", "event-description-editor");
      }
    });
    observer.observe(document, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const matchMutate = useSwrMatchMutate();

  const [shouldMutate, setShouldMutate] = useState<boolean>(false);

  const handleMutate = useCallback(() => {
    if (shouldMutate) {
      matchMutate(
        new RegExp(
          `^/organizations/${organizationId}/events/${organizationEventId}\\?`,
          "g"
        )
      );
      setShouldMutate(false);
    }
  }, [matchMutate, organizationId, organizationEventId, shouldMutate]);

  useEffect(() => {
    if (shouldMutate) {
      handleMutate();
    }
  }, [handleMutate, shouldMutate]);

  const [isEditMode, setIsEditMode] = useState<boolean>(
    Boolean(router.query.editMode as string) || false
  );
  const [isOpenTagDrawer, setIsOpenTagDrawer] = useState<boolean>(false);

  const { excute: createOrgTargetTags, isLoading: isTagCreating } =
    useAxiosApiWrapper(apis.org.createOrgTargetTags, "Create");
  const { excute: deleteOrgTargetTag, isLoading: isDeletingTag } =
    useAxiosApiWrapper(apis.org.deleteOrgTargetTag, "Delete");

  const { data: tagGroup, isValidating: isLoadingTagGroup } = useOrgTagGroups(
    {
      organizationId,
    },
    {
      locale,
      serviceModuleValue: ServiceModuleValue.EVENT,
    }
  );

  const { data: comments, mutate: commentsMutate } = useTargetComments({
    organizationId,
    targetTable: Table.EVENTS,
    targetId: data?.organizationEventId as string,
  });

  const [isOpenContentDrawer, setIsOpenContentDrawer] =
    useState<boolean>(false);

  useEffect(() => {
    const handleMouseClick = (event) => {
      const popover = document.getElementById("mouse-over-popover");
      const clickedElement = event.target as HTMLElement;
      const descButtons = document.querySelectorAll('[id^="description-btn-"]');
      let isDescButton = false;
      descButtons.forEach((descButton) => {
        if (descButton.contains(clickedElement)) isDescButton = true;
      });

      if (
        popover &&
        open &&
        !popover.contains(clickedElement) &&
        !isDescButton
      ) {
        handlePopoverClose();
      }
    };

    document.addEventListener("click", handleMouseClick);

    return () => {
      document.removeEventListener("click", handleMouseClick);
    };
  }, [open]);

  const handleScrollTo = () => {
    const el = document.getElementById("event_comments");
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 64;

      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleToggleCommentDrawer = () => {
    handleScrollTo();
  };

  const handleToggleContentDrawer = () => {
    setIsOpenContentDrawer(!isOpenContentDrawer);
  };

  const tags = useOrgTagsByGroups(tagGroup?.source);

  const handleOpenTagDrawer = () => {
    setTimeout(() => {
      setIsOpenTagDrawer(true);
    }, 400);
  };
  const handleCloseTagDrawer = () => {
    setIsOpenTagDrawer(false);
  };

  const handleTagAdded = async (p) => {
    createOrgTargetTags(p)
      .then(() => {
        matchMutate(
          new RegExp(
            `^/organizations/${organizationId}/events/${organizationEventId}\\?`,
            "g"
          )
        );
      })
      .catch(() => {});
  };

  const handleTagDeleted = async (p) => {
    deleteOrgTargetTag(p)
      .then(() => {
        matchMutate(
          new RegExp(
            `^/organizations/${organizationId}/events/${organizationEventId}\\?`,
            "g"
          )
        );
      })
      .catch(() => {});
  };

  const handleChangeEventTitle = async (name, value) => {
    if (onUpdateEvent) {
      try {
        await onUpdateEvent({
          [name]: value.value,
        });
        return "success";
      } catch (error) {
        return "failed";
      }
    }
    return "failed";
  };

  const handleChangeEventDescription = async () => {
    if (onUpdateEvent) {
      try {
        await onUpdateEvent({
          organizationEventDescription: contentModel || "",
        });
        setIsEditMode(false);
        return "success";
      } catch (error) {
        return "failed";
      }
    }
    return "failed";
  };

  const handleChangeDuration = async (name, value) => {
    if (onUpdateEvent) {
      try {
        await onUpdateEvent({
          organizationEventStartDate: value.value[0],
          organizationEventEndDate: value.value[1],
        });
        return "success";
      } catch (error) {
        return "failed";
      }
    }
    return "failed";
  };

  const handleChangeEventAddress = async (name, value) => {
    if (onUpdateEvent) {
      try {
        await onUpdateEvent({
          [name]: value.value,
        });
        return "success";
      } catch (error) {
        return "failed";
      }
    }
    return "failed";
  };

  const handleSaveValue = useCallback(
    (name, newValues, remarkValues) => {
      let payload: Omit<
        UpdateOrgEventApiPayload,
        "organizationId" | "organizationEventId"
      >;
      if (data) {
        payload = getUpdatePayload(
          { [name]: newValues.value },
          defaultValues,
          newValues.targetId,
          {
            [name]: remarkValues,
          },
          organizationEventId
        );
      } else {
        payload = getUpdatePayload(
          { [name]: newValues.value },
          defaultValues,
          newValues.targetId,
          {
            [name]: remarkValues,
          }
        );
      }

      if (data) {
        return updateOrgEvent({
          organizationId,
          organizationEventId,
          ...payload,
        })
          .then(() => {
            setShouldMutate(true);
            return "success";
          })
          .catch((err) => {
            apis.tools.createLog({
              function: "updateOrgEvent: error",
              browserDescription: window.navigator.userAgent,
              jsonData: {
                data: err,
                deviceInfo: getDeviceInfo(),
              },
              level: "ERROR",
            });
          });
      }
      return undefined;
    },
    [
      data,
      getUpdatePayload,
      defaultValues,
      organizationEventId,
      updateOrgEvent,
      organizationId,
    ]
  );

  const renderDynamicColumnContents = useCallback(
    () =>
      Object.keys(orgColumnsGroupByGroup).map((key, index) => (
        <Grid container key={key + index}>
          {(key === "none"
            ? readable
            : readable &&
              targetRoles &&
              (targetRoles[key]?.includes("READ") ||
                targetRoles[key]?.includes("WRITE"))) && (
            <React.Fragment key={key}>
              {key !== "none" && (
                <Grid item xs={12} mb={2}>
                  <GroupLabel
                    label={
                      orgColumnsGroupByGroup[key][0].organizationColumnGroup
                        ?.columnGroupName
                    }
                  />
                </Grid>
              )}
              {orgColumnsGroupByGroup[key]?.map((el) => (
                <Grid item xs={12} key={el.columnId}>
                  <Stack direction="column" marginBottom={2}>
                    <ListItemText
                      primaryTypographyProps={{
                        typography: "body2",
                        color: "text.secondary",
                        mb: 0.5,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {wordLibrary?.[el.columnName] ?? el.columnName}
                      {el.isRequired ? (
                        <span style={{ color: "red" }}> *</span>
                      ) : undefined}
                      {el?.isCommentEnabled === "TRUE" ? (
                        <IconButton
                          aria-label="help"
                          sx={{ color: "#637381" }}
                          onClick={() => {
                            commentTargetIdRef.current = el?.columnId;
                            openCommentDialog();
                          }}
                        >
                          <MapsUgcOutlinedIcon sx={{ fontSize: "18px" }} />
                        </IconButton>
                      ) : (
                        ""
                      )}
                      {el?.columnDescription ? (
                        <IconButton
                          aria-label="help"
                          sx={{ color: "#637381" }}
                          onClick={(e) => {
                            handlePopoverOpen(e, el?.columnDescription);
                          }}
                          id={`description-btn-${el?.columnId}`}
                        >
                          <HelpOutlineIcon sx={{ fontSize: "18px" }} />
                        </IconButton>
                      ) : (
                        ""
                      )}
                    </ListItemText>
                    <DynamicFieldWithAction
                      value={values[el.columnId]?.columnTargetValue}
                      name={el.columnId}
                      columnType={el.columnType}
                      isRelatedServiceModule={Boolean(
                        el.isRelatedServiceModule
                      )}
                      columnTargetRelatedTargetId={
                        values[el.columnId]?.columnTargetRelatedTargetId
                      }
                      columnRelatedServiceModuleValue={
                        el.columnRelatedServiceModuleValue
                      }
                      label={el.columnName}
                      options={dynamicOptions[el.columnId]}
                      format={(value) =>
                        parseDynamicColumnValue(el.columnType, value as string)
                      }
                      boldText
                      handleClickHistory={onShowHistoryDialog}
                      handleChange={handleSaveValue}
                      readable={readable}
                      writable={
                        key === "none"
                          ? writable
                          : writable &&
                            targetRoles &&
                            targetRoles[key]?.includes("WRITE")
                      }
                      deletable={deletable}
                      isEditor={el.isEditor === 1}
                      min={el.columnNumberMin}
                      max={el.columnNumberMax}
                      editorTemplateContent={el.columnEditorTemplateContent}
                      hasValidator={el.hasValidator === 1}
                      validator={el.columnValidatorRegex}
                      hasRemark={el.hasValueRemark === 1}
                      requiredRemark={el.isRequiredValueRemark === 1}
                      numberUnit={el.columnNumberUnit}
                      numberDecimal={el.columnNumberOfDecimal}
                      remarkList={
                        values[el.columnId]
                          ? values[el.columnId].columnTargetValueRemarkList
                          : []
                      }
                      uploadFile={(data?.uploadFileList || []).find(
                        (li) =>
                          li.uploadFileId ===
                          values[el.columnId]?.columnTargetValue
                      )}
                      required={el.isRequired === 1}
                      isUniqueValue={el.isUniqueValue}
                      maxOptionBeSelected={el.maxOptionBeSelected}
                      minOptionBeSelected={el.minOptionBeSelected}
                    />
                  </Stack>
                </Grid>
              ))}
            </React.Fragment>
          )}
        </Grid>
      )),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      orgColumnsGroupByGroup,
      readable,
      targetRoles,
      values,
      dynamicOptions,
      onShowHistoryDialog,
      handleSaveValue,
      writable,
      deletable,
      data?.uploadFileList,
      wordLibrary,
    ]
  );

  return (
    <>
      <EditSection
        sx={{ marginBottom: 2 }}
        className={classes.editSectionContainer}
      >
        {data && (
          <TagAutocompleteWithAction
            targetId={data.organizationEventId}
            selectedTags={
              data.organizationTagTargetList?.map((el) => el.organizationTag) ||
              []
            }
            options={tags || []}
            readable={readable}
            writable={writable}
            deletable={deletable}
            onAddTag={handleTagAdded}
            onRemoveTag={handleTagDeleted}
            isLoading={
              isDeletingTag || isLoadingTagGroup || isTagCreating || isMutating
            }
          />
        )}
      </EditSection>
      {data && (
        <>
          <EditSection
            sx={{ marginBottom: 2 }}
            className={classes.headerEditSectionContainer}
            ref={contentRef}
          >
            <Grid container spacing={2} position="relative">
              <div
                className={clsx(
                  classes.loader,
                  isMutating && classes.showLoader,
                  {
                    [classes.lightOpacity]: settings.themeMode === "light",
                    [classes.darkOpacity]: settings.themeMode !== "light",
                  }
                )}
              >
                <CircularProgress />
              </div>
              <Grid item xs={12}>
                <Grid container className={classes.titleTextField}>
                  <Grid item>
                    <DynamicFieldWithAction
                      label="事件標題"
                      name="organizationEventTitle"
                      format={(value) =>
                        parseDynamicColumnValue(
                          ColumnType.TEXT,
                          value as string
                        )
                      }
                      handleClickHistory={onShowHistoryDialog}
                      handleChange={handleChangeEventTitle}
                      value={data?.organizationEventTitle}
                      columnType={ColumnType.TEXT}
                      readable={readable}
                      writable={writable}
                      deletable={deletable}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Stack direction="column">
                  <ListItemText
                    primary="事件日期"
                    primaryTypographyProps={{
                      typography: "body2",
                      color: "text.secondary",
                      mb: 0.5,
                    }}
                  />
                  <DynamicFieldWithAction
                    label="事件日期"
                    name="duration"
                    format={(value) =>
                      parseDynamicColumnValue(
                        ColumnType.DATERANGE,
                        value as string
                      )
                    }
                    handleClickHistory={onShowHistoryDialog}
                    handleChange={handleChangeDuration}
                    value={[
                      data?.organizationEventStartDate || "",
                      data?.organizationEventEndDate || "",
                    ]}
                    columnType={ColumnType.DATETIMERANGE}
                    boldText
                    readable={readable}
                    writable={writable}
                    deletable={deletable}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack direction="column">
                  <ListItemText
                    primary="事件地址"
                    primaryTypographyProps={{
                      typography: "body2",
                      color: "text.secondary",
                      mb: 0.5,
                    }}
                  />
                  <Grid container>
                    <Grid item>
                      <DynamicFieldWithAction
                        label="事件地址"
                        name="organizationEventAddress"
                        format={(value) =>
                          parseDynamicColumnValue(
                            ColumnType.TEXT,
                            value as string
                          )
                        }
                        handleClickHistory={onShowHistoryDialog}
                        handleChange={handleChangeEventAddress}
                        value={data?.organizationEventAddress}
                        columnType={ColumnType.TEXT}
                        boldText
                        readable={readable}
                        writable={writable}
                        deletable={deletable}
                      />
                    </Grid>
                    <Grid item>
                      <a
                        href={`https://google.com/maps/search/${data?.organizationEventAddress}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Avatar src="/events/map.png" sx={{ marginLeft: 5 }} />
                      </a>
                    </Grid>
                  </Grid>
                  {renderDynamicColumnContents()}
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                {!isEditMode && (
                  <Box
                    onClick={() => {
                      if (writable) setIsEditMode(true);
                    }}
                    id="edit-event-content-button"
                    data-tid="edit-event-content-button"
                    sx={{ cursor: writable ? "pointer" : "default" }}
                  >
                    <FroalaEditorView model={organizationEventDescription} />
                    {(organizationEventDescription === "" ||
                      !organizationEventDescription) &&
                      writable && (
                        <Typography textAlign="center" color="textSecondary">
                          {wordLibrary?.["click to edit"] ?? "點此編輯"}
                        </Typography>
                      )}
                  </Box>
                )}
                {isEditMode && writable && (
                  <FroalaEditor
                    filePathType={ServiceModuleValue.EVENT}
                    model={contentModel}
                    onModelChange={(model) => {
                      setContentModel(model);
                    }}
                    config={{
                      toolbarSticky: true,
                      heightMin: 300,
                      placeholderText:
                        wordLibrary?.["edit article content"] ?? "編輯文章內容",
                    }}
                  />
                )}
              </Grid>
              {isEditMode && writable && (
                <Grid
                  container
                  spacing={2}
                  justifyContent="end"
                  marginTop="10px"
                >
                  <Grid item>
                    <Button
                      rounded
                      variant="contained"
                      onClick={() => {
                        setIsEditMode(false);
                        setContentModel(data?.organizationEventDescription);
                      }}
                      id="cancel-event-content-button"
                      data-tid="cancel-event-content-button"
                    >
                      {wordLibrary?.cancel ?? "取消"}
                    </Button>
                  </Grid>
                  {writable && (
                    <Grid item>
                      <Button
                        rounded
                        variant="contained"
                        color="primary"
                        onClick={handleChangeEventDescription}
                        loading={loading}
                        disabled={!writable || loading}
                        id="save-event-content-button"
                        data-tid="save-event-content-button"
                      >
                        {wordLibrary?.save ?? "儲存"}
                      </Button>
                    </Grid>
                  )}
                </Grid>
              )}
            </Grid>
            <Grid>
              <Stack direction="row" sx={{ mb: 3, mt: 5 }}>
                <Typography variant="h4" id="event_comments">
                  {wordLibrary?.["response section"] ?? "回應區"}
                </Typography>

                <Typography variant="subtitle2" sx={{ color: "text.disabled" }}>
                  ({comments?.source.length})
                </Typography>
              </Stack>

              <TargetCommentForm
                organizationId={organizationId}
                targetTable={Table.EVENTS}
                targetId={data.organizationEventId}
                commentsMutate={commentsMutate}
              />

              <Divider sx={{ mt: 5, mb: 2 }} />

              <TargetCommentList
                organizationId={organizationId}
                targetTable={Table.EVENTS}
                comments={comments?.source || []}
                commentsMutate={commentsMutate}
              />
            </Grid>
          </EditSection>
          <EventContentDrawer
            isOpen={isOpenContentDrawer}
            onClickAway={handleToggleContentDrawer}
            contentRef={contentRef}
          />
          <TagDrawer
            isOpen={isOpenTagDrawer}
            onClickAway={handleCloseTagDrawer}
          >
            <EditSection className={classes.editSectionContainer}>
              {data && (
                <TagAutocompleteWithAction
                  targetId={data.organizationEventId}
                  writable={writable}
                  deletable={deletable}
                  selectedTags={
                    data.organizationTagTargetList?.map(
                      (el) => el.organizationTag
                    ) || []
                  }
                  options={tags || []}
                  onAddTag={handleTagAdded}
                  onRemoveTag={handleTagDeleted}
                  isToolbar
                  isLoading={
                    isDeletingTag ||
                    isLoadingTagGroup ||
                    isTagCreating ||
                    isMutating
                  }
                />
              )}
            </EditSection>
          </TagDrawer>
          <Popover
            id="mouse-over-popover"
            sx={{
              pointerEvents: "none",
            }}
            open={open}
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            onClose={handlePopoverClose}
            PaperProps={{
              style: { pointerEvents: "auto" },
            }}
          >
            <ColumnDescription descr={descr} handleClose={handlePopoverClose} />
          </Popover>
          <Fab
            color="primary"
            className={clsx(classes.tagIcon, {
              [classes.left]: rtl,
              [classes.right]: !rtl,
            })}
            onClick={handleOpenTagDrawer}
          >
            <LocalOfferIcon />
          </Fab>
          <Fab
            color="primary"
            onClick={handleToggleContentDrawer}
            className={clsx(classes.articleIcon, {
              [classes.left]: rtl,
              [classes.right]: !rtl,
            })}
          >
            <ArticleIcon />
          </Fab>
          <Fab
            color="primary"
            onClick={handleToggleCommentDrawer}
            className={clsx(classes.smsIcon, {
              [classes.left]: rtl,
              [classes.right]: !rtl,
            })}
          >
            <SmsRoundedIcon />
          </Fab>
          <CommentDialog
            organizationId={organizationId}
            targetTable={Table.COLUMNS}
            targetId={commentTargetIdRef.current}
          />
        </>
      )}
    </>
  );
};

export default EventInfo;
