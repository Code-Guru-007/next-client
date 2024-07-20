import React, { FC, useState } from "react";

import useOrgMembers from "utils/useOrgMembers";
import { SNACKBAR } from "components/App";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import apis from "utils/apis";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import {
  ModulePermission,
  OrganizationMember,
  ServiceModulePermissionMapping,
} from "@eGroupAI/typings/apis";
import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useOrgMemberTargetAuth from "utils/useOrgMemberTargetAuth";

import Autocomplete from "@eGroupAI/material/Autocomplete";
import Dialog from "@eGroupAI/material/Dialog";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@eGroupAI/material/DialogActions";
import DialogContent from "@eGroupAI/material/DialogContent";
import MenuItem from "components/MenuItem";
import TextField from "@eGroupAI/material/TextField";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import Form from "components/Form";
import { OrganizationMemberTargetAuth } from "interfaces/entities";

const FORM = "MemberTargetAuthEditForm";
export const DIALOG = "MemberTargetAuthEditDialog";

const defaultValues = {
  organizationMemberTargetAuthName: "",
  organizationMemberTargetAuthPermission: [],
  organizationMemberTargetAuthDescription: "",
};

type Values = {
  organizationMemberTargetAuthName: string;
  organizationMemberTargetAuthPermission: ModulePermission[];
  organizationMemberTargetAuthDescription: string;
  organizationMember?: OrganizationMember;
};

export interface MemberTargetAuthEditDialogProps {
  targetId?: string;
  orgMemberTargetAuth?: OrganizationMemberTargetAuth;
}

