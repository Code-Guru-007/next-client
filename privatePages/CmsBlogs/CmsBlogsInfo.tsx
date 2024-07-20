import React, { FC, useState } from "react";
import { makeStyles } from "@mui/styles";
import { Box } from "@mui/material";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useOrgBlogs from "utils/useOrgBlogs";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { Locale, PageType } from "interfaces/utils";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";

import CmsSeoPageEditSection from "components/CmsSeoPageEditSection";
import OrgMediaSliderEditor from "components/OrgMediaSliderEditor";
import EditSectionDialog from "components/EditSectionDialog";
import parseCreateMediaListApiPayload from "utils/parseCreateMediaListApiPayload";
import Grid from "@eGroupAI/material/Grid";
import Pagination from "./Pagination";
import CategoryCard from "./CategoryCard";
import CreateBlogForm, { FORM } from "./CreateBlogForm";

const useStyles = makeStyles({
  editSectionContainer: {
    borderRadius: 16,
    marginTop: "30px",
    overflow: "hidden",
    // borderBottom: "1px solid #EEEEEE",
  },
});

const perPage = 5;
interface CmsBlogsProps {
  tabData: string;
  dialogProps: {
    openAddDialog: boolean;
    sortOpenDialog: boolean;
    setOpenAddDialog: any;
    setSortOpenDialog: any;
    selectedLocale: Locale;
    isOpen: boolean;
    handleClose: any;
  };
}
const CmsBlogs: FC<CmsBlogsProps> = function ({ tabData, dialogProps }) {
  const {
    openAddDialog,
    selectedLocale,
    setOpenAddDialog,
    setSortOpenDialog,
    sortOpenDialog,
    isOpen,
    handleClose,
  } = dialogProps;
  const wordLibrary = useSelector(getWordLibrary);
  const classes = useStyles();
  const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);
  const { excute: createOrgBlog, isLoading: isCreating } = useAxiosApiWrapper(
    apis.org.createOrgBlog,
    "Create"
  );

  const [page, setPage] = useState(1);
  const {
    data: blogs,
    mutate,
    isValidating,
  } = useOrgBlogs(
    {
      organizationId,
    },
    {
      locale,
      startIndex: (page - 1) * perPage,
    }
  );

  return (
    <>
      <EditSectionDialog
        primary="文章"
        open={isOpen}
        tableSelectedLocale={selectedLocale}
        onClose={handleClose}
        updating={isCreating}
        renderForm={(selectedLocale) => (
          <CreateBlogForm
            onSubmit={async (values) => {
              try {
                await createOrgBlog({
                  organizationId,
                  organizationBlogTitle: values.organizationBlogTitle,
                  organizationBlogContent: values.organizationBlogContent,
                  organizationMediaList: parseCreateMediaListApiPayload(
                    values.organizationMediaList
                  ),
                  locale: selectedLocale,
                });
                mutate();
                handleClose();
              } catch (error) {
                apis.tools.createLog({
                  function: "createOrgBlog: error",
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
        isWidthSM={false}
      />
      {tabData === "info" && (
        <CmsSeoPageEditSection
          primary={wordLibrary?.["article list seo"] ?? "文章列表SEO"}
          pageType={PageType.BLOG}
          selectedLocale={selectedLocale}
          className={classes.editSectionContainer}
        />
      )}
      {tabData === "articleListCarousel" && (
        <Box className={classes.editSectionContainer}>
          <OrgMediaSliderEditor
            openAddDialog={openAddDialog}
            openSortModel={sortOpenDialog}
            setOpenAddDialog={setOpenAddDialog}
            setOpenSortModel={setSortOpenDialog}
            tableSelectedLocale={selectedLocale}
            pageType={PageType.BLOG}
            title="文章列表輪播圖"
          />
        </Box>
      )}

      {tabData === "articleManagement" && (
        <Box className={classes.editSectionContainer}>
          <Grid container>
            <Grid item xs={12}>
              <CategoryCard
                dataUpdate={mutate}
                data={blogs}
                isLoading={isValidating}
              />
            </Grid>
          </Grid>
          <Pagination
            count={Math.ceil((blogs?.total ?? 0) / perPage)}
            pageNum={page}
            onChange={(val) => setPage(val)}
          />
        </Box>
      )}
    </>
  );
};

export default CmsBlogs;
