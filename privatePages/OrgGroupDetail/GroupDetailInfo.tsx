import React, {
  FC,
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Theme } from "@mui/material/styles";
import { ServiceModuleValue, Table } from "interfaces/utils";
import { useRouter } from "next/router";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import apis from "utils/apis";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import { useSelector } from "react-redux";
import { OrganizationGroup } from "interfaces/entities";
import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import useOrgGroup from "utils/useOrgGroup";

import useStaticColumns from "utils/useStaticColumns";
import parseDynamicColumnValue from "utils/parseDynamicColumnValue";
import ListRoundedIcon from "@mui/icons-material/ListRounded";
import MapsUgcOutlinedIcon from "@mui/icons-material/MapsUgcOutlined";
import Stack from "@mui/material/Stack";
import ListItemText from "@mui/material/ListItemText";
import { IconButton } from "@mui/material";
import Popover from "@eGroupAI/material/Popover";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

import Fab from "@eGroupAI/material/Fab";
import Typography from "@eGroupAI/material/Typography";
import Grid from "@eGroupAI/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import EditSection from "components/EditSection";
import EditSectionHeader from "components/EditSectionHeader";
import { makeStyles } from "@mui/styles";
import DynamicFieldWithAction from "components/DynamicField/DynamicFieldWithAction";
import ColumnDescription from "components/ColumnDescription";

import clsx from "clsx";

import { UpdateOrgGroupApiPayload } from "interfaces/payloads";
import useUpdateOrgGroupApiPayload from "utils/useUpdateOrgGroupApiPayload";
import useOrgDynamicColumns from "utils/useOrgDynamicColumns";
import GroupLabel from "components/GroupLabel";
import getOrgColumnGroupByGroup from "utils/getOrgColumnsGroupByGroup";
import useOrgRoleTargetAuth from "utils/useOrgRoleTargetAuth";
import InfoHistoryDialog, {
  DIALOG as HISTORY_DIALOG,
  RecordTarget,
} from "components/InfoHistoryDialog";
import CommentDialog, {
  DIALOG as COMMENT_DIALOG,
} from "components/CommentDialog";
import { useSettingsContext } from "minimal/components/settings";

import { getWordLibrary } from "redux/wordLibrary/selectors";
import OrgGroupContentDrawer from "./OrgGroupContentDrawer";

