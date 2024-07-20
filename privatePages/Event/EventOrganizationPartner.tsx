import React, { FC, useMemo, useState } from "react";
import { zhCN } from "date-fns/locale";
import { zonedTimeToUtc } from "date-fns-tz";
import { useSelector } from "react-redux";

import { makeStyles } from "@mui/styles";
import Tooltip from "@mui/material/Tooltip";

import { format as formatDate } from "@eGroupAI/utils/dateUtils";
import {
  EachRowState,
  useDataTable,
} from "@eGroupAI/material-module/DataTable";
import { TableRowProps } from "@eGroupAI/material/TableRow";
import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import IconButton from "@mui/material/IconButton";
import EditSection from "components/EditSection";
import I18nDataTable from "components/I18nDataTable";
import SelectePartnersDialog, {
  DIALOG as PARTNER_DIALOG,
} from "components/SelectPartnerDialog";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import { OrganizationEvent, OrganizationPartner } from "interfaces/entities";
import { Button } from "@mui/material";
import Iconify from "minimal/components/iconify/iconify";

const useStyles = makeStyles(() => ({
  editSectionContainer: {
    padding: 0,
    borderRadius: 0,
    boxShadow: "none",
    marginBottom: 0,
    borderBottom: "1px solid #EEEEEE",
  },
}));

export interface Props {
  event?: OrganizationEvent;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdateEvent?: (values: { [key: string]: any }) => void;
  isLoadingEvent?: boolean;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
}

