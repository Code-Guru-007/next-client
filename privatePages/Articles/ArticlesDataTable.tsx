/* eslint-disable @typescript-eslint/no-shadow */
import React, { FC, useCallback, useMemo, useState } from "react";
import { useRouter } from "next/router";

import {
  EachRowState,
  useDataTable,
} from "@eGroupAI/material-module/DataTable";
import { DefaultPayload } from "@eGroupAI/material-module/DataTable/useDataTable";
import { useSelector } from "react-redux";

import Paper from "@eGroupAI/material/Paper";
import Tooltip from "@eGroupAI/material/Tooltip";
import StyledSearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import I18nDataTable from "components/I18nDataTable";
import ArticleDataTableRow from "components/ArticleDataTableRow";
import PermissionValid from "components/PermissionValid";

import { ServiceModuleValue, Table } from "interfaces/utils";
import { OrganizationArticle } from "interfaces/entities";
import { TableRowProps } from "@eGroupAI/material/TableRow";

import useDataTableFilterColumns from "utils/useDataTableFilterColumns";
import useOrgArticleFilterSearch from "utils/useOrgArticleFilterSearch";

import { useReduxDialog } from "@eGroupAI/redux-modules";
import {
  TagAddDialog,
  TAG_ADD_DIALOG,
  TagDeleteDialog,
  TAG_DELETE_DIALOG,
} from "components/DatatableToolDialogs";
import { IconButton } from "@mui/material";
import Iconify from "minimal/components/iconify/iconify";

import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { LoadingButton } from "@mui/lab";
import { useSettingsContext } from "minimal/components/settings";

interface ArticleDefaultPayload extends DefaultPayload {
  startIndex?: number;
}

interface Props {
  organizationId: string;
  isRelease?: number;
  tableName: string;
}

