import React, { useCallback, useMemo, useEffect, useState } from "react";

import { getOrgShareEditList } from "redux/createUserInfoFilledUrlDialog/selectors";
import {
  initializeOrgShareValues,
  setFinishUploadFile,
  setHasDueDate,
  setHasRelativeTime,
  setOrgShareEdits,
  setOrgShareValues,
  setWelcomeUploadFile,
} from "redux/createUserInfoFilledUrlDialog";
import { ColumnType, EntityList } from "@eGroupAI/typings/apis";
import useStaticColumns from "utils/useStaticColumns";
import { Table, ServiceModuleValue } from "interfaces/utils";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useAppDispatch } from "redux/configureAppStore";

import useOrgShareTemplateList from "utils/useOrgShareTemplateList";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { Autocomplete, Box, CircularProgress, Stack } from "@mui/material";
import List from "@eGroupAI/material/List";
import ListItem from "@eGroupAI/material/ListItem";
import ListItemButton from "@eGroupAI/material/ListItemButton";
import ListItemIcon from "@eGroupAI/material/ListItemIcon";
import ListItemText from "@eGroupAI/material/ListItemText";
import Checkbox from "@eGroupAI/material/Checkbox";
import Grid from "@eGroupAI/material/Grid";
import TextField from "@mui/material/TextField";
import StyledSearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";
import {
  OrganizationColumn,
  OrganizationShareTemplate,
  UploadFile,
} from "interfaces/entities";
import clsx from "clsx";
import { makeStyles } from "@mui/styles";

import { addDays, set } from "date-fns";
import ShareEditCheckbox, {
  ExtendedOrganizationShareEdit,
} from "./ShareEditCheckbox";

export interface SelectShareEditListStepProps {
  selectedTemplate?: OrganizationShareTemplate;
  setSelectedTemplate?: React.Dispatch<
    React.SetStateAction<OrganizationShareTemplate | undefined>
  >;
  orgColumns: EntityList<OrganizationColumn> | undefined;
}

export type ShareEditDynamicColumnType =
  | { [key: string]: ExtendedOrganizationShareEdit }
  | undefined;

const useStyles = makeStyles(() => ({
  loader: {
    position: "absolute",
    top: 0,
    bottome: 0,
    left: 0,
    right: 0,
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    background: "rgba(255,255,255,0.5)",
    width: "100%",
    height: "800px",
  },
  showLoader: {
    display: "flex",
  },
}));

