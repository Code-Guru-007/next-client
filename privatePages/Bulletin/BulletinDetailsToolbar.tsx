import React, {
  forwardRef,
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
} from "react";
import { useSelector } from "react-redux";
// @mui
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import { StackProps } from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { ColumnType } from "@eGroupAI/typings/apis";
// routes
import { RouterLink } from "minimal/routes/components";
// components
import Iconify from "minimal/components/iconify";
import CustomPopover, { usePopover } from "minimal/components/custom-popover";
import TagAutocompleteWithAction from "components/TagAutocompleteWithAction";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import PermissionValid from "components/PermissionValid";
import useOrgTagsByGroups from "utils/useOrgTagsByGroups";
import useOrgTagGroups from "utils/useOrgTagGroups";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import {
  Bulletin,
  OrganizationModuleShare,
  OrganizationTag,
} from "interfaces/entities";
import { ServiceModuleValue } from "interfaces/utils";
import apis from "utils/apis";

import { KeyedMutator } from "swr";
import { AxiosResponse } from "axios";
import { useResponsive } from "minimal/hooks/use-responsive";
import { Stack } from "@mui/material";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import InviteShareLinkDialog, {
  DIALOG as SHARE_LINK_DIALOG,
} from "components/InviteShareLinkDialog";

import { useSettingsContext } from "minimal/components/settings";
// ----------------------------------------------------------------------

export type RecordTarget = {
  key?: string;
  type?: ColumnType;
  name?: string;
  permission?: {
    readable?: boolean;
    writable?: boolean;
    deletable?: boolean;
  };
};

type Props = StackProps & {
  bulletin: Bulletin;
  editLink: string;
  publish: number;
  onChangePublish: (newValue: number) => void;
  onChangePinned: (newValue: number) => void;
  openReadsDialog: () => void;
  handleClickHistory: (r?: RecordTarget) => void;
  isLoading: boolean;
  publishOptions: {
    value: number;
    label: string;
  }[];
  onTagMutate?: KeyedMutator<AxiosResponse<Bulletin, any>>;
  permissions: { readable: boolean; writable: boolean; deletable: boolean };
};

export interface BulletinDetailsToolbarExposeRef {
  selectedTags: OrganizationTag[];
  options: OrganizationTag[];
  onAddTag: (payload: any) => Promise<void>;
  onRemoveTag: (payload: any) => Promise<void>;
  isTagCreating: boolean;
  isTagDeleting: boolean;
  isLoadingTagGroup: boolean;
}

const BulletinDetailsToolbar = forwardRef<
  BulletinDetailsToolbarExposeRef,
  Props
