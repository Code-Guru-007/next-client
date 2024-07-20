import React, { FC, useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useRouter } from "next/router";

import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import ListRoundedIcon from "@mui/icons-material/ListRounded";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";
import { makeStyles } from "@mui/styles";
import { Divider, Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Fab from "@eGroupAI/material/Fab";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";

import { useSettingsContext } from "minimal/components/settings";
import { useResponsive } from "minimal/hooks/use-responsive";

import FroalaEditorView from "components/FroalaEditorView";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import TagDrawer from "components/TagDrawer";
import EditSection from "components/EditSection";
import TagAutocompleteWithAction from "components/TagAutocompleteWithAction";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo";

import Iconify from "minimal/components/iconify";

import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useBulletin from "utils/Bulletin/useBulletin";
import clsx from "clsx";

import { Table } from "interfaces/utils";
import useTargetComments from "utils/useTargetComments";

import TargetCommentForm from "components/TargetComment/TargetCommentForm";
import TargetCommentList from "components/TargetComment/TargetCommentList";

import TargetHistoryRecordDialog, {
  DIALOG as HISTORY_RECORD_DIALOG,
  RecordTarget,
} from "components/TargetHistoryRecordDialog";
import { TabDataItem } from "components/ResponsiveTabs";

import BulletinReadsDialog, {
  DIALOG as READS_DIALOG,
} from "./BulletinReadsDialog";

import BulletinDetailsToolbar, {
  BulletinDetailsToolbarExposeRef,
} from "./BulletinDetailsToolbar";
import BulletinContentDrawer from "./BulletinContentDrawer";

const useStyles = makeStyles(() => ({
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
  tagIcon: {
    position: "fixed",
    bottom: 230,
  },
  editSectionContainer: {
    borderRadius: 0,
    boxShadow: "none",
    marginBottom: 0,
    borderBottom: "1px solid #EEEEEE",
    zIndex: 1000,
  },
  right: {
    right: 20,
  },
  left: {
    left: 20,
  },
}));

export interface BulletinInfoProps {
  bulletinId: string;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
  tabValue?: string;
  tabData?: TabDataItem[];
}

const BulletinInfo: FC<BulletinInfoProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const smUp = useResponsive("up", "sm");
  const mdUp = useResponsive("up", "md");

  const POST_PUBLISH_OPTIONS = [
    {
      value: 1,
      label: wordLibrary?.published ?? "已發布",
    },
    {
      value: 0,
      label: wordLibrary?.draft ?? "未發布",
    },
  ];
  const {
    bulletinId,
    readable = false,
    writable = false,
    deletable = false,
    tabValue,
    tabData,
  } = props;

  const { push } = useRouter();
  const userRedirectUrl = window.localStorage.getItem("userRedirectUrl");
  if (userRedirectUrl) {
    window.localStorage.removeItem("userRedirectUrl");
    if (userRedirectUrl !== "/me/bulletins")
      push({ pathname: userRedirectUrl });
  }

  const classes = useStyles();
  const locale = useSelector(getGlobalLocale);
  const organizationId = useSelector(getSelectedOrgId);
  const contentRef = useRef<HTMLDivElement>(null);
  const settings = useSettingsContext();
  const rtl = settings.themeDirection === "rtl";

  const [isOpenContentDrawer, setIsOpenContentDrawer] =
    useState<boolean>(false);
  const [isOpenTagDrawer, setIsOpenTagDrawer] = useState<boolean>(false);
  const bulletinDetailToolbarRef =
    useRef<BulletinDetailsToolbarExposeRef>(null);

  const { data: comments, mutate: commentsMutate } = useTargetComments({
    organizationId,
    targetTable: Table.BULLETIN,
    targetId: bulletinId,
  });

  const {
    data: bulletin,
    mutate,
    isValidating,
  } = useBulletin(
    {
      organizationId,
      bulletinId,
    },
    {
      locale,
    }
  );

  const { openDialog: openHistoryDialog } = useReduxDialog(
    `${Table.BULLETIN}-${HISTORY_RECORD_DIALOG}`
  );
  const { openDialog: openReadsDialog } = useReduxDialog(READS_DIALOG);
  const [recordTarget, setRecordTarget] = useState<RecordTarget>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { excute: updateBulletin, isLoading } = useAxiosApiWrapper(
    apis.org.updateBulletin,
    "Update"
  );

  const handleHistoryClick = (r?: RecordTarget) => {
    if (r) {
      setRecordTarget(r);
      setIsDialogOpen(true);
    }
  };
  useEffect(() => {
    if (isDialogOpen) openHistoryDialog();
  }, [isDialogOpen, openHistoryDialog]);

  const handleUpdateBulletinPublish = async (value) => {
    if (bulletin) {
      try {
        await updateBulletin({
          organizationId,
          bulletinId: bulletin?.bulletinId,
          isRelease: value,
        });
        if (mutate) {
          mutate();
        }
      } catch (error) {
        apis.tools.createLog({
          function: "BulletinInfo:handleUpdateBulletinPublish",
          browserDescription: window.navigator.userAgent,
          jsonData: {
            data: error,
            deviceInfo: getDeviceInfo(),
          },
          level: "ERROR",
        });
      }
    }
  };

  const handleUpdateBulletinPinned = async (value) => {
    if (bulletin) {
      try {
        await updateBulletin({
          organizationId,
          bulletinId: bulletin?.bulletinId,
          isPinned: value,
        });
        if (mutate) {
          mutate();
        }
      } catch (error) {
        apis.tools.createLog({
          function: "BulletinInfo:handleUpdateBulletinPinned",
          browserDescription: window.navigator.userAgent,
          jsonData: {
            data: error,
            deviceInfo: getDeviceInfo(),
          },
          level: "ERROR",
        });
      }
    }
  };
  const handleScrollTo = () => {
    const el = document.getElementById("bulletin_comments");
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

  const handleOpenTagDrawer = () => {
    setTimeout(() => {
      setIsOpenTagDrawer(true);
    }, 400);
  };
  const handleCloseTagDrawer = () => {
    setIsOpenTagDrawer(false);
  };

  const getWidth = () => {
    if (mdUp) return "745px";
    if (smUp) return "745px";
    return "100%";
  };

  const renderBulletin = bulletin && (
    <>
      <BulletinDetailsToolbar
        ref={bulletinDetailToolbarRef}
        permissions={{ readable, writable, deletable }}
        bulletin={bulletin}
        editLink={`/me/bulletins/${bulletinId}/edit`}
        publish={bulletin.isRelease || 0}
        onChangePublish={handleUpdateBulletinPublish}
        onChangePinned={handleUpdateBulletinPinned}
        openReadsDialog={openReadsDialog}
        handleClickHistory={handleHistoryClick}
        publishOptions={POST_PUBLISH_OPTIONS}
        isLoading={isLoading}
        onTagMutate={mutate}
      />

      <Stack
        sx={{
          mx: "auto",
          mt: { xs: 2, md: 4 },
        }}
      >
        <Grid>
          <Typography
            sx={{
              textAlign: "left",
              fontSize: "40px",
              fontWeight: "bold",
              margin: "auto",
              width: { xs: "100%", sm: "745px" },
              maxWidth: "745px",
              marginBottom: "32px",
              wordWrap: "break-word",
            }}
          >
            {bulletin?.bulletinTitle}
          </Typography>
        </Grid>
        <Grid
          ref={contentRef}
          className="froala-editor-view-text-indent"
          style={{
            margin: smUp ? "auto" : "none",
            width: getWidth(),
            maxWidth: "745px",
          }}
        >
          <FroalaEditorView model={bulletin?.bulletinContent} />
        </Grid>

        <Stack direction="row" sx={{ mb: 3, mt: 5 }}>
          <Typography variant="h4" id="bulletin_comments">
            {wordLibrary?.["response section"] ?? "回應區"}
          </Typography>

          <Typography variant="subtitle2" sx={{ color: "text.disabled" }}>
            ({comments?.source.length})
          </Typography>
        </Stack>

        <TargetCommentForm
          organizationId={organizationId}
          targetTable={Table.BULLETIN}
          targetId={bulletinId}
          commentsMutate={commentsMutate}
        />

        <Divider sx={{ mt: 5, mb: 2 }} />

        <TargetCommentList
          organizationId={organizationId}
          targetTable={Table.BULLETIN}
          comments={comments?.source || []}
          commentsMutate={commentsMutate}
        />
      </Stack>
    </>
  );

  return (
    <>
      <BulletinReadsDialog
        bulletinId={bulletinId}
        organizationId={organizationId}
      />
      <Container maxWidth={false}>
        <div
          className={clsx(classes.loader, isValidating && classes.showLoader, {
            [classes.lightOpacity]: settings.themeMode === "light",
            [classes.darkOpacity]: settings.themeMode !== "light",
          })}
        >
          <CircularProgress />
        </div>
        {renderBulletin}
      </Container>
      {bulletin && isDialogOpen && (
        <TargetHistoryRecordDialog
          targetTitle={bulletin.bulletinTitle || ""}
          targetContent={bulletin.bulletinContent || ""}
          targetIsRelease={bulletin.isRelease || 0}
          targetId={bulletin.bulletinId}
          recordTarget={recordTarget}
          advancedSearchTable={Table.BULLETIN}
          onUpdate={() => {
            mutate();
          }}
          onHandleClose={() => {
            setIsDialogOpen(false);
          }}
        />
      )}
      <TagDrawer isOpen={isOpenTagDrawer} onClickAway={handleCloseTagDrawer}>
        <EditSection className={classes.editSectionContainer}>
          {bulletin && bulletinDetailToolbarRef.current && (
            <TagAutocompleteWithAction
              targetId={bulletin.creator.loginId}
              writable={writable}
              deletable={deletable}
              selectedTags={
                bulletin.organizationTagTargetList?.map(
                  (el) => el.organizationTag
                ) || []
              }
              options={bulletinDetailToolbarRef.current.options || []}
              onAddTag={bulletinDetailToolbarRef.current.onAddTag}
              onRemoveTag={bulletinDetailToolbarRef.current.onRemoveTag}
              isToolbar
              isLoading={
                bulletinDetailToolbarRef.current.isTagCreating ||
                bulletinDetailToolbarRef.current.isTagDeleting ||
                bulletinDetailToolbarRef.current.isLoadingTagGroup ||
                isValidating
              }
            />
          )}
        </EditSection>
      </TagDrawer>
      <BulletinContentDrawer
        isOpen={isOpenContentDrawer}
        onClickAway={handleToggleContentDrawer}
        contentRef={contentRef}
        tabValue={tabValue}
        tabData={tabData}
      />
      <Fab
        color="primary"
        className={clsx(classes.tagIcon, {
          [classes.left]: rtl,
          [classes.right]: !rtl,
        })}
        onClick={handleOpenTagDrawer}
        id="bulletin-tag-drawer-button"
        data-tid="bulletin-tag-drawer-button"
      >
        <Iconify icon={"mdi:tag"} />
      </Fab>
      <Fab
        color="primary"
        onClick={handleToggleContentDrawer}
        className={clsx(classes.articleIcon, {
          [classes.left]: rtl,
          [classes.right]: !rtl,
        })}
        id="bulletin-content-drawer-button"
        data-tid="bulletin-content-drawer-button"
      >
        <ListRoundedIcon />
      </Fab>
      <Fab
        color="primary"
        onClick={handleToggleCommentDrawer}
        className={clsx(classes.smsIcon, {
          [classes.left]: rtl,
          [classes.right]: !rtl,
        })}
        id="bulletin-comment-drawer-button"
        data-tid="bulletin-comment-drawer-button"
      >
        <SmsRoundedIcon />
      </Fab>
    </>
  );
};

export default BulletinInfo;
