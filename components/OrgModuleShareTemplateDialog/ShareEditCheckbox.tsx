import React from "react";

import ListItem from "@eGroupAI/material/ListItem";
import ListItemButton from "@eGroupAI/material/ListItemButton";
import ListItemIcon from "@eGroupAI/material/ListItemIcon";
import ListItemText from "@eGroupAI/material/ListItemText";
import Checkbox from "@eGroupAI/material/Checkbox";
import Switch from "@mui/material/Switch";
import { ColumnType } from "@eGroupAI/typings/apis";
import { OrganizationShareEdit } from "interfaces/entities";

export type ExtendedOrganizationShareEdit = OrganizationShareEdit & {
  checked: boolean;
  columnName: string;
  columnId: string;
};

export type DynamicColumnsType = {
  [x: string]: ExtendedOrganizationShareEdit;
};

export interface ShareEditCheckboxProps {
  itemKey?: string;
  dynamicColumns?: { [x: string]: ExtendedOrganizationShareEdit };
  columnName?: string;
  columnType?: ColumnType;
  checked?: boolean;
  switchChecked?: boolean;
  autoFill?: boolean;
  handleRequiredSwitchChange: (key: string, checked: boolean) => void;
  handleAutoFillSwitchChange: (key: string, checked: boolean) => void;
  handleToggle: (key: string, checked: boolean) => void;
}

const ShareEditCheckbox = function (props: ShareEditCheckboxProps) {
  const {
    itemKey,
    checked,
    switchChecked,
    autoFill,
    columnName,
    handleRequiredSwitchChange,
    handleAutoFillSwitchChange,
    handleToggle,
  } = props;

  return (
    <ListItem
      key={itemKey}
      disablePadding
      secondaryAction={
        <>
          <Switch
            edge="end"
            checked={autoFill}
            disabled={!checked}
            onChange={(_, checked) => {
              handleAutoFillSwitchChange(itemKey as string, checked);
            }}
          />
          <Switch
            edge="end"
            checked={switchChecked}
            disabled={!checked}
            onChange={(_, checked) => {
              handleRequiredSwitchChange(itemKey as string, checked);
            }}
          />
        </>
      }
    >
      <ListItemButton
        onClick={() => {
          handleToggle(itemKey as string, !checked);
        }}
      >
        <ListItemIcon>
          <Checkbox edge="start" disableRipple checked={checked} />
        </ListItemIcon>
        <ListItemText
          primary={columnName}
          primaryTypographyProps={{
            maxWidth: 350,
          }}
        />
      </ListItemButton>
    </ListItem>
  );
};

export default React.memo(ShareEditCheckbox, (prev, next) => {
  if (
    prev.checked === next.checked &&
    prev.switchChecked === next.switchChecked &&
    prev.autoFill === next.autoFill
  )
    return true;
  return false;
});
