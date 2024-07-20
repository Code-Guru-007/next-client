import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormLabel,
  IconButton,
  InputAdornment,
  Stack,
  Switch,
  Tooltip,
  TextField,
} from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import { useTheme } from "@mui/styles";
import { DialogTitle } from "@eGroupAI/material";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";

import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";

import Form from "components/Form";
import { SNACKBAR } from "components/App";
import ReactMultiEmail from "components/MultiEmailField";
import DialogConfirmButton from "components/DialogConfirmButton";

import { useForm, Controller } from "react-hook-form";
import { InviteShareLinkFormInput } from "interfaces/form";

import Iconify from "minimal/components/iconify";
import { useBoolean } from "minimal/hooks/use-boolean";

import QRCodeDialog, { DIALOG as QRCODE_DIALOG } from "components/QRCodeDialog";
import { OrganizationModuleShare } from "interfaces/entities";
import { ServiceModuleValue } from "interfaces/utils";

export interface InviteShareLinkDialogProps {
  serviceModuleValue: ServiceModuleValue;
  targetId: string;
  orgModuleShare: OrganizationModuleShare;
}

export const FORM = "InviteShareLinkForm";
export const DIALOG = "InviteShareLinkDialog";

export default function InviteShareLinkDialog(
  props: InviteShareLinkDialogProps
) {
  const { orgModuleShare, serviceModuleValue, targetId } = props;

  const theme = useTheme();
  const wordLibrary = useSelector(getWordLibrary);
  const organizationId = useSelector(getSelectedOrgId);
  const [resPwd, setResPwd] = useState<string | undefined>();

  const showPassword = useBoolean();
  const { openSnackbar } = useReduxSnackbar<SnackbarProps>(SNACKBAR);
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const { openDialog: openQRCodeDialog } = useReduxDialog(QRCODE_DIALOG);

  const pswInputEl = React.useRef<HTMLInputElement>(null);

  const { excute: sendEmailInvitation, isLoading: isEmailInviting } =
    useAxiosApiWrapper(apis.org.sendOrgModuleShareEmailInvites, "Create");

  const {
    excute: updatePasswordOrgModuleShare,
    isLoading: isUpdatingPassword,
  } = useAxiosApiWrapper(apis.org.updatePasswordOrgModuleShare, "Update");

  const { control, watch, reset, getValues } =
    useForm<InviteShareLinkFormInput>({
      defaultValues: {
        organizationInvitationEmailList: [],
        shareUrl: `https://${window.location.host}/reurl/${orgModuleShare?.organizationShareShortUrl}`,
        isSharePasswordRequired:
          orgModuleShare?.isSharePasswordRequired === "YES",
        organizationSharePassword: "",
      },
    });

  useEffect(() => {
    if (isOpen) {
      if (!orgModuleShare?.organizationShareShortUrl) return;
      if (!navigator.clipboard) {
        document.execCommand("copy");
      } else {
        navigator.clipboard
          .writeText(
            `https://${window.location.host}/reurl/${orgModuleShare?.organizationShareShortUrl}`
          )
          .then(() => {})
          .catch(() => {});
      }
      openSnackbar({
        message: wordLibrary?.["copy successful"] ?? "複製成功",
        severity: "success",
      });
    }
  }, [isOpen, openSnackbar, wordLibrary, orgModuleShare]);

  useEffect(() => {
    if (orgModuleShare) {
      reset({
        isSharePasswordRequired:
          orgModuleShare?.isSharePasswordRequired === "YES",
        organizationInvitationEmailList: [],
        organizationSharePassword: "",
        shareUrl: `https://${window.location.host}/reurl/${orgModuleShare?.organizationShareShortUrl}`,
      });
    }
  }, [orgModuleShare, reset]);

  const isNeedPassword = watch("isSharePasswordRequired");
  const password = watch("organizationSharePassword");

  const handleUpdateModuleSharePassword = () => {
    const values = getValues();
    updatePasswordOrgModuleShare({
      organizationId,
      shareId: orgModuleShare?.organizationShareId || "",
      isSharePasswordRequired: isNeedPassword ? "YES" : "NO",
      organizationSharePassword: password,
    })
      .then(() => {
        reset({
          isSharePasswordRequired: isNeedPassword,
          organizationInvitationEmailList:
            values.organizationInvitationEmailList,
          organizationSharePassword: password,
          shareUrl: `https://${window.location.host}/reurl/${orgModuleShare?.organizationShareShortUrl}`,
        });
        setResPwd(password);
      })
      .catch(() => {});
  };

  const handleShareViaThirdParty = (provider: string) => {
    const shareUrl = `https://${window.location.host}/reurl/${orgModuleShare?.organizationShareShortUrl}`;

    const facebookShareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}`;
    const lineShareLink = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
      shareUrl
    )}`;

    switch (provider) {
      case "facebook":
        window.open(facebookShareLink, "_blank");
        break;
      case "line":
        window.open(lineShareLink, "_blank");
        break;
      case "qrcode":
        openQRCodeDialog();
        break;
      default:
        break;
    }
  };

  const handleSendEmailInvites = () => {
    const values = getValues();
    sendEmailInvitation({
      organizationId,
      organizationInvitationEmailList: values.organizationInvitationEmailList,
      shareUrl: values.shareUrl,
      isSharePasswordRequired: values.isSharePasswordRequired ? "YES" : "NO",
      organizationSharePassword: values.organizationSharePassword,
      organizationInvitationTargetType: serviceModuleValue,
      targetId,
    })
      .then(() => {
        reset({
          isSharePasswordRequired: isNeedPassword,
          organizationInvitationEmailList: [],
          organizationSharePassword: password,
          shareUrl: `https://${window.location.host}/reurl/${orgModuleShare?.organizationShareShortUrl}`,
        });
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (isOpen && isNeedPassword && pswInputEl.current) {
      pswInputEl.current.focus();
    }
  }, [isOpen, isNeedPassword]);

  return (
    <Dialog fullWidth maxWidth="sm" open={isOpen} onClose={closeDialog}>
      <DialogTitle onClickClose={closeDialog}>
        {wordLibrary?.["invite to browse"] ?? "邀請瀏覽"}
      </DialogTitle>
      <DialogContent>
        <Form id={FORM}>
          <Controller
            control={control}
            name="organizationInvitationEmailList"
            render={({ field: { onChange, value } }) => (
              <Stack
                sx={{ position: "relative" }}
                direction="row"
                justifyContent="center"
                alignItems="flex-end"
              >
                <ReactMultiEmail
                  placeholder={
                    wordLibrary?.[
                      "enter an email and press Enter to continue adding"
                    ] ?? "輸入Email並按Enter，即可繼續添加"
                  }
                  emails={value}
                  onChange={onChange}
                  getLabel={(
                    email: string,
                    index: number,
                    removeEmail: (index: number) => void
                  ) => (
                    <div data-tag key={index} style={{ display: "flex" }}>
                      {email}
                      <Box data-tag-handle onClick={() => removeEmail(index)}>
                        ×
                      </Box>
                    </div>
                  )}
                />
                <DialogConfirmButton
                  sx={{ position: "absolute", bottom: 9, right: 8 }}
                  variant="contained"
                  onClick={handleSendEmailInvites}
                  disabled={
                    !getValues("organizationInvitationEmailList").length ||
                    !orgModuleShare?.organizationShareShortUrl ||
                    isEmailInviting
                  }
                  loading={isEmailInviting}
                >
                  {wordLibrary?.["send invitation"] ?? "寄送邀請"}
                </DialogConfirmButton>
              </Stack>
            )}
          />
          <Stack direction="row" spacing={3} sx={{ mt: "24px" }}>
            <Button onClick={() => handleShareViaThirdParty("facebook")}>
              <Iconify
                icon="fa6-brands:facebook"
                color={theme.palette.primary.main}
                width={40}
              />
            </Button>
            <Button onClick={() => handleShareViaThirdParty("line")}>
              <Iconify icon="fa6-brands:line" color="green" width={40} />
            </Button>
            <Button onClick={() => handleShareViaThirdParty("qrcode")}>
              <Iconify icon="bi:qr-code" color="black" width={40} />
            </Button>
            <Tooltip title="複製瀏覽連結">
              <IconButton
                onClick={() => {
                  if (!orgModuleShare?.organizationShareShortUrl) return;
                  if (!navigator.clipboard) {
                    document.execCommand("copy");
                  } else {
                    navigator.clipboard
                      .writeText(
                        `https://${window.location.host}/reurl/${orgModuleShare?.organizationShareShortUrl}`
                      )
                      .then(() => {})
                      .catch(() => {});
                  }
                  openSnackbar({
                    message: wordLibrary?.["copy successful"] ?? "複製成功",
                    severity: "success",
                  });
                }}
              >
                <LinkIcon sx={{ width: "40px", height: "40px" }} />
              </IconButton>
            </Tooltip>
          </Stack>
          <Box mt={3}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <FormLabel color="primary">
                {wordLibrary?.["do you need a browsing password"] ??
                  "是否需要瀏覽密碼"}
                ?
              </FormLabel>
              <Controller
                control={control}
                name="isSharePasswordRequired"
                render={({ field: { onChange, value } }) => (
                  <Switch
                    defaultChecked={isNeedPassword}
                    checked={value}
                    onChange={(e, checked) => {
                      onChange(checked);
                      if (!checked) {
                        const values = getValues();
                        if (resPwd)
                          updatePasswordOrgModuleShare({
                            organizationId,
                            shareId: orgModuleShare?.organizationShareId || "",
                            isSharePasswordRequired: "NO",
                          })
                            .then(() => {
                              reset({
                                isSharePasswordRequired: false,
                                organizationInvitationEmailList:
                                  values.organizationInvitationEmailList,
                                organizationSharePassword: "",
                                shareUrl: `https://${window.location.host}/reurl/${orgModuleShare?.organizationShareShortUrl}`,
                              });
                              setResPwd(undefined);
                            })
                            .catch(() => {});
                      }
                    }}
                  />
                )}
              />
            </Stack>
            {isNeedPassword && (
              <Controller
                control={control}
                name="organizationSharePassword"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    inputRef={pswInputEl}
                    fullWidth
                    label="密碼"
                    placeholder={
                      wordLibrary?.["please enter the browsing password"] ??
                      "請輸入瀏覽密碼"
                    }
                    disabled={!isNeedPassword}
                    required={isNeedPassword}
                    onChange={onChange}
                    value={value}
                    type={showPassword.value ? "text" : "password"}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={showPassword.onToggle}
                            edge="end"
                          >
                            <Iconify
                              icon={
                                showPassword.value
                                  ? "solar:eye-bold"
                                  : "solar:eye-closed-bold"
                              }
                            />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            )}
          </Box>
        </Form>
      </DialogContent>
      <DialogActions>
        {isNeedPassword && (
          <>
            <DialogConfirmButton
              onClick={handleUpdateModuleSharePassword}
              disabled={
                isUpdatingPassword ||
                !orgModuleShare?.organizationShareShortUrl ||
                !isNeedPassword ||
                !password
              }
              loading={isUpdatingPassword}
            >
              {wordLibrary?.["save browsing password"] ?? "儲存瀏覽密碼"}
            </DialogConfirmButton>
          </>
        )}
      </DialogActions>
      <QRCodeDialog
        value={`https://${window.location.host}/reurl/${orgModuleShare?.organizationShareShortUrl}`}
        size={384}
      />
    </Dialog>
  );
}
