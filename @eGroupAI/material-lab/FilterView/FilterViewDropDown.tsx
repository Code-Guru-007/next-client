import React, { FC, useState, useEffect, useMemo, useRef } from "react";

import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";

import Button, { ButtonProps } from "@eGroupAI/material/Button";
import EditableLabel from "@eGroupAI/material/EditableLabel";

import { FilterConditionGroup, FilterSearch } from "@eGroupAI/typings/apis";
import { CircularProgress, useTheme } from "@mui/material";
import {
  compare2FilterObjects,
  convertFilterObject2Payload,
} from "@eGroupAI/material-module/DataTable/utils";

import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import IconButton from "@eGroupAI/material/IconButton";

import Menu from "components/Menu";
import MenuItem from "components/MenuItem";
import ListItemIcon from "@eGroupAI/material/ListItemIcon";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ContentCopyIcon from "@mui/icons-material/ContentCopyRounded";
import TaskAltIcon from "@mui/icons-material/TaskAltRounded";
import DeleteIcon from "@mui/icons-material/DeleteRounded";
import { PublicOffRounded, PublicRounded } from "@mui/icons-material";

import { makeStyles } from "@mui/styles";

import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import { DIALOG as PUBLISH_DIALOG } from "components/ConfirmPublishDialog";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";

import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useGetLoginId from "utils/useGetLoginId";
import { ServiceModuleValue } from "interfaces/utils";

import { TableFilterEvents } from "@eGroupAI/material-module/DataTable/typing";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { Option, Value as FilterValue } from "../FilterDropDown";

export type FilterValues = {
  [key: number]: FilterValue;
};

const useStyles = makeStyles((theme) => ({
  popoverMenu: {
    "& .MuiPopover-paper": {
      width: "300px",
    },
  },
  menuIcon: {
    "&.MuiListItemIcon-root": {
      color: theme.palette.grey[500],
      marginRight: "12px",
    },
  },
  menuText: {
    "&.MuiMenuItem-root": {},
  },
  menuErrText: {
    "&.MuiMenuItem-root": {
      color: theme.palette.error.main,
    },
  },
  changeLight: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 50,
    background: theme.palette.primary.main,
  },
}));

export interface FilterViewDropDownProps extends Omit<ButtonProps, "color"> {
  isActive?: boolean;
  activeViewIds?: string[];
  setActiveViewIds?: (value: React.SetStateAction<string[]>) => void;
  selectedViewId?: string;
  setSelectedViewId?: (
    viewId: React.SetStateAction<string | undefined>
  ) => void;
  viewId: string;
  viewName?: string;
  viewNo?: number;
  isPublic?: number;
  organizationId?: string;
  loginId?: string;
  filterObject?: FilterSearch;
  filterObjectFromPayload?: FilterSearch;
  filterOptionGroups?: {
    filterConditionList: Option[];
    filterConditionGroupName: FilterConditionGroup["filterConditionGroupName"];
  }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSetFilterView?: (payloadsToBeSet: any, toogleUnSelect?: boolean) => void;
  onChangeName?: (name: string) => void;
  onDuplicateView?: (viewId: string) => void;
  onSaveChange?: (values: FilterValues) => void;
  onDeleteView?: (viewId: string) => void;
  onMutate?: () => void;
  serviceModuleValue?: ServiceModuleValue | "UNDEFINED";
  setTableFilterEvent?: React.Dispatch<
    React.SetStateAction<TableFilterEvents | undefined>
  >;
}