const SelectShareEditListStep = function (props: SelectShareEditListStepProps) {
  const { selectedTemplate, setSelectedTemplate, orgColumns } = props;
  const classes = useStyles();
  const organizationId = useSelector(getSelectedOrgId);
  const dispatch = useAppDispatch();
  const shareEditList = useSelector(getOrgShareEditList) || [];
  const wordLibrary = useSelector(getWordLibrary);

  const { data: orgShareTemplates, isValidating } = useOrgShareTemplateList(
    {
      organizationId,
    },
    undefined,
    { serviceModuleValue: ServiceModuleValue.CRM_USER },
    undefined,
    false
  );

  const { excute: getOrgShareTemplate, isLoading: isGettingShareTemplate } =
    useAxiosApiWrapper(apis.org.getOrgShareTemplate, "None");

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

  const handleClearTemplate = useCallback(() => {
    dispatch(initializeOrgShareValues());
    const updatedDynamicColumns = Object.keys(dynamicColumns)
      .map((key) => ({
        ...dynamicColumns[key],
        checked: false,
        organizationShareEditIsRequired: 0,
      }))
      .reduce((acc, curr) => {
        if (curr?.organizationShareEditKey)
          acc[curr.organizationShareEditKey] = curr;
        return acc;
      }, {});
    setDynamicColumns(updatedDynamicColumns);
  }, [dispatch, dynamicColumns]);

  const handleChangeTemplate = useCallback(
    async (templateId: string) => {
      if (templateId === "") {
        if (setSelectedTemplate) setSelectedTemplate(undefined);
        handleClearTemplate();
        return;
      }
      const { data: shareTemplate } = await getOrgShareTemplate({
        organizationId,
        organizationShareTemplateId: templateId,
      });
      if (setSelectedTemplate) setSelectedTemplate(shareTemplate);

      let orgShareExpiredDateString = "";
      if (shareTemplate.organizationShareTemplateExpiredDate) {
        orgShareExpiredDateString = new Date(
          shareTemplate.organizationShareTemplateExpiredDate
        ).toISOString();
      } else if (shareTemplate.organizationShareTemplateEndDaysInterval) {
        orgShareExpiredDateString = set(
          addDays(
            new Date(),
            shareTemplate.organizationShareTemplateEndDaysInterval
          ),
          { hours: 23, minutes: 59, seconds: 59 }
        ).toISOString();
      }

      dispatch(
        setOrgShareValues({
          values: {
            orgShareTemplateTitle: shareTemplate.organizationShareTemplateTitle,
            orgShareTemplateTagList:
              shareTemplate.organizationTagTargetList?.map(
                ({ organizationTag }) => organizationTag
              ),
            orgShareEditList:
              shareTemplate.organizationShareTemplateEditList?.map((edit) => ({
                organizationShareEditKey: edit.organizationShareTemplateEditKey,
                organizationShareEditType:
                  edit.organizationShareTemplateEditType,
                organizationShareEditIsRequired:
                  edit.organizationShareTemplateEditIsRequired,
                isDynamicColumn: edit.isDynamicColumn,
                isAutoFill: edit.isAutoFill,
              })),
            orgFinanceTemplateList:
              shareTemplate.organizationFinanceTemplateList,
            uploadFileTargetList:
              shareTemplate.uploadFileList
                ?.filter(
                  (uploadedFile) =>
                    uploadedFile.uploadFilePathType ===
                    ServiceModuleValue.USER_AGREEMENT
                )
                ?.map((file) => ({
                  uploadFile: {
                    uploadFileId: file.uploadFileId,
                  },
                })) || [],
            orgShareEditNeedUpload: String(
              shareTemplate.organizationShareTemplateEditNeedUpload
            ),
            orgShareIsOneTime: String(
              shareTemplate.organizationShareTemplateIsOneTime
            ),
            orgShareUploadDescription:
              shareTemplate.organizationShareTemplateUploadDescription,
            orgShareWelcomeMessage:
              shareTemplate.organizationShareTemplateWelcomeMessage,
            orgShareFinishMessage:
              shareTemplate.organizationShareTemplateFinishMessage,
            welcomeUploadFileId:
              shareTemplate.uploadFileList?.find(
                (el) =>
                  el.uploadFilePathType === ServiceModuleValue.WELCOME_IMAGE
              )?.uploadFileId || "",
            finishUploadFileId:
              shareTemplate.uploadFileList?.find(
                (el) =>
                  el.uploadFilePathType === ServiceModuleValue.FINISH_IMAGE
              )?.uploadFileId || "",
            welcomeUploadFiles: [],
            finishUploadFiles: [],
            orgShareExpiredDateString,
          },
        })
      );
      dispatch(setHasRelativeTime("0"));
      dispatch(
        setHasDueDate(
          shareTemplate.organizationShareTemplateExpiredDate ||
            shareTemplate.organizationShareTemplateEndDaysInterval
            ? "1"
            : "0"
        )
      );
      dispatch(
        setWelcomeUploadFile(
          shareTemplate.uploadFileList?.find(
            (el) => el.uploadFilePathType === ServiceModuleValue.WELCOME_IMAGE
          ) as UploadFile
        )
      );
      dispatch(
        setFinishUploadFile(
          shareTemplate.uploadFileList?.find(
            (el) => el.uploadFilePathType === ServiceModuleValue.FINISH_IMAGE
          ) as UploadFile
        )
      );

      const dynamicColumnIds =
        shareTemplate?.organizationShareTemplateEditList?.map(
          (shareEdit) => shareEdit.organizationShareTemplateEditKey
        );
      const updatedDynamicColumns = Object.keys(dynamicColumns)
        .map((key) => {
          if (dynamicColumnIds?.includes(key)) {
            return {
              ...dynamicColumns[key],
              checked: true,
              organizationShareEditIsRequired:
                shareTemplate?.organizationShareTemplateEditList?.find(
                  (shareEdit) =>
                    shareEdit.organizationShareTemplateEditKey === key
                )?.organizationShareTemplateEditIsRequired,
              isAutoFill:
                shareTemplate?.organizationShareTemplateEditList?.find(
                  (shareEdit) =>
                    shareEdit.organizationShareTemplateEditKey === key
                )?.isAutoFill,
            };
          }
          return {
            ...dynamicColumns[key],
            checked: false,
            organizationShareEditIsRequired:
              shareTemplate?.organizationShareTemplateEditList?.find(
                (shareEdit) =>
                  shareEdit.organizationShareTemplateEditKey === key
              )?.organizationShareTemplateEditIsRequired,
            isAutoFill: shareTemplate?.organizationShareTemplateEditList?.find(
              (shareEdit) => shareEdit.organizationShareTemplateEditKey === key
            )?.isAutoFill,
          };
        })
        .reduce((acc, curr) => {
          if (curr?.organizationShareEditKey)
            acc[curr.organizationShareEditKey] = curr;
          return acc;
        }, {});
      setDynamicColumns(updatedDynamicColumns);
    },
    [
      dispatch,
      dynamicColumns,
      getOrgShareTemplate,
      organizationId,
      setSelectedTemplate,
      handleClearTemplate,
    ]
  );

  useEffect(() => {
    if (searchText !== "") {
      const filtered = Object.values(dynamicColumns).filter((col) =>
        col.columnName.includes(searchText)
      );
      setFilteredColumns(filtered);
    } else setFilteredColumns(Object.values(dynamicColumns));
  }, [dynamicColumns, searchText]);

  const renderDynamicColumnTemplate = useCallback(
    () => (
      <Grid item xs={12}>
        <Autocomplete
          options={
            orgShareTemplates?.source.map((templateSearch) => ({
              label: templateSearch.organizationShareTemplateTitle,
              value: templateSearch.organizationShareTemplateId,
            })) || []
          }
          getOptionLabel={(option) => option.label || ""}
          noOptionsText={wordLibrary?.["no information found"] ?? "查無資料"}
          value={{
            label: selectedTemplate?.organizationShareTemplateTitle,
            value: selectedTemplate?.organizationShareTemplateId,
          }}
          isOptionEqualToValue={(option, value) => option.label === value.label}
          onChange={(e, option) => {
            handleChangeTemplate(option?.value || "");
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={wordLibrary?.["share template"] ?? "分享連結表單範本"}
              sx={{ padding: 0, mb: 2 }}
            />
          )}
        />
      </Grid>
    ),
    [
      handleChangeTemplate,
      orgShareTemplates?.source,
      selectedTemplate?.organizationShareTemplateId,
      selectedTemplate?.organizationShareTemplateTitle,
      wordLibrary,
    ]
  );

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
      <Box
        className={clsx(
          classes.loader,
          (isValidating || isGettingShareTemplate) && classes.showLoader
        )}
      >
        <CircularProgress />
      </Box>
      {renderDynamicColumnTemplate()}
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
              mr: 1,
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
