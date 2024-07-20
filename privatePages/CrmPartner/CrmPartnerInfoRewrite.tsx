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
import Stack from "@mui/material/Stack";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import { useSelector } from "react-redux";
import { OrganizationColumn, OrganizationPartner } from "interfaces/entities";
import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";
import ColumnDescription from "components/ColumnDescription";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import useOrgPartner from "utils/useOrgPartner";
import useStaticColumns from "utils/useStaticColumns";
import parseDynamicColumnValue from "utils/parseDynamicColumnValue";

import Fab from "@eGroupAI/material/Fab";
import Grid from "@eGroupAI/material/Grid";
import Popover from "@eGroupAI/material/Popover";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CircularProgress from "@mui/material/CircularProgress";
import MapsUgcOutlinedIcon from "@mui/icons-material/MapsUgcOutlined";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ListRoundedIcon from "@mui/icons-material/ListRounded";
import EditSection from "components/EditSection";
import EditSectionHeader from "components/EditSectionHeader";
import { makeStyles } from "@mui/styles";
import DynamicFieldWithAction from "components/DynamicField/DynamicFieldWithAction";

import clsx from "clsx";

import { UpdateOrgPartnerApiPayload } from "interfaces/payloads";
import useUpdatePartnerApiPayload from "utils/useUpdatePartnerApiPayload";
import useOrgDynamicColumns from "utils/useOrgDynamicColumns";
import TagAutocompleteWithAction from "components/TagAutocompleteWithAction";
import useOrgTagsByGroups from "utils/useOrgTagsByGroups";
import useOrgTagGroups from "utils/useOrgTagGroups";
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
import InfiniteScroll from "react-infinite-scroll-component";
import CrmPartnerTagDrawer from "./CrmPartnerTagDrawer";
import CrmPartnerContentDrawer from "./CrmPartnerContentDrawer";

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
};
export interface TabDataItem {
  label: string;
  value: string;
}

export interface CrmPartnerInfoProps {
  orgPartner?: OrganizationPartner;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
  noInfiniteScroll?: boolean;
  tabValue?: string;
  tabData?: TabDataItem[];
  isOpenDrawer?: boolean;
  setIsOpenDrawer?: (isOpen: boolean) => void;
}

