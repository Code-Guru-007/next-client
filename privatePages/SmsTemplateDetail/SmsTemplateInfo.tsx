import React, { FC, useState } from "react";
import { useSelector } from "react-redux";
import clsx from "clsx";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import { Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Stack from "@mui/material/Stack";
import ListItemText from "@mui/material/ListItemText";
import Grid from "@eGroupAI/material/Grid";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { ColumnType } from "@eGroupAI/typings/apis";
import CircularProgress from "@eGroupAI/material/CircularProgress";
import Typography from "@eGroupAI/material/Typography";
import Center from "@eGroupAI/material-layout/Center";

import { getWordLibrary } from "redux/wordLibrary/selectors";

import DynamicFieldWithAction from "components/DynamicField/DynamicFieldWithAction";
import EditSection from "components/EditSection";
import EditSectionHeader from "components/EditSectionHeader";
import TagAutocompleteWithAction from "components/TagAutocompleteWithAction";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useOrgTagsByGroups from "utils/useOrgTagsByGroups";
import useOrgTagGroups from "utils/useOrgTagGroups";
import { ServiceModuleValue } from "interfaces/utils";
import { OrganizationSmsTemplate } from "interfaces/entities";
import { useSettingsContext } from "minimal/components/settings";

import SmsTemplateInfoHistoryDialog, {
  DIALOG as HISTORY_DIALOG,
  RecordTarget,
} from "./SmstemplateInfoHistoryDialog";

const useStyles = makeStyles((theme: Theme) => ({
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
  editSectionContainer: {
    borderRadius: 0,
    boxShadow: "none",
    marginBottom: 0,
    borderBottom: `1px solid ${theme.palette.grey[500]}`,
  },
  headerEditSectionContainer: {
    borderRadius: 0,
    boxShadow: "none",
    minHeight: "500px",
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
  editor: {
    "& .fr-toolbar": {
      top: 0,
      position: "sticky",
      zIndex: 1000,
    },
  },
}));

export interface SmsTemplateInfoProps {
  organizationSmsTemplateId?: string;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
  smsTemplate: OrganizationSmsTemplate | undefined;
  mutate: () => void;
  isValidating: boolean;
}

const SmsTemplateInfo: FC<SmsTemplateInfoProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const {
    organizationSmsTemplateId,
    readable = false,
    writable = false,
    deletable = false,
    smsTemplate,
    mutate,
    isValidating,
  } = props;
  const classes = useStyles();
  const settings = useSettingsContext();

  const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);

  const { data } = useOrgTagGroups(
    {
      organizationId,
    },
    {
      locale,
      serviceModuleValue: ServiceModuleValue.SMS_TEMPLATE,
    }
  );

  const tags = useOrgTagsByGroups(data?.source);
  const { openDialog: openHistoryDialog } = useReduxDialog(HISTORY_DIALOG);
  const [recordTarget, setRecordTarget] = useState<RecordTarget>({});

  const { excute: updateSmsTemplate } = useAxiosApiWrapper(
    apis.org.updateSmsTemplate,
    "Update"
  );

  const { excute: createSmsTemplateTagList, isLoading: isTagCreating } =
    useAxiosApiWrapper(apis.org.createSmsTemplateTagList, "Create");

  const { excute: deleteSmsTemplateTag, isLoading: isTagDeleting } =
    useAxiosApiWrapper(apis.org.deleteSmsTemplateTag, "Delete");

  const handleHistoryClick = (r?: RecordTarget) => {
    if (r) {
      setRecordTarget(r);
      openHistoryDialog();
    }
  };

  const handleUpdateSmsTemplateTitle = async (_, newValue) => {
    const { organizationSmsTemplateContent } = smsTemplate || {};
    try {
      await updateSmsTemplate({
        organizationId,
        organizationSmsTemplateId: smsTemplate?.organizationSmsTemplateId,
        organizationSmsTemplateTitle: newValue.value,
        organizationSmsTemplateContent,
      });
      mutate();
    } catch (error) {
      apis.tools.createLog({
        function: "DatePicker: handleUpdateSmsTemplateTitle",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: error,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
    }
  };

  const handleUpdateSmsTemplateContent = async (_, newValue) => {
    const { organizationSmsTemplateTitle } = smsTemplate || {};
    try {
      await updateSmsTemplate({
        organizationId,
        organizationSmsTemplateId: smsTemplate?.organizationSmsTemplateId,
        organizationSmsTemplateTitle,
        organizationSmsTemplateContent: newValue.value,
      });
      mutate();
    } catch (error) {
      apis.tools.createLog({
        function: "DatePicker: handleUpdateSmsTemplateContent",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: error,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
    }
  };

  const handleTagSmsTemplate = (value) => {
    const { organizationTagList } = value;
    return createSmsTemplateTagList({
      organizationId,
      organizationSmsTemplateId: smsTemplate?.organizationSmsTemplateId,
      organizationTagList: [...organizationTagList],
    }).then(() => {
      if (mutate) mutate();
    });
  };

  const handleDeleteSmsTemplateTag = (v) => {
    const { organizationId, tagId } = v;
    return deleteSmsTemplateTag({
      organizationId,
      tagId,
      organizationSmsTemplateId,
    }).then(() => {
      if (mutate) mutate();
    });
  };

  return (
    <>
      {!readable && (
        <Center offsetTop={200}>
          <Typography variant="h5">
            {wordLibrary?.["no such permission"] ?? "無此權限"}
          </Typography>
        </Center>
      )}
      {readable && (
        <>
          <EditSection className={classes.editSectionContainer}>
            {!smsTemplate && <p>No Data</p>}
            {smsTemplate && (
              <TagAutocompleteWithAction
                targetId={organizationId}
                writable={writable}
                deletable={deletable}
                selectedTags={
                  smsTemplate.organizationTagTargetList?.map(
                    (el) => el.organizationTag
                  ) || []
                }
                options={tags || []}
                onAddTag={handleTagSmsTemplate}
                onRemoveTag={handleDeleteSmsTemplateTag}
                isLoading={isTagCreating || isTagDeleting || isValidating}
              />
            )}
          </EditSection>
          <EditSection className={classes.headerEditSectionContainer}>
            <EditSectionHeader
              primary={wordLibrary?.["edit sms template"] ?? "編輯簡訊範本"}
            />
            <Grid container spacing={2} position="relative">
              <div
                className={clsx(
                  classes.loader,
                  isValidating && classes.showLoader,
                  {
                    [classes.lightOpacity]: settings.themeMode === "light",
                    [classes.darkOpacity]: settings.themeMode !== "light",
                  }
                )}
              >
                <CircularProgress />
              </div>
              <Grid item xs={12}>
                <Stack direction="column">
                  <ListItemText
                    primary={wordLibrary?.title ?? "標題"}
                    primaryTypographyProps={{
                      typography: "body2",
                      color: "text.secondary",
                      mb: 0.5,
                    }}
                  />
                  <DynamicFieldWithAction
                    value={smsTemplate?.organizationSmsTemplateTitle || ""}
                    name="SmsTemplateTitle"
                    columnType={ColumnType.TEXT}
                    boldText
                    handleClickHistory={handleHistoryClick}
                    handleChange={handleUpdateSmsTemplateTitle}
                    readable={readable}
                    writable={writable}
                    deletable={deletable}
                    id="sms-template-title"
                  />
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack direction="column">
                  <ListItemText
                    primary={wordLibrary?.content ?? "內容"}
                    primaryTypographyProps={{
                      typography: "body2",
                      color: "text.secondary",
                      mb: 0.5,
                    }}
                  />
                  <DynamicFieldWithAction
                    value={smsTemplate?.organizationSmsTemplateContent || ""}
                    name="SmsTemplateContent"
                    columnType={ColumnType.TEXT}
                    boldText
                    handleClickHistory={handleHistoryClick}
                    handleChange={handleUpdateSmsTemplateContent}
                    readable={readable}
                    writable={writable}
                    deletable={deletable}
                    id="sms-template-content"
                  />
                </Stack>
              </Grid>
            </Grid>
          </EditSection>
          {smsTemplate && (
            <SmsTemplateInfoHistoryDialog
              targetId={smsTemplate.organizationSmsTemplateId}
              recordTarget={recordTarget}
            />
          )}
        </>
      )}
    </>
  );
};

export default SmsTemplateInfo;