const useStyles = makeStyles((theme: Theme) => ({
  textField: {
    display: "flex",
    marginRight: 2,
    wordBreak: "break-word",
    "& .MuiTypography-root": {
      fontSize: "15px",
      zIndex: 1,
    },
  },
  textTitle: {
    fontSize: 14,
    color: "#637381",
    marginBottom: 4,
  },
  editSectionContainer: {
    borderRadius: 0,
    boxShadow: "none",
    marginBottom: 0,
    borderBottom: `1px solid ${theme.palette.grey[600]}`,
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
  menuIcon: {
    position: "fixed",
    bottom: 90,
    right: 20,
  },
}));

export type OptionType = {
  optionId: string;
  label: string;
  value: string;
};

export interface UserInfoProps {
  orgGroup?: OrganizationGroup;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
}

const UserInfo: FC<UserInfoProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const {
    orgGroup,
    readable = false,
    writable = false,
    deletable = false,
  } = props;
  const [mutableOrgGroup, setMutableOrgGroup] = useState<
    OrganizationGroup | undefined
  >(orgGroup);

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

  const classes = useStyles();
  const settings = useSettingsContext();
  const router = useRouter();

  const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);
  const organizationGroupId = router.query.groupId as string;
  const contentRef = useRef<HTMLDivElement>(null);

  const [isOpenCommentDrawer, setIsOpenCommentDrawer] =
    useState<boolean>(false);
  const { data: updatedOrgGroup, isValidating } = useOrgGroup(
    {
      organizationId,
      organizationGroupId,
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
      serviceModuleValue: ServiceModuleValue.ORGANIZATION_GROUP,
    }
  );

  const handleToggleCommentDrawer = () => {
    setIsOpenCommentDrawer(!isOpenCommentDrawer);
  };
  useEffect(() => {
    setMutableOrgGroup(updatedOrgGroup);
  }, [updatedOrgGroup]);

  const columns = useStaticColumns(
    Table.ORGANIZATION_GROUP,
    "isEdit",
    organizationId
  );
  const { data: orgColumns } = useOrgDynamicColumns(
    {
      organizationId,
    },
    {
      columnTable: "ORGANIZATION_GROUP",
    }
  );
  const getUpdatePayload = useUpdateOrgGroupApiPayload(
    mutableOrgGroup?.dynamicColumnTargetList,
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

  const { openDialog: openHistoryDialog } = useReduxDialog(HISTORY_DIALOG);
  const { openDialog: openCommentDialog } = useReduxDialog(COMMENT_DIALOG);

  const [recordTarget, setRecordTarget] = useState<RecordTarget>({});

  const { excute: updateOrgGroup } = useAxiosApiWrapper(
    apis.org.updateOrgGroup,
    "Update"
  );

  const matchMutate = useSwrMatchMutate();

  const [shouldMutate, setShouldMutate] = useState<boolean>(false);

  const handleMutate = useCallback(() => {
    if (shouldMutate) {
      matchMutate(
        new RegExp(
          `^/organizations/${organizationId}/groups/${organizationGroupId}\\?`,
          "g"
        )
      );
      setShouldMutate(false);
    }
  }, [matchMutate, organizationId, organizationGroupId, shouldMutate]);

  useEffect(() => {
    if (shouldMutate) {
      handleMutate();
    }
  }, [handleMutate, shouldMutate]);

  const defaultValues = useMemo(() => {
    if (!mutableOrgGroup) return {};
    const dynamics = mutableOrgGroup.dynamicColumnTargetList?.reduce((a, b) => {
      const uploadFileName = mutableOrgGroup.uploadFileList?.find(
        (el) => el.uploadFileId === b.columnTargetValue
      )?.uploadFileName;
      return {
        ...a,
        [b.organizationColumn.columnId]: { ...b, uploadFileName },
      };
    }, {});
    return {
      organizationGroupZIPCode: mutableOrgGroup.organizationGroupZIPCode || "",
      organizationGroupName: mutableOrgGroup.organizationGroupName || "",
      organizationGroupCountry: mutableOrgGroup.organizationGroupCountry || "",
      organizationGroupCity: mutableOrgGroup.organizationGroupCity || "",
      organizationGroupArea: mutableOrgGroup.organizationGroupArea || "",
      organizationGroupAddress: mutableOrgGroup.organizationGroupAddress || "",
      organizationGroupTelephone:
        mutableOrgGroup.organizationGroupTelephone || "",
      organizationGroupFax: mutableOrgGroup.organizationGroupFax || "",
      organizationGroupEmail: mutableOrgGroup.organizationGroupEmail || "",
      organizationGroupServiceArea:
        mutableOrgGroup.organizationGroupServiceArea || "",
      ...dynamics,
    };
  }, [mutableOrgGroup]);

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
    (name, newValues, remarkValues) => {
      let payload: Omit<
        UpdateOrgGroupApiPayload,
        "organizationId" | "organizationGroupId"
      >;
      if (mutableOrgGroup) {
        payload = getUpdatePayload(
          {
            [name]: typeof newValues === "object" ? newValues.value : newValues,
          },
          defaultValues,
          newValues.targetId,
          {
            [name]: remarkValues,
          },
          organizationGroupId
        );
      } else {
        payload = getUpdatePayload(
          {
            [name]: typeof newValues === "object" ? newValues.value : newValues,
          },
          defaultValues,
          newValues.targetId,
          {
            [name]: remarkValues,
          }
        );
      }

      if (mutableOrgGroup) {
        return updateOrgGroup({
          organizationId,
          organizationGroupId,
          ...payload,
        })
          .then(() => {
            setShouldMutate(true);
            return "success";
          })
          .catch((err) => {
            apis.tools.createLog({
              function: "updateOrgGroup: error",
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
      mutableOrgGroup,
      getUpdatePayload,
      defaultValues,
      organizationGroupId,
      updateOrgGroup,
      organizationId,
    ]
  );

  const renderStaticColumnContents = useCallback(() => {
    if (!columns || !mutableOrgGroup) return undefined;
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
  }, [columns, dynamicOptions, mutableOrgGroup, values]);

  const renderDynamicColumnContents = useCallback(
    () =>
      Object.keys(orgColumnsGroupByGroup).map((key) => (
        <>
          {(key === "none"
            ? readable
            : readable &&
              targetRoles &&
              (targetRoles[key]?.includes("READ") ||
                targetRoles[key]?.includes("WRITE"))) && (
            <React.Fragment key={key}>
              {key !== "none" && (
                <Grid item xs={12}>
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
                  <Stack direction="column">
                    <Typography
                      className={clsx(classes.textTitle, "dynamicField")}
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      {wordLibrary?.[el.columnName] ?? el.columnName}
                      {el.isRequired ? (
                        <span style={{ color: "red" }}> *</span>
                      ) : (
                        ""
                      )}
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
                    </Typography>
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
                      label={`${el.columnName}(搜尋並按Enter)`}
                      options={dynamicOptions[el.columnId]}
                      format={(value) =>
                        parseDynamicColumnValue(el.columnType, value as string)
                      }
                      boldText
                      handleClickHistory={handleClickHistory}
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
                      uploadFile={mutableOrgGroup?.uploadFileList?.find(
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
        </>
      )),
    [
      classes.textTitle,
      deletable,
      dynamicOptions,
      handleClickHistory,
      handleSaveValue,
      mutableOrgGroup?.uploadFileList,
      orgColumnsGroupByGroup,
      readable,
      targetRoles,
      values,
      wordLibrary,
      writable,
      openCommentDialog,
    ]
  );

  return (
    <>
      {mutableOrgGroup && (
        <InfoHistoryDialog
          targetId={organizationGroupId}
          recordTarget={recordTarget}
        />
      )}
      <EditSection
        className={classes.headerEditSectionContainer}
        ref={contentRef}
      >
        <EditSectionHeader primary="資訊" />
        <Grid container spacing={2} position="relative">
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
      </EditSection>
      <OrgGroupContentDrawer
        isOpen={isOpenCommentDrawer}
        onClickAway={handleToggleCommentDrawer}
        contentRef={contentRef}
      />
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
        className={classes.menuIcon}
        onClick={handleToggleCommentDrawer}
      >
        <ListRoundedIcon />
      </Fab>
      <CommentDialog
        organizationId={organizationId}
        targetTable={Table.COLUMNS}
        targetId={commentTargetIdRef.current}
      />
    </>
  );
};

export default UserInfo;
