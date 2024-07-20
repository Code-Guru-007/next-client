import React, { FC, useMemo } from "react";

import { useSelector } from "react-redux";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import useIsOpen from "@eGroupAI/hooks/useIsOpen";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import apis from "utils/apis";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useOrgCmsMenus from "utils/useOrgCmsMenus";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import { SNACKBAR } from "components/App";
import { Locale, PageType } from "interfaces/utils";

import Stack from "@mui/material/Stack";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "components/IconButton/StyledIconButton";
import Tooltip from "@eGroupAI/material/Tooltip";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import Iconify from "minimal/components/iconify";
import EditSection, { EditSectionProps } from "components/EditSection";
import EditSectionHeader, {
  EditSectionHeaderProps,
} from "components/EditSectionHeader";
import EditSectionDialog from "components/EditSectionDialog";
import CmsSeoPageForm, { FORM } from "./CmsSeoPageForm";

export interface CmsSeoPageEditSectionProps extends EditSectionProps {
  pageType: PageType;
  selectedLocale?: Locale;
  primary?: EditSectionHeaderProps["primary"];
  dialogTabShow?: boolean;
}

const CmsSeoPageEditSection: FC<CmsSeoPageEditSectionProps> = function (props) {
  const locale = useSelector(getGlobalLocale);
  const { pageType, primary, selectedLocale, dialogTabShow, ...other } = props;
  const wordLibrary = useSelector(getWordLibrary);
  const organizationId = useSelector(getSelectedOrgId);
  const { openSnackbar } = useReduxSnackbar<SnackbarProps>(SNACKBAR);
  const { isOpen, handleClose, handleOpen } = useIsOpen(false);
  const { data: cmsMenu, mutate: mutateCmsMenu } = useOrgCmsMenus(
    {
      organizationId,
    },
    {
      locale: selectedLocale || locale,
    }
  );
  const { excute: updateOrgCmsSeo, isLoading } = useAxiosApiWrapper(
    apis.org.updateOrgCmsSeo,
    "Update"
  );

  const data = useMemo(
    () => cmsMenu?.source.find((el) => el.organizationCmsPageType === pageType),
    [pageType, cmsMenu?.source]
  );

  return (
    <>
      <EditSectionDialog
        useLocaleTabs
        primary={primary}
        open={isOpen}
        onClose={() => {
          handleClose();
        }}
        updating={isLoading}
        renderForm={(selectedLocale) => (
          <CmsSeoPageForm
            organizationCmsMenuId={data?.organizationCmsMenuId}
            selectedLocale={selectedLocale}
            onSubmit={async (values, mutate) => {
              try {
                if (data) {
                  await updateOrgCmsSeo({
                    organizationId,
                    locale: selectedLocale,
                    targetId: data.organizationCmsMenuId,
                    organizationCmsSeoTitle: values.organizationCmsSeoTitle,
                    organizationCmsSeoDescription:
                      values.organizationCmsSeoDescription,
                  });
                  mutate();
                  mutateCmsMenu();
                } else {
                  openSnackbar({
                    message:
                      wordLibrary?.[
                        "you do not have permission to perform this operation"
                      ] ?? "您沒有操作權限",
                    severity: "error",
                    AlertProps: {
                      shape: "round",
                    },
                  });
                }
              } catch (error) {
                // eslint-disable-next-line no-console
                apis.tools.createLog({
                  function: "CmsSeoPagEditSection: handleDelete",
                  browserDescription: window.navigator.userAgent,
                  jsonData: {
                    data: error,
                    deviceInfo: getDeviceInfo(),
                  },
                  level: "ERROR",
                });
              }
            }}
          />
        )}
        form={FORM}
      />
      <EditSection {...other}>
        <EditSectionHeader primary={primary}>
          <Tooltip title="編輯SEO內容">
            <IconButton onClick={handleOpen}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>
        </EditSectionHeader>
        <Stack direction="column" marginBottom={2}>
          <ListItemText
            primary={wordLibrary?.title ?? "標題"}
            secondary={data?.organizationCmsSeo?.organizationCmsSeoTitle}
            primaryTypographyProps={{
              typography: "body2",
              color: "text.secondary",
              mb: 0.5,
            }}
            secondaryTypographyProps={{
              typography: "subtitle2",
              color: "text.primary",
              component: "span",
            }}
          />
        </Stack>
        <Stack direction="column" marginBottom={2}>
          <ListItemText
            primary={wordLibrary?.description ?? "描述"}
            secondary={data?.organizationCmsSeo?.organizationCmsSeoDescription}
            primaryTypographyProps={{
              typography: "body2",
              color: "text.secondary",
              mb: 0.5,
            }}
            secondaryTypographyProps={{
              typography: "subtitle2",
              color: "text.primary",
              component: "span",
            }}
          />
        </Stack>
      </EditSection>
    </>
  );
};

export default CmsSeoPageEditSection;
