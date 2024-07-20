import React, { useState } from "react";
import { ColumnType, OrganizationMember } from "@eGroupAI/typings/apis";
import EditSection from "components/EditSection";
import makeStyles from "@mui/styles/makeStyles";
import Stack from "@mui/material/Stack";
import ListItemText from "@mui/material/ListItemText";
import { Box, CircularProgress, Grid } from "@eGroupAI/material";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import DynamicFieldWithAction from "components/DynamicField/DynamicFieldWithAction";
import PermissionValid from "components/PermissionValid";
import IconButton from "components/IconButton/StyledIconButton";
import { useSelector } from "react-redux";

import clsx from "clsx";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import useCheckOrgOwner from "@eGroupAI/hooks/apis/useCheckOrgOwner";
import Tooltip from "@eGroupAI/material/Tooltip";
import parseDynamicColumnValue from "utils/parseDynamicColumnValue";
import { GenderMap } from "interfaces/utils";

import EditIcon from "@mui/icons-material/Edit";
import { useSettingsContext } from "minimal/components/settings";

import MemberInfoHistoryDialog, {
  DIALOG as HISTORY_DIALOG,
  RecordTarget,
} from "./MemberInfoHistoryDialog";

const genderOptions = [
  { optionId: "1", label: "男", value: "1" },
  { optionId: "2", label: "女", value: "2" },
];

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
  textTitle: {
    padding: "8px 0 8px 0",
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
  editSectionContainer: {
    borderRadius: 0,
    boxShadow: "none",
    marginBottom: 2,
    borderBottom: "1px solid #EEEEEE",
  },
  editSectionHeader: {
    marginBottom: "30px",
  },
}));

export interface MemberInfoProps {
  orgMember?: OrganizationMember;
  onUpdateMember?: (
    name: string,
    value: string
  ) => void | Promise<string | void>;
  isLoading?: boolean;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
  openRoleDialog: (options?: unknown) => void;
}

