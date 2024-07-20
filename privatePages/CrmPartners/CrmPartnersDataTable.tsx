import React, { FC, useEffect, useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import {
  useDataTable,
  EachRowState,
} from "@eGroupAI/material-module/DataTable";
import useOrgPartnerFilterSearch from "utils/useOrgPartnerFilterSearch";
import { DefaultPayload } from "@eGroupAI/material-module/DataTable/useDataTable";
import Paper from "@eGroupAI/material/Paper";
import Tooltip from "@eGroupAI/material/Tooltip";
import StyledSearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { TableRowProps } from "@eGroupAI/material/TableRow";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import I18nDataTable from "components/I18nDataTable";
import PermissionValid from "components/PermissionValid";
import PartnerDataTableRow from "components/PartnerDataTableRow";

import { ServiceModuleValue, Table } from "interfaces/utils";
import { OrganizationPartner } from "interfaces/entities";
import { OrganizationEvent } from "interfaces/payloads";
import useDataTableFilterColumns from "utils/useDataTableFilterColumns";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";

import OrgPartnerDialog, {
  DIALOG as ORG_PARTNER_DIALOG,
} from "components/OrgPartnerDialog";

import {
  TagAddDialog,
  TAG_ADD_DIALOG,
  TagDeleteDialog,
  TAG_DELETE_DIALOG,
} from "components/DatatableToolDialogs";

import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Iconify from "minimal/components/iconify/iconify";

import CrmPartnerEventDialog, {
  DIALOG as EVENT_DIALOG,
} from "components/EventDialog";

interface CrmPartnerDefaultPayload extends DefaultPayload {
  startIndex?: number;
}

interface Props {
  isCreated: boolean;
}

const CrmPartnersDataTable: FC<Props> = function (props) {
  const { isCreated } = props;
  const organizationId = useSelector(getSelectedOrgId);
  const { openDialog, closeDialog: closePartnerInfoDialog } =
    useReduxDialog(ORG_PARTNER_DIALOG);

  const { openDialog: openTagDialog } = useReduxDialog(
    `${ServiceModuleValue.CRM_PARTNER}_${TAG_ADD_DIALOG}`
  );
  const { openDialog: openTagDeleteDialog } = useReduxDialog(
    `${ServiceModuleValue.CRM_PARTNER}_${TAG_DELETE_DIALOG}`
  );

  const { openDialog: openEventDialog, closeDialog: closeEventDialog } =
    useReduxDialog(EVENT_DIALOG);
  const [deleteState, setDeleteState] = useState<boolean>(false);
  const [eachRowState, setEachRowState] = useState<
    EachRowState<
      OrganizationPartner & {
        TableRowProps: TableRowProps;
      }
    >
  >({});
  const [checkedAll, setCheckedAll] = useState<boolean>(false);

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
  } = useDataTable<CrmPartnerDefaultPayload>(
    `CrmPartnersDataTable-${organizationId}`,
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
    Table.PARTNERS,
    setPayload,
    payload,
    setSubmitedPayload,
    submitedPayload
  );

  const { data, isValidating, mutate } = useOrgPartnerFilterSearch(
    {
      organizationId,
    },
    filterSearch,
    undefined,
    undefined,
    !filterSearch
  );

  const wordLibrary = useSelector(getWordLibrary);

  const { excute: createOrgPartner, isLoading: isCreating } =
    useAxiosApiWrapper(apis.org.createOrgPartner, "Create");

  const { excute: createOrgPartnerEvent, isLoading: isCreatingTargetsEvents } =
    useAxiosApiWrapper(apis.org.createOrgPartnerEvent, "Create");
  useEffect(() => {
    if (isCreated) {
      mutate();
    }
  }, [isCreated, mutate]);

  const selectedPartners = useMemo(
    () =>
      Object.values(eachRowState)
        .filter((el) => el?.checked)
        .map((el) => {
          const { TableRowProps: trp, ...other } = el?.data || {};
          return other as OrganizationPartner;
        }),
    [eachRowState]
  );

  const selectedPartnersIdList = useMemo(
    () => selectedPartners.map((p) => p.organizationPartnerId),
    [selectedPartners]
  );

  const excludedTargetIdList = useMemo(
    () =>
      Object.values(eachRowState)
        .filter((el) => !el?.checked)
        .map((el) => el?.data?.organizationPartnerId as string),
    [eachRowState]
  );

  const selectedTagIdList = useMemo(
    () =>
      selectedPartners
        .filter(
          (partner) => (partner?.organizationTagTargetList?.length ?? 0) > 0
        )
        .flatMap((partner) =>
          partner?.organizationTagTargetList?.map((tag) => tag?.id?.tagId)
        ),
    [selectedPartners]
  );

  const handleCheckedAllClick = useCallback(() => {
    setCheckedAll(true);
  }, []);

  const handleCheckedAllClearClick = useCallback(() => {
    setCheckedAll(false);
  }, []);

  const handleCreateOrgEvent = useCallback(
    async (organizationEvent: OrganizationEvent) => {
      try {
        await createOrgPartnerEvent({
          organizationId,
          targetIdList: selectedPartnersIdList,
          organizationEvent,
        });
        closeEventDialog();
      } catch (error) {
        apis.tools.createLog({
          function: "DatePicker: handleCreateOrgEvent",
          browserDescription: window.navigator.userAgent,
          jsonData: {
            data: error,
            deviceInfo: getDeviceInfo(),
          },
          level: "ERROR",
        });
      }
    },
    [
      closeEventDialog,
      createOrgPartnerEvent,
      organizationId,
      selectedPartnersIdList,
    ]
  );

  const buttonTools = (
    <PermissionValid shouldBeOrgOwner modulePermissions={["CREATE"]}>
      <Button
        onClick={() => {
          openDialog();
        }}
        variant="contained"
        startIcon={<Iconify icon="mingcute:add-line" />}
      >
        {wordLibrary?.add ?? "新增"}
      </Button>
    </PermissionValid>
  );

  const selectedToolsbar = (
    <>
      {selectedPartners.length !== 0 && (
        <PermissionValid shouldBeOrgOwner modulePermissions={["UPDATE_ALL"]}>
          <Tooltip title="批次建立事件">
            <div role="button" tabIndex={-1}>
              <IconButton
                onClick={() => {
                  openEventDialog();
                }}
                color="primary"
              >
                <Iconify icon="ic:baseline-calendar-month" width={24} />
              </IconButton>
            </div>
          </Tooltip>
        </PermissionValid>
      )}
      {selectedPartners.length !== 0 && (
        <PermissionValid shouldBeOrgOwner modulePermissions={["UPDATE_ALL"]}>
          <Tooltip title={wordLibrary?.["batch tagging"] ?? "批次標註"}>
            <div role="button" tabIndex={-1}>
              <IconButton
                onClick={() => {
                  openTagDialog();
                }}
                disabled={
                  (!checkedAll && selectedPartners.length === 0) ||
                  (checkedAll && data?.total === excludedTargetIdList.length)
                }
                color="primary"
              >
                <Iconify icon="ic:baseline-local-offer" width={24} />
              </IconButton>
            </div>
          </Tooltip>
        </PermissionValid>
      )}
      {(checkedAll || selectedPartners.length !== 0) &&
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
                    (!checkedAll && selectedPartners.length === 0) ||
                    (checkedAll && data?.total === excludedTargetIdList.length)
                  }
                  color="primary"
                >
                  <Iconify icon="mdi:tag-off" width={24} />
                </IconButton>
              </div>
            </Tooltip>
          </PermissionValid>
        )}
    </>
  );

  const tableData = useMemo(
    () =>
      !data
        ? []
        : data.source.map((el) => ({
            ...el,
            TableRowProps: {
              hover: true,
              sx: { cursor: "pointer" },
              onClick: (e) => {
                e.stopPropagation();
                window.open(
                  `/me/crm/partners/${el.organizationPartnerId}`,
                  "_blank"
                );
              },
            },
          })),
    [data]
  );

  return (
    <>
      <Paper>
        <I18nDataTable
          columns={columns}
          rowKey="organizationPartnerId"
          data={tableData}
          renderDataRow={(rowData) => {
            const row = rowData as OrganizationPartner;

            return (
              <PartnerDataTableRow
                columns={columns}
                row={row}
                key={row.organizationPartnerId}
                handleClick={(e) => {
                  e.stopPropagation();
                  window.open(
                    `/me/crm/partners/${row.organizationPartnerId}`,
                    "_blank"
                  );
                }}
              />
            );
          }}
          onEachRowStateChange={(state) => {
            setEachRowState(state);
          }}
          isEmpty={data?.total === 0}
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
          serviceModuleValue={ServiceModuleValue.CRM_PARTNER}
          buttonTools={buttonTools}
          selectedToolsbar={selectedToolsbar}
          payload={payload}
          enableFilter
          filterConditionGroups={filterConditionGroups}
          onFilterViewSelect={handleSelectFilterView}
          onFilterValuesChange={handleFilterValuesChange}
          onFilterValuesSubmit={handleFilterValuesSubmit}
          onFilterValuesClear={handleFilterValuesClear}
          onCheckedAllClick={handleCheckedAllClick}
          onCheckedAllClearClick={handleCheckedAllClearClick}
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
      <OrgPartnerDialog
        loading={isCreating}
        onConfirm={(p) => {
          createOrgPartner({
            organizationId,
            ...p,
          })
            .then(() => {
              mutate();
              closePartnerInfoDialog();
            })
            .catch(() => {});
        }}
      />
      {filterSearch && (
        <TagAddDialog
          filterSearch={filterSearch}
          tableModule={Table.PARTNERS}
          serviceModuleValue={ServiceModuleValue.CRM_PARTNER}
          isCheckedAllPageRows={checkedAll}
          selectedTargetIds={selectedPartnersIdList}
          excludeSelectedTargetIds={excludedTargetIdList}
          onSuccess={() => {
            mutate();
          }}
        />
      )}
      {filterSearch && (
        <TagDeleteDialog
          filterSearch={filterSearch}
          tableModule={Table.PARTNERS}
          serviceModuleValue={ServiceModuleValue.CRM_PARTNER}
          isCheckedAllPageRows={checkedAll}
          selectedTargetIds={selectedPartnersIdList}
          excludeSelectedTargetIds={excludedTargetIdList}
          onSuccess={() => {
            setDeleteState(true);
            mutate();
          }}
          selectedTagIdList={checkedAll ? undefined : selectedTagIdList}
        />
      )}
      <CrmPartnerEventDialog
        organizationId={organizationId}
        onSubmit={(values) => {
          if (values)
            handleCreateOrgEvent({
              organizationEventTitle: values.organizationEventTitle || "",
              organizationEventDescription:
                values.organizationEventDescription || "",
              organizationEventAddress: values.organizationEventAddress || "",
              organizationEventStartDate:
                values.organizationEventStartDate || "",
              organizationEventEndDate: values.organizationEventEndDate || "",
              uploadFileList: values.uploadFileList?.length
                ? values.uploadFileList.map((el) => ({
                    uploadFileId: el.uploadFileId,
                  }))
                : undefined,
              organizationMemberList: values.organizationMemberList?.length
                ? values.organizationMemberList.map((el) => ({
                    member: {
                      loginId: el.member.loginId,
                    },
                  }))
                : undefined,
              organizationTagList: values.organizationTagList?.length
                ? values.organizationTagList.map((el) => ({
                    tagId: el.tagId,
                  }))
                : undefined,
            });
        }}
        loading={isCreatingTargetsEvents}
      />
    </>
  );
};

export default CrmPartnersDataTable;
