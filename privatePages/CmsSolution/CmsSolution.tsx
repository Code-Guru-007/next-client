import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
// import { getGlobalLocale } from "components/PrivateLayout/selectors";

import { Container } from "@eGroupAI/material";
import { Main } from "@eGroupAI/material-layout";
import useTab from "@eGroupAI/hooks/useTab";

import { ContentType, Locale, PageType } from "interfaces/utils";
import useOrgSolution from "utils/useOrgSolution";
import useOrgCmsContents from "utils/useOrgCmsContents";
import useBreadcrumb from "utils/useBreadcrumb";

import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";

import { Box, Button, FormControl, MenuItem, Select } from "@mui/material";

import Iconify from "minimal/components/iconify";

import PrivateLayout from "components/PrivateLayout";
import ResponsiveTabs from "components/ResponsiveTabs";

import SolutionCmsContentEditor from "components/SolutionCmsContentEditor";
import { OrganizationCmsContent } from "interfaces/entities";

import { useReduxDialog } from "@eGroupAI/redux-modules";

import SolutionCmsContentsManageDialog, {
  DIALOG as CMS_CONTENTS_MANAGE_DAILOG,
} from "./SolutionCmsContentsManageDialog";
import SolutionInfoEditor from "./SolutionInfoEditor";
import SolutionCmsContentsManageForm, {
  FORM,
} from "./SolutionCmsContentsManageForm";
import SolutionInfoManagementContext from "./SolutionInfoManagementContext";
import SolutionCmsContentsManagementContext from "./SolutionCmsContentsManagementContext";

export type TabData = {
  label: string;
  value: string;
};

