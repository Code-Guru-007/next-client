import React, { useCallback, useMemo, useEffect, useState } from "react";

import { getOrgShareEditList } from "redux/createUserInfoFilledUrlDialog/selectors";
import { setOrgShareEdits } from "redux/createUserInfoFilledUrlDialog";
import { ColumnType } from "@eGroupAI/typings/apis";
import useStaticColumns from "utils/useStaticColumns";
import { Table } from "interfaces/utils";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useAppDispatch } from "redux/configureAppStore";
import useOrgDynamicColumns from "utils/useOrgDynamicColumns";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { Stack } from "@mui/material";
import List from "@eGroupAI/material/List";
import ListItem from "@eGroupAI/material/ListItem";
import ListItemButton from "@eGroupAI/material/ListItemButton";
import ListItemIcon from "@eGroupAI/material/ListItemIcon";
import ListItemText from "@eGroupAI/material/ListItemText";
import Checkbox from "@eGroupAI/material/Checkbox";
import StyledSearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";

import ShareEditCheckbox, {
  ExtendedOrganizationShareEdit,
} from "./ShareEditCheckbox";

export type ShareEditDynamicColumnType =
  | { [key: string]: ExtendedOrganizationShareEdit }
  | undefined;

const SelectShareEditListStep = function () {
  const organizationId = useSelector(getSelectedOrgId);
  const dispatch = useAppDispatch();
  const shareEditList = useSelector(getOrgShareEditList) || [];
  const wordLibrary = useSelector(getWordLibrary);
  const { data: orgColumns } = useOrgDynamicColumns(
    {
      organizationId,
    },
    {
      columnTable: "ORGANIZATION_USER",
    }
  );

  const staticColumns = useStaticColumns(Table.USERS, "isEdit");

  const [dynamicColumns, setDynamicColumns] = useState(() => {
    const statics: ShareEditDynamicColumnType = staticColumns
      ?.map((s) => ({
        [s.sortKey as string]: {
          organizationShareEditKey: s.sortKey as string,
          organizationShareEditType: ColumnType.TEXT,
          organizationShareEditIsRequired:
            (shareEditList.filter(
              (e) => e.organizationShareEditKey === (s.sortKey as string)
            ) || [])[0]?.organizationShareEditIsRequired || undefined,
          isAutoFill:
            (shareEditList.filter(
              (e) => e.organizationShareEditKey === (s.sortKey as string)
            ) || [])[0]?.isAutoFill || "TRUE",
          checked: Boolean(
            (shareEditList.filter(
              (e) => e.organizationShareEditKey === (s.sortKey as string)
            ) || [])[0]
          ),
          isDynamicColumn: undefined,
          columnName: s.columnName,
          columnId: s.sortKey as string,
        },
      }))
      .reduce((a, b) => ({ ...a, ...b }), {});
    const dynamics: ShareEditDynamicColumnType = orgColumns?.source
      .map((o) => ({
        [o.columnId]: {
          organizationShareEditKey: o.columnId,
          organizationShareEditType: o.columnType,
          organizationShareEditIsRequired:
            (shareEditList.filter(
              (e) => e.organizationShareEditKey === o.columnId
            ) || [])[0]?.organizationShareEditIsRequired || undefined,
          isAutoFill:
            (shareEditList.filter(
              (e) => e.organizationShareEditKey === o.columnId
            ) || [])[0]?.isAutoFill || "TRUE",
          checked: Boolean(
            (shareEditList.filter(
              (e) => e.organizationShareEditKey === o.columnId
            ) || [])[0]
          ),
          isDynamicColumn: "1",
          columnName: o.columnName,
          columnId: o.columnId,
        },
      }))
      .reduce((a, b) => ({ ...a, ...b }), {});
    return { ...statics, ...dynamics };
  });

  const [searchText, setSearchText] = useState<string>("");
  const [filteredColumns, setFilteredColumns] = useState<
    ExtendedOrganizationShareEdit[]
  >(Object.values(dynamicColumns));

  const checkedAll = useMemo(
    () =>
      Object.values(dynamicColumns).filter(
        ({ checked, columnId }) =>
          checked && filteredColumns.some((fCol) => fCol.columnId === columnId)
      ).length === filteredColumns.length && filteredColumns.length > 0,
    [dynamicColumns, filteredColumns]
  );

  const indeterminate = useMemo(
    () =>
      Object.values(dynamicColumns).filter(
        ({ checked, columnId }) =>
          checked && filteredColumns.some((fCol) => fCol.columnId === columnId)
      ).length > 0 &&
      Object.values(dynamicColumns).filter(
        ({ checked, columnId }) =>
          checked && filteredColumns.some((fCol) => fCol.columnId === columnId)
      ).length !== filteredColumns.length &&
      filteredColumns.length > 0,
    [dynamicColumns, filteredColumns]
  );

  const handleToggle = (key: string, checked: boolean) => {
    setDynamicColumns((old) => ({
      ...old,
      [key]: {
        ...old[key],
        checked,
      } as ExtendedOrganizationShareEdit,
    }));
  };

  const handleRequiredSwitchChange = (key: string, checked: boolean) => {
    setDynamicColumns((old) => ({
      ...old,
      [key]: {
        ...old[key],
        organizationShareEditIsRequired: checked ? 1 : undefined,
      } as ExtendedOrganizationShareEdit,
    }));
  };

  const handleAutoFillSwitchChange = (key: string, checked: boolean) => {
    setDynamicColumns((old) => ({
      ...old,
      [key]: {
        ...old[key],
        isAutoFill: checked ? "TRUE" : "FALSE",
      } as ExtendedOrganizationShareEdit,
    }));
  };

  const handleToggleAll = useCallback(() => {
    if (checkedAll) {
      const newValues = filteredColumns
        .map((fCol) => ({
          [fCol.columnId]: {
            ...(dynamicColumns[fCol.columnId] as ExtendedOrganizationShareEdit),
            checked: false,
          },
        }))
        .reduce((a, b) => ({ ...a, ...b }), {});
      setDynamicColumns((prev) => ({ ...prev, ...newValues }));
    } else {
      const newValues = filteredColumns
        .map((fCol) => ({
          [fCol.columnId]: {
            ...(dynamicColumns[fCol.columnId] as ExtendedOrganizationShareEdit),
            checked: true,
          },
        }))
        .reduce((a, b) => ({ ...a, ...b }), {});
      setDynamicColumns((prev) => ({ ...prev, ...newValues }));
    }
  }, [checkedAll, dynamicColumns, filteredColumns]);

  const handleSearchChange = (value) => {
    setSearchText(value);
  };

  useEffect(() => {
    const newStoreData = Object.keys(dynamicColumns)
      .map((key) => dynamicColumns[key] as ExtendedOrganizationShareEdit)
      .filter((el) => el.checked)
      .map((el) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { checked, columnName, ...other } = el;
        return other;
      });

    dispatch(setOrgShareEdits(newStoreData));
  }, [dispatch, dynamicColumns]);

  useEffect(() => {
    if (searchText !== "") {
      const filtered = Object.values(dynamicColumns).filter((col) =>
        col.columnName.includes(searchText)
      );
      setFilteredColumns(filtered);
    } else setFilteredColumns(Object.values(dynamicColumns));
  }, [dynamicColumns, searchText]);

  const renderDynamicColumns = useCallback(
    () =>
      filteredColumns.map((col) => (
        <ShareEditCheckbox
          key={col.columnId}
          itemKey={col.columnId}
          checked={dynamicColumns[col.columnId]?.checked}
          switchChecked={
            dynamicColumns[col.columnId]?.organizationShareEditIsRequired === 1
          }
          autoFill={dynamicColumns[col.columnId]?.isAutoFill !== "FALSE"}
          columnName={dynamicColumns[col.columnId]?.columnName}
          columnType={dynamicColumns[col.columnId]?.organizationShareEditType}
          handleToggle={handleToggle}
          handleRequiredSwitchChange={handleRequiredSwitchChange}
          handleAutoFillSwitchChange={handleAutoFillSwitchChange}
        />
      )),
    [dynamicColumns, filteredColumns]
  );

  if (!orgColumns || !staticColumns) {
    return null;
  }

  return (
    <List>
      <Stack
        direction={"row"}
        sx={{
          float: "right",
          mb: 1,
          width: "50%",
        }}
      >
        <StyledSearchBar
          triggerSearchOnTyping
          handleSearchChange={handleSearchChange}
          value={searchText}
          placeholder={
            wordLibrary?.["search and press Enter"] ?? "搜尋並按Enter"
          }
        />
      </Stack>
      <ListItem
        disablePadding
        secondaryAction={
          <Stack
            direction={"row"}
            sx={{
              float: "right",
              width: "110px",
            }}
          >
            <ListItemText
              primary={wordLibrary?.isAutoFill ?? "自動代入"}
              sx={{ textAlign: "center" }}
            />
            <ListItemText
              primary={wordLibrary?.required ?? "必填"}
              sx={{ textAlign: "center" }}
            />
          </Stack>
        }
      >
        <ListItemButton onClick={handleToggleAll}>
          <ListItemIcon>
            <Checkbox
              edge="start"
              disableRipple
              checked={checkedAll}
              indeterminate={indeterminate}
            />
          </ListItemIcon>
          <ListItemText primary={wordLibrary?.all ?? "全部"} />
        </ListItemButton>
      </ListItem>
      {renderDynamicColumns()}
    </List>
  );
};

export default React.memo(SelectShareEditListStep);
