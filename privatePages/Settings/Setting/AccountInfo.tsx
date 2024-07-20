import React from "react";
import Stack from "@mui/material/Stack";
import ListItemText from "@mui/material/ListItemText";
import { Button, Grid } from "@eGroupAI/material";
import EditSection from "components/EditSection";
import EditSectionHeader from "components/EditSectionHeader";
import { makeStyles } from "@mui/styles";
import { DurationValueType } from "interfaces/form";

import DynamicFieldWithAction from "components/DynamicField/DynamicFieldWithAction";
import { ColumnType, Member } from "@eGroupAI/typings/apis";
import parseDynamicColumnValue from "utils/parseDynamicColumnValue";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { DIALOG } from "./MemberPasswordUpdateDialog";

const useStyles = makeStyles((theme) => ({
  editSection: {
    borderRadius: 0,
    margin: 0,
    boxShadow: "none",
    [theme.breakpoints.down("md")]: {
      margin: 0,
    },
  },
}));

export interface AccountInfoProps {
  memberInfo: Member;
  handleChange: (
    name: string,
    value?: DurationValueType
  ) => void | Promise<void | string>;
  loading?: boolean;
}

const AccountInfo = function (props: AccountInfoProps) {
  const classes = useStyles();
  const { memberInfo, handleChange } = props;
  const { openDialog } = useReduxDialog(DIALOG);

  return (
    <>
      <EditSection className={classes.editSection}>
        <EditSectionHeader primary="帳號" style={{ paddingTop: 40 }} />
        <Grid container>
          <Grid item xs={12}>
            <Stack direction="column">
              <ListItemText
                primary="電子信箱"
                primaryTypographyProps={{
                  typography: "body2",
                  color: "text.secondary",
                  mb: 0.5,
                }}
              />
              <DynamicFieldWithAction
                name="memberAccount"
                label="Member Account"
                columnType={ColumnType.TEXT}
                value={memberInfo?.memberAccount}
                format={(value) =>
                  parseDynamicColumnValue(ColumnType.TEXT, value as string)
                }
                boldText
                required
                handleChange={handleChange}
                readable
                writable={false}
              />
            </Stack>
          </Grid>
          {memberInfo?.hasMemberPassword === 1 && (
            <Grid item xs={12}>
              <Stack direction="column">
                <ListItemText
                  primary="密碼"
                  primaryTypographyProps={{
                    typography: "body2",
                    color: "text.secondary",
                    mb: 0.5,
                  }}
                />
                <Button onClick={openDialog} variant="text">
                  **************
                </Button>
              </Stack>
            </Grid>
          )}
        </Grid>
      </EditSection>
    </>
  );
};

export default AccountInfo;
