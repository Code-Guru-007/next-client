import React, { FC, useState } from "react";
import { useSelector } from "react-redux";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useReduxDialog } from "@eGroupAI/redux-modules";

import { ColumnTemplate } from "interfaces/entities";
import { ServiceModuleValue } from "interfaces/utils";

import DynamicColumnTemplateDataTable from "components/DynamicColumnTemplateDataTable";
import DynamicColumnTemplateEventDialog, {
  DIALOG as DynamicTemplateEventDialog,
} from "components/DynamicColumnTemplateDialog/DynamicColumnTemplateEventDialog";
import DynamicColumnTemplateUserDialog, {
  DIALOG as DynamicTemplateUserDialog,
} from "components/DynamicColumnTemplateDialog/DynamicColumnTemplateUserDialog";
import DynamicColumnTemplatePartnerDialog, {
  DIALOG as DynamicTemplatePartnerDialog,
} from "components/DynamicColumnTemplateDialog/DynamicColumnTemplatePartnerDialog";

interface Props {
  columnTable: string;
  serviceModuleValue: ServiceModuleValue;
}

const DynamicColumnTemplate: FC<Props> = function (props) {
  const { columnTable, serviceModuleValue } = props;
  const orgId = useSelector(getSelectedOrgId);
  const { openDialog: openEventDialog } = useReduxDialog(
    DynamicTemplateEventDialog
  );
  const { openDialog: openUserDialog } = useReduxDialog(
    DynamicTemplateUserDialog
  );
  const { openDialog: openPartnerDialog } = useReduxDialog(
    DynamicTemplatePartnerDialog
  );
  const [columnTemplateToUpdate, setColumnTemplateToUpdate] = useState<
    ColumnTemplate | undefined
  >();

  const handleOpenCreateColumnDialog = () => {
    setColumnTemplateToUpdate(undefined);
    if (serviceModuleValue === ServiceModuleValue.EVENT) openEventDialog();
    if (serviceModuleValue === ServiceModuleValue.CRM_USER) openUserDialog();
    if (serviceModuleValue === ServiceModuleValue.CRM_PARTNER)
      openPartnerDialog();
  };

  const handleOpenEditCoumnDialog = (group) => {
    setColumnTemplateToUpdate(group);
    if (serviceModuleValue === ServiceModuleValue.EVENT) openEventDialog();
    if (serviceModuleValue === ServiceModuleValue.CRM_USER) openUserDialog();
    if (serviceModuleValue === ServiceModuleValue.CRM_PARTNER)
      openPartnerDialog();
  };

  return (
    <>
      <DynamicColumnTemplateDataTable
        organizationId={orgId}
        onCreateColumnTemplate={handleOpenCreateColumnDialog}
        onEditColumnTemplate={handleOpenEditCoumnDialog}
        serviceModuleValue={serviceModuleValue}
      />
      {serviceModuleValue === ServiceModuleValue.EVENT && (
        <DynamicColumnTemplateEventDialog
          columnTemplate={columnTemplateToUpdate}
          onCloseDialog={() => setColumnTemplateToUpdate(undefined)}
          serviceModuleValue={serviceModuleValue}
          columnTable={columnTable}
        />
      )}
      {serviceModuleValue === ServiceModuleValue.CRM_USER && (
        <DynamicColumnTemplateUserDialog
          columnTemplate={columnTemplateToUpdate}
          onCloseDialog={() => setColumnTemplateToUpdate(undefined)}
          serviceModuleValue={serviceModuleValue}
          columnTable={columnTable}
        />
      )}
      {serviceModuleValue === ServiceModuleValue.CRM_PARTNER && (
        <DynamicColumnTemplatePartnerDialog
          columnTemplate={columnTemplateToUpdate}
          onCloseDialog={() => setColumnTemplateToUpdate(undefined)}
          serviceModuleValue={serviceModuleValue}
          columnTable={columnTable}
        />
      )}
    </>
  );
};

export default DynamicColumnTemplate;
