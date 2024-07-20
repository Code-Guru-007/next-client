import React, { FC, useState } from "react";

import { useRouter } from "next/router";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import { useSelector } from "react-redux";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { DIALOG as EVENT_DIALOG } from "components/EventDialog";
import { OrganizationEvent } from "interfaces/entities";

import PermissionValid from "components/PermissionValid";
import IconButton from "components/IconButton/StyledIconButton";
import Tooltip from "@eGroupAI/material/Tooltip";
import MenuItem from "components/MenuItem";
import ListItemIcon from "@eGroupAI/material/ListItemIcon";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ReviewsIcon from "@mui/icons-material/Reviews";
import CommentIcon from "@mui/icons-material/Comment";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import Menu from "components/Menu";
import PermissionValidGroup from "components/PermissionValidGroup";
import { DIALOG as REVIEW_DIALOG } from "./CreateReviewDialog";
import { DIALOG as COMMENT_DIALOG } from "./CreateCommentDialog";

interface EventMenuProps {
  data?: OrganizationEvent;
}

const EventMenu: FC<EventMenuProps> = function EventMenu(props) {
  const { data } = props;
  const router = useRouter();
  const { query } = router;
  const organizationId = useSelector(getSelectedOrgId);
  const wordLibrary = useSelector(getWordLibrary);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { openDialog: openEventDialog } = useReduxDialog(EVENT_DIALOG);
  const { openDialog: openReviewDialog } = useReduxDialog(REVIEW_DIALOG);
  const { openDialog: openCommentDialog } = useReduxDialog(COMMENT_DIALOG);
  const { excute: updateOrgEvent } = useAxiosApiWrapper(
    apis.org.updateOrgEvent,
    "Update"
  );
  const matchMutate = useSwrMatchMutate();
  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
  } = useReduxDialog(DELETE_DIALOG);
  const { excute: deleteOrgEvent } = useAxiosApiWrapper(
    apis.org.deleteOrgEvent,
    "Delete"
  );
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <PermissionValidGroup
        schema={[
          {
            shouldBeOrgOwner: true,
            modulePermissions: [
              "UPDATE_ALL",
              "DELETE_ALL",
              "SUBMIT_REVIEW",
              "COMMENT",
              "AUDIT",
              "AUTH",
            ],
          },
          {
            modulePermissions: ["UPDATE", "DELETE"],
            vaildLoginId: data?.updater?.loginId,
            conditions: ["MODULE", "AND", "MEMBER"],
          },
        ]}
      >
        <Tooltip title={wordLibrary?.["event menu"] ?? "事件選單"}>
          <IconButton
            onClick={(event) => {
              setAnchorEl(event.currentTarget);
            }}
            edge="end"
            size="small"
          >
            <MoreHorizIcon />
          </IconButton>
        </Tooltip>
      </PermissionValidGroup>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <PermissionValidGroup
          schema={[
            {
              shouldBeOrgOwner: true,
              modulePermissions: ["UPDATE_ALL"],
            },
            {
              modulePermissions: ["UPDATE"],
              vaildLoginId: data?.updater?.loginId,
              conditions: ["MODULE", "AND", "MEMBER"],
            },
          ]}
        >
          <MenuItem
            onClick={() => {
              handleClose();
              openEventDialog();
            }}
            disabled={data?.isReviewing}
            sx={{
              display: data?.organizationEventIsOpen === 0 ? "none" : undefined,
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            {wordLibrary?.["edit event"] ?? "編輯事件"}
          </MenuItem>
        </PermissionValidGroup>
        <PermissionValid modulePermissions={["COMMENT"]}>
          <MenuItem
            onClick={() => {
              openCommentDialog();
            }}
            disabled={data?.isReviewing}
            sx={{
              display: data?.organizationEventIsOpen === 0 ? "none" : undefined,
            }}
          >
            <ListItemIcon>
              <CommentIcon fontSize="small" />
            </ListItemIcon>
            {wordLibrary?.["add comment"] ?? "新增評論"}
          </MenuItem>
        </PermissionValid>
        <PermissionValid modulePermissions={["SUBMIT_REVIEW"]}>
          <MenuItem
            onClick={() => {
              handleClose();
              openReviewDialog();
            }}
            disabled={data?.isReviewing}
            sx={{
              display: data?.organizationEventIsOpen === 0 ? "none" : undefined,
            }}
          >
            <ListItemIcon>
              <ReviewsIcon fontSize="small" />
            </ListItemIcon>
            {data?.isReviewing
              ? `${wordLibrary?.["under review"] ?? "審核中"}`
              : `${wordLibrary?.["submit for review"] ?? "提交審核"}`}
          </MenuItem>
        </PermissionValid>
        <PermissionValidGroup
          schema={[
            {
              shouldBeOrgOwner: true,
              modulePermissions: ["UPDATE_ALL"],
            },
            {
              modulePermissions: ["UPDATE"],
              vaildLoginId: data?.updater?.loginId,
              conditions: ["MODULE", "AND", "MEMBER"],
            },
          ]}
        >
          <MenuItem
            onClick={async () => {
              handleClose();
              if (data) {
                try {
                  updateOrgEvent({
                    organizationId,
                    organizationEventId: data.organizationEventId,
                    organizationEventIsOpen: data.organizationEventIsOpen
                      ? 0
                      : 1,
                  })
                    .then(() => {
                      matchMutate(
                        new RegExp(
                          `^/organizations/${organizationId}/events/${data.organizationEventId}\\?`,
                          "g"
                        )
                      );
                    })
                    .catch((err) => {
                      apis.tools.createLog({
                        function: "updateOrgEvent.matchMutate: error",
                        browserDescription: window.navigator.userAgent,
                        jsonData: {
                          data: err,
                          deviceInfo: getDeviceInfo(),
                        },
                        level: "ERROR",
                      });
                    });
                } catch (error) {
                  apis.tools.createLog({
                    function: "updateOrgEvent: error",
                    browserDescription: window.navigator.userAgent,
                    jsonData: {
                      data: error,
                      deviceInfo: getDeviceInfo(),
                    },
                    level: "ERROR",
                  });
                }
              }
            }}
          >
            <ListItemIcon>
              {data?.organizationEventIsOpen ? (
                <LockIcon fontSize="small" />
              ) : (
                <LockOpenIcon fontSize="small" />
              )}
            </ListItemIcon>
            {data?.organizationEventIsOpen
              ? `${wordLibrary?.["close event"] ?? "關閉事件"}`
              : `${wordLibrary?.["open event"] ?? "開啟事件"}`}
          </MenuItem>
        </PermissionValidGroup>
        <PermissionValidGroup
          schema={[
            {
              shouldBeOrgOwner: true,
              modulePermissions: ["DELETE_ALL"],
            },
            {
              modulePermissions: ["DELETE"],
              vaildLoginId: data?.updater?.loginId,
              conditions: ["MODULE", "AND", "MEMBER"],
            },
          ]}
        >
          <MenuItem
            onClick={() => {
              if (data) {
                openConfirmDeleteDialog({
                  primary: `您確定要刪除${data.organizationEventTitle}嗎？`,
                  onConfirm: async () => {
                    closeConfirmDeleteDialog();
                    try {
                      await deleteOrgEvent({
                        organizationId,
                        organizationEventId: data.organizationEventId,
                      });
                      if (query.userId) {
                        router.replace(`/me/crm/users/${query.userId}?tab=1`);
                      } else {
                        router.replace("/me/event/events");
                      }
                    } catch (error) {
                      apis.tools.createLog({
                        function: "deleteOrgEvent: error",
                        browserDescription: window.navigator.userAgent,
                        jsonData: {
                          data: error,
                          deviceInfo: getDeviceInfo(),
                        },
                        level: "ERROR",
                      });
                    }
                  },
                });
              }
            }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            {wordLibrary?.delete ?? "刪除"}
          </MenuItem>
        </PermissionValidGroup>
      </Menu>
    </>
  );
};

export default EventMenu;
