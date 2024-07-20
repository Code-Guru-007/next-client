import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useSelector } from "react-redux";
// @mui
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import { StackProps } from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { ColumnType } from "@eGroupAI/typings/apis";
// routes
import { RouterLink } from "minimal/routes/components";
// components
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { Stack } from "@mui/material";
import { AxiosResponse } from "axios";
import InviteShareLinkDialog, {
  DIALOG as SHARE_LINK_DIALOG,
} from "components/InviteShareLinkDialog";
import PermissionValid from "components/PermissionValid";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import TagAutocompleteWithAction from "components/TagAutocompleteWithAction";
import {
  OrganizationArticle,
  OrganizationModuleShare,
  OrganizationTag,
} from "interfaces/entities";
import { ServiceModuleValue } from "interfaces/utils";
import CustomPopover, { usePopover } from "minimal/components/custom-popover";
import Iconify from "minimal/components/iconify";
import { useSettingsContext } from "minimal/components/settings";
import { useResponsive } from "minimal/hooks/use-responsive";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { KeyedMutator } from "swr";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useOrgTagGroups from "utils/useOrgTagGroups";
import useOrgTagsByGroups from "utils/useOrgTagsByGroups";
import Link from "@mui/material/Link";
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
  permissions: { readable: boolean; writable: boolean; deletable: boolean };
  article: OrganizationArticle;
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
  onTagMutate?: KeyedMutator<AxiosResponse<OrganizationArticle, any>>;
};

export interface ArticleDetailsToolbarExposeRef {
  selectedTags: OrganizationTag[];
  options: OrganizationTag[];
  onAddTag: (payload: any) => Promise<void>;
  onRemoveTag: (payload: any) => Promise<void>;
  isTagCreating: boolean;
  isTagDeleting: boolean;
  isLoadingTagGroup: boolean;
}

