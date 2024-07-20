import React, { FC } from "react";
import { SubmitHandler, useForm, Controller } from "react-hook-form";

import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";

import Grid from "@eGroupAI/material/Grid";
import Box from "@eGroupAI/material/Box";
import Autocomplete from "@eGroupAI/material/Autocomplete";
import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogActions from "@eGroupAI/material/DialogActions";
import TextField from "@mui/material/TextField";
import useOrgRoles from "@eGroupAI/hooks/apis/useOrgRoles";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import ReactMultiEmail from "components/MultiEmailField";
import { InvitateMemberFormInput } from "interfaces/form";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";
import InputAdornment from "@mui/material/InputAdornment";

export const DIALOG = "InvitateMemberDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

interface InvitateMemberDialogProps {
  onSubmit: SubmitHandler<InvitateMemberFormInput>;
  loading?: boolean;
  organizationId: string;
}

const InvitateMemberDialog: FC<InvitateMemberDialogProps> = function (props) {
  const { onSubmit, loading, organizationId } = props;
  const theme = useTheme();
  const classes = useStyles();
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const { control, handleSubmit, setValue, watch } =
    useForm<InvitateMemberFormInput>({
      defaultValues: {
        organizationInvitationEmailList: [],
        organizationMemberRoleSet: [],
      },
      shouldUnregister: true,
    });

  const { data: roles } = useOrgRoles({
    organizationId,
  });

  const wordLibrary = useSelector(getWordLibrary);

  return (
    <Dialog
      open={isOpen}
      onClose={closeDialog}
      maxWidth="sm"
      fullWidth
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={closeDialog}>
        {wordLibrary?.["invite organization members"] ?? "邀請單位成員"}
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
        <DialogContent>
          <Grid container spacing={3} paddingTop={2} paddingBottom={2}>
            <Grid item xs={12}>
              <Controller
                control={control}
                name="organizationInvitationEmailList"
                render={({ field: { onChange, value } }) => (
                  <ReactMultiEmail
                    id="invite-member-email-input"
                    data-tid="invite-member-email-input"
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
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                control={control}
                name="organizationMemberRoleSet"
                render={({ field }) => (
                  <Autocomplete
                    defaultValue={roles?.source?.filter(
                      (tag) =>
                        field.value.findIndex(
                          (el) => el === tag.organizationRoleId
                        ) !== -1
                    )}
                    options={roles?.source || []}
                    multiple
                    disableCloseOnSelect
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        placeholder={
                          wordLibrary?.["select multiple roles"] ??
                          "可選擇多個角色"
                        }
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <InputAdornment
                              position="end"
                              id="invite-select-multiple-roles"
                              data-tid="invite-select-multiple-roles"
                            >
                              {params.InputProps.endAdornment}
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                    isOptionEqualToValue={(option, value) =>
                      option.organizationRoleId === value.organizationRoleId
                    }
                    getOptionLabel={(option) => option.organizationRoleNameZh}
                    onChange={(e, value) => {
                      const roleList = value.map((el) => el.organizationRoleId);
                      setValue("organizationMemberRoleSet", roleList);
                    }}
                    noOptionsText={
                      wordLibrary?.["no information found"] ?? "查無資料"
                    }
                    id="invite-select-multiple-roles-input"
                    data-tid="invite-select-multiple-roles-input"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <DialogCloseButton
            id="invite-dialog-close-btn"
            data-tid="invite-dialog-close-btn"
            onClick={closeDialog}
          />
          <DialogConfirmButton
            id="invite-dialog-confirm-btn"
            data-tid="invite-dialog-confirm-btn"
            type="submit"
            sx={{ ml: 1 }}
            loading={loading}
            disabled={
              loading || !(watch("organizationInvitationEmailList")?.length > 0)
            }
          />
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InvitateMemberDialog;
