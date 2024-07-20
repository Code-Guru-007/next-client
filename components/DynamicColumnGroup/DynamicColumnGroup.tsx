import React, { FC, useState } from "react";
import { useSelector } from "react-redux";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useReduxDialog } from "@eGroupAI/redux-modules";

import { ColumnGroup } from "interfaces/entities";
import { ServiceModuleValue } from "interfaces/utils";

import DynamicColumnGroupDataTable from "components/DynamicColumnGroupDataTable";
import DynamicColumnGroupDialog, {
  DIALOG,
} from "components/DynamicColumnGroupDialog";

interface Props {
  columnTable: string;
  serviceModuleValue: ServiceModuleValue;
  tagStatus?: boolean;
}

const DynamicColumnGroup: FC<Props> = function (props) {
  const { columnTable, serviceModuleValue, tagStatus } = props;
  const orgId = useSelector(getSelectedOrgId);

  const { openDialog } = useReduxDialog(DIALOG);
  const [columnGroupToUpdate, setColumnGroupToUpdate] = useState<
    ColumnGroup | undefined
  >();

  const handleOpenCreateColumnDialog = () => {
    setColumnGroupToUpdate(undefined);
    openDialog();
  };

  const handleOpenEditCoumnDialog = (group) => {
    setColumnGroupToUpdate(group);
    openDialog();
  };

  return (
    <>
      <DynamicColumnGroupDataTable
        organizationId={orgId}
        onCreateColumnGroup={handleOpenCreateColumnDialog}
        onEditColumnGroup={handleOpenEditCoumnDialog}
        serviceModuleValue={serviceModuleValue}
      />
      <DynamicColumnGroupDialog
        columnGroup={columnGroupToUpdate}
        onCloseDialog={() => setColumnGroupToUpdate(undefined)}
        serviceModuleValue={serviceModuleValue}
        columnTable={columnTable}
        tagStatus={tagStatus}
      />
    </>
  );
};

export default DynamicColumnGroup;