const ArticlesDataTable: FC<Props> = function (props) {
  const { organizationId, isRelease = 0, tableName } = props;

  const [deleteState, setDeleteState] = useState<boolean>(false);
  const [eachRowState, setEachRowState] = useState<
    EachRowState<
      OrganizationArticle & {
        TableRowProps: TableRowProps;
      }
    >
  >({});
  const [checkedAll, setCheckedAll] = useState<boolean>(false);

  const router = useRouter();
  const settings = useSettingsContext();

  const { openDialog: openTagDialog } = useReduxDialog(
    `${ServiceModuleValue.ARTICLE}_${TAG_ADD_DIALOG}`
  );
  const { openDialog: openTagDeleteDialog } = useReduxDialog(
    `${ServiceModuleValue.ARTICLE}_${TAG_DELETE_DIALOG}`
  );

  const {
    handleChangePage,
    handleRowsPerPageChange,
    handleSearchChange,
    handleSelectFilterView,
    handleFilterValuesChange,
    handleFilterValuesSubmit,
    handleFilterValuesClear,
    payload,
    setPayload,
    submitedPayload,
    setSubmitedPayload,
    page,
    rowsPerPage,
  } = useDataTable<ArticleDefaultPayload>(
    `${tableName}-${organizationId}`,
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
    Table.ARTICLES,
    setPayload,
    payload,
    setSubmitedPayload,
    submitedPayload
  );

  const handleCheckedAllClick = useCallback(() => {
    setCheckedAll(true);
  }, []);

  const handleCheckedAllClearClick = useCallback(() => {
    setCheckedAll(false);
  }, []);

  const { excute: createOrgArticle, isLoading: isCreating } =
    useAxiosApiWrapper(apis.org.createOrgArticle, "Create");

  const wordLibrary = useSelector(getWordLibrary);

  const { data, isValidating, mutate } = useOrgArticleFilterSearch(
    {
      organizationId,
    },
    filterSearch,
    {
      isRelease: isRelease.toString(),
    },
    undefined,
    !filterSearch
  );

  const selectedArticles = useMemo(
    () =>
      Object.values(eachRowState)
        .filter((el) => el?.checked)
        .map((el) => {
          const { TableRowProps: trp, ...other } = el?.data || {};
          return other as OrganizationArticle;
        }),
    [eachRowState]
  );

  const selectedArticlesIdList = useMemo(
    () => selectedArticles.map((p) => p.articleId),
    [selectedArticles]
  );

  const selectedTagIdList = useMemo(
    () =>
      selectedArticles
        .filter((article) => article.organizationTagTargetList.length > 0)
        .flatMap((article) =>
          article.organizationTagTargetList.map((tag) => tag?.id?.tagId)
        ),
    [selectedArticles]
  );

  const excludedTargetIdList = useMemo(
    () =>
      Object.values(eachRowState)
        .filter((el) => !el?.checked)
        .map((el) => el?.data?.articleId as string),
    [eachRowState]
  );

  const buttonTools = (
    <PermissionValid shouldBeOrgOwner modulePermissions={["CREATE"]}>
      <Tooltip title={wordLibrary?.add ?? "新增文章"}>
        <LoadingButton
          onClick={() => {
            createOrgArticle({
              organizationId,
              articleTitle: wordLibrary?.untitled ?? "未命名",
              articleContent: "",
              organizationTagList: [],
              isRelease: 0,
              isPinned: 0,
            })
              .then((res) => {
                router.push(`/me/articles/${res.data.articleId}/edit`);
                settings.onUpdate("themeLayout", "mini");
              })
              .catch(() => {});
          }}
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          loading={isCreating}
          id="article-add-button"
          data-tid="article-add-button"
        >
          {wordLibrary?.add ?? "新增"}
        </LoadingButton>
      </Tooltip>
    </PermissionValid>
  );

  const selectedToolsbar = (
    <>
      {selectedArticles.length !== 0 && (
        <PermissionValid shouldBeOrgOwner modulePermissions={["UPDATE_ALL"]}>
          <Tooltip title={wordLibrary?.["batch tagging"] ?? "批次標註"}>
            <div role="button" tabIndex={-1}>
              <IconButton
                onClick={() => {
                  openTagDialog();
                }}
                disabled={
                  (!checkedAll && selectedArticles.length === 0) ||
                  (checkedAll && data?.total === excludedTargetIdList.length)
                }
                color="primary"
                id="article-tag-add-button"
                data-tid="artilce-tag-add-button"
              >
                <Iconify icon="ic:baseline-local-offer" width={24} />
              </IconButton>
            </div>
          </Tooltip>
        </PermissionValid>
      )}
      {(checkedAll || selectedArticles.length !== 0) &&
        selectedTagIdList.length !== 0 && (
          <PermissionValid shouldBeOrgOwner modulePermissions={["DELETE_ALL"]}>
            <Tooltip
              title={wordLibrary?.["batch tagging delete"] ?? "批次標註刪除"}
            >
              <div role="button" tabIndex={-1}>
                <IconButton
                  onClick={() => {
                    openTagDeleteDialog();
                  }}
                  disabled={
                    (!checkedAll && selectedArticles.length === 0) ||
                    (checkedAll && data?.total === excludedTargetIdList.length)
                  }
                  color="primary"
                  id="article-tag-del-btn"
                  data-tid="article-tag-del-btn"
                >
                  <Iconify icon="mdi:tag-off" width={24} />
                </IconButton>
              </div>
            </Tooltip>
          </PermissionValid>
        )}
    </>
  );

  return (
    <div>
      <Paper>
        <I18nDataTable
          columns={columns}
          rowKey="articleId"
          data={!data ? [] : data?.source}
          renderDataRow={(rowData) => {
            const row = rowData as OrganizationArticle;

            return (
              <ArticleDataTableRow
                columns={columns}
                row={row}
                key={row.articleId}
                handleClick={(e) => {
                  e.stopPropagation();
                  window.open(`/me/articles/${row.articleId}`, "_blank");
                }}
              />
            );
          }}
          isEmpty={data?.total === 0}
          onEachRowStateChange={(state) => {
            setEachRowState(state);
          }}
          enableReportTool
          filterSearch={filterSearch}
          serverSide
          loading={
            isValidating || isFilterConditionGroupsValidating || !filterSearch
          }
          MuiTablePaginationProps={{
            count: data?.total ?? 0,
            page,
            rowsPerPage,
            onPageChange: handleChangePage,
            onRowsPerPageChange: handleRowsPerPageChange,
          }}
          enableRowCheckbox
          onCheckedAllClick={handleCheckedAllClick}
          onCheckedAllClearClick={handleCheckedAllClearClick}
          buttonTools={buttonTools}
          selectedToolsbar={selectedToolsbar}
          serviceModuleValue={ServiceModuleValue.ARTICLE}
          payload={payload}
          onFilterViewSelect={handleSelectFilterView}
          enableFilter
          filterConditionGroups={filterConditionGroups}
          onFilterValuesChange={handleFilterValuesChange}
          onFilterValuesSubmit={handleFilterValuesSubmit}
          onFilterValuesClear={handleFilterValuesClear}
          filterValues={payload.filterValues}
          onSortLabelClick={(sortKey, order) => {
            setPayload((p) => ({
              ...p,
              sort: {
                sortKey,
                order: order.toUpperCase(),
              },
            }));
          }}
          FilterDropDownProps={{
            onSubmit: handleFilterSubmit,
            onClear: handleFilterClear,
          }}
          searchBar={
            <StyledSearchBar
              handleSearchChange={handleSearchChange}
              value={payload.query}
              placeholder={
                wordLibrary?.["search and press Enter"] ?? "搜尋並按Enter"
              }
            />
          }
          deleteState={deleteState}
          setDeleteState={setDeleteState}
        />
      </Paper>
      {filterSearch && (
        <TagAddDialog
          filterSearch={filterSearch}
          tableModule={Table.ARTICLES}
          serviceModuleValue={ServiceModuleValue.ARTICLE}
          isCheckedAllPageRows={checkedAll}
          selectedTargetIds={selectedArticlesIdList}
          excludeSelectedTargetIds={excludedTargetIdList}
          onSuccess={() => {
            mutate();
          }}
        />
      )}
      {filterSearch && (
        <TagDeleteDialog
          filterSearch={filterSearch}
          tableModule={Table.ARTICLES}
          serviceModuleValue={ServiceModuleValue.ARTICLE}
          isCheckedAllPageRows={checkedAll}
          selectedTargetIds={selectedArticlesIdList}
          excludeSelectedTargetIds={excludedTargetIdList}
          onSuccess={() => {
            setDeleteState(true);
            mutate();
          }}
          selectedTagIdList={checkedAll ? undefined : selectedTagIdList}
        />
      )}
    </div>
  );
};

export default ArticlesDataTable;
