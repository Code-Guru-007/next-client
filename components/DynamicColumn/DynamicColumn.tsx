import React, { FC, useState } from "react";
import { useSelector } from "react-redux";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useReduxDialog } from "@eGroupAI/redux-modules";

import DynamicColumnDataTable from "components/DynamicColumnDataTable";
import { OrganizationColumn } from "interfaces/entities";
import { ColumnTable, ServiceModuleValue } from "interfaces/utils";

import DynamicColumnsDialog, { DIALOG } from "components/DynamicColumnsDialog";
import DynamicColumnsSortDialog, {
  DIALOG as SORT_DIALOG,
} from "components/DynamicColumnsDialog/DynamicColumnSortDialog";

interface Props {
  columnTable: ColumnTable;
  serviceModuleValue: ServiceModuleValue;
  columnTableString: string;
  dynamicFieldTypeEnable?: boolean;
}

const DynamicColumn: FC<Props> = function (props) {
  const {
    columnTable,
    serviceModuleValue,
    columnTableString,
    dynamicFieldTypeEnable,
  } = props;
  const orgId = useSelector(getSelectedOrgId);
  const { openDialog } = useReduxDialog(DIALOG);
  const { openDialog: openSortDialog } = useReduxDialog(SORT_DIALOG);

  const [columnToUpdate, setColumnToUpdate] = useState<
    OrganizationColumn | undefined
  >();
  const [columnToCopy, setColumnToCopy] = useState<
    OrganizationColumn | undefined
  >();

  const handleOpenCreateColumnDialog = () => {
    setColumnToUpdate(undefined);
    setColumnToCopy(undefined);
    openDialog();
  };

  const handleOpenEditColumnDialog = (col) => {
    setColumnToUpdate(col);
    setColumnToCopy(undefined);
    openDialog();
  };

  const handleOpenCopyColumnDialog = (col) => {
    setColumnToUpdate(undefined);
    setColumnToCopy(col);
    openDialog();
  };

  const handleOpenSortColumnDialog = () => {
    openSortDialog();
  };

  return (
    <>
      <DynamicColumnDataTable
        organizationId={orgId}
        onCreateColumn={handleOpenCreateColumnDialog}
        onEditColumn={handleOpenEditColumnDialog}
        onSortColumn={handleOpenSortColumnDialog}
        onCopyColumn={handleOpenCopyColumnDialog}
        columnTable={columnTableString}
        serviceModuleValue={serviceModuleValue}
      />
      <DynamicColumnsDialog
        dynamicFieldTypeEnable={dynamicFieldTypeEnable}
        column={columnToUpdate}
        columnToCopy={columnToCopy}
        columnTable={columnTable}
        serviceModuleValue={serviceModuleValue}
      />
      <DynamicColumnsSortDialog columnTable={columnTable} />
    </>
  );
};

export default DynamicColumn;
