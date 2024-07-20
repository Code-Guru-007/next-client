import React, { FC } from "react";

import useOrgBlog from "utils/useOrgBlog";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import apis from "utils/apis";
import useIsOpen from "@eGroupAI/hooks/useIsOpen";
import parseUpdateMediaPromises from "utils/parseUpdateMediaPromises";
import { format } from "@eGroupAI/utils/dateUtils/dateUtils";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import Knowledge from "@eGroupAI/material-module/infocenter/blog/Knowledge";
import CircularProgress from "@eGroupAI/material/CircularProgress";
import Center from "@eGroupAI/material-layout/Center";
import Tooltip from "@eGroupAI/material/Tooltip";
import IconButton from "components/IconButton/StyledIconButton";
import EditSectionHeader from "components/EditSectionHeader";
import EditSectionDialog from "components/EditSectionDialog";
import Iconify from "minimal/components/iconify";
import { Locale } from "interfaces/utils";

import EditBlogForm, { FORM } from "./EditBlogForm";

export interface BlogEditorProps {
  blogId: string;
  selectedLocale?: Locale;
}
const BlogEditor: FC<BlogEditorProps> = function (props) {
  const { blogId, selectedLocale } = props;
  const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);
  const { data } = useOrgBlog(
    {
      organizationId,
      organizationBlogId: blogId as string,
    },
    {
      locale,
    }
  );
  const { isOpen, handleClose, handleOpen } = useIsOpen(false);

  const { excute: updateOrgBlog, isLoading: isUpdating } = useAxiosApiWrapper(
    apis.org.updateOrgBlog,
    "Update"
  );

  return (
    <>
      <EditSectionDialog
        tableSelectedLocale={selectedLocale}
        primary="編輯文章"
        open={isOpen}
        onClose={handleClose}
        updating={isUpdating}
        renderForm={(selectedLocale) => (
          <EditBlogForm
            selectedLocale={selectedLocale}
            blogId={blogId as string}
            onSubmit={(values, mutate) => {
              const promises: Promise<unknown>[] = parseUpdateMediaPromises(
                organizationId,
                selectedLocale
              );
              promises.push(
                updateOrgBlog({
                  organizationId,
                  organizationBlogId: blogId as string,
                  organizationBlogTitle: values.organizationBlogTitle,
                  organizationBlogContent: values.organizationBlogContent,
                  locale: selectedLocale,
                })
              );
              Promise.all(promises)
                .then(() => {
                  mutate();
                  handleClose();
                })
                .catch((err) => {
                  apis.tools.createLog({
                    function: "UpdateBlogAndMedia: error",
                    browserDescription: window.navigator.userAgent,
                    jsonData: {
                      data: err,
                      deviceInfo: getDeviceInfo(),
                    },
                    level: "ERROR",
                  });
                });
            }}
          />
        )}
        form={FORM}
        isWidthSM={false}
      />
      <EditSectionHeader primary="編輯文章">
        <Tooltip title="編輯文章">
          <IconButton onClick={handleOpen}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        </Tooltip>
      </EditSectionHeader>
      {data ? (
        <Knowledge
          category={data.organizationTagTargetList
            ?.map((el) => el.organizationTag.tagName)
            .join(" ")}
          primary={data.organizationBlogTitle}
          author={data.organizationBlogAuthor}
          createDate={format(data.organizationBlogCreateDate, "PP pp")}
          visitsCount={data.organizationBlogVisitsCount}
          content={data.organizationBlogContent}
          prevUrl={
            data.organizationBlogPre?.organizationBlogId
              ? `/me/cms/blogs/${data.organizationBlogPre.organizationBlogId}`
              : undefined
          }
          nextUrl={
            data.organizationBlogNextBlog?.organizationBlogId
              ? `/me/cms/blogs/${data.organizationBlogNextBlog.organizationBlogId}`
              : undefined
          }
        />
      ) : (
        <Center height={700}>
          <CircularProgress />
        </Center>
      )}
    </>
  );
};

export default BlogEditor;