const FilterViewDropDown: FC<FilterViewDropDownProps> = (props) => {
  const theme = useTheme();
  const classes = useStyles();

  const lid = useGetLoginId();

  const wordLibrary = useSelector(getWordLibrary);

  const {
    isActive,
    selectedViewId,
    setSelectedViewId,
    viewId,
    viewName = `${wordLibrary?.["custom filter"] ?? "自訂篩選"}`,
    isPublic,
    loginId,
    filterObject,
    filterObjectFromPayload,
    filterOptionGroups: filterOptionGroupProp,
    onSetFilterView,
    onDeleteView,
    onMutate,
    serviceModuleValue,
    setTableFilterEvent,
  } = props;

  const organizationId = useSelector(getSelectedOrgId);

  const { excute: deleteFilterView, isLoading: isDeleting } =
    useAxiosApiWrapper(apis.org.deleteFilterView, "Delete");

  const { excute: createFilterView, isLoading: isDuplicating } =
    useAxiosApiWrapper(apis.org.createFilterView, "Create");

  const { excute: updateFilterView, isLoading: isUpdating } =
    useAxiosApiWrapper(apis.org.updateFilterView, "Update");

  const { excute: updateFilterViewPublic, isLoading: isPublicing } =
    useAxiosApiWrapper(apis.org.updateFilterViewPublic, "None");

  const payloadsToBeSet = useMemo(
    () => convertFilterObject2Payload(filterObject, filterOptionGroupProp),
    [filterObject, filterOptionGroupProp]
  );

  const [isChanged, setIsChanged] = useState<boolean>(false);
  const [isEditName, setIsEditName] = useState<boolean>(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [filterViewName, setFilterViewName] = useState<string>(viewName);
  const [isSelected, setIsSelected] = useState<boolean>(
    selectedViewId === viewId
  );

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (selectedViewId !== viewId) {
      setIsSelected(false);
    } else setIsSelected(true);
  }, [selectedViewId, setIsSelected, viewId]);

  useEffect(() => {
    setFilterViewName(viewName);
  }, [viewName]);

  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
  } = useReduxDialog(DELETE_DIALOG);

  const {
    openDialog: openConfirmPublishDialog,
    closeDialog: closeConfirmPublishDialog,
  } = useReduxDialog(PUBLISH_DIALOG);

  const endIcon = (
    <>
      {(isDeleting || isDuplicating || isUpdating || isPublicing) && (
        <CircularProgress size={20} />
      )}
      {!isDeleting && !isDuplicating && !isUpdating && !isPublicing && (
        <ArrowBackIosNewRoundedIcon
          fontSize="small"
          style={{
            transform: "rotate(270deg)",
          }}
        />
      )}
    </>
  );

  const endIconButton = (
    <IconButton
      color="inherit"
      size="small"
      component="span"
      onClick={(e) => {
        e.stopPropagation();
        handleClick(e);
      }}
      sx={{
        padding: "1.5px",
        zIndex: 9999,
      }}
      id={"filterview-drop-down-btn"}
      data-tid={"filterview-drop-down-btn"}
    >
      {endIcon}
    </IconButton>
  );

  useEffect(() => {
    if (isSelected) {
      if (!compare2FilterObjects(filterObjectFromPayload, filterObject))
        setIsChanged(true);
      else setIsChanged(false);
    } else setIsChanged(false);
  }, [filterObject, filterObjectFromPayload, isSelected]);

  const handleClickButton = () => {
    if (setTableFilterEvent)
      setTableFilterEvent(TableFilterEvents.FILTER_VIEW_SELECT);
    if (selectedViewId !== viewId) {
      if (setSelectedViewId) setSelectedViewId(viewId);
    }
    if (compare2FilterObjects(filterObjectFromPayload, filterObject)) {
      if (isSelected && !isChanged && onSetFilterView)
        onSetFilterView(payloadsToBeSet, true); // une-select the selected filter view
      return;
    }
    if (onSetFilterView) onSetFilterView(payloadsToBeSet);
  };

  const handleClickDelete = () => {
    handleClose();
    openConfirmDeleteDialog({
      primary: `確定要刪除篩選條件 ${viewName} ?`,
      onConfirm: async () => {
        if (viewId) {
          closeConfirmDeleteDialog();
          deleteFilterView({
            organizationId,
            filterViewId: viewId,
          })
            .then(() => {
              if (setSelectedViewId) setSelectedViewId(undefined);
              if (onDeleteView) onDeleteView(viewId);
            })
            .catch(() => {});
        }
      },
    });
  };

  const handleClickDuplicate = () => {
    handleClose();
    const payload = {
      organizationId,
      serviceModuleValue: serviceModuleValue as ServiceModuleValue,
      filterObject: filterObject as FilterSearch,
    };
    createFilterView(payload)
      .then(() => {
        if (onMutate) onMutate();
      })
      .catch(() => {});
  };

  const handleClickSaveChange = () => {
    handleClose();
    const filterViewUpdates = {
      organizationId,
      filterViewId: viewId,
      filterViewName,
      filterObject: filterObjectFromPayload as FilterSearch,
    };
    updateFilterView(filterViewUpdates)
      .then(() => {
        setIsChanged(false);
        if (onMutate) onMutate();
      })
      .catch(() => {});
  };

  const handleClickPublicChange = () => {
    handleClose();
    openConfirmPublishDialog({
      primary: "您確定要更改這個儲存的篩選條件的權限嗎？",
      onConfirm: async () => {
        closeConfirmPublishDialog();
        const filterViewPublics = {
          organizationId,
          filterViewId: viewId,
          isPublic: isPublic ? 0 : 1,
        };
        updateFilterViewPublic(filterViewPublics)
          .then(() => {
            setIsChanged(false);
            if (onMutate) onMutate();
          })
          .catch(() => {});
      },
    });
  };

  const handleClickRename = () => {
    setIsEditName(true);
    handleClose();
  };

  const onSaveName = (name: string | undefined) => {
    const filterViewUpdates = {
      organizationId,
      filterViewId: viewId,
      filterViewName: name as string,
      filterObject: filterObject as FilterSearch,
    };
    return updateFilterView(filterViewUpdates).then(() => {
      if (onMutate) onMutate();
      setFilterViewName(name as string);
      setIsChanged(false);
      return "success";
    });
  };
  return (
    <>
      {(isPublic === 1 || loginId === lid) && (
        <>
          <Button
            ref={btnRef}
            style={{ position: "relative" }}
            variant="contained"
            color={
              isActive || isSelected
                ? theme.palette.info.dark
                : theme.palette.primary.light
            }
            textColor={
              isActive || isSelected
                ? theme.palette.grey[200]
                : theme.palette.grey[700]
            }
            onClick={handleClickButton}
            onDoubleClick={() => {
              // if (loginId === lid) {
              //   if (isChanged)
              //     if (onSetFilterView) onSetFilterView(payloadsToBeSet);
              //   if (!isChanged) setIsEditName(true);
              // }
            }}
            endIcon={
              isSelected || isUpdating || isPublicing
                ? endIconButton
                : undefined
            }
            disabled={isDeleting || isDuplicating || isUpdating || isPublicing}
            disableRipple={isEditName}
            sx={{
              "&.MuiEgButton-contained": {
                padding: "6px 18px",
                lineHeight: "28.5px",
              },
            }}
            id={`filterview-${viewName}`}
            data-tid={`filterview-${viewName}`}
          >
            <EditableLabel
              value={filterViewName}
              isEditName={loginId === lid ? isEditName : false}
              setIsEditName={setIsEditName}
              onSaveName={onSaveName}
              isSelected={isSelected}
              isUpdating={isUpdating}
            />
            {isChanged && <div className={classes.changeLight} />}
          </Button>
          {loginId === lid && (
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              className={classes.popoverMenu}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              sx={{
                top: "15px",
                left: "25px",
              }}
            >
              <MenuItem
                onClick={handleClickRename}
                className={classes.menuText}
                id="filterview-menu-tool-rename"
                data-tid="filterview-menu-tool-rename"
              >
                <ListItemIcon className={classes.menuIcon}>
                  <EditRoundedIcon fontSize="small" />
                </ListItemIcon>
                重新命名
              </MenuItem>
              <MenuItem
                onClick={handleClickDuplicate}
                className={classes.menuText}
                id="filterview-menu-tool-copy"
                data-tid="filterview-menu-tool-copy"
              >
                <ListItemIcon className={classes.menuIcon}>
                  <ContentCopyIcon fontSize="small" />
                </ListItemIcon>
                {wordLibrary?.copy ?? "複製"}
              </MenuItem>
              <MenuItem
                id="filterview-menu-tool-update"
                data-tid="filterview-menu-tool-update"
                onClick={handleClickSaveChange}
                className={classes.menuText}
                disabled={!isChanged}
              >
                <ListItemIcon className={classes.menuIcon}>
                  <TaskAltIcon fontSize="small" />
                </ListItemIcon>
                {wordLibrary?.update ?? "更新"}
                條件
              </MenuItem>
              <MenuItem
                onClick={handleClickPublicChange}
                className={classes.menuText}
                id="filterview-menu-tool-makepublic"
                data-tid="filterview-menu-tool-makepublic"
              >
                {Boolean(isPublic) && (
                  <>
                    <ListItemIcon className={classes.menuIcon}>
                      <PublicOffRounded fontSize="small" />
                    </ListItemIcon>
                    設為不公開
                  </>
                )}
                {!isPublic && (
                  <>
                    <ListItemIcon className={classes.menuIcon}>
                      <PublicRounded fontSize="small" />
                    </ListItemIcon>
                    設為公開
                  </>
                )}
              </MenuItem>
              <MenuItem
                onClick={handleClickDelete}
                className={classes.menuErrText}
                id="filterview-menu-tool-delete"
                data-tid="filterview-menu-tool-delete"
              >
                <ListItemIcon className={classes.menuIcon}>
                  <DeleteIcon fontSize="small" />
                </ListItemIcon>
                {wordLibrary?.delete ?? "刪除"}
              </MenuItem>
            </Menu>
          )}
        </>
      )}
    </>
  );
};

export default FilterViewDropDown;