const MemberInfo = function (props: MemberInfoProps) {
  const classes = useStyles(props);
  const settings = useSettingsContext();

  const {
    orgMember,
    onUpdateMember,
    readable,
    // writable,
    deletable,
    openRoleDialog,
  } = props;
  const wordLibrary = useSelector(getWordLibrary);
  const { openDialog: openHistoryDialog } = useReduxDialog(HISTORY_DIALOG);
  const [recordTarget, setRecordTarget] = useState<RecordTarget>({});

  const { orgOwnerLoginId } = useCheckOrgOwner();

  const handleClickHistory = (r?: RecordTarget) => {
    if (r) {
      setRecordTarget(r);
      openHistoryDialog();
    }
  };

  const handleSaveValue = (name, value) => {
    if (onUpdateMember) {
      return onUpdateMember(name, value.value);
    }
    return undefined;
  };

  return (
    <>
      {orgMember && (
        <MemberInfoHistoryDialog
          targetId={orgMember.member.loginId}
          recordTarget={recordTarget}
        />
      )}
      <EditSection className={classes.editSectionContainer}>
        <Grid container spacing={2} position="relative">
          <div
            className={clsx(classes.loader, !orgMember && classes.showLoader, {
              [classes.lightOpacity]: settings.themeMode === "light",
              [classes.darkOpacity]: settings.themeMode !== "light",
            })}
          >
            <CircularProgress />
          </div>
          <Grid item xs={12}>
            <Stack direction="column">
              <ListItemText
                primary={wordLibrary?.role ?? "角色"}
                primaryTypographyProps={{
                  typography: "body2",
                  color: "text.secondary",
                  mb: 0.5,
                }}
              />
              <Box sx={{ fontSize: 14 }}>
                {orgMember?.organizationRoleList
                  ? orgMember.organizationRoleList
                      .map((el) => el.organizationRoleNameZh)
                      .join(", ")
                  : `${wordLibrary?.["no role"] ?? "無角色"}`}
                {orgMember?.member.loginId !== orgOwnerLoginId && (
                  <PermissionValid
                    shouldBeOrgOwner
                    modulePermissions={["UPDATE_ALL"]}
                  >
                    <Tooltip title={wordLibrary?.edit ?? "編輯"}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          openRoleDialog();
                        }}
                      >
                        <EditIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  </PermissionValid>
                )}
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="column">
              <ListItemText
                primary={wordLibrary?.["member name"] ?? "會員名稱"}
                primaryTypographyProps={{
                  typography: "body2",
                  color: "text.secondary",
                  mb: 0.5,
                }}
              />
              <DynamicFieldWithAction
                label="Member Name"
                columnType={ColumnType.TEXT}
                value={orgMember?.member.memberName}
                name="memberName"
                format={(value) =>
                  parseDynamicColumnValue(ColumnType.TEXT, value as string)
                }
                boldText
                handleClickHistory={handleClickHistory}
                handleChange={handleSaveValue}
                readable={readable}
                writable={false}
                deletable={deletable}
              />
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="column">
              <ListItemText
                primary={wordLibrary?.["member mobile"] ?? "會員手機"}
                primaryTypographyProps={{
                  typography: "body2",
                  color: "text.secondary",
                  mb: 0.5,
                }}
              />
              <DynamicFieldWithAction
                label="Member Phone"
                columnType={ColumnType.TEXT}
                value={orgMember?.member.memberPhone}
                name="memberPhone"
                format={(value) =>
                  parseDynamicColumnValue(ColumnType.TEXT, value as string)
                }
                boldText
                handleClickHistory={handleClickHistory}
                handleChange={handleSaveValue}
                readable={readable}
                writable={false}
                deletable={deletable}
              />
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="column">
              <ListItemText
                primary={wordLibrary?.["member email"] ?? "會員Email"}
                primaryTypographyProps={{
                  typography: "body2",
                  color: "text.secondary",
                  mb: 0.5,
                }}
              />
              <DynamicFieldWithAction
                label="Member Email"
                columnType={ColumnType.TEXT}
                value={orgMember?.member.memberEmail}
                name="memberEmail"
                format={(value) =>
                  parseDynamicColumnValue(ColumnType.TEXT, value as string)
                }
                boldText
                handleClickHistory={handleClickHistory}
                handleChange={handleSaveValue}
                readable={readable}
                writable={false}
                deletable={deletable}
              />
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="column">
              <ListItemText
                primary={wordLibrary?.["member birthday"] ?? "會員生日"}
                primaryTypographyProps={{
                  typography: "body2",
                  color: "text.secondary",
                  mb: 0.5,
                }}
              />
              <DynamicFieldWithAction
                label="Member Birthday"
                columnType={ColumnType.DATE}
                value={orgMember?.member.memberBirth}
                name="memberBirthday"
                format={(value) =>
                  parseDynamicColumnValue(ColumnType.DATE, value as string)
                }
                boldText
                handleClickHistory={handleClickHistory}
                handleChange={handleSaveValue}
                readable={readable}
                writable={false}
                deletable={deletable}
              />
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="column">
              <ListItemText
                primary={wordLibrary?.["member gender"] ?? "會員性別"}
                primaryTypographyProps={{
                  typography: "body2",
                  color: "text.secondary",
                  mb: 0.5,
                }}
              />
              <DynamicFieldWithAction
                label={wordLibrary?.["member gender"] ?? "會員性別"}
                columnType={ColumnType.CHOICE_ONE}
                value={orgMember?.member.memberGender}
                format={(value) =>
                  value ? GenderMap[value as number] : undefined
                }
                options={genderOptions}
                name="memberGender"
                boldText
                handleClickHistory={handleClickHistory}
                handleChange={handleSaveValue}
                readable={readable}
                writable={false}
                deletable={deletable}
              />
            </Stack>
          </Grid>
        </Grid>
      </EditSection>
    </>
  );
};

export default MemberInfo;
