import React, {
  useCallback,
  useMemo,
  useEffect,
  useState,
  useContext,
} from "react";

import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import { Box, Stack, Switch } from "@mui/material";
import List from "@eGroupAI/material/List";
import ListItem from "@eGroupAI/material/ListItem";
import ListItemButton from "@eGroupAI/material/ListItemButton";
import ListItemIcon from "@eGroupAI/material/ListItemIcon";
import ListItemText from "@eGroupAI/material/ListItemText";
import Checkbox from "@eGroupAI/material/Checkbox";
import StyledSearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";

import SelectColumnCheckbox from "./SelectColumnCheckbox";
import { UserExportDialogContext } from "./UserExportDialogContext";
import { ExtendedStaticColumn, SelectColumnStepProps } from "./typings";

export type ExportEditColumnType =
  | { [key: string]: ExtendedStaticColumn }
  | undefined;

const SelectStaticColumnsStep = function (props: SelectColumnStepProps) {
  const { staticColumns, useTagExport = false } = props;

  const {
    exportStaticColumnList,
    setExportStaticColumnList,
    isExportTag,
    setIsExportTag,
  } = useContext(UserExportDialogContext);

  const wordLibrary = useSelector(getWordLibrary);

  const [columns, setColumns] = useState(() => {
    const statics: ExportEditColumnType = staticColumns
      ?.map((sCol) => ({
        [sCol.sortKey as string]: {
          ...sCol,
          checked: Boolean(
            exportStaticColumnList.find((s) => s.sortKey === sCol.sortKey)
              ?.checked
          ),
        },
      }))
      .reduce((a, b) => ({ ...a, ...b }), {});

    return { ...statics };
  });

  const [searchText, setSearchText] = useState<string>("");
  const [filteredColumns, setFilteredColumns] = useState<
    ExtendedStaticColumn[]
  >(Object.values(columns));

  const checkedAll = useMemo(
    () =>
      Object.values(columns).filter(
        ({ checked, sortKey }) =>
          checked && filteredColumns.some((fCol) => fCol.sortKey === sortKey)
      ).length === filteredColumns.length && filteredColumns.length > 0,
    [columns, filteredColumns]
  );

  const indeterminate = useMemo(
    () =>
      Object.values(columns).filter(
        ({ checked, sortKey }) =>
          checked && filteredColumns.some((fCol) => fCol.sortKey === sortKey)
      ).length > 0 &&
      Object.values(columns).filter(
        ({ checked, sortKey }) =>
          checked && filteredColumns.some((fCol) => fCol.sortKey === sortKey)
      ).length !== filteredColumns.length &&
      filteredColumns.length > 0,
    [columns, filteredColumns]
  );

  const handleToggle = (key: string, checked: boolean) => {
    setColumns((old) => ({
      ...old,
      [key]: {
        ...old[key],
        checked,
      } as ExtendedStaticColumn,
    }));
  };

  const handleToggleAll = useCallback(() => {
    if (checkedAll) {
      const newValues = filteredColumns
        .map((fCol) => ({
          [fCol.sortKey || ""]: {
            ...(columns[fCol.sortKey || ""] as ExtendedStaticColumn),
            checked: false,
          },
        }))
        .reduce((a, b) => ({ ...a, ...b }), {});
      setColumns((prev) => ({ ...prev, ...newValues }));
    } else {
      const newValues = filteredColumns
        .map((fCol) => ({
          [fCol.sortKey || ""]: {
            ...(columns[fCol.sortKey || ""] as ExtendedStaticColumn),
            checked: true,
          },
        }))
        .reduce((a, b) => ({ ...a, ...b }), {});
      setColumns((prev) => ({ ...prev, ...newValues }));
    }
  }, [checkedAll, columns, filteredColumns]);

  const handleSearchChange = (value) => {
    setSearchText(value);
  };

  useEffect(() => {
    if (searchText !== "") {
      const filtered = Object.values(columns).filter((col) =>
        col.columnName.includes(searchText)
      );
      setFilteredColumns(filtered);
    } else setFilteredColumns(Object.values(columns));
  }, [columns, searchText]);

  useEffect(() => {
    const newList = Object.keys(columns)
      .map((key) => columns[key] as ExtendedStaticColumn)
      .filter((el) => el.checked);
    setExportStaticColumnList(newList);
  }, [columns, setExportStaticColumnList]);

  const renderColumns = useCallback(
    () =>
      filteredColumns.map((col) => (
        <SelectColumnCheckbox
          key={col.sortKey}
          itemKey={col.sortKey}
          checked={columns[col.sortKey || ""]?.checked}
          columnName={columns[col.sortKey || ""]?.columnName}
          columnType={columns[col.sortKey || ""]?.columnType}
          handleToggle={handleToggle}
        />
      )),
    [columns, filteredColumns]
  );

  if (!staticColumns) {
    return null;
  }

  return (
    <List>
      {useTagExport && (
        <Stack direction={"row"} sx={{ mb: 1, width: "100%" }}>
          <ListItem
            disablePadding
            secondaryAction={
              <ListItemText
                primary={wordLibrary?.["export tags"] ?? "匯出標籤"}
              />
            }
          >
            <ListItemButton
              onClick={() => {
                setIsExportTag((prev) => !prev);
              }}
            >
              <ListItemIcon>
                <Switch
                  edge="start"
                  checked={isExportTag}
                  onChange={(e, checked) => {
                    e.stopPropagation();
                    setIsExportTag(checked);
                  }}
                />
              </ListItemIcon>
              <Box flexGrow={1} />
            </ListItemButton>
          </ListItem>
        </Stack>
      )}
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
      <ListItem disablePadding>
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
      {renderColumns()}
    </List>
  );
};

export default React.memo(SelectStaticColumnsStep);