const EventOrganizationPartner: FC<Props> = (props) => {
  const {
    event,
    onUpdateEvent,
    isLoadingEvent = false,
    writable = false,
    deletable = false,
  } = props;
  const classes = useStyles();
  const wordLibrary = useSelector(getWordLibrary);
  const { openDialog, closeDialog } = useReduxDialog(PARTNER_DIALOG);
  const { openDialog: openDeleteDialog, closeDialog: closeDeleteDialog } =
    useReduxDialog(DELETE_DIALOG);

  const [deleteState, setDeleteState] = useState<boolean>(false);
  const [eachRowState, setEachRowState] = useState<
    EachRowState<
      OrganizationPartner & {
        TableRowProps: TableRowProps;
      }
    >
  >({});

  const {
    handleChangePage,
    handleRowsPerPageChange,
    handleFilterValuesChange,
    handleFilterValuesSubmit,
    handleFilterValuesClear,
    payload,
    setPayload,

    page,
    rowsPerPage,
  } = useDataTable(
    `EventPartnersDataTable-${event?.organizationEventId}`,
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );

  const selectedPartners = useMemo(() => {
    const checkedRows = Object.values(eachRowState).filter((el) => el?.checked);
    if (checkedRows.length === 0) {
      return [];
    }
    return checkedRows.reduce<OrganizationPartner[]>((a, b) => {
      if (!b) return a;
      if (b.checked) {
        return [...a, b.data as OrganizationPartner];
      }
      return a;
    }, []);
  }, [eachRowState]);

  const handleAddNewPartner = (partnerList) => {
    if (event) {
      const defaultPartnerIdList = event.organizationPartnerList?.map(
        (el) => el.organizationPartnerId
      );
      const partnerIdList = partnerList.map((el) => el.organizationPartnerId);
      const addedPartnerList = partnerList
        .filter(
          (partner) =>
            !defaultPartnerIdList?.includes(partner.organizationPartnerId)
        )
        .map((el) => ({
          organizationPartnerId: el.organizationPartnerId,
        }));
      const removedPartnerIdList = event.organizationPartnerList
        ?.filter(
          (partner) => !partnerIdList?.includes(partner.organizationPartnerId)
        )
        .map((el) => ({
          organizationPartnerId: el.organizationPartnerId,
        }));
      if (onUpdateEvent) {
        onUpdateEvent({
          organizationPartnerList: addedPartnerList,
          removeOrganizationPartnerList: removedPartnerIdList,
        });
        closeDialog();
      }
    }
  };

  const handleDeletePartner = () => {
    openDeleteDialog({
      primary: "Are you sure to delete?",
      onConfirm: () => {
        if (event) {
          const removeIdList = selectedPartners.map((el) => ({
            organizationPartnerId: el.organizationPartnerId,
          }));
          if (onUpdateEvent) {
            onUpdateEvent({
              removeOrganizationPartnerList: removeIdList,
            });
            setDeleteState(true);
            closeDeleteDialog();
          }
        }
      },
    });
  };

  const buttonTools = writable && (
    <Button
      onClick={openDialog}
      variant="contained"
      startIcon={<Iconify icon="mingcute:add-line" />}
    >
      {wordLibrary?.add ?? "新增"}
    </Button>
  );

  const selectedToolsbar = (
    <>
      {selectedPartners.length > 0 && deletable && (
        <Tooltip title={wordLibrary?.delete ?? "刪除"}>
          <IconButton
            onClick={() => {
              handleDeletePartner();
            }}
            color="primary"
          >
            <Iconify icon="solar:trash-bin-trash-bold" width={24} />
          </IconButton>
        </Tooltip>
      )}
    </>
  );

  const tableData = useMemo(
    () =>
      event?.organizationPartnerList
        ? event.organizationPartnerList.map((el) => ({
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
          }))
        : [],
    [event?.organizationPartnerList]
  );

  return (
    <>
      <EditSection
        sx={{ marginBottom: 2 }}
        className={classes.editSectionContainer}
      >
        <I18nDataTable
          columns={[
            {
              id: "organizationPartnerNameZh",
              name: `${wordLibrary?.name ?? "名稱"}`,
              dataKey: "organizationPartnerNameZh",
            },
            {
              id: "organizationPartnerAddress",
              name: `${wordLibrary?.address ?? "地址"}`,
              dataKey: "organizationPartnerAddress",
            },
            {
              id: "organizationPartnerWebsite",
              name: "網站",
              dataKey: "organizationPartnerWebsite",
            },
            {
              id: "organizationPartnerInvoiceTaxIdNumber",
              name: "統編",
              dataKey: "organizationPartnerInvoiceTaxIdNumber",
            },
            {
              id: "organizationPartnerTelephone",
              name: `${wordLibrary?.phone ?? "電話"}`,
              dataKey: "organizationPartnerTelephone",
            },
            {
              id: "organizationPartnerFax",
              name: "傳真",
              dataKey: "organizationPartnerFax",
            },
            {
              id: "organizationPartnerCreateDate",
              name: wordLibrary?.["creation time"] ?? "建立時間",
              dataKey: "organizationPartnerCreateDate",
              format: (val) =>
                formatDate(
                  zonedTimeToUtc(new Date(val), "Asia/Taipei"),
                  "PP pp",
                  {
                    locale: zhCN,
                  }
                ),
            },
          ]}
          rowKey="organizationPartnerId"
          data={tableData}
          serverSide
          enableRowCheckbox
          loading={isLoadingEvent}
          isEmpty={event?.organizationPartnerList?.length === 0}
          MuiTablePaginationProps={{
            count: event?.organizationPartnerList
              ? event.organizationPartnerList.length
              : 0,
            page,
            rowsPerPage,
            onPageChange: handleChangePage,
            onRowsPerPageChange: handleRowsPerPageChange,
          }}
          onEachRowStateChange={(state) => {
            setEachRowState(state);
          }}
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
          buttonTools={buttonTools}
          selectedToolsbar={selectedToolsbar}
          deleteState={deleteState}
          setDeleteState={setDeleteState}
        />
      </EditSection>
      <SelectePartnersDialog
        partnerList={event?.organizationPartnerList}
        onSubmit={handleAddNewPartner}
      />
    </>
  );
};

export default EventOrganizationPartner;
