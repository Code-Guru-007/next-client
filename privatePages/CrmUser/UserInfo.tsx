import React, {
  FC,
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

import { ServiceModuleValue, Table } from "interfaces/utils";
import { useRouter } from "next/router";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";

import { useMediaQuery, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import MapsUgcOutlinedIcon from "@mui/icons-material/MapsUgcOutlined";
import ListItemText from "@mui/material/ListItemText";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import { useSelector } from "react-redux";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import {
  OrganizationColumn,
  DynamicColumnTarget,
  OrganizationUser,
} from "interfaces/entities";
import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";
import Popover from "@eGroupAI/material/Popover";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import useOrgUser from "utils/useOrgUser";

import useStaticColumns from "utils/useStaticColumns";
import parseDynamicColumnValue from "utils/parseDynamicColumnValue";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ListRoundedIcon from "@mui/icons-material/ListRounded";

import Fab from "@eGroupAI/material/Fab";
import Grid from "@eGroupAI/material/Grid";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import CircularProgress from "@mui/material/CircularProgress";
import EditSection from "components/EditSection";
import EditSectionHeader from "components/EditSectionHeader";
import { makeStyles } from "@mui/styles";
import DynamicFieldWithAction from "components/DynamicField/DynamicFieldWithAction";

import clsx from "clsx";

import {
  CreateOrgTargetTagsApiPayload,
  DeleteOrgTargetTagsApiPayload,
  UpdateOrgUserApiPayload,
} from "interfaces/payloads";
import useUpdateUserApiPayload from "utils/useUpdateUserApiPayload";
import useOrgDynamicColumns from "utils/useOrgDynamicColumns";
import TagAutocompleteWithAction from "components/TagAutocompleteWithAction";
import useOrgTagsByGroups from "utils/useOrgTagsByGroups";
import useOrgTagGroups from "utils/useOrgTagGroups";
import GroupLabel from "components/GroupLabel";
import getOrgColumnGroupByGroup from "utils/getOrgColumnsGroupByGroup";
import useOrgRoleTargetAuth from "utils/useOrgRoleTargetAuth";
import { useSettingsContext } from "minimal/components/settings";
import InfiniteScroll from "react-infinite-scroll-component";
import InfoHistoryDialog, {
  DIALOG as HISTORY_DIALOG,
  RecordTarget,
} from "components/InfoHistoryDialog";
import CommentDialog, {
  DIALOG as COMMENT_DIALOG,
} from "components/CommentDialog";
import ColumnDescription from "components/ColumnDescription";
import CrmUserTagDrawer from "./CrmUserTagDrawer";
import CrmUserContentDrawer from "./CrmUserContentDrawer";

const useStyles = makeStyles(() => ({
  textField: {
    display: "flex",
    marginRight: 2,
    wordBreak: "break-word",
    "& .MuiTypography-root": {
      fontSize: "15px",
      zIndex: 1,
    },
  },
  editSectionContainer: {
    borderRadius: 0,
    boxShadow: "none",
    marginBottom: 0,
    borderBottom: "1px solid #EEEEEE",
    zIndex: 1000,
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
  tagIcon: {
    position: "fixed",
    bottom: 160,
  },
  menuIcon: {
    position: "fixed",
    bottom: 90,
  },
  right: {
    right: 20,
  },
  left: {
    left: 20,
  },
}));

export type OptionType = {
  optionId: string;
  label: string;
  value: string;
  nextColumnId?: string;
};

export interface TabDataItem {
  label: string;
  value: string;
}

export interface UserInfoProps {
  orgUser?: OrganizationUser;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
  noInfiniteScroll?: boolean;
  tabValue?: string;
  tabData?: TabDataItem[];
  isOpenDrawer?: boolean;
  setIsOpenDrawer?: (isOpen: boolean) => void;
}

const UserInfo: FC<UserInfoProps> = function (props) {
  const {
    orgUser,
    readable = false,
    writable = false,
    deletable = false,
    noInfiniteScroll = true,
    tabValue,
    tabData,
    isOpenDrawer = false,
    setIsOpenDrawer,
  } = props;
  const [mutableOrgUser, setMutableOrgUser] = useState<
    OrganizationUser | undefined
  >(orgUser);

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

  const theme = useTheme();
  const isDownSm = useMediaQuery(theme.breakpoints.down("sm"));
  const isDownMd = useMediaQuery(theme.breakpoints.down("md"));
  const isDownLg = useMediaQuery(theme.breakpoints.down("lg"));

  const classes = useStyles();
  const router = useRouter();
  const settings = useSettingsContext();
  const rtl = settings.themeDirection === "rtl";

  const wordLibrary = useSelector(getWordLibrary);
  const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);
  const organizationUserId = router.query.userId as string;
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  const [hasMore, setHasMore] = useState<boolean>(!noInfiniteScroll);
  const [scrollIndex, setScrollIndex] = useState<number>(1);

  const { excute: createOrgTargetTags, isLoading: isTagCreating } =
    useAxiosApiWrapper(apis.org.createOrgTargetTags, "Create");
  const { excute: deleteOrgTargetTag, isLoading } = useAxiosApiWrapper(
    apis.org.deleteOrgTargetTag,
    "Delete"
  );
  const [isOpenTagDrawer, setIsOpenTagDrawer] = useState<boolean>(false);
  const [isOpenCommentDrawer, setIsOpenCommentDrawer] =
    useState<boolean>(isOpenDrawer);
  const { data: updatedOrgUser, isValidating } = useOrgUser(
    {
      organizationId,
      organizationUserId,
    },
    {
      locale,
    }
  );
  const { data: targetRoles } = useOrgRoleTargetAuth(
    {
      organizationId,
    },
    {
      serviceModuleValue: ServiceModuleValue.CRM_USER,
    }
  );

  const handleOpenTagDrawer = () => {
    setTimeout(() => {
      setIsOpenTagDrawer(true);
    }, 400);
  };
  const handleCloseTagDrawer = () => {
    setIsOpenTagDrawer(false);
  };

  const handleOpenCommentDrawer = () => {
    setTimeout(() => {
      setIsOpenCommentDrawer(true);
      if (setIsOpenDrawer) {
        setIsOpenDrawer(true);
      }
    }, 400);
  };
  const handleCloseCommentDrawer = () => {
    setIsOpenCommentDrawer(false);
    if (setIsOpenDrawer) {
      setIsOpenDrawer(false);
    }
  };
  useEffect(() => {
    setMutableOrgUser(updatedOrgUser);
  }, [updatedOrgUser]);

  const columns = useStaticColumns(Table.USERS, "isEdit", organizationId);
  const { data: orgColumns } = useOrgDynamicColumns(
    {
      organizationId,
    },
    {
      columnTable: "ORGANIZATION_USER",
    }
  );

  const getUpdatePayload = useUpdateUserApiPayload(
    mutableOrgUser?.dynamicColumnTargetList,
    orgColumns?.source
  );

  const [dynamicOptions, setDynamicOptions] = useState<{
    [name: string]: OptionType[] | undefined;
  }>({});

  useEffect(() => {
    columns?.map((el) => {
      const { columnType } = el;
      if (el.sortKey && columnType) {
        const elOption = el.keyValueMap
          ? Object.keys(el.keyValueMap).map((key) => ({
              optionId: key,
              label: key,
              value: el.keyValueMap ? el.keyValueMap[key] || "" : "",
            }))
          : undefined;

        setDynamicOptions((prev) => ({
          ...prev,
          [el?.sortKey as string]: elOption,
        }));
      }
      return null;
    });

    orgColumns?.source.map((el) => {
      const elOption = el.organizationOptionList?.map((o) => ({
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
  }, [orgColumns?.source, columns]);

  const orgColumnsGroupByGroup = useMemo(
    () => getOrgColumnGroupByGroup(orgColumns?.source),
    [orgColumns?.source]
  );

  // all columns are rearranged by group
  const columnsToRender = useMemo(() => {
    const result: OrganizationColumn[] = [];
    Object.keys(orgColumnsGroupByGroup).forEach((key) =>
      orgColumnsGroupByGroup[key].forEach((column: OrganizationColumn) =>
        result.push(column)
      )
    );
    return result;
  }, [orgColumnsGroupByGroup]);

  const maxScrollIndex = useMemo(
    () => Math.floor(columnsToRender.length / 5) + 1,
    [columnsToRender.length]
  );

  const columnsRendered = useMemo(
    () =>
      columnsToRender.slice(
        0,
        (noInfiniteScroll ? maxScrollIndex : scrollIndex) * 5
      ) || [],
    [columnsToRender, maxScrollIndex, noInfiniteScroll, scrollIndex]
  );

  const fetchData = useCallback(() => {
    setScrollIndex(scrollIndex + 1);
    if (scrollIndex * 5 >= columnsToRender.length) setHasMore(false);
  }, [scrollIndex, columnsToRender.length]);

  const { openDialog: openHistoryDialog } = useReduxDialog(HISTORY_DIALOG);
  const { openDialog: openCommentDialog } = useReduxDialog(COMMENT_DIALOG);

  const [recordTarget, setRecordTarget] = useState<RecordTarget>({});

  const { excute: updateOrgUser } = useAxiosApiWrapper(
    apis.org.updateOrgUser,
    "Update"
  );

  const matchMutate = useSwrMatchMutate();

  const [shouldMutate, setShouldMutate] = useState<boolean>(false);

  const handleMutate = useCallback(() => {
    if (shouldMutate) {
      matchMutate(
        new RegExp(
          `^/organizations/${organizationId}/users/${organizationUserId}\\?`,
          "g"
        )
      );
      setShouldMutate(false);
    }
  }, [matchMutate, organizationId, organizationUserId, shouldMutate]);

  useEffect(() => {
    if (shouldMutate) {
      handleMutate();
    }
  }, [handleMutate, shouldMutate]);

  const { data } = useOrgTagGroups(
    {
      organizationId,
    },
    {
      locale,
      serviceModuleValue: ServiceModuleValue.CRM_USER,
    }
  );
  const tags = useOrgTagsByGroups(data?.source);

  const handleTagAdded = async (
    p: CreateOrgTargetTagsApiPayload | undefined
  ) => {
    createOrgTargetTags(p)
      .then(() => {
        matchMutate(
          new RegExp(
            `^/organizations/${organizationId}/users/${organizationUserId}\\?`,
            "g"
          )
        );
      })
      .catch(() => {});
  };

  const handleTagDeleted = async (
    p: DeleteOrgTargetTagsApiPayload | undefined
  ) => {
    deleteOrgTargetTag(p)
      .then(() => {
        matchMutate(
          new RegExp(
            `^/organizations/${organizationId}/users/${organizationUserId}\\?`,
            "g"
          )
        );
      })
      .catch(() => {});
  };

  const defaultValues = useMemo(() => {
    if (!mutableOrgUser) return {};
    const dynamics = mutableOrgUser.dynamicColumnTargetList?.reduce((a, b) => {
      const uploadFileName = mutableOrgUser.uploadFileList?.find(
        (el) => el.uploadFileId === b.columnTargetValue
      )?.uploadFileName;
      return {
        ...a,
        [b.organizationColumn.columnId]: { ...b, uploadFileName },
      };
    }, {});
    return {
      organizationUserAddress: mutableOrgUser.organizationUserAddress || "",
      organizationUserArea: mutableOrgUser.organizationUserArea || "",
      organizationUserCity: mutableOrgUser.organizationUserCity || "",
      organizationUserEmail: mutableOrgUser.organizationUserEmail || "",
      organizationUserGender: mutableOrgUser.organizationUserGender
        ? String(mutableOrgUser.organizationUserGender)
        : undefined,
      organizationUserIdCardNumber:
        mutableOrgUser.organizationUserIdCardNumber || "",
      organizationUserNameZh: mutableOrgUser.organizationUserNameZh || "",
      organizationUserNameEn: mutableOrgUser.organizationUserNameEn || "",
      organizationUserPhone: mutableOrgUser.organizationUserPhone || "",
      organizationUserZIPCode: mutableOrgUser.organizationUserZIPCode || "",
      organizationUserBirth: mutableOrgUser.organizationUserBirth || "",
      ...dynamics,
    };
  }, [mutableOrgUser]);

  const [values, setValues] = useState(defaultValues);

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

  useEffect(() => {
    setValues(defaultValues);
  }, [defaultValues]);

  const handleClickHistory = useCallback(
    (r?: RecordTarget) => {
      if (r) {
        setRecordTarget(r);
        openHistoryDialog();
      }
    },
    [openHistoryDialog]
  );

  const handleSaveValue = useCallback(
    (
      name,
      newValues,
      remarkValues,
      nextColumnValues,
      nextColumnRemarkValues,
      columnTargetValueList,
      nextColumnTargetValueList
    ) => {
      let payload: Omit<
        UpdateOrgUserApiPayload,
        "organizationId" | "organizationUserId"
      >;
      const chgValues = { ...newValues };
      if (mutableOrgUser) {
        if (
          name === "organizationUserGender" &&
          chgValues.value === undefined
        ) {
          chgValues.value = "0";
        }
        payload = getUpdatePayload(
          {
            [name]: typeof newValues === "object" ? chgValues.value : chgValues,
            ...nextColumnValues,
          },
          defaultValues,
          chgValues.targetId,
          {
            [name]: remarkValues,
            ...nextColumnRemarkValues,
          },
          organizationUserId,
          undefined,
          undefined,
          undefined,
          { [name]: columnTargetValueList, ...nextColumnTargetValueList }
        );
      } else {
        payload = getUpdatePayload(
          {
            [name]: typeof newValues === "object" ? chgValues.value : chgValues,
            ...nextColumnValues,
          },
          defaultValues,
          chgValues.targetId,
          {
            [name]: remarkValues,
            ...nextColumnRemarkValues,
          }
        );
      }

      if (mutableOrgUser) {
        return updateOrgUser({
          organizationId,
          organizationUserId,
          ...payload,
        })
          .then(() => {
            setShouldMutate(true);
            return "success";
          })
          .catch((err) => {
            apis.tools.createLog({
              function: "updateOrgUser: error",
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
      mutableOrgUser,
      getUpdatePayload,
      defaultValues,
      organizationUserId,
      updateOrgUser,
      organizationId,
    ]
  );

  Object.keys(orgColumnsGroupByGroup).map((key) => (
    <>
      {(key === "none"
        ? readable
        : readable &&
          targetRoles &&
          (targetRoles[key]?.includes("READ") ||
            targetRoles[key]?.includes("WRITE"))) && <></>}
    </>
  ));

  const renderStaticColumnContents = useCallback(() => {
    if (!columns || !mutableOrgUser) return undefined;
    return columns.map((el) => (
      <Grid item xs={12} key={el.id}>
        <Stack direction="column">
          <ListItemText
            primaryTypographyProps={{
              typography: "body2",
              color: "text.secondary",
              mb: 0.5,
            }}
          >
            {wordLibrary?.[el.columnName] ?? el.columnName}
            {el.isEditFix === 1 ? (
              <span style={{ color: "red" }}> *</span>
            ) : undefined}
          </ListItemText>
          <DynamicFieldWithAction
            capitalize={el.sortKey === "organizationUserIdCardNumber"}
            value={values[el.sortKey as string]}
            remarkList={
              values[el.sortKey as string]
                ? values[el.sortKey as string].columnTargetValueRemarkList
                : []
            }
            name={el.sortKey as string}
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, no-underscore-dangle
            columnType={el.columnType!}
            options={dynamicOptions[el.sortKey as string]}
            format={el.format}
            required={el.isEditFix === 1}
            label={el.columnName}
            boldText
            handleClickHistory={handleClickHistory}
            handleChange={handleSaveValue}
            readable={readable}
            writable={writable}
            deletable={deletable}
          />
        </Stack>
      </Grid>
    ));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, dynamicOptions, mutableOrgUser, values]);

  const renderDynamicColumnContents = useCallback(
    () =>
      columnsRendered?.map((el: OrganizationColumn, index) => {
        let newGroupLabel = true;
        const groupKey = el.organizationColumnGroup?.columnGroupId || "none";
        if (index !== 0)
          newGroupLabel =
            groupKey !==
            columnsRendered[index - 1]?.organizationColumnGroup?.columnGroupId;

        const options = dynamicOptions[el.columnId];
        const optionsHasNextColumn = options?.filter((opt) => opt.nextColumnId);

        const optionsNextColumns = optionsHasNextColumn?.reduce<
          OrganizationColumn[]
        >((a, o) => {
          const find = orgColumns?.source.find(
            (col) => col.columnId === o.nextColumnId
          );
          if (find) return [...a, find];
          return [...a];
        }, []);

        const nextColumnTargets = optionsNextColumns?.reduce<
          DynamicColumnTarget[]
        >((a, b) => {
          const findColumnTarget =
            mutableOrgUser?.dynamicColumnTargetList?.find(
              (t) => t.organizationColumn.columnId === b.columnId
            );
          if (findColumnTarget)
            return [...a, { ...findColumnTarget, organizationColumn: b }];
          return [
            ...a,
            {
              organizationColumn: b,
              columnTargetValue: "",
              targetId: "",
              columnTargetId: "",
              columnTargetRelatedTargetId: "",
              columnTargetValueRemarkList: [],
            },
          ];
        }, []);

        const groupPerm =
          readable &&
          targetRoles &&
          (targetRoles[groupKey]?.includes("READ") ||
            targetRoles[groupKey]?.includes("WRITE"));

        return (
          (groupKey === "none" ? readable : Boolean(groupPerm)) && (
            <React.Fragment key={el.columnId}>
              {newGroupLabel && groupKey !== "none" && (
                <Grid item xs={12}>
                  <GroupLabel
                    label={
                      el.organizationColumnGroup?.columnGroupName as string
                    }
                    dataGroupId={el.organizationColumnGroup?.columnGroupId}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <Stack direction="column">
                  <ListItemText
                    primaryTypographyProps={{
                      typography: "body2",
                      color: "text.secondary",
                      mb: 0.5,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {el.columnName}
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
                    choiceOneDropdownPadding
                    // hideMultiTextBorder
                    selectedDropdownOption={{
                      targetId:
                        values[el.columnId]?.columnTargetRelatedTargetId,
                      targetInformationList: values[
                        el.columnId
                      ]?.columnTargetValue
                        ?.split(":")[0]
                        ?.split(", "),
                    }}
                    value={values[el.columnId]?.columnTargetValue}
                    name={el.columnId}
                    columnType={el.columnType}
                    isRelatedServiceModule={Boolean(el.isRelatedServiceModule)}
                    columnTargetRelatedTargetId={
                      values[el.columnId]?.columnTargetRelatedTargetId
                    }
                    columnRelatedServiceModuleValue={
                      el.columnRelatedServiceModuleValue
                    }
                    label={`${el.columnName}`}
                    options={options}
                    format={(value) =>
                      parseDynamicColumnValue(el.columnType, value as string)
                    }
                    boldText
                    handleClickHistory={handleClickHistory}
                    handleChange={handleSaveValue}
                    readable={readable}
                    writable={
                      groupKey === "none"
                        ? writable
                        : writable &&
                          targetRoles &&
                          targetRoles[groupKey]?.includes("WRITE")
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
                    uploadFile={mutableOrgUser?.uploadFileList?.find(
                      (li) =>
                        li.uploadFileId ===
                        values[el.columnId]?.columnTargetValue
                    )}
                    required={el.isRequired === 1}
                    isUniqueValue={el.isUniqueValue === 1}
                    hasNextColumn={el.hasNextColumn === 1}
                    nextColumnTargets={nextColumnTargets}
                    dynamicOptions={dynamicOptions}
                    maxOptionBeSelected={el.maxOptionBeSelected}
                    minOptionBeSelected={el.minOptionBeSelected}
                  />
                </Stack>
              </Grid>
            </React.Fragment>
          )
        );
      }),
    [
      deletable,
      openCommentDialog,
      columnsRendered,
      dynamicOptions,
      handleClickHistory,
      handleSaveValue,
      mutableOrgUser?.dynamicColumnTargetList,
      mutableOrgUser?.uploadFileList,
      orgColumns?.source,
      readable,
      targetRoles,
      values,
      writable,
    ]
  );

  const handleScrollTo = useCallback(
    (groupId?: string) => {
      const indexToScroll = columnsToRender?.findIndex(
        (el) => el.organizationColumnGroup?.columnGroupId === groupId
      );
      setScrollIndex(Math.floor(indexToScroll / 5) + 1);
      setSelectedGroupId(groupId || "");
    },
    [columnsToRender]
  );

  useEffect(() => {
    if (selectedGroupId !== "") {
      const elementToScroll = document.querySelector(
        `[data-groupId="${selectedGroupId}"]`
      );

      const scrollTop = window.scrollY;
      let topOffset = 430;
      if (isDownMd) {
        topOffset = 390;
      }
      if (isDownSm || isDownLg) {
        topOffset = 400;
      }
      if (scrollTop !== undefined && elementToScroll) {
        window.scrollTo({
          top:
            elementToScroll.getBoundingClientRect().top + scrollTop - topOffset,
          left: 0,
          behavior: "smooth",
        });
        setSelectedGroupId("");
      }
    }
  }, [isDownLg, isDownMd, isDownSm, selectedGroupId]);

  return (
    <>
      {mutableOrgUser && (
        <InfoHistoryDialog
          targetId={organizationUserId}
          recordTarget={recordTarget}
          handleChange={handleSaveValue}
          values={values}
        />
      )}
      <EditSection
        sx={{
          marginBottom: 2,
        }}
        className={classes.editSectionContainer}
      >
        {mutableOrgUser && (
          <TagAutocompleteWithAction
            targetId={organizationUserId}
            selectedTags={
              mutableOrgUser.organizationTagTargetList?.map(
                (el) => el.organizationTag
              ) || []
            }
            options={tags || []}
            writable={writable}
            deletable={deletable}
            onAddTag={handleTagAdded}
            onRemoveTag={handleTagDeleted}
            isLoading={isLoading || isTagCreating || isValidating}
          />
        )}
      </EditSection>
      <EditSection
        className={classes.headerEditSectionContainer}
        ref={contentRef}
      >
        <EditSectionHeader primary={wordLibrary?.information ?? "資訊"} />
        <InfiniteScroll
          dataLength={(columns?.length || 0) + columnsRendered.length}
          next={fetchData}
          hasMore={hasMore}
          loader={hasMore && <CircularProgress sx={{ margin: 2 }} />}
          style={{
            overflow: "unset",
          }}
          scrollThreshold={0.95}
        >
          <Grid container spacing={2} position="relative" id="scroll-section">
            <div
              className={clsx(
                classes.loader,
                isValidating && classes.showLoader,
                {
                  [classes.lightOpacity]: settings.themeMode === "light",
                  [classes.darkOpacity]: settings.themeMode !== "light",
                }
              )}
            >
              <CircularProgress />
            </div>
            {renderStaticColumnContents()}
            {renderDynamicColumnContents()}
          </Grid>
        </InfiniteScroll>
      </EditSection>
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
        className={clsx(classes.menuIcon, {
          [classes.left]: rtl,
          [classes.right]: !rtl,
        })}
        onClick={handleOpenCommentDrawer}
      >
        <ListRoundedIcon />
      </Fab>
      <CrmUserTagDrawer
        isOpen={isOpenTagDrawer}
        onClickAway={handleCloseTagDrawer}
      >
        <EditSection className={classes.editSectionContainer}>
          {mutableOrgUser && (
            <TagAutocompleteWithAction
              targetId={organizationUserId}
              selectedTags={
                mutableOrgUser.organizationTagTargetList?.map(
                  (el) => el.organizationTag
                ) || []
              }
              options={tags || []}
              writable={writable}
              deletable={deletable}
              onAddTag={handleTagAdded}
              onRemoveTag={handleTagDeleted}
              isLoading={isLoading}
              isToolbar
              isDrawer
            />
          )}
        </EditSection>
      </CrmUserTagDrawer>
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
      <CrmUserContentDrawer
        isOpen={isOpenCommentDrawer}
        onClickAway={handleCloseCommentDrawer}
        contentRef={contentRef}
        orgColumnsGroup={orgColumnsGroupByGroup}
        targetRoles={targetRoles}
        readable={readable}
        handleScrollTo={handleScrollTo}
        tabValue={tabValue}
        tabData={tabData}
      />
      <CommentDialog
        organizationId={organizationId}
        targetTable={Table.COLUMNS}
        targetId={commentTargetIdRef.current}
      />
    </>
  );
};

export default UserInfo;
