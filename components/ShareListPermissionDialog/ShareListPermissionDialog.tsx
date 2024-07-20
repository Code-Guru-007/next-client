import React from "react";
import { Dialog, DialogActions, DialogContent, List } from "@mui/material";
import { DialogTitle } from "@eGroupAI/material";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import DialogConfirmButton from "components/DialogConfirmButton";
import DialogCloseButton from "components/DialogCloseButton";
import InviteShareUserItem from "components/InviteShareUserItem";
import Iconify from "minimal/components/iconify";
import Scrollbar from "minimal/components/scrollbar";
import { ServiceModuleValue } from "interfaces/utils";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useOrgSharePermissionUsers } from "@eGroupAI/hooks/apis/useOrgSharePermissionUsers";

import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";

import { OrganizationModuleShare } from "interfaces/entities";

export interface ShareListPermissionDialogProps {
  serviceModuleValue: ServiceModuleValue;
  targetId: string;
  setOrgModuleShare: React.Dispatch<
    React.SetStateAction<OrganizationModuleShare | undefined>
  >;
}

export const DIALOG = "ShareListPermissionDialog";

export default function ShareListPermissionDialog(
  props: ShareListPermissionDialogProps
) {
  const { serviceModuleValue, targetId, setOrgModuleShare } = props;
  const organizationId = useSelector(getSelectedOrgId);
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const wordLibrary = useSelector(getWordLibrary);
  const { data: shareUsers } = useOrgSharePermissionUsers({
    organizationId,
    serviceModuleValue,
    targetId,
  });

  const { excute: createOrgModuleShare, isLoading: isCreatingShare } =
    useAxiosApiWrapper(apis.org.createOrgModuleShare, "Create");

  const handleCreateOrgShare = () => {
    createOrgModuleShare({
      organizationId,
      organizationShareTargetType: serviceModuleValue,
      targetId,
      isSharePasswordRequired: "NO",
    })
      .then((res) => {
        closeDialog();
        setOrgModuleShare(res.data);
      })
      .catch(() => {});
  };

  return (
    <Dialog fullWidth maxWidth="xs" open={isOpen} onClose={closeDialog}>
      <DialogTitle onClickClose={closeDialog}>
        {wordLibrary?.["permission list"] ?? "權限列表"}
      </DialogTitle>
      <DialogContent>
        {shareUsers && (
          <Scrollbar sx={{ maxHeight: 60 * 6 }}>
            <List disablePadding>
              {shareUsers.source.map((module) => (
                <InviteShareUserItem
                  key={module.member.loginId}
                  person={module.member}
                  module={module}
                />
              ))}
            </List>
          </Scrollbar>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", mt: 3 }}>
        <DialogConfirmButton
          startIcon={<Iconify icon="eva:link-2-fill" />}
          onClick={handleCreateOrgShare}
          loading={isCreatingShare}
        >
          {wordLibrary?.["share link"] ?? "分享連結"}
        </DialogConfirmButton>
        <DialogCloseButton
          variant="outlined"
          color="inherit"
          onClick={closeDialog}
        />
      </DialogActions>
    </Dialog>
  );
}
