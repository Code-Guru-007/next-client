import React, { useState } from "react";

import useMemberOrgInfo from "utils/useMemberOrgInfo";

import {
  getSelectedOrgId,
  setSelectedOrg,
} from "@eGroupAI/redux-modules/memberOrgs";
import { useDispatch, useSelector } from "react-redux";

import { getGlobalLocale } from "components/PrivateLayout/selectors";
import Typography from "@eGroupAI/material/Typography";

import { UpdateOrgInfoApiPayload } from "interfaces/payloads";
import { makeStyles } from "@mui/styles";
import Stack from "@mui/material/Stack";
import ListItemText from "@mui/material/ListItemText";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import TextField from "@eGroupAI/material/TextField";
import { ColumnType } from "@eGroupAI/typings/apis";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import OrgInfoHistoryDialog, {
  DIALOG,
  RecordTarget,
} from "./OrgInfoHistoryDialog";

import OrgInfoHeader from "./OrgInfoHeader";

export interface OrgInfoEditorProps {
  editable?: boolean;
}
const useStyles = makeStyles(() => ({
  textField: {
    display: "flex",
    flexWrap: "wrap",
    "& .MuiTypography-root": {
      fontSize: "15px",
    },
  },
  textTitle: {
    padding: "8px 0 8px 0",
    minWidth: 145,
  },
}));

