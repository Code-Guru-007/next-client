import React, { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";

import { makeStyles } from "@mui/styles";
import { Button, useTheme } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import HorizontalRuleRoundedIcon from "@mui/icons-material/HorizontalRuleRounded";

import List from "@eGroupAI/material/List";
import MenuItem from "components/MenuItem";
import ListItem from "@eGroupAI/material/ListItem";
import TextField from "@mui/material/TextField";
import ListItemIcon from "@eGroupAI/material/ListItemIcon";
import { Controller, useFormContext, useFieldArray } from "react-hook-form";

import IconButton from "components/IconButton/StyledIconButton";
import DragItem, { OnDropItem, useDragItem } from "components/DragItem";
import Tooltip from "@eGroupAI/material/Tooltip";

import useOrgDynamicColumns from "utils/useOrgDynamicColumns";
import { useAppDispatch } from "redux/configureAppStore";
import { setDeletedColumnOptionIds, setIsSorted } from "redux/dynamicColumns";
import { getDeletedColumnOptionIds } from "redux/dynamicColumns/selectors";
import { DynamicColumnsFormInput } from "interfaces/form";
import { getWordLibrary } from "redux/wordLibrary/selectors";

const useStyle = makeStyles({
  listItemIcon: {
    minWidth: "unset",
  },
  dynamicDropDown: {
    width: "250px",
    "& .MuiInputBase-input": {
      padding: "9px 18.5px",
    },
  },
});

export interface DynamicColumnOptionFieldArrayProps {
  index: number;
  /**
   * If columnId exist means user is updating not creating.
   */
  columnId?: string;
  nextSettings?: boolean;
  organizationId?: string;
  groupId?: string;
}

const DynamicColumnOptionFieldArray: FC<DynamicColumnOptionFieldArrayProps> =
  function (props) {
    const theme = useTheme();
    const { index, columnId, nextSettings, organizationId, groupId } = props;

    const classes = useStyle();
    const [optionName, setOptionName] = useState("");

    const dispatch = useAppDispatch();

    const { control, register, watch } =
      useFormContext<DynamicColumnsFormInput>();

    const { fields, append, remove, replace, insert } = useFieldArray({
      control,
      name: `organizationColumnList.${index}.organizationOptionList`,
    });
    const { data } = useOrgDynamicColumns({
      organizationId,
    });

    const columns = data?.source?.filter(
      (el) => el.organizationColumnGroup?.columnGroupId === groupId
    );

    const deletedColumnOptionIds = useSelector(getDeletedColumnOptionIds);

    const { items, itemsRef, handleMoveItem, setItems } = useDragItem(
      "id",
      watch(`organizationColumnList.${index}.organizationOptionList`)
    );

    const optionList = watch(
      `organizationColumnList.${index}.organizationOptionList`
    );

    useEffect(() => {
      if (fields.length === 0) {
        append([
          {
            id: uuidv4(),
            organizationOptionName: "",
            organizationOptionNextColumnId: "",
          },
        ]);
      }
    }, [append, fields]);

    const handleDropItem: OnDropItem = () => {
      replace(
        itemsRef.current.map((el) => ({
          id: el.id,
          organizationOptionId: el.organizationOptionId,
          organizationOptionName: el.organizationOptionName,
          organizationOptionNextColumnId: el.organizationOptionNextColumnId,
        }))
      );
      dispatch(setIsSorted(true));
    };

    const handleInsertOption = (idx) => {
      insert(idx + 1, {
        id: uuidv4(),
        organizationOptionId: "",
        organizationOptionName: "",
        organizationOptionNextColumnId: "",
      });
    };

    const handleRemoveOption = (idx) => {
      if (fields.length > 1) {
        remove(idx);
        setItems(items.filter((_, index) => index !== idx));
      }
    };

    const wordLibrary = useSelector(getWordLibrary);

    return (
      <List>
        {items.map((el, sIndex) => (
          <DragItem
            key={el.id}
            id={el.id}
            onMoveItem={handleMoveItem}
            onDropItem={handleDropItem}
            type="options"
          >
            {({ ref }) => (
              <ListItem ref={ref} disableGutters>
                <ListItemIcon className={classes.listItemIcon}>
                  <DragIndicatorIcon sx={{ cursor: "pointer" }} />
                </ListItemIcon>
                <input
                  type="hidden"
                  {...register(
                    `organizationColumnList.${index}.organizationOptionList.${sIndex}.id`
                  )}
                />
                <input
                  type="hidden"
                  {...register(
                    `organizationColumnList.${index}.organizationOptionList.${sIndex}.organizationOptionId`
                  )}
                />
                <Controller
                  control={control}
                  name={`organizationColumnList.${index}.organizationOptionList.${sIndex}.organizationOptionName`}
                  render={({ field }) => {
                    const value = optionList
                      ? optionList[sIndex]?.organizationOptionName
                      : "";
                    const nameList = optionList?.map(
                      (el) => el.organizationOptionName
                    );
                    let duplicateName = false;
                    if (
                      (nameList?.filter((name) => name === value) || [])
                        .length > 1
                    ) {
                      duplicateName = true;
                    }
                    let warningName = "";
                    if (optionName === "" && field.value === "") {
                      warningName = "請輸入選項名稱";
                    }
                    if (duplicateName) {
                      warningName = "選項重複，請重新輸入";
                    }
                    return (
                      <>
                        <TextField
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e);
                            setOptionName(e.target.value);
                          }}
                          error={duplicateName || field.value === ""}
                          helperText={warningName}
                          required
                          size="small"
                          label="選項名稱"
                          InputLabelProps={{
                            sx: {
                              "&.MuiFormLabel-root.MuiInputLabel-root.Mui-disabled":
                                {
                                  color: theme.palette.grey[300],
                                },
                            },
                          }}
                        />
                        <ListItemIcon className={classes.listItemIcon}>
                          <Tooltip title="新增選項">
                            <IconButton
                              onClick={() => {
                                handleInsertOption(sIndex);
                                setOptionName("");
                              }}
                            >
                              <AddRoundedIcon sx={{ cursor: "pointer" }} />
                            </IconButton>
                          </Tooltip>
                        </ListItemIcon>
                        <ListItemIcon className={classes.listItemIcon}>
                          <Tooltip title="移除選項">
                            <IconButton
                              onClick={() => {
                                handleRemoveOption(sIndex);
                                if (el.organizationOptionId && columnId) {
                                  dispatch(
                                    setDeletedColumnOptionIds([
                                      ...deletedColumnOptionIds,
                                      el.organizationOptionId,
                                    ])
                                  );
                                }
                              }}
                              disabled={fields.length <= 1}
                            >
                              <HorizontalRuleRoundedIcon
                                sx={{ cursor: "pointer" }}
                              />
                            </IconButton>
                          </Tooltip>
                        </ListItemIcon>
                      </>
                    );
                  }}
                />

                {nextSettings && (
                  <Controller
                    control={control}
                    name={`organizationColumnList.${index}.organizationOptionList.${sIndex}.organizationOptionNextColumnId`}
                    render={({ field }) => {
                      const { value, onChange, ...others } = field;
                      return (
                        <TextField
                          value={value}
                          onChange={(e) => {
                            onChange(e);
                          }}
                          {...others}
                          label="動態欄位"
                          select
                          fullWidth
                          className={classes.dynamicDropDown}
                          size="small"
                        >
                          {columns
                            ?.filter((col) => col.columnId !== columnId)
                            .map((column) => (
                              <MenuItem
                                value={column.columnId}
                                key={column.columnId}
                              >
                                {wordLibrary?.[column.columnName] ??
                                  column.columnName}
                              </MenuItem>
                            ))}
                          <MenuItem
                            value={""}
                            key={""}
                            sx={{
                              backgroundColor: "#EDEEF1 !important",
                            }}
                          >
                            <Button
                              variant="text"
                              fullWidth
                              sx={{
                                justifyContent: "start",
                              }}
                            >
                              {wordLibrary?.clear ?? "清除"}
                            </Button>
                          </MenuItem>
                        </TextField>
                      );
                    }}
                  />
                )}
              </ListItem>
            )}
          </DragItem>
        ))}
      </List>
    );
  };

export default DynamicColumnOptionFieldArray;