const ArticleDetailsToolbar = forwardRef<ArticleDetailsToolbarExposeRef, Props>(
  (props, ref) => {
    const {
      permissions,
      article,
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
      ...other
    } = props;
    const wordLibrary = useSelector(getWordLibrary);

    const POST_PIN_OPTIONS = [
      {
        value: 1,
        label: wordLibrary?.pinned ?? "已釘選",
      },
      {
        value: 0,
        label: wordLibrary?.unPinned ?? "未釘選",
      },
    ];

    const [selectedButton, setSelectedButton] = useState<"pin" | "publish">();
    const pinnedPopover = usePopover();
    const publishedPopover = usePopover();
    const { openDialog: openShareLinkDialog } =
      useReduxDialog(SHARE_LINK_DIALOG);
    const [orgModuleShare, setOrgModuleShare] =
      useState<OrganizationModuleShare>();

    useEffect(() => {
      if (orgModuleShare) openShareLinkDialog();
    }, [openShareLinkDialog, orgModuleShare]);

    useEffect(() => {
      if (article) {
        setArticleTags(
          article.organizationTagTargetList?.map((el) => el.organizationTag) ||
            []
        );
      }
    }, [article]);

    const locale = useSelector(getGlobalLocale);
    const organizationId = useSelector(getSelectedOrgId);
    const downSm = useResponsive("down", "sm");
    const onlyXs = useResponsive("only", "xs");

    const settings = useSettingsContext();

    const [articleTags, setArticleTags] = useState<OrganizationTag[]>(
      article.organizationTagTargetList?.map((el) => el.organizationTag) || []
    );

    const popup_labels = [
      `${wordLibrary?.["Publish Article"] ?? "發布文章"}`,
      `${wordLibrary?.draft ?? "草稿"}`,
      `${wordLibrary?.Published ?? "已發布"}`,
      `${wordLibrary?.Unpublished ?? "取消發布"}`,
    ];
    useEffect(() => {
      if (article) {
        setArticleTags(
          article.organizationTagTargetList?.map((el) => el.organizationTag) ||
            []
        );
      }
    }, [article]);

    const { data, isValidating: isLoadingTagGroup } = useOrgTagGroups(
      {
        organizationId,
      },
      {
        locale,
        serviceModuleValue: ServiceModuleValue.ARTICLE,
      }
    );

    const tags = useOrgTagsByGroups(data?.source);

    const { excute: createOrgTargetTags, isLoading: isTagCreating } =
      useAxiosApiWrapper(apis.org.createOrgTargetTags, "Create");

    const { excute: deleteOrgTargetTag, isLoading: isTagDeleting } =
      useAxiosApiWrapper(apis.org.deleteOrgTargetTag, "Delete");

    const handleTagAdded = async (payload) => {
      const { organizationTagList } = payload;
      createOrgTargetTags({
        organizationId,
        targetId: article?.articleId || "",
        organizationTagList: [...organizationTagList],
      })
        .then(() => {
          if (onTagMutate) onTagMutate();
        })
        .catch(() => {});
    };

    const handleTagDeleted = async (payload) => {
      const { organizationId, tagId } = payload;
      return deleteOrgTargetTag({
        organizationId,
        tagId,
        targetId: article?.articleId || "",
      }).then(() => {
        if (onTagMutate) onTagMutate();
      });
    };

    const handleClickHistory = useCallback(
      (e) => {
        e.stopPropagation();
        if (handleClickHistoryProp)
          handleClickHistoryProp({
            key: "articleTitle",
            type: ColumnType.TEXT,
          });
      },
      [handleClickHistoryProp]
    );

    const { excute: createOrgModuleShare, isLoading: isCreatingShare } =
      useAxiosApiWrapper(apis.org.createOrgModuleShare, "None");

    const handleCreateOrgShare = () => {
      createOrgModuleShare({
        organizationId,
        organizationShareTargetType: ServiceModuleValue.ARTICLE,
        targetId: article?.articleId,
        isSharePasswordRequired: "NO",
      })
        .then((res) => {
          setOrgModuleShare(res.data);
        })
        .catch(() => {});
    };

    // Expose a selected file and upload method to the ref from parent
    useImperativeHandle(ref, () => ({
      selectedTags: articleTags,
      options: tags || [],
      onAddTag: handleTagAdded,
      onRemoveTag: handleTagDeleted,
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
              targetId={article.creator.loginId}
              writable={permissions.writable}
              deletable={permissions.deletable}
              isToolbar
              selectedTags={articleTags}
              options={tags || []}
              onAddTag={handleTagAdded}
              onRemoveTag={handleTagDeleted}
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
                          id="article-share-btn"
                          data-tid="article-share-btn"
                        >
                          <Iconify icon="material-symbols:share" />
                        </IconButton>
                      ) : (
                        <CircularProgress color="inherit" size={16} />
                      )}
                    </Tooltip>
                  </PermissionValid>

                  <Box sx={{ fontSize: "13px", paddingRight: "2px" }}>
                    {article.readCount}
                  </Box>
                  <Tooltip
                    title={wordLibrary?.["viewing history"] ?? "觀看紀錄"}
                  >
                    <IconButton
                      component="label"
                      onClick={openReadsDialog}
                      id="dialog-open-read-btn"
                      data-tid="dialog-open-read-btn"
                    >
                      <Iconify icon="ic:round-remove-red-eye" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Tooltip title={wordLibrary?.["history record"] ?? "歷史紀錄"}>
                  <IconButton
                    component="label"
                    onClick={handleClickHistory}
                    id="dialog-open-history-btn"
                    data-tid="dialog-open-history-btn"
                  >
                    <Iconify icon="mdi:history" />
                  </IconButton>
                </Tooltip>

                {permissions.writable && (
                  <Tooltip title={wordLibrary?.edit ?? "編輯"}>
                    <Link
                      component={RouterLink}
                      href={editLink}
                      underline="none"
                    >
                      <IconButton
                        onClick={() => {
                          settings.onUpdate("themeLayout", "mini");
                        }}
                        id="link-edit-btn"
                        data-tid="link-edit-btn"
                      >
                        <Iconify icon="solar:pen-bold" />
                      </IconButton>
                    </Link>
                  </Tooltip>
                )}
                {article.isPinned === 1 ? (
                  <Tooltip title={wordLibrary?.unpinned ?? "取消釘選"}>
                    <IconButton onClick={() => onChangePinned(0)}>
                      <Iconify
                        icon="fluent-mdl2:pinned-solid"
                        sx={{ color: "#23c55d" }}
                      />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title={wordLibrary?.pin ?? "釘選文章"}>
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
                  id="menu-published-popover-button"
                  data-tid="menu-published-popover-button"
                  sx={{
                    textTransform: "capitalize",
                    textWrap: "noWrap",
                  }}
                >
                  {publish === 1
                    ? `${wordLibrary?.published ?? "已發布"}`
                    : `${wordLibrary?.draft ?? "草稿"}`}
                </LoadingButton>
              </Stack>
            </Box>
          </Box>
        )}

        {downSm && (
          <>
            <Stack spacing={1} sx={{ mt: 3 }}>
              <TagAutocompleteWithAction
                targetId={article.creator.loginId}
                writable={permissions.writable}
                deletable={permissions.deletable}
                isToolbar
                selectedTags={articleTags}
                options={tags || []}
                onAddTag={handleTagAdded}
                onRemoveTag={handleTagDeleted}
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
                        id="create-org-share-downSm-btn"
                        data-tid="create-org-share-downSm-btn"
                      >
                        <Iconify icon="material-symbols:share" />
                      </IconButton>
                    ) : (
                      <CircularProgress color="inherit" size={16} />
                    )}
                  </Tooltip>
                </PermissionValid>
                <Box sx={{ fontSize: "13px", paddingRight: "2px" }}>
                  {article.readCount}
                </Box>
                {permissions.readable && (
                  <Tooltip
                    title={wordLibrary?.["viewing history"] ?? "觀看紀錄"}
                  >
                    <IconButton
                      component="label"
                      onClick={openReadsDialog}
                      id="dialog-open-read-downSm-btn"
                      data-tid="dialog-open-read-downSm-btn"
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
                  id="dialog-open-history-downSm-btn"
                  data-tid="dialog-open-history-downSm-btn"
                >
                  <Iconify icon="mdi:history" />
                </IconButton>
              </Tooltip>

              {permissions.writable && (
                <Tooltip title={wordLibrary?.edit ?? "編輯"}>
                  <Link component={RouterLink} href={editLink} underline="none">
                    <IconButton
                      id="link-edit-downSm-btn"
                      data-tid="link-edit-downSm-btn"
                    >
                      <Iconify icon="solar:pen-bold" />
                    </IconButton>
                  </Link>
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
                >
                  {article.isPinned === 1
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
          open={pinnedPopover.open}
          onClose={pinnedPopover.onClose}
          arrow="top-right"
          sx={{ width: 140 }}
        >
          {POST_PIN_OPTIONS.map((option, index) => (
            <MenuItem
              key={option.value}
              selected={option.value === article.isPinned}
              id={`article-pin-menu-${index}`}
              data-tid={`article-pin-menu-${index}`}
              onClick={() => {
                pinnedPopover.onClose();
                setSelectedButton("pin");
                onChangePinned(option.value);
              }}
              disabled={!permissions.writable}
            >
              {option.value === 1 && article.isPinned === 0 && (
                <Iconify icon="fluent-mdl2:pinned" sx={{ mr: 1 }} />
              )}
              {option.value === 1 && article.isPinned === 1 && (
                <Iconify
                  icon="fluent-mdl2:pinned-solid"
                  sx={{ mr: 1, color: "#23c55d" }}
                />
              )}
              {option.value === 0 && (
                <Iconify icon="fluent-mdl2:unpin" sx={{ mr: 1 }} />
              )}

              {option.label}
            </MenuItem>
          ))}
        </CustomPopover>
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
              id={`article-publish-menu-${index}`}
              data-tid={`article-publish-menu-${index}`}
              onClick={() => {
                publishedPopover.onClose();
                setSelectedButton("publish");
                if (publish !== option.value) onChangePublish(option.value);
              }}
              disabled={!permissions.writable}
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
            serviceModuleValue={ServiceModuleValue.ARTICLE}
            targetId={article?.articleId || ""}
            orgModuleShare={orgModuleShare}
          />
        )}
      </>
    );
  }
);

export default ArticleDetailsToolbar;