function OrgInfoEditor(props: OrgInfoEditorProps) {
  const wordLibrary = useSelector(getWordLibrary);
  const { editable = false } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);
  const { openDialog: openHistoryDialog } = useReduxDialog(DIALOG);
  const [recordTarget, setRecordTarget] = useState<RecordTarget>({});

  const { data, mutate } = useMemberOrgInfo(
    {
      organizationId,
    },
    {
      locale,
    }
  );

  const { excute: updateOrgInfo } = useAxiosApiWrapper(
    apis.member.updateOrgInfo,
    "Update"
  );

  const handleOnClickHistory = (r?: RecordTarget) => {
    if (r) {
      setRecordTarget(r);
      openHistoryDialog();
    }
  };

  const handleOnChangeWithAction = (value, name) => {
    const payload = {
      organizationAddress: data?.organizationAddress,
      organizationArea: data?.organizationArea,
      organizationCity: data?.organizationCity,
      organizationCountry: data?.organizationCountry,
      organizationEmail: data?.organizationEmail,
      organizationFacebookUrl: data?.organizationFacebookUrl,
      organizationId: data?.organizationId,
      organizationInvoiceTaxIdNumber: data?.organizationInvoiceTaxIdNumber,
      organizationName: data?.organizationName,
      organizationTelephone: data?.organizationTelephone,
      organizationWebsite: data?.organizationWebsite,
      organizationYoutubeUrl: data?.organizationYoutubeUrl,
      organizationZIPCode: data?.organizationZIPCode,
    };
    const fieldSet = { locale, ...payload };
    const newFieldSet = {
      ...fieldSet,
      [name]: value,
    };
    return updateOrgInfo({
      ...newFieldSet,
    } as UpdateOrgInfoApiPayload)
      .then(({ data }) => {
        mutate();
        dispatch(setSelectedOrg({ ...data }));
        return "success";
      })
      .catch(() => "failed");
  };

  return (
    <>
      {!!data && (
        <div>
          <OrgInfoHeader />
          <Stack direction="column" marginBottom={2}>
            <ListItemText
              primary={wordLibrary?.name ?? "名稱"}
              primaryTypographyProps={{
                typography: "body2",
                color: "text.secondary",
                mb: 0.5,
              }}
            />
            <TextField
              onChangeWithAction={(v) =>
                handleOnChangeWithAction(v, "organizationName")
              }
              onClickHistory={() => {
                handleOnClickHistory({
                  key: "organizationName",
                  type: ColumnType.TEXT,
                  name: "名稱",
                });
              }}
              name="organizationName"
              writable={editable}
              enableAction
              showHistoryIcon
              boldTextWithAction
              value={data?.organizationName || ""}
            />
          </Stack>
          <Stack direction="column" marginBottom={2}>
            <ListItemText
              primary={wordLibrary?.email ?? "Email"}
              primaryTypographyProps={{
                typography: "body2",
                color: "text.secondary",
                mb: 0.5,
              }}
            />
            <TextField
              onChangeWithAction={(v) =>
                handleOnChangeWithAction(v, "organizationEmail")
              }
              onClickHistory={() => {
                handleOnClickHistory({
                  key: "organizationEmail",
                  type: ColumnType.TEXT,
                  name: "Email",
                });
              }}
              name="organizationEmail"
              writable={editable}
              enableAction
              showHistoryIcon
              boldTextWithAction
              value={data?.organizationEmail || ""}
            />
          </Stack>
          <Stack direction="column" marginBottom={2}>
            <ListItemText
              primary={wordLibrary?.phone ?? "電話"}
              primaryTypographyProps={{
                typography: "body2",
                color: "text.secondary",
                mb: 0.5,
              }}
            />
            <TextField
              onChangeWithAction={(v) =>
                handleOnChangeWithAction(v, "organizationTelephone")
              }
              onClickHistory={() => {
                handleOnClickHistory({
                  key: "organizationTelephone",
                  type: ColumnType.TEXT,
                  name: "電話",
                });
              }}
              name="organizationTelephone"
              writable={editable}
              enableAction
              showHistoryIcon
              boldTextWithAction
              value={data?.organizationTelephone || ""}
            />
          </Stack>
          <Stack direction="column" marginBottom={2}>
            <ListItemText
              primary={wordLibrary?.["unified business number"] ?? "統一編號"}
              primaryTypographyProps={{
                typography: "body2",
                color: "text.secondary",
                mb: 0.5,
              }}
            />
            <TextField
              onChangeWithAction={(v) =>
                handleOnChangeWithAction(v, "organizationInvoiceTaxIdNumber")
              }
              onClickHistory={() => {
                handleOnClickHistory({
                  key: "organizationInvoiceTaxIdNumber",
                  type: ColumnType.TEXT,
                  name: "統一編號",
                });
              }}
              name="organizationInvoiceTaxIdNumber"
              writable={editable}
              enableAction
              showHistoryIcon
              boldTextWithAction
              value={data?.organizationInvoiceTaxIdNumber || ""}
            />
          </Stack>
          <Stack direction="column" marginBottom={2}>
            <ListItemText
              primary={wordLibrary?.country ?? "國家"}
              primaryTypographyProps={{
                typography: "body2",
                color: "text.secondary",
                mb: 0.5,
              }}
            />
            <TextField
              onChangeWithAction={(v) =>
                handleOnChangeWithAction(v, "organizationCountry")
              }
              onClickHistory={() => {
                handleOnClickHistory({
                  key: "organizationCountry",
                  type: ColumnType.TEXT,
                  name: "國家",
                });
              }}
              name="organizationCountry"
              writable={editable}
              enableAction
              showHistoryIcon
              boldTextWithAction
              value={data?.organizationCountry || ""}
            />
          </Stack>
          <Stack direction="column" marginBottom={2}>
            <ListItemText
              primary={wordLibrary?.city ?? "城市"}
              primaryTypographyProps={{
                typography: "body2",
                color: "text.secondary",
                mb: 0.5,
              }}
            />
            <TextField
              onChangeWithAction={(v) =>
                handleOnChangeWithAction(v, "organizationCity")
              }
              onClickHistory={() => {
                handleOnClickHistory({
                  key: "organizationCity",
                  type: ColumnType.TEXT,
                  name: "城市",
                });
              }}
              name="organizationCity"
              writable={editable}
              enableAction
              showHistoryIcon
              boldTextWithAction
              value={data?.organizationCity || ""}
            />
          </Stack>
          <Stack direction="column" marginBottom={2}>
            <ListItemText
              primary={wordLibrary?.region ?? "地區"}
              primaryTypographyProps={{
                typography: "body2",
                color: "text.secondary",
                mb: 0.5,
              }}
            />
            <TextField
              onChangeWithAction={(v) =>
                handleOnChangeWithAction(v, "organizationArea")
              }
              onClickHistory={() => {
                handleOnClickHistory({
                  key: "organizationArea",
                  type: ColumnType.TEXT,
                  name: "地區",
                });
              }}
              name="organizationArea"
              writable={editable}
              enableAction
              showHistoryIcon
              boldTextWithAction
              value={data?.organizationArea || ""}
            />
          </Stack>
          <Stack direction="column" marginBottom={2}>
            <ListItemText
              primary={wordLibrary?.address ?? "地址"}
              primaryTypographyProps={{
                typography: "body2",
                color: "text.secondary",
                mb: 0.5,
              }}
            />
            <TextField
              onChangeWithAction={(v) =>
                handleOnChangeWithAction(v, "organizationAddress")
              }
              onClickHistory={() => {
                handleOnClickHistory({
                  key: "organizationAddress",
                  type: ColumnType.TEXT,
                  name: "地址",
                });
              }}
              name="organizationAddress"
              writable={editable}
              enableAction
              showHistoryIcon
              boldTextWithAction
              value={data?.organizationAddress || ""}
            />
          </Stack>
          <Stack direction="column" marginBottom={2}>
            <ListItemText
              primary={wordLibrary?.["postal code"] ?? "郵遞區號"}
              primaryTypographyProps={{
                typography: "body2",
                color: "text.secondary",
                mb: 0.5,
              }}
            />
            <TextField
              onChangeWithAction={(v) =>
                handleOnChangeWithAction(v, "organizationZIPCode")
              }
              onClickHistory={() => {
                handleOnClickHistory({
                  key: "organizationZIPCode",
                  type: ColumnType.TEXT,
                  name: "郵遞區號",
                });
              }}
              name="organizationZIPCode"
              writable={editable}
              enableAction
              showHistoryIcon
              boldTextWithAction
              value={data?.organizationZIPCode || ""}
            />
          </Stack>
          <Stack direction="column" marginBottom={2}>
            <ListItemText
              primary={
                wordLibrary?.["facebook fan page link"] ?? "FB粉絲團連結"
              }
              primaryTypographyProps={{
                typography: "body2",
                color: "text.secondary",
                mb: 0.5,
              }}
            />
            <TextField
              onChangeWithAction={(v) =>
                handleOnChangeWithAction(v, "organizationFacebookUrl")
              }
              onClickHistory={() => {
                handleOnClickHistory({
                  key: "organizationFacebookUrl",
                  type: ColumnType.TEXT,
                  name: "FB粉絲團連結",
                });
              }}
              name="organizationFacebookUrl"
              writable={editable}
              enableAction
              showHistoryIcon
              boldTextWithAction
              value={data?.organizationFacebookUrl || ""}
            />
          </Stack>
          <Stack direction="column" marginBottom={2}>
            <ListItemText
              primary={
                wordLibrary?.["youtube channel link"] ?? "Youtube頻道連結"
              }
              primaryTypographyProps={{
                typography: "body2",
                color: "text.secondary",
                mb: 0.5,
              }}
            />
            <TextField
              onChangeWithAction={(v) =>
                handleOnChangeWithAction(v, "organizationYoutubeUrl")
              }
              onClickHistory={() => {
                handleOnClickHistory({
                  key: "organizationYoutubeUrl",
                  type: ColumnType.TEXT,
                  name: "Youtube頻道連結",
                });
              }}
              name="organizationYoutubeUrl"
              writable={editable}
              enableAction
              showHistoryIcon
              boldTextWithAction
              value={data?.organizationYoutubeUrl || ""}
            />
          </Stack>
          <OrgInfoHistoryDialog
            targetId={data.organizationId}
            recordTarget={recordTarget}
          />
        </div>
      )}
      {!data && (
        <div>
          <OrgInfoHeader />
          <div className={classes.textField}>
            <Typography variant="body1" className={classes.textTitle}>
              {wordLibrary?.name ?? "名稱"}
            </Typography>
          </div>
          <div className={classes.textField}>
            <Typography variant="body1" className={classes.textTitle}>
              Email
            </Typography>
          </div>
          <div className={classes.textField}>
            <Typography variant="body1" className={classes.textTitle}>
              {wordLibrary?.phone ?? "電話"}
            </Typography>
          </div>
          <div className={classes.textField}>
            <Typography variant="body1" className={classes.textTitle}>
              {wordLibrary?.["unified business number"] ?? "統一編號"}
            </Typography>
          </div>
          <div className={classes.textField}>
            <Typography variant="body1" className={classes.textTitle}>
              {wordLibrary?.country ?? "國家"}
            </Typography>
          </div>
          <div className={classes.textField}>
            <Typography variant="body1" className={classes.textTitle}>
              {wordLibrary?.city ?? "城市"}
            </Typography>
          </div>
          <div className={classes.textField}>
            <Typography variant="body1" className={classes.textTitle}>
              {wordLibrary?.region ?? "地區"}
            </Typography>
          </div>
          <div className={classes.textField}>
            <Typography variant="body1" className={classes.textTitle}>
              {wordLibrary?.address ?? "地址"}
            </Typography>
          </div>
          <div className={classes.textField}>
            <Typography variant="body1" className={classes.textTitle}>
              {wordLibrary?.["postal code"] ?? "郵遞區號"}
            </Typography>
          </div>
          <div className={classes.textField}>
            <Typography variant="body1" className={classes.textTitle}>
              {wordLibrary?.["facebook fan page link"] ?? "FB粉絲團連結"}
            </Typography>
          </div>
          <div className={classes.textField}>
            <Typography variant="body1" className={classes.textTitle}>
              {wordLibrary?.["youtube channel link"] ?? "Youtube頻道連結"}
            </Typography>
          </div>
        </div>
      )}
    </>
  );
}

export default OrgInfoEditor;
