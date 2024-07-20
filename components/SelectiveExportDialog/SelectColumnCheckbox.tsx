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

export interface SelectColumnCheckboxProps {
  handleToggle: (key: string, checked: boolean) => void;
  itemKey?: string;
  dynamicColumns?: { [x: string]: ExtendedOrganizationShareEdit };
  columnName?: string;
  columnType?: ColumnType;
  checked?: boolean;
  useSwitch?: boolean;
  switchChecked?: boolean;
  handleSwitchChange?: (key: string, checked: boolean) => void;
}

const SelectColumnCheckbox = function (props: SelectColumnCheckboxProps) {
  const {
    itemKey,
    checked,
    useSwitch = false,
    switchChecked,
    columnName,
    handleSwitchChange,
    handleToggle,
  } = props;

  return (
    <ListItem
      key={itemKey}
      disablePadding
      secondaryAction={
        useSwitch && (
          <Switch
            edge="start"
            checked={switchChecked}
            disabled={!checked}
            onChange={(_, checked) => {
              if (handleSwitchChange)
                handleSwitchChange(itemKey as string, checked);
            }}
          />
        )
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

export default React.memo(SelectColumnCheckbox, (prev, next) => {
  if (
    prev.checked === next.checked &&
    prev.switchChecked === next.switchChecked
  )
    return true;
  return false;
});