const CmsSolution = () => {
  const { pathname, query, push } = useRouter();
  const { solutionId } = query;

  // const locale = useSelector(getGlobalLocale);
  const wordLibrary = useSelector(getWordLibrary);
  const organizationId = useSelector(getSelectedOrgId);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const defaultTabs = [
    {
      label: "解決方案資訊",
      value: "info",
    },
  ];

  const [dynamicTabs, setDynamicTabs] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);

  const urlParams = new URLSearchParams(window.location.search);
  const tabValue = urlParams.get("tab");
  const { value, handleChange } = useTab<string>(
    "CmsSolution",
    (tabValue as string) || "none",
    true
  );

  useEffect(() => {
    if (query.tab) {
      handleChange(query.tab as string);
    }
  }, [handleChange, query, query.tab]);

  useEffect(() => {
    if (solutionId && value === "none") {
      handleChange(query.tab as string);
      push({
        pathname,
        query: {
          ...query,
          tab: query.tab || "info",
        },
      });
    }
  }, [handleChange, pathname, push, query, solutionId, value]);

  const {
    isOpen: openCmsContentsManageDialog,
    openDialog: setOpenCmsContentsManageDialog,
    closeDialog: closeCmsContentsManageDialog,
  } = useReduxDialog(CMS_CONTENTS_MANAGE_DAILOG);

  const [selectedLocale, setSelectedLocale] = useState<Locale>(Locale.ZH_TW);
  const [searchTableData, setSearchTableData] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [openSortDialog, setOpenSortDialog] = useState<boolean>(false);

  const {
    data: solutionInfo,
    mutate: solutionInfoMutate,
    isValidating: solutionInfoValidating,
  } = useOrgSolution(
    {
      organizationId,
      organizationSolutionId: (query.solutionId as string) || "",
    },
    {
      locale: selectedLocale,
    }
  );

  const {
    data: solutionCmsContents,
    mutate: solutionCmsContentsMutate,
    isValidating: solutionCmsContentsValidating,
  } = useOrgCmsContents(
    {
      organizationId,
    },
    {
      PAGE_TYPE_: PageType.CUSTOMIZE,
      targetId: solutionId as string,
      locale: selectedLocale,
    }
  );

  const { excute: createOrgCmsContent, isLoading: isCreating } =
    useAxiosApiWrapper(apis.org.createOrgCmsContent);
  const { excute: deleteOrgCmsContent, isLoading: isDeleting } =
    useAxiosApiWrapper(apis.org.deleteOrgCmsContent);
  const { excute: updateOrgCmsContent, isLoading: isUpdating } =
    useAxiosApiWrapper(apis.org.updateOrgCmsContent);
  // const { excute: updateOrgCmsContentSort, isLoading: isSorting } =
  //   useAxiosApiWrapper(apis.org.updateOrgCmsContentSort);

  const [arrangedSolutionCmsContents, setArrangedSolutionCmsContents] =
    useState<OrganizationCmsContent[]>([]);

  useEffect(() => {
    if (solutionCmsContents && solutionCmsContents?.source?.length) {
      // sort by organizationCmsContentSort
      setArrangedSolutionCmsContents(
        solutionCmsContents.source.sort(
          (a, b) =>
            Number(a.organizationCmsContentSort) -
            Number(b.organizationCmsContentSort)
        )
      );
    }
  }, [solutionCmsContents, solutionCmsContents?.source?.length]);

  useEffect(() => {
    const tabData: TabData[] = [];
    arrangedSolutionCmsContents.forEach((item, index) => {
      tabData.push({
        label: item.organizationCmsContentTitle || `UnDefined${index}`,
        value:
          `sort${String(item.organizationCmsContentSort)}` || `sort${index}`,
      });
    });
    setDynamicTabs(tabData);
  }, [arrangedSolutionCmsContents]);

  const tabs = useMemo(
    () => [...defaultTabs, ...dynamicTabs],
    [defaultTabs, dynamicTabs]
  );

  useBreadcrumb(solutionInfo?.organizationSolutionName || "");

  const translatedTitle = `${solutionInfo?.organizationSolutionName || ""} | ${
    wordLibrary?.["網站管理"] ?? "網站管理"
  } - ${wordLibrary?.["產品管理"] ?? "產品管理"} | ${
    wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
  }`;

  const contextValue = useMemo(
    () => ({
      solutionInfo,
      selectedLocale,
      setSelectedLocale,
    }),
    [selectedLocale, solutionInfo, setSelectedLocale]
  );

  const cmsContentsContextValue = useMemo(
    () => ({
      solutionInfo,
      selectedLocale,
      setSelectedLocale,
      cmsContentList: arrangedSolutionCmsContents,
    }),
    [
      selectedLocale,
      solutionInfo,
      setSelectedLocale,
      arrangedSolutionCmsContents,
    ]
  );

  const actionButton = useMemo(() => {
    if (value === "info") {
      return (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Button
            variant="contained"
            startIcon={<Iconify icon="icon-park-outline:add-web" />}
            onClick={() => setOpenCmsContentsManageDialog()}
            sx={{ mx: 1 }}
          >
            {wordLibrary?.["edit section"] ?? "編輯區塊"}
          </Button>
          <FormControl size="small">
            <Select
              labelId="demo-select-small-label"
              id="demo-select-small"
              value={selectedLocale}
              onChange={(e: any) => setSelectedLocale(e.target.value)}
            >
              <MenuItem value="zh_TW">繁體中文</MenuItem>
              <MenuItem value="en_US">English</MenuItem>
            </Select>
          </FormControl>
        </Box>
      );
    }
    return (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setOpenAddDialog(true)}
          sx={{ mx: 1 }}
        >
          {wordLibrary?.add ?? "新增"}
        </Button>
        <Button
          sx={{ mx: 1 }}
          variant="outlined"
          startIcon={<Iconify icon="akar-icons:sort" />}
          onClick={() => setOpenSortDialog(true)}
        >
          排序
        </Button>
        <FormControl size="small">
          <Select
            labelId="demo-select-small-label"
            id="demo-select-small"
            value={selectedLocale}
            onChange={(e: any) => setSelectedLocale(e.target.value)}
          >
            <MenuItem value="zh_TW">繁體中文</MenuItem>
            <MenuItem value="en_US">English</MenuItem>
          </Select>
        </FormControl>
      </Box>
    );
  }, [selectedLocale, value, wordLibrary, setOpenCmsContentsManageDialog]);

  return (
    <PrivateLayout title={translatedTitle} actionsButton={actionButton}>
      <Main>
        <ResponsiveTabs
          value={value}
          tabData={tabs}
          onChange={(value) => {
            push({
              pathname,
              query: {
                ...query,
                tab: value,
              },
            });
          }}
        />
        <SolutionCmsContentsManagementContext.Provider
          value={cmsContentsContextValue}
        >
          <SolutionCmsContentsManageDialog
            open={openCmsContentsManageDialog}
            pageType={PageType.CUSTOMIZE}
            targetId={solutionInfo?.organizationSolutionId || ""}
            form={FORM}
            updating={
              solutionCmsContentsValidating ||
              isCreating ||
              isDeleting ||
              isUpdating
              // isSorting
            }
            title={wordLibrary?.management ?? "管理"}
            subTitle={wordLibrary?.["drag and drop"] ?? "拖移圖片進行排序"}
            selectedLocale={selectedLocale}
            renderForm={() => (
              <SolutionCmsContentsManageForm
                solutionInfo={solutionInfo}
                onSubmit={({
                  newContents,
                  modifiedContents,
                  deletedContents,
                  // allList,
                }) => {
                  /* delete solution cms contents */
                  const deletePromises = deletedContents?.map((content) =>
                    deleteOrgCmsContent({
                      organizationId,
                      organizationCmsContentId:
                        content.organizationCmsContentId,
                    })
                  );

                  /*  update solution cms content */
                  const updatePromises = modifiedContents.map((content) =>
                    updateOrgCmsContent({
                      organizationId,
                      organizationCmsContentId:
                        content.organizationCmsContentId || "",
                      locale: selectedLocale,
                      organizationCmsContentTitle:
                        content.organizationCmsContentTitle,
                    })
                  );

                  /*  create new solution cms contents */
                  const newPromises = newContents.map((content) =>
                    createOrgCmsContent({
                      organizationId,
                      targetId: solutionInfo?.organizationSolutionId || "",
                      organizationCmsPageType: PageType.CUSTOMIZE,
                      locale: selectedLocale,
                      organizationCmsContentTitle:
                        content.organizationCmsContentTitle,
                      organizationCmsContentType: ContentType.CUSTOMIZE,
                    })
                  );

                  const allPromises = [
                    ...deletePromises,
                    ...newPromises,
                    ...updatePromises,
                  ];

                  Promise.all(allPromises)
                    .then(() => {
                      // updateOrgCmsContentSort({
                      //   organizationId,
                      //   organizationCmsId:
                      //     solutionInfo?.organizationSolutionId || "",
                      //   organizationCmsContentList: allList.map((l) => ({
                      //     organizationCmsContentId: l.organizationCmsContentId,
                      //   })),
                      // });
                      solutionCmsContentsMutate();
                      closeCmsContentsManageDialog();
                    })
                    .catch(() => {});
                }}
              />
            )}
          />
        </SolutionCmsContentsManagementContext.Provider>
        <Container maxWidth={false}>
          <SolutionInfoManagementContext.Provider value={contextValue}>
            {value === "info" && (
              <SolutionInfoEditor
                solutionId={solutionId as string}
                solutionInfo={solutionInfo}
                selectedLocale={selectedLocale}
                // onEditClose={() => {
                //   solutionInfoMutate();
                // }}
                infoMutate={solutionInfoMutate}
                loading={solutionInfoValidating}
              />
            )}
          </SolutionInfoManagementContext.Provider>
          {arrangedSolutionCmsContents?.map((cmsContent, index) => {
            const tabValue =
              `sort${String(cmsContent.organizationCmsContentSort)}` ||
              `sort${index}`;
            if (value === tabValue)
              return (
                <SolutionCmsContentEditor
                  key={cmsContent.organizationCmsContentId}
                  setSortOpenDialog={setOpenSortDialog}
                  sortOpenDialog={openSortDialog}
                  setSearchTableData={setSearchTableData}
                  searchTableData={searchTableData}
                  pageType={PageType.CUSTOMIZE}
                  contentType={ContentType.CUSTOMIZE}
                  title={cmsContent.organizationCmsContentTitle}
                  openAddDialog={openAddDialog}
                  tableSelectedLocale={selectedLocale}
                  setOpenAddDialog={setOpenAddDialog}
                  data={cmsContent}
                  onEditClose={() => {
                    solutionCmsContentsMutate();
                  }}
                  loading={solutionCmsContentsValidating}
                />
              );
            return <></>;
          })}
        </Container>
      </Main>
    </PrivateLayout>
  );
};

export default CmsSolution;