const MemberTargetAuthEditDialog: FC<MemberTargetAuthEditDialogProps> =
  function (props) {
    const { targetId, orgMemberTargetAuth } = props;
    const wordLibrary = useSelector(getWordLibrary);
    const { closeDialog, isOpen } = useReduxDialog(DIALOG);
    const { openSnackbar } = useReduxSnackbar<SnackbarProps>(SNACKBAR);
    const matchMutate = useSwrMatchMutate();
    const organizationId = useSelector(getSelectedOrgId);
    const [query, setQuery] = useState("");
    let dialogTitleText;
    if (orgMemberTargetAuth) {
      dialogTitleText = `${wordLibrary?.edit ?? "編輯"} ${
        orgMemberTargetAuth.member.memberName
      }`;
    } else {
      dialogTitleText = wordLibrary?.add ?? "新增";
    }
    const [values, setValues] = useState<Values>(defaultValues);
    const { data: orgMembers, isValidating } = useOrgMembers(
      {
        organizationId,
      },
      {
        query,
      }
    );
    useOrgMemberTargetAuth(
      {
        organizationId,
        organizationMemberTargetAuthId:
          orgMemberTargetAuth?.organizationMemberTargetAuthId,
      },
      undefined,
      {
        onSuccess: (res) => {
          setValues({
            organizationMemberTargetAuthName:
              res.data.organizationMemberTargetAuthName,
            organizationMemberTargetAuthPermission:
              res.data.organizationMemberTargetAuthPermission,
            organizationMemberTargetAuthDescription:
              res.data.organizationMemberTargetAuthDescription,
          });
        },
      }
    );
    const { excute: createMemberTargetAuth, isLoading: isCreating } =
      useAxiosApiWrapper(apis.org.createMemberTargetAuth);
    const { excute: updateMemberTargetAuth, isLoading: isUpdating } =
      useAxiosApiWrapper(apis.org.updateMemberTargetAuth);

    const myCloseDialog = () => {
      setValues(defaultValues);
      closeDialog();
    };

    return (
      <Dialog open={isOpen} onClose={myCloseDialog} fullWidth maxWidth="md">
        <DialogTitle onClickClose={myCloseDialog}>
          {dialogTitleText} {wordLibrary?.permission ?? "權限"}
        </DialogTitle>
        <DialogContent>
          <Form
            id={FORM}
            onSubmit={async (e) => {
              e.preventDefault();
              if (orgMemberTargetAuth) {
                try {
                  await updateMemberTargetAuth({
                    organizationId,
                    organizationMemberTargetAuthId:
                      orgMemberTargetAuth.organizationMemberTargetAuthId,
                    organizationMemberTargetAuthName:
                      values.organizationMemberTargetAuthName,
                    organizationMemberTargetAuthPermission:
                      values.organizationMemberTargetAuthPermission,
                    organizationMemberTargetAuthDescription:
                      values.organizationMemberTargetAuthDescription,
                  });
                  matchMutate(
                    new RegExp(
                      `^/organizations/${organizationId}/member-target-auths\\?`,
                      "g"
                    )
                  );
                  myCloseDialog();
                  openSnackbar({
                    message: wordLibrary?.["edit successful"] ?? "編輯成功!",
                    severity: "success",
                  });
                } catch (error) {
                  // eslint-disable-next-line no-console
                  apis.tools.createLog({
                    function: "updateMemberTargetAuth: error",
                    browserDescription: window.navigator.userAgent,
                    jsonData: {
                      data: error,
                      deviceInfo: getDeviceInfo(),
                    },
                    level: "ERROR",
                  });
                }
              } else if (targetId && values.organizationMember) {
                try {
                  await createMemberTargetAuth({
                    organizationId,
                    targetId,
                    organizationMemberTargetAuthName:
                      values.organizationMemberTargetAuthName,
                    organizationMemberTargetAuthPermission:
                      values.organizationMemberTargetAuthPermission,
                    organizationMemberTargetAuthDescription:
                      values.organizationMemberTargetAuthDescription,
                    organizationMemberTargetAuthServiceModule: "SPECIFICATION",
                    member: {
                      loginId: values.organizationMember.member.loginId,
                    },
                  });
                  matchMutate(
                    new RegExp(
                      `^/organizations/${organizationId}/member-target-auths\\?`,
                      "g"
                    )
                  );
                  myCloseDialog();
                  openSnackbar({
                    message: wordLibrary?.["added successfully"] ?? "新增成功",
                    severity: "success",
                  });
                } catch (error) {
                  openSnackbar({
                    message: wordLibrary?.["duplicate entry"] ?? "重複新增",
                    severity: "error",
                  });
                }
              }
            }}
          >
            {!orgMemberTargetAuth && (
              <Autocomplete
                loading={isValidating}
                options={orgMembers?.source || []}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={wordLibrary?.["organization member"] ?? "單位成員"}
                    required
                    variant="outlined"
                    margin="normal"
                    InputProps={{
                      ...params.InputProps,
                      required: true,
                    }}
                  />
                )}
                isOptionEqualToValue={(option, value) =>
                  option.member.memberName === value?.member.memberName
                }
                getOptionLabel={(option) => option.member.memberName}
                noOptionsText={
                  wordLibrary?.["no information found"] ?? "查無資料"
                }
                value={values.organizationMember}
                onInputChange={(_, v) => {
                  setQuery(v);
                }}
                onChange={(e, value) => {
                  if (value) {
                    setValues((v) => ({
                      ...v,
                      organizationMember: value,
                    }));
                  }
                }}
              />
            )}
            <TextField
              label={wordLibrary?.permission ?? "權限"}
              variant="outlined"
              fullWidth
              required
              margin="normal"
              select
              SelectProps={{
                multiple: true,
                required: true,
                onChange: (e) => {
                  setValues((v) => ({
                    ...v,
                    organizationMemberTargetAuthPermission: e.target
                      .value as ModulePermission[],
                  }));
                },
              }}
              value={values.organizationMemberTargetAuthPermission}
            >
              {Object.values(ModulePermission).map((el) => (
                <MenuItem key={el} value={el}>
                  {ServiceModulePermissionMapping[el]}
                </MenuItem>
              ))}
            </TextField>
          </Form>
        </DialogContent>
        <DialogActions>
          <DialogCloseButton onClick={myCloseDialog}>
            {wordLibrary?.cancel ?? "取消"}
          </DialogCloseButton>
          <DialogConfirmButton
            type="submit"
            loading={isCreating || isUpdating}
            form={FORM}
          >
            {wordLibrary?.confirm ?? "確認"}
          </DialogConfirmButton>
        </DialogActions>
      </Dialog>
    );
  };

export default MemberTargetAuthEditDialog;