const CrmPartnerInfo: FC<CrmPartnerInfoProps> = function (props) {
  const {
    orgPartner,
    readable = false,
    writable = false,
    deletable = false,
    noInfiniteScroll = true,
    tabValue,
    tabData,
    isOpenDrawer = false,
    setIsOpenDrawer,
  } = props;
  const [mutableOrgPartner, setMutableOrgPartner] = useState<
    OrganizationPartner | undefined
  >(orgPartner);
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

  const [isOpenTagDrawer, setIsOpenTagDrawer] = useState<boolean>(false);
  const [isOpenCommentDrawer, setIsOpenCommentDrawer] =
    useState<boolean>(isOpenDrawer);

  const theme = useTheme();
  const isDownSm = useMediaQuery(theme.breakpoints.down("sm"));
  const isDownMd = useMediaQuery(theme.breakpoints.down("md"));
  const isDownLg = useMediaQuery(theme.breakpoints.down("lg"));

  const classes = useStyles();
  const settings = useSettingsContext();
  const router = useRouter();
  const organizationPartnerId = router.query.partnerId as string;
  const contentRef = useRef<HTMLDivElement>(null);
  const rtl = settings.themeDirection === "rtl";
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  const [hasMore, setHasMore] = useState<boolean>(!noInfiniteScroll);
  const [scrollIndex, setScrollIndex] = useState<number>(1);

  const wordLibrary = useSelector(getWordLibrary);
  const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);

  const { excute: createOrgTargetTags, isLoading: isTagCreating } =
    useAxiosApiWrapper(apis.org.createOrgTargetTags, "Create");
  const { excute: deleteOrgTargetTag, isLoading } = useAxiosApiWrapper(
    apis.org.deleteOrgTargetTag,
    "Delete"
  );

  const { data: updatedOrgPartner, isValidating } = useOrgPartner(
    {
      organizationId,
      organizationPartnerId,
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
      serviceModuleValue: ServiceModuleValue.CRM_PARTNER,
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

  useEffect(() => {
    setMutableOrgPartner(updatedOrgPartner);
  }, [updatedOrgPartner]);

  const columns = useStaticColumns(Table.PARTNERS, "isEdit", organizationId);

  const { data: orgColumns } = useOrgDynamicColumns(
    {
      organizationId,
    },
    {
      columnTable: "ORGANIZATION_PARTNER",
    }
  );

  const getUpdatePayload = useUpdatePartnerApiPayload(
    mutableOrgPartner?.dynamicColumnTargetList,
    orgColumns?.source
  );

  const [dynamicOptions, setDynamicOptions] = useState<{
    [name: string]: OptionType[] | undefined;
  }>({});

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
    [orgColumns]
  );

  const columnsToRender = useMemo(() => {
    const result: OrganizationColumn[] = [];
    Object.keys(orgColumnsGroupByGroup).forEach((key) =>
      orgColumnsGroupByGroup[key].forEach((column) => result.push(column))
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

  const { excute: updateOrgPartner } = useAxiosApiWrapper(
    apis.org.updateOrgPartner,
    "Update"
  );

  const matchMutate = useSwrMatchMutate();

  const { data } = useOrgTagGroups(
    {
      organizationId,
    },
    {
      locale,
      serviceModuleValue: ServiceModuleValue.CRM_PARTNER,
    }
  );
  const tags = useOrgTagsByGroups(data?.source);

  const handleTagAdded = async (p) => {
    createOrgTargetTags(p)
      .then(() => {
        matchMutate(
          new RegExp(
            `^/organizations/${organizationId}/partners/${mutableOrgPartner?.organizationPartnerId}\\?`,
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
            `^/organizations/${organizationId}/partners/${mutableOrgPartner?.organizationPartnerId}\\?`,
            "g"
          )
        );
      })
      .catch(() => {});
  };

  const defaultValues = useMemo(() => {
    if (!mutableOrgPartner) return {};
    const dynamics = mutableOrgPartner.dynamicColumnTargetList?.reduce(
      (a, b) => {
        const uploadFileName = mutableOrgPartner.uploadFileList?.find(
          (el) => el.uploadFileId === b.columnTargetValue
        )?.uploadFileName;
        return {
          ...a,
          [b.organizationColumn.columnId]: { ...b, uploadFileName },
        };
      },
      {}
    );
    return {
      organizationPartnerNameZh:
        mutableOrgPartner.organizationPartnerNameZh || "",
      organizationPartnerNameEn:
        mutableOrgPartner.organizationPartnerNameEn || "",
      organizationPartnerAddress:
        mutableOrgPartner.organizationPartnerAddress || "",
      organizationPartnerWebsite:
        mutableOrgPartner.organizationPartnerWebsite || "",
      organizationPartnerInvoiceTaxIdNumber:
        mutableOrgPartner.organizationPartnerInvoiceTaxIdNumber || "",
      organizationPartnerTelephone:
        mutableOrgPartner.organizationPartnerTelephone || "",
      organizationPartnerFax: mutableOrgPartner.organizationPartnerFax || "",
      organizationPartnerArea: mutableOrgPartner.organizationPartnerArea || "",
      organizationPartnerCity: mutableOrgPartner.organizationPartnerCity || "",
      organizationPartnerCountry:
        mutableOrgPartner.organizationPartnerCountry || "",
      organizationPartnerZIPCode:
        mutableOrgPartner.organizationPartnerZIPCode || "",
      ...dynamics,
    };
  }, [mutableOrgPartner]);

  const [values, setValues] = useState(defaultValues);

  useEffect(() => {
    setValues(defaultValues);
  }, [defaultValues]);

  const handleClickHistory = (r?: RecordTarget) => {
    if (r) {
      setRecordTarget(r);
      openHistoryDialog();
    }
  };

  const handleSaveValue = useCallback(
    (name, newValue, remarkValues) => {
      let payload: Omit<
        UpdateOrgPartnerApiPayload,
        "organizationId" | "organizationPartnerId"
      >;
      if (mutableOrgPartner) {
        payload = getUpdatePayload(
          { [name]: newValue.value },
          defaultValues,
          {
            [name]: remarkValues,
          },
          mutableOrgPartner.organizationPartnerId
        );
      } else {
        payload = getUpdatePayload({ [name]: newValue.value }, defaultValues, {
          [name]: remarkValues,
        });
      }

      if (mutableOrgPartner) {
        return updateOrgPartner({
          organizationId,
          organizationPartnerId: mutableOrgPartner.organizationPartnerId,
          ...payload,
        })
          .then(() => {
            matchMutate(
              new RegExp(
                `^/organizations/${organizationId}/partners/${mutableOrgPartner.organizationPartnerId}\\?`,
                "g"
              )
            );
            setValues((prev) => ({
              ...prev,
              [name]: newValue.value,
            }));
            return "success";
          })
          .catch((err) => {
            apis.tools.createLog({
              function: "updateOrgPartner: error",
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
      mutableOrgPartner,
      getUpdatePayload,
      defaultValues,
      updateOrgPartner,
      organizationId,
      matchMutate,
    ]
  );

  const renderContent = useCallback(() => {
    if (!columns || !mutableOrgPartner) return undefined;
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
              values[el.sortKey as string]?.columnTargetValueRemarkList
            }
            name={el.sortKey as string}
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, no-underscore-dangle
            columnType={el.columnType!}
            options={dynamicOptions[el.sortKey as string]}
            format={el.format}
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
  }, [columns, dynamicOptions, mutableOrgPartner, values]);

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

  return (
    <>
      {mutableOrgPartner && (
        <InfoHistoryDialog
          targetId={mutableOrgPartner.organizationPartnerId}
          recordTarget={recordTarget}
        />
      )}
      <EditSection
        sx={{ marginBottom: 2 }}
        className={classes.editSectionContainer}
      >
        {mutableOrgPartner && (
          <TagAutocompleteWithAction
            targetId={mutableOrgPartner.organizationPartnerId}
            selectedTags={
              mutableOrgPartner.organizationTagTargetList?.map(
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
      <EditSection className={classes.headerEditSectionContainer}>
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
            {renderContent()}
            {Object.keys(orgColumnsGroupByGroup).map((key) => (
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
                            orgColumnsGroupByGroup[key][0]
                              .organizationColumnGroup?.columnGroupName
                          }
                          dataGroupId={key}
                        />
                      </Grid>
                    )}
                    {orgColumnsGroupByGroup[key]?.map((el) => (
                      <Grid item xs={12} key={el.columnId}>
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
                            {wordLibrary?.[el.columnName] ?? el.columnName}
                            {el.isEditFix === 1 ? (
                              <span style={{ color: "red" }}> *</span>
                            ) : undefined}
                            {el?.isCommentEnabled ? (
                              <IconButton
                                aria-label="help"
                                sx={{ color: "#637381" }}
                                onClick={() => {
                                  commentTargetIdRef.current = el?.columnId;
                                  openCommentDialog();
                                }}
                              >
                                <MapsUgcOutlinedIcon
                                  sx={{ fontSize: "18px" }}
                                />
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
                            label={el.columnName}
                            options={dynamicOptions[el.columnId]}
                            format={(value) =>
                              parseDynamicColumnValue(
                                el.columnType,
                                value as string
                              )
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
                            editorTemplateContent={
                              el.columnEditorTemplateContent
                            }
                            hasValidator={el.hasValidator === 1}
                            validator={el.columnValidatorRegex}
                            hasRemark={el.hasValueRemark === 1}
                            requiredRemark={el.isRequiredValueRemark === 1}
                            numberUnit={el.columnNumberUnit}
                            numberDecimal={el.columnNumberOfDecimal}
                            remarkList={
                              values[el.columnId]
                                ? values[el.columnId]
                                    .columnTargetValueRemarkList
                                : []
                            }
                            uploadFile={mutableOrgPartner?.uploadFileList?.find(
                              (li) =>
                                li.uploadFileId ===
                                values[el.columnId]?.columnTargetValue
                            )}
                            required={el.isRequired === 1}
                            isUniqueValue={el.isUniqueValue}
                            minOptionBeSelected={el.minOptionBeSelected}
                            maxOptionBeSelected={el.maxOptionBeSelected}
                          />
                        </Stack>
                      </Grid>
                    ))}
                  </React.Fragment>
                )}
              </>
            ))}
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
              <ColumnDescription
                descr={descr}
                handleClose={handlePopoverClose}
              />
            </Popover>
          </Grid>
          <CommentDialog
            organizationId={organizationId}
            targetTable={Table.COLUMNS}
            targetId={commentTargetIdRef.current}
          />
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
      <CrmPartnerTagDrawer
        isOpen={isOpenTagDrawer}
        onClickAway={handleCloseTagDrawer}
      >
        <EditSection className={classes.editSectionContainer}>
          {mutableOrgPartner && (
            <TagAutocompleteWithAction
              targetId={organizationPartnerId}
              selectedTags={
                mutableOrgPartner.organizationTagTargetList?.map(
                  (el) => el.organizationTag
                ) || []
              }
              options={tags || []}
              writable={writable}
              deletable={deletable}
              onAddTag={handleTagAdded}
              onRemoveTag={handleTagDeleted}
              isLoading={isLoading || isTagCreating || isValidating}
              isToolbar
              isDrawer
            />
          )}
        </EditSection>
      </CrmPartnerTagDrawer>
      <CrmPartnerContentDrawer
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
    </>
  );
};

export default CrmPartnerInfo;
