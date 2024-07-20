import React from "react";
import Stack from "@mui/material/Stack";
import ListItemText from "@mui/material/ListItemText";
import { Grid } from "@eGroupAI/material";
import EditSection from "components/EditSection";
import EditSectionHeader from "components/EditSectionHeader";
import { makeStyles } from "@mui/styles";

import DynamicFieldWithAction from "components/DynamicField/DynamicFieldWithAction";
import { ColumnType, Member } from "@eGroupAI/typings/apis";
import parseDynamicColumnValue from "utils/parseDynamicColumnValue";
import { GenderMap } from "interfaces/utils";
import { DurationValueType } from "interfaces/form";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";

const genderOptions = [
  { optionId: "1", label: "男", value: "1" },
  { optionId: "2", label: "女", value: "2" },
];

const useStyles = makeStyles((theme) => ({
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
  editSection: {
    borderTop: "1px solid #EEEEEE",
    borderRadius: 0,
    margin: 0,
    boxShadow: "none",
    [theme.breakpoints.down("md")]: {
      margin: 0,
    },
  },
}));

export interface PersonalInfoProps {
  memberInfo: Member;
  handleChange: (
    name: string,
    value?: DurationValueType
  ) => void | Promise<void | string>;
  loading?: boolean;
}

const PersonalInfo = function (props: PersonalInfoProps) {
  const classes = useStyles();
  const { memberInfo, handleChange } = props;
  const wordLibrary = useSelector(getWordLibrary);

  return (
    <EditSection className={classes.editSection}>
      <EditSectionHeader primary="個人資訊" style={{ paddingTop: 40 }} />
      <Grid item xs={12}>
        <Stack direction="column" marginBottom={2}>
          <ListItemText
            primary={wordLibrary?.name ?? "名稱"}
            primaryTypographyProps={{
              typography: "body2",
              color: "text.secondary",
              mb: 0.5,
            }}
          />
          <DynamicFieldWithAction
            name="memberName"
            label="Member Name"
            columnType={ColumnType.TEXT}
            value={memberInfo?.memberName}
            format={(value) =>
              parseDynamicColumnValue(ColumnType.TEXT, value as string)
            }
            boldText
            required
            handleChange={handleChange}
            readable
            writable
          />
        </Stack>
      </Grid>
      <Grid container>
        <Grid item xs={12}>
          <Stack direction="column" marginBottom={2}>
            <ListItemText
              primary="手機"
              primaryTypographyProps={{
                typography: "body2",
                color: "text.secondary",
                mb: 0.5,
              }}
            />
            <DynamicFieldWithAction
              name="memberPhone"
              label="Member Phone"
              columnType={ColumnType.TEXT}
              value={memberInfo?.memberPhone}
              format={(value) =>
                parseDynamicColumnValue(ColumnType.TEXT, value as string)
              }
              boldText
              handleChange={handleChange}
              readable
              writable
            />
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Stack direction="column" marginBottom={2}>
            <ListItemText
              primary="電子信箱"
              primaryTypographyProps={{
                typography: "body2",
                color: "text.secondary",
                mb: 0.5,
              }}
            />
            <DynamicFieldWithAction
              name="memberEmail"
              label="Member Email"
              columnType={ColumnType.TEXT}
              value={memberInfo?.memberEmail}
              format={(value) =>
                parseDynamicColumnValue(ColumnType.TEXT, value as string)
              }
              boldText
              handleChange={handleChange}
              readable
              writable
            />
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Stack direction="column" marginBottom={2}>
            <ListItemText
              primary="性別"
              primaryTypographyProps={{
                typography: "body2",
                color: "text.secondary",
                mb: 0.5,
              }}
            />
            <DynamicFieldWithAction
              name="memberGender"
              label="性別"
              columnType={ColumnType.CHOICE_ONE}
              options={genderOptions}
              value={memberInfo?.memberGender}
              format={(value) =>
                value ? GenderMap[value as number] : undefined
              }
              boldText
              handleChange={handleChange}
              readable
              writable
            />
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Stack direction="column" marginBottom={2}>
            <ListItemText
              primary="生日"
              primaryTypographyProps={{
                typography: "body2",
                color: "text.secondary",
                mb: 0.5,
              }}
            />
            <DynamicFieldWithAction
              name="memberBirth"
              label="Member Birthday"
              columnType={ColumnType.DATE}
              value={memberInfo?.memberBirth}
              maxDate={new Date()}
              format={(value) =>
                parseDynamicColumnValue(ColumnType.DATE, value as string)
              }
              boldText
              handleChange={handleChange}
              readable
              writable
            />
          </Stack>
        </Grid>
      </Grid>
    </EditSection>
  );
};

export default PersonalInfo;
