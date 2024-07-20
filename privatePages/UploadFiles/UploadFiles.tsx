import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import Main from "@eGroupAI/material-layout/Main";
import Container from "@eGroupAI/material/Container";
import useTab from "@eGroupAI/hooks/useTab";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import useDataTableFilterColumns from "utils/useDataTableFilterColumns";
import useOrgUploadFilesFilterSearchInfinite from "utils/useOrgUploadFilesFilterSearchInfinite";
import { useDataTable } from "@eGroupAI/material-module/DataTable";
import { DefaultPayload } from "@eGroupAI/material-module/DataTable/useDataTable";

import PrivateLayout from "components/PrivateLayout";
import ResponsiveTabs from "components/ResponsiveTabs";
import { ServiceModuleValue, Table } from "interfaces/utils";
import TagGroupsDataTable from "components/TagGroups/TagGroupsDataTable";
import useModulePermissionValid from "components/PermissionValid/useModulePermissionValid";

import UploadFilesContext from "./UploadFilesContext";
import UploadFilesDataTable from "./UploadFilesDataTable";
import UploadFilesGridView from "./UploadFilesGridView";

interface UploadFilesDefaultPayload extends DefaultPayload {
  startIndex?: number;
}

const UploadFiles = function () {
  const wordLibrary = useSelector(getWordLibrary);
  const tabData = [
    {
      value: "files",
      label: wordLibrary?.files ?? "檔案",
      id: "upload-files-files-tab",
      testId: "upload-files-files-tab",
    },
    {
      value: "tagGroup",
      label: wordLibrary?.["label management"] ?? "標籤管理",
      id: "upload-files-tagGroup-tab",
      testId: "upload-files-tagGroup-tab",
    },
  ];
  const { query, push, pathname } = useRouter();
  const organizationId = useSelector(getSelectedOrgId);
  const {
    handleChangePage,
    handleRowsPerPageChange,
    handleSearchChange,
    handleFilterValuesChange,
    handleSelectFilterView,
    handleFilterValuesSubmit,
    handleFilterValuesClear,
    payload,
    setPayload,
    submitedPayload,
    setSubmitedPayload,
    page,
    rowsPerPage,
  } = useDataTable<UploadFilesDefaultPayload>(
    `UploadFilesDataTable-${organizationId}`,
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );
  const {
    columns,
    filterSearch,
    filterConditionGroups,
    isFilterConditionGroupsValidating,
    handleFilterSubmit,
    handleFilterClear,
  } = useDataTableFilterColumns(
    Table.UPLOADFILE,
    setPayload,
    payload,
    setSubmitedPayload,
    submitedPayload
  );
  const { data, mutate, setSize, isValidating } =
    useOrgUploadFilesFilterSearchInfinite(
      {
        organizationId,
      },
      filterSearch,
      undefined,
      filterSearch?.size,
      undefined,
      !(filterSearch?.size && filterSearch?.size > 0)
    );

  const uploadFilesContextValue = useMemo(
    () => ({
      handleChangePage,
      handleRowsPerPageChange,
      handleSearchChange,
      handleFilterValuesChange,
      handleSelectFilterView,
      handleFilterValuesSubmit,
      handleFilterValuesClear,
      page,
      rowsPerPage,
      filterConditionGroups,
      handleFilterSubmit,
      handleFilterClear,
      isValidating,
      filterSearch,
      payload,
      mutate,
      columns,
      isFilterConditionGroupsValidating,
      setPayload,
    }),
    [
      handleChangePage,
      handleRowsPerPageChange,
      handleSearchChange,
      handleFilterValuesChange,
      handleSelectFilterView,
      handleFilterValuesSubmit,
      handleFilterValuesClear,
      page,
      rowsPerPage,
      filterConditionGroups,
      handleFilterSubmit,
      handleFilterClear,
      isValidating,
      filterSearch,
      payload,
      mutate,
      columns,
      isFilterConditionGroupsValidating,
      setPayload,
    ]
  );

  const urlParams = new URLSearchParams(window.location.search);
  const tabValue = urlParams.get("tab");
  const { value, handleChange } = useTab<string>(
    "UploadFiles",
    (tabValue as string) || "none",
    true
  );

  const [browserMode, setBrowserMode] = useState<"table" | "grid">("table");

  const { hasModulePermission: tagGroup } = useModulePermissionValid({
    targetPath: "/me/tag-groups",
    modulePermissions: ["LIST", "READ"],
  });

  useEffect(() => {
    if (query.tab) {
      handleChange(query.tab as string);
    }
  }, [handleChange, query.tab]);

  useEffect(() => {
    if (value === "none") {
      push({
        pathname,
        query: {
          ...query,
          tab: query.tab || "files",
        },
      });
    }
  }, [pathname, push, query, handleChange, value]);

  const translatedTitle = `${wordLibrary?.["檔案管理"] ?? "檔案管理"} | ${
    wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
  }`;

  return (
    <PrivateLayout title={translatedTitle}>
      <Main>
        <Container maxWidth={false}>
          <ResponsiveTabs
            value={String(value)}
            tabData={
              tagGroup ? tabData : tabData.filter(({ value }) => value !== "1")
            }
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
          <UploadFilesContext.Provider value={uploadFilesContextValue}>
            {value === "files" && browserMode === "table" && (
              <UploadFilesDataTable
                organizationId={organizationId}
                changeBrowserMode={(mode: "table" | "grid") => {
                  setBrowserMode(mode);
                }}
                data={data ? data[0] : { source: [], total: 0 }}
              />
            )}
            {value === "files" && browserMode === "grid" && (
              <UploadFilesGridView
                organizationId={organizationId}
                changeBrowserMode={(mode: "table" | "grid") => {
                  setBrowserMode(mode);
                }}
                data={data}
                setSize={setSize}
              />
            )}
          </UploadFilesContext.Provider>
          {value === "tagGroup" && (
            <TagGroupsDataTable
              organizationId={organizationId}
              serviceModuleValue={ServiceModuleValue.FILES}
            />
          )}
        </Container>
      </Main>
    </PrivateLayout>
  );
};

export default UploadFiles;
