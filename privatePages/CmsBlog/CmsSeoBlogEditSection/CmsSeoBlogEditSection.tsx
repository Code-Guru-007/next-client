import React, { FC } from "react";

import { useSelector } from "react-redux";
import useIsOpen from "@eGroupAI/hooks/useIsOpen";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useOrgBlog from "utils/useOrgBlog";
import { getGlobalLocale } from "components/PrivateLayout/selectors";

import IconButton from "components/IconButton/StyledIconButton";
import Tooltip from "@eGroupAI/material/Tooltip";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import Stack from "@mui/material/Stack";
import ListItemText from "@mui/material/ListItemText";
import Iconify from "minimal/components/iconify";
import { Locale } from "interfaces/utils";
import EditSection, { EditSectionProps } from "components/EditSection";
import EditSectionHeader, {
  EditSectionHeaderProps,
} from "components/EditSectionHeader";
import EditSectionDialog from "components/EditSectionDialog";
import CmsSeoBlogForm, { FORM } from "./CmsSeoBlogForm";

export interface CmsSeoBlogEditSectionProps extends EditSectionProps {
  blogId: string;
  primary?: EditSectionHeaderProps["primary"];
  selectedLocale?: Locale;
}

const CmsSeoBlogEditSection: FC<CmsSeoBlogEditSectionProps> = function (props) {
  const { blogId, primary, selectedLocale, ...other } = props;
  const wordLibrary = useSelector(getWordLibrary);
  const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);
  const { isOpen, handleClose, handleOpen } = useIsOpen(false);
  const { data, mutate: mutateCmsBlog } = useOrgBlog(
    {
      organizationId,
      organizationBlogId: blogId,
    },
    {
      locale: selectedLocale || locale,
    }
  );
  const { excute: updateOrgCmsSeo, isLoading } = useAxiosApiWrapper(
    apis.org.updateOrgCmsSeo,
    "Update"
  );

  return (
    <>
      <EditSectionDialog
        useLocaleTabs
        tableSelectedLocale={selectedLocale}
        primary={primary}
        open={isOpen}
        onClose={() => {
          handleClose();
        }}
        updating={isLoading}
        renderForm={(selectedLocale) => (
          <CmsSeoBlogForm
            organizationBlogId={data?.organizationBlogId}
            selectedLocale={selectedLocale}
            onSubmit={async (values, mutate) => {
              try {
                if (data) {
                  await updateOrgCmsSeo({
                    organizationId,
                    locale: selectedLocale,
                    targetId: data.organizationBlogId,
                    organizationCmsSeoTitle: values.organizationCmsSeoTitle,
                    organizationCmsSeoDescription:
                      values.organizationCmsSeoDescription,
                  });
                  mutate();
                  mutateCmsBlog();
                  handleClose();
                }
              } catch (error) {
                apis.tools.createLog({
                  function: "updateOrgCmsSeo: error",
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

export default CmsSeoBlogEditSection;
