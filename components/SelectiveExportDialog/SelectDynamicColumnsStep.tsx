import React, {
  useCallback,
  useMemo,
  useEffect,
  useState,
  useContext,
} from "react";

import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import { Stack } from "@mui/material";
import List from "@eGroupAI/material/List";
import ListItem from "@eGroupAI/material/ListItem";
import ListItemButton from "@eGroupAI/material/ListItemButton";
import ListItemIcon from "@eGroupAI/material/ListItemIcon";
import ListItemText from "@eGroupAI/material/ListItemText";
import Checkbox from "@eGroupAI/material/Checkbox";
import StyledSearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";

import ResponsiveTabs, {
  TabDataItem,
  ItemCount,
} from "components/ResponsiveTabs";
import SelectColumnCheckbox from "./SelectColumnCheckbox";
import { UserExportDialogContext } from "./UserExportDialogContext";
import { ExtendedDynamicColumn, SelectColumnStepProps } from "./typings";

export type ExportEditColumnType =
  | { [key: string]: ExtendedDynamicColumn }
  | undefined;

const SelectColumnsStep = function (props: SelectColumnStepProps) {
  const { orgColumns } = props;
  const { exportDynamicColumnList, setExportDynamicColumnList } = useContext(
    UserExportDialogContext
  );

  const [tabValue, setTabValue] = useState<string>("all");
  const [itemCounts, setItemCounts] = useState<ItemCount[]>();
  const wordLibrary = useSelector(getWordLibrary);

  const [columns, setColumns] = useState(() => {
    const dynamics: ExportEditColumnType = orgColumns
      ?.map((dCol) => ({
        [dCol.columnId]: {
          ...dCol,
          checked: Boolean(
            exportDynamicColumnList.find((d) => d.columnId === dCol.columnId)
              ?.checked
          ),
        },
      }))
      .reduce((a, b) => ({ ...a, ...b }), {});
    return { ...dynamics };
  });

  const [searchText, setSearchText] = useState<string>("");
  const [filteredColumns, setFilteredColumns] = useState<
    ExtendedDynamicColumn[]
  >(Object.values(columns));

  const checkedAll = useMemo(
    () =>
      Object.values(columns).filter(
        ({ checked, columnId }) =>
          checked && filteredColumns.some((fCol) => fCol.columnId === columnId)
      ).length === filteredColumns.length && filteredColumns.length > 0,
    [columns, filteredColumns]
  );

  const indeterminate = useMemo(
    () =>
      Object.values(columns).filter(
        ({ checked, columnId }) =>
          checked && filteredColumns.some((fCol) => fCol.columnId === columnId)
      ).length > 0 &&
      Object.values(columns).filter(
        ({ checked, columnId }) =>
          checked && filteredColumns.some((fCol) => fCol.columnId === columnId)
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
      } as ExtendedDynamicColumn,
    }));
  };

  const handleToggleAll = useCallback(() => {
    if (checkedAll) {
      const newValues = filteredColumns
        .map((fCol) => ({
          [fCol.columnId]: {
            ...(columns[fCol.columnId] as ExtendedDynamicColumn),
            checked: false,
          },
        }))
        .reduce((a, b) => ({ ...a, ...b }), {});
      setColumns((prev) => ({ ...prev, ...newValues }));
    } else {
      const newValues = filteredColumns
        .map((fCol) => ({
          [fCol.columnId]: {
            ...(columns[fCol.columnId] as ExtendedDynamicColumn),
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
  const groupTags = useMemo(() => {
    const seenIds = new Set();
    const tagCounts = {};
    const tags = Object.values(columns)
      .filter((column) => column?.organizationColumnGroup)
      .map((column) => {
        const group = column?.organizationColumnGroup;
        const id = group?.columnGroupId;

        if (id) {
          if (!tagCounts[id]) {
            tagCounts[id] = 0; // Initialize count for this id if not already present
          }
          tagCounts[id] += 1; // Increment count for this id
        }

        return {
          label: column?.organizationColumnGroup?.columnGroupName,
          id: column?.organizationColumnGroup?.columnGroupId,
          value: column?.organizationColumnGroup?.columnGroupId,
        };
      })
      .filter(({ id }) => {
        if (id && !seenIds.has(id)) {
          seenIds.add(id);
          return true;
        }
        return false;
      });

    tags.unshift({
      id: "all",
      label: "All",
      value: "all",
    });
    return tags;
  }, [columns]);

  useEffect(() => {
    let filtered;
    if (searchText !== "") {
      filtered = Object.values(columns).filter((col) =>
        col.columnName.includes(searchText)
      );
    } else {
      filtered = Object.values(columns);
    }

    if (tabValue !== "all")
      filtered = filtered.filter(
        (item) =>
          item?.organizationColumnGroup &&
          item?.organizationColumnGroup?.columnGroupId === tabValue
      );

    setFilteredColumns(filtered);
  }, [columns, searchText, tabValue]);

  useEffect(() => {
    let filtered;
    if (searchText !== "") {
      filtered = Object.values(columns).filter((col) =>
        col.columnName.includes(searchText)
      );
    } else {
      filtered = Object.values(columns);
    }

    const counts = groupTags.map(
      (groupTag) =>
        ({
          id: groupTag.id,
          count:
            groupTag.id === "all"
              ? filtered.length
              : filtered.filter(
                  (item) =>
                    item.organizationColumnGroup &&
                    item.organizationColumnGroup.columnGroupId === groupTag.id
                ).length,
        } as ItemCount)
    );

    setItemCounts(counts);
  }, [columns, searchText, groupTags]);

  useEffect(() => {
    const selectedList = Object.keys(columns)
      .map((key) => columns[key] as ExtendedDynamicColumn)
      .filter((el) => el.checked);
    setExportDynamicColumnList(selectedList);
  }, [columns, setExportDynamicColumnList]);

  const renderColumns = useCallback(
    () =>
      filteredColumns.map((col) => (
        <SelectColumnCheckbox
          key={col.columnId}
          itemKey={col.columnId}
          checked={columns[col.columnId]?.checked}
          columnName={columns[col.columnId]?.columnName}
          handleToggle={handleToggle}
        />
      )),
    [columns, filteredColumns]
  );

  if (!orgColumns) {
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
      <ResponsiveTabs
        value={tabValue || "all"}
        tabData={groupTags as TabDataItem[]}
        onChange={(value) => {
          setTabValue(value);
        }}
        sx={{ display: "flex", flexDirection: "row", width: "100%" }}
        itemCounts={itemCounts}
      />
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

export default React.memo(SelectColumnsStep);