>((props, ref) => {
  const {
    bulletin,
    publish,
    editLink,
    publishOptions,
    onChangePublish,
    onChangePinned,
    openReadsDialog,
    handleClickHistory: handleClickHistoryProp,
    isLoading,
    sx,
    onTagMutate,
    permissions,
    ...other
  } = props;
  const wordLibrary = useSelector(getWordLibrary);

  const [selectedButton, setSelectedButton] = useState<"pin" | "publish">();
  const pinnedPopover = usePopover();
  const publishedPopover = usePopover();

  const downSm = useResponsive("down", "sm");
  const onlyXs = useResponsive("only", "xs");
  const settings = useSettingsContext();

  const locale = useSelector(getGlobalLocale);
  const organizationId = useSelector(getSelectedOrgId);

  const [bulletinTags, setBulletinTags] = useState<OrganizationTag[]>(
    bulletin.organizationTagTargetList?.map((el) => el.organizationTag) || []
  );

  const { openDialog: openShareLinkDialog } = useReduxDialog(SHARE_LINK_DIALOG);
  const [orgModuleShare, setOrgModuleShare] =
    useState<OrganizationModuleShare>();

  useEffect(() => {
    if (orgModuleShare) openShareLinkDialog();
  }, [openShareLinkDialog, orgModuleShare]);

  useEffect(() => {
    if (bulletin) {
      setBulletinTags(
        bulletin.organizationTagTargetList?.map((el) => el.organizationTag) ||
          []
      );
    }
  }, [bulletin]);

  const popup_labels = [
    `${wordLibrary?.["Publish Article"] ?? "發布文章"}`,
    `${wordLibrary?.draft ?? "草稿"}`,
    `${wordLibrary?.Published ?? "已發布"}`,
    `${wordLibrary?.Unpublished ?? "取消發布"}`,
  ];

  const { data, isValidating: isLoadingTagGroup } = useOrgTagGroups(
    {
      organizationId,
    },
    {
      locale,
      serviceModuleValue: ServiceModuleValue.BULLETIN,
    }
  );

  const tags = useOrgTagsByGroups(data?.source);

  const { excute: createOrgTargetTags, isLoading: isTagCreating } =
    useAxiosApiWrapper(apis.org.createOrgTargetTags, "Create");

  const { excute: createOrgModuleShare, isLoading: isCreatingShare } =
    useAxiosApiWrapper(apis.org.createOrgModuleShare, "None");

  const handleCreateOrgShare = () => {
    createOrgModuleShare({
      organizationId,
      organizationShareTargetType: ServiceModuleValue.BULLETIN,
      targetId: bulletin?.bulletinId,
      isSharePasswordRequired: "NO",
    })
      .then((res) => {
        setOrgModuleShare(res.data);
      })
      .catch(() => {});
  };

  const { excute: deleteOrgTargetTag, isLoading: isTagDeleting } =
    useAxiosApiWrapper(apis.org.deleteOrgTargetTag, "Delete");

  const handleAddBulletinTag = (payload) => {
    const { organizationTagList } = payload;
    return createOrgTargetTags({
      organizationId,
      targetId: bulletin?.bulletinId || "",
      organizationTagList: [...organizationTagList],
    }).then(() => {
      if (onTagMutate) onTagMutate();
    });
  };

  const handleDeleteBulletinTag = (payload) => {
    const { organizationId, tagId } = payload;
    return deleteOrgTargetTag({
      organizationId,
      tagId,
      targetId: bulletin?.bulletinId || "",
    }).then(() => {
      if (onTagMutate) onTagMutate();
    });
  };

  const handleClickHistory = useCallback(
    (e) => {
      e.stopPropagation();
      if (handleClickHistoryProp)
        handleClickHistoryProp({ key: "bulletin", type: ColumnType.TEXT });
    },
    [handleClickHistoryProp]
  );

  // Expose a selected file and upload method to the ref from parent
  useImperativeHandle(ref, () => ({
    selectedTags: bulletinTags,
    options: tags || [],
    onAddTag: handleAddBulletinTag,
    onRemoveTag: handleDeleteBulletinTag,
    isTagCreating,
    isTagDeleting,
    isLoadingTagGroup,
  }));

  return (
    <>
      {!downSm && (
        <Box
          spacing={1}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: { xs: 2, md: 4 },
            mt: 3,
            ...sx,
          }}
          {...other}
        >
          <TagAutocompleteWithAction
            targetId={bulletin.creator.loginId}
            writable={permissions.writable}
            deletable={permissions.deletable}
            isToolbar
            selectedTags={bulletinTags}
            options={tags || []}
            onAddTag={handleAddBulletinTag}
            onRemoveTag={handleDeleteBulletinTag}
            isLoading={isTagCreating || isTagDeleting || isLoadingTagGroup}
          />

          {/* <Box sx={{ flexGrow: 1 }} /> */}
          <Box
            sx={{
              display: "inline-flex",
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <PermissionValid modulePermissions={["SHARE"]}>
                <Tooltip title={wordLibrary?.share ?? "分享"}>
                  {!isCreatingShare ? (
                    <IconButton
                      component="button"
                      onClick={handleCreateOrgShare}
                      id="create-share-btn"
                      data-tid="create-share-btn"
                    >
                      <Iconify icon="material-symbols:share" />
                    </IconButton>
                  ) : (
                    <CircularProgress color="inherit" size={16} />
                  )}
                </Tooltip>
              </PermissionValid>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Box sx={{ fontSize: "13px", paddingRight: "2px" }}>
                  {bulletin.readCount}
                </Box>
                <Tooltip title={wordLibrary?.["viewing history"] ?? "觀看紀錄"}>
                  <IconButton
                    component="label"
                    onClick={openReadsDialog}
                    id="bulletin-view-history-btn"
                    data-tid="bulletin-view-history-btn"
                  >
                    <Iconify icon="ic:round-remove-red-eye" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Tooltip title={wordLibrary?.["history view"] ?? "歷史紀錄"}>
                <IconButton
                  component="label"
                  onClick={handleClickHistory}
                  id="bulletin-history-record-btn"
                  data-tid="bulletin-history-record-btn"
                >
                  <Iconify icon="mdi:history" />
                </IconButton>
              </Tooltip>

              {permissions.writable && (
                <Tooltip title={wordLibrary?.edit ?? "編輯"}>
                  <IconButton
                    component={RouterLink}
                    href={editLink}
                    onClick={() => {
                      settings.onUpdate("themeLayout", "mini");
                    }}
                    id="bulletin-edit-btn"
                    data-tid="bulletin-edit-btn"
                  >
                    <Iconify icon="solar:pen-bold" />
                  </IconButton>
                </Tooltip>
              )}
              {bulletin.isPinned === 1 ? (
                <Tooltip title={wordLibrary?.unpin ?? "取消釘選"}>
                  <IconButton onClick={() => onChangePinned(0)}>
                    <Iconify
                      icon="fluent-mdl2:pinned-solid"
                      sx={{ color: "#23c55d" }}
                    />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title={wordLibrary?.pin ?? "釘選佈告欄"}>
                  <IconButton onClick={() => onChangePinned(1)}>
                    <Iconify icon="fluent-mdl2:pinned" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <Stack direction="row" spacing={0.5}>
              <LoadingButton
                color="inherit"
                variant="contained"
                loading={isLoading && selectedButton === "publish"}
                endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                onClick={publishedPopover.onOpen}
                sx={{
                  textTransform: "capitalize",
                  textWrap: "noWrap",
                }}
                id="bulletin-publish-btn"
                data-tid="bulletin-publish-btn"
              >
                {publish === 1
                  ? `${wordLibrary?.published ?? "已發布"}`
                  : `${wordLibrary?.draft ?? "未發布"}`}
              </LoadingButton>
            </Stack>
          </Box>
        </Box>
      )}

      {downSm && (
        <>
          <Stack spacing={1} sx={{ mt: 3 }}>
            <TagAutocompleteWithAction
              targetId={bulletin.creator.loginId}
              writable={permissions.writable}
              deletable={permissions.deletable}
              isToolbar
              selectedTags={bulletinTags}
              options={tags || []}
              onAddTag={handleAddBulletinTag}
              onRemoveTag={handleDeleteBulletinTag}
              isLoading={isTagCreating || isTagDeleting || isLoadingTagGroup}
            />
          </Stack>
          <Stack
            spacing={1}
            direction="row"
            sx={{
              mb: 4,
              mt: 3,
              marginLeft: onlyXs ? "-30px" : "",
              ...sx,
            }}
            {...other}
          >
            <Box sx={{ flexGrow: 1 }} />

            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <PermissionValid modulePermissions={["SHARE"]}>
                <Tooltip title={wordLibrary?.share ?? "分享"}>
                  {!isCreatingShare ? (
                    <IconButton
                      component="button"
                      onClick={handleCreateOrgShare}
                      id="create-share-btn"
                      data-tid="create-share-btn"
                    >
                      <Iconify icon="material-symbols:share" />
                    </IconButton>
                  ) : (
                    <CircularProgress color="inherit" size={16} />
                  )}
                </Tooltip>
              </PermissionValid>
              <Box sx={{ fontSize: "13px", paddingRight: "2px" }}>
                {bulletin.readCount}
              </Box>
              {permissions.readable && (
                <Tooltip title={wordLibrary?.["viewing history"] ?? "觀看紀錄"}>
                  <IconButton
                    component="label"
                    onClick={openReadsDialog}
                    id="bulletin-view-history-btn"
                    data-tid="bulletin-view-history-btn"
                  >
                    <Iconify icon="ic:round-remove-red-eye" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            <Tooltip title={wordLibrary?.["history view"] ?? "歷史紀錄"}>
              <IconButton
                component="label"
                onClick={handleClickHistory}
                id="bulletin-history-record-btn"
                data-tid="bulletin-history-record-btn"
              >
                <Iconify icon="mdi:history" />
              </IconButton>
            </Tooltip>

            {permissions.writable && (
              <Tooltip title={wordLibrary?.edit ?? "編輯"}>
                <IconButton component={RouterLink} href={editLink}>
                  <Iconify icon="solar:pen-bold" />
                </IconButton>
              </Tooltip>
            )}
            <Stack direction="row" spacing={0.5}>
              <LoadingButton
                color="inherit"
                variant="contained"
                loading={isLoading && selectedButton === "pin"}
                endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                onClick={pinnedPopover.onOpen}
                sx={{
                  textTransform: "capitalize",
                  padding: onlyXs ? "2px" : "",
                  textWrap: onlyXs ? "unset" : "noWrap",
                }}
                id="bulletin-menu-pin-popover-btn"
                data-tid="bulletin-menu-pin-popover-btn"
              >
                {bulletin.isPinned === 1
                  ? `${wordLibrary?.pinned ?? "已釘選"}`
                  : `${wordLibrary?.unPinned ?? "未釘選"}`}
              </LoadingButton>
              <LoadingButton
                color="inherit"
                variant="contained"
                loading={isLoading && selectedButton === "publish"}
                endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                onClick={publishedPopover.onOpen}
                sx={{
                  textTransform: "capitalize",
                  padding: onlyXs ? "2px" : "",
                  textWrap: onlyXs ? "unset" : "noWrap",
                }}
                id="bulletin-menu-publish-popover-button"
                data-tid="bulletin-menu-publish-popover-button"
              >
                {publish === 1
                  ? `${wordLibrary?.published ?? "已發布"}`
                  : `${wordLibrary?.draft ?? "未發布"}`}
              </LoadingButton>
            </Stack>
          </Stack>
        </>
      )}

      <CustomPopover
        open={publishedPopover.open}
        onClose={publishedPopover.onClose}
        arrow="top-right"
        sx={{ width: 140 }}
      >
        {publishOptions.map((option, index) => (
          <MenuItem
            key={option.value}
            selected={option.value === publish}
            onClick={() => {
              publishedPopover.onClose();
              setSelectedButton("publish");
              if (publish !== option.value) onChangePublish(option.value);
            }}
            disabled={!permissions.writable}
            id={`bulletin-publish-menu-${index}`}
            data-tid={`bulletin-publish-menu-${index}`}
          >
            {option.value === 1 && (
              <Iconify icon="eva:cloud-upload-fill" sx={{ mr: 1 }} />
            )}
            {option.value === 0 && (
              <Iconify icon="solar:file-text-bold" sx={{ mr: 1 }} />
            )}
            {popup_labels[publish * 2 + index]}
          </MenuItem>
        ))}
      </CustomPopover>
      {orgModuleShare && (
        <InviteShareLinkDialog
          serviceModuleValue={ServiceModuleValue.BULLETIN}
          targetId={bulletin?.bulletinId || ""}
          orgModuleShare={orgModuleShare}
        />
      )}
    </>
  );
});

export default BulletinDetailsToolbar;
