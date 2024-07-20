import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@eGroupAI/material";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import {
  DialogActions,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DialogConfirmButton from "components/DialogConfirmButton";
import Iconify from "minimal/components/iconify";
import { useBoolean } from "minimal/hooks/use-boolean";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";

export const DIALOG = "PasswordRquiredToViewShare";

export interface PasswordRquiredToViewShareDialogProps {
  organizationId: string;
  shareId: string;
  setShareContent: React.Dispatch<React.SetStateAction<any>>;
  setPasswordVerified: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function PasswordRequiredToViewShareDialog(
  props: PasswordRquiredToViewShareDialogProps
) {
  const { organizationId, shareId, setShareContent, setPasswordVerified } =
    props;
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const password = useBoolean();

  const inputEl = useRef<HTMLInputElement>(null);
  const [userPsw, setUserPsw] = useState<string>("");

  const { excute: accessOrgModuleShare, isLoading: isAccessingPassword } =
    useAxiosApiWrapper(
      apis.org.accessOrgModuleShare,
      "None",
      undefined,
      undefined,
      [{ statusCode: 401, errorMsg: "您輸入的瀏覽密碼不正確，請再試一次" }]
    );

  const handleAccessOrgModuleShare = () => {
    if (!userPsw) return;
    accessOrgModuleShare({
      organizationId,
      shareId,
      organizationSharePassword: userPsw,
    })
      .then((res) => {
        closeDialog();
        setPasswordVerified(true);
        setShareContent({ ...res.data });
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (inputEl.current) {
      inputEl.current.focus();
    }
  }, []);

  return (
    <Dialog fullWidth maxWidth="sm" open={isOpen}>
      <DialogTitle onClickClose={closeDialog}>需要瀏覽密碼</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={3}>
          <Typography variant="subtitle1">
            請輸入瀏覽密碼以繼續閱讀文章/佈告欄
          </Typography>
          <TextField
            label="密碼"
            placeholder="查看密碼"
            type={password.value ? "text" : "password"}
            value={userPsw}
            onChange={(e) => {
              setUserPsw(e.target.value);
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleAccessOrgModuleShare();
            }}
            required
            InputProps={{
              inputRef: inputEl,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={password.onToggle} edge="end">
                    <Iconify
                      icon={
                        password.value
                          ? "solar:eye-bold"
                          : "solar:eye-closed-bold"
                      }
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <DialogConfirmButton
          loading={isAccessingPassword}
          disabled={!userPsw}
          onClick={handleAccessOrgModuleShare}
        />
      </DialogActions>
    </Dialog>
  );
}
