import React, { FC, useState } from "react";
import { useSelector } from "react-redux";
import clsx from "clsx";

import { makeStyles } from "@mui/styles";
import Stack from "@mui/material/Stack";
import ListItemText from "@mui/material/ListItemText";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
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
import { useSettingsContext } from "minimal/components/settings";
import { ServiceModuleValue } from "interfaces/utils";
import { OrganizationSesTemplate } from "interfaces/entities";
import SesTemplateInfoHistoryDialog, {
  DIALOG as HISTORY_DIALOG,
  RecordTarget,
} from "./SesTemplateInfoHistoryDialog";

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
  editSectionContainer: {
    borderRadius: 0,
    boxShadow: "none",
    marginBottom: 0,
    borderBottom: `1px solid ${theme.palette.grey[600]}`,
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

export interface SesTemplateInfoProps {
  organizationSesTemplateId?: string;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
  sesTemplate: OrganizationSesTemplate | undefined;
  mutate: () => void;
  isValidating: boolean;
}

const SesTemplateInfo: FC<SesTemplateInfoProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const {
    organizationSesTemplateId,
    readable = false,
    writable = false,
    deletable = false,
    sesTemplate,
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
      serviceModuleValue: ServiceModuleValue.SES_TEMPLATE,
    }
  );

  const tags = useOrgTagsByGroups(data?.source);
  const { openDialog: openHistoryDialog } = useReduxDialog(HISTORY_DIALOG);
  const [recordTarget, setRecordTarget] = useState<RecordTarget>({});

  const { excute: updateSesTemplate } = useAxiosApiWrapper(
    apis.org.updateSesTemplate,
    "Update"
  );

  const { excute: createSesTemplateTagList, isLoading: isTagCreating } =
    useAxiosApiWrapper(apis.org.createSesTemplateTagList, "Create");

  const { excute: deleteSesTemplateTag, isLoading: isTagDeleting } =
    useAxiosApiWrapper(apis.org.deleteSesTemplateTag, "Delete");

  const handleHistoryClick = (r?: RecordTarget) => {
    if (r) {
      setRecordTarget(r);
      openHistoryDialog();
    }
  };

  const handleUpdateSesTemplateTitle = async (name, newValue) => {
    const { organizationSesTemplateContent } = sesTemplate || {};
    try {
      await updateSesTemplate({
        organizationId,
        organizationSesTemplateId: sesTemplate?.organizationSesTemplateId,
        organizationSesTemplateTitle: newValue.value,
        organizationSesTemplateContent,
      });
      mutate();
    } catch (error) {
      apis.tools.createLog({
        function: "DatePicker: handleUpdateSesTemplateTitle",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: error,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
    }
  };

  const handleUpdateSesTemplateContent = async (name, newValue) => {
    const { organizationSesTemplateTitle } = sesTemplate || {};
    try {
      await updateSesTemplate({
        organizationId,
        organizationSesTemplateId: sesTemplate?.organizationSesTemplateId,
        organizationSesTemplateTitle,
        organizationSesTemplateContent: newValue.value,
      });
      mutate();
    } catch (error) {
      apis.tools.createLog({
        function: "DatePicker: handleUpdateSesTemplateContent",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: error,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
    }
  };

  const handleTagSesTemplate = (value) => {
    const { organizationTagList } = value;
    return createSesTemplateTagList({
      organizationId,
      organizationSesTemplateId: sesTemplate?.organizationSesTemplateId,
      organizationTagList: [...organizationTagList],
    }).then(() => {
      if (mutate) mutate();
    });
  };

  const handleDeleteSesTemplateTag = (v) => {
    const { organizationId, tagId } = v;
    return deleteSesTemplateTag({
      organizationId,
      tagId,
      organizationSesTemplateId,
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
            {!sesTemplate && <p>No Data</p>}
            {sesTemplate && (
              <TagAutocompleteWithAction
                targetId={organizationId}
                writable={writable}
                deletable={deletable}
                selectedTags={
                  sesTemplate.organizationTagTargetList?.map(
                    (el) => el.organizationTag
                  ) || []
                }
                options={tags || []}
                onAddTag={handleTagSesTemplate}
                onRemoveTag={handleDeleteSesTemplateTag}
                isLoading={isTagCreating || isTagDeleting || isValidating}
              />
            )}
          </EditSection>
          <EditSection className={classes.headerEditSectionContainer}>
            <EditSectionHeader
              primary={
                wordLibrary?.["edit email template"] ?? "編輯電子郵件範本"
              }
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
                    value={sesTemplate?.organizationSesTemplateTitle || ""}
                    name="sesTemplateTitle"
                    columnType={ColumnType.TEXT}
                    boldText
                    handleClickHistory={handleHistoryClick}
                    handleChange={handleUpdateSesTemplateTitle}
                    readable={readable}
                    writable={writable}
                    deletable={deletable}
                    id="ses-template-title"
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
                    value={sesTemplate?.organizationSesTemplateContent || ""}
                    name="sesTemplateContent"
                    columnType={ColumnType.TEXT}
                    boldText
                    handleClickHistory={handleHistoryClick}
                    handleChange={handleUpdateSesTemplateContent}
                    readable={readable}
                    writable={writable}
                    deletable={deletable}
                    id="ses-template-content"
                  />
                </Stack>
              </Grid>
            </Grid>
          </EditSection>
          {sesTemplate && (
            <SesTemplateInfoHistoryDialog
              targetId={sesTemplate.organizationSesTemplateId}
              recordTarget={recordTarget}
            />
          )}
        </>
      )}
    </>
  );
};

export default SesTemplateInfo;
