import React, {
  FC,
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { isEqual } from "lodash";
import { AxiosPromise } from "axios";
import { useForm, FormProvider } from "react-hook-form";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import { useAppDispatch } from "redux/configureAppStore";
import { setDeletedColumnOptionIds, setIsSorted } from "redux/dynamicColumns";
import {
  getDeletedColumnOptionIds,
  getIsSorted,
} from "redux/dynamicColumns/selectors";
import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import useConfirmLeaveDialog from "utils/useConfirmLeaveDialog";
import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useSelector } from "react-redux";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import { OrganizationColumn } from "interfaces/entities";

import DialogTitle from "@eGroupAI/material/DialogTitle";
import Box from "@eGroupAI/material/Box";
import Dialog from "@eGroupAI/material/Dialog";
import { ColumnType } from "@eGroupAI/typings/apis";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import DialogActions from "@mui/material/DialogActions";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import PermissionValid from "components/PermissionValid/PermissionValid";
import { ColumnTable, ServiceModuleValue } from "interfaces/utils";
import { DynamicColumnsFormInput } from "interfaces/form";
import useOrgDynamicColumnGroupsFilterSearch from "utils/useOrgDynamicColumnGroupsFilterSearch";
import DialogFullPageContainer from "components/DialogFullPageContainer";
import DynamicColumnsForm, { FORM } from "./DynamicColumnsForm";
import DynamicPreview from "./DynamicPreview";

export const DIALOG = "DynamicColumnsDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

function hasDuplicates(stringArray: string[] = []) {
  const stringSet = new Set();
  for (let i = 0; i < stringArray.length; i++) {
    if (stringSet.has(stringArray[i])) {
      return true;
    }
    stringSet.add(stringArray[i]);
  }
  return false;
}

export interface DynamicColumnsDialogProps {
  column?: OrganizationColumn;
  columnTable: ColumnTable;
  columnToCopy?: OrganizationColumn;
  serviceModuleValue: ServiceModuleValue;
  dynamicFieldTypeEnable: boolean | undefined;
}

const DynamicColumnsDialog: FC<DynamicColumnsDialogProps> = function (props) {
  const {
    column,
    columnTable,
    columnToCopy,
    serviceModuleValue,
    dynamicFieldTypeEnable,
  } = props;
  const classes = useStyles();

  const theme = useTheme();
  const dispatch = useAppDispatch();
  const organizationId = useSelector(getSelectedOrgId);
  const [preview, setPreview] = useState(false);
  const [previewValue, setPreviewValue] = useState<DynamicColumnsFormInput>();
  const [formIsDirty, setFormIsDirty] = useState(false);
  const submitBtn = useRef<HTMLInputElement | null>(null);

  const wordLibrary = useSelector(getWordLibrary);
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const { excute: updateOrgDynamicColumn, isLoading: isUpdating } =
    useAxiosApiWrapper(apis.org.updateOrgDynamicColumn);
  const { excute: deleteOrgDynamicColumnOption } = useAxiosApiWrapper(
    apis.org.deleteOrgDynamicColumnOption
  );
  const { excute: sortOrgDynamicColumnOptions, isLoading: isSorting } =
    useAxiosApiWrapper(apis.org.sortOrgDynamicColumnOptions, "Update");
  const deletedColumnOptionIds = useSelector(getDeletedColumnOptionIds);
  const isSorted = useSelector(getIsSorted);
  const matchMutate = useSwrMatchMutate();
  const methods = useForm<DynamicColumnsFormInput>({
    defaultValues: {
      organizationColumnList: [],
    },
  });

  const defaultValues: DynamicColumnsFormInput = useMemo(() => {
    if (column)
      return {
        organizationColumnList: [
          {
            columnId: column.columnId,
            columnTable: column.columnTable,
            columnType: column.columnType,
            columnRelatedServiceModuleValue:
              column.columnRelatedServiceModuleValue,
            columnName: column.columnName,
            columnDescription: column?.columnDescription,
            organizationOptionList: column.organizationOptionList?.map(
              (el) => ({
                id: el.organizationOptionId,
                organizationOptionId: el.organizationOptionId,
                organizationOptionName: el.organizationOptionName,
                organizationOptionNextColumnId:
                  el.organizationOptionNextColumnId || "",
              })
            ),
            columnNumberMin: column.columnNumberMin,
            columnNumberMax: column.columnNumberMax,
            columnNumberOfDecimal: column.columnNumberOfDecimal,
            columnNumberUnit: column.columnNumberUnit,
            hasValidator: column.hasValidator,
            columnValidatorRegex: column.columnValidatorRegex,
            isRequired: column.isRequired,
            isRelatedServiceModule: column.isRelatedServiceModule,
            isEditor: column.isEditor,
            columnEditorTemplateContent: column.columnEditorTemplateContent,
            hasValueRemark: column.hasValueRemark,
            hasNextColumn: column.hasNextColumn,
            isUniqueValue: column.isUniqueValue,
            isRequiredValueRemark: column.isRequiredValueRemark,
            organizationColumnGroup: column.organizationColumnGroup,
            isCommentEnabled: column.isCommentEnabled,
            maxOptionBeSelected: column.maxOptionBeSelected,
            minOptionBeSelected: column.minOptionBeSelected,
          },
        ],
      };
    if (columnToCopy)
      return {
        organizationColumnList: [
          {
            columnId: "",
            columnTable: columnToCopy.columnTable,
            columnType: columnToCopy.columnType,
            columnRelatedServiceModuleValue:
              columnToCopy.columnRelatedServiceModuleValue,
            columnName: columnToCopy.columnName,
            columnDescription: columnToCopy?.columnDescription,
            organizationOptionList: columnToCopy.organizationOptionList?.map(
              (el) => ({
                id: el.organizationOptionId,
                organizationOptionName: el.organizationOptionName,
                organizationOptionNextColumnId:
                  el.organizationOptionNextColumnId,
              })
            ),
            columnNumberMin: columnToCopy.columnNumberMin,
            columnNumberMax: columnToCopy.columnNumberMax,
            columnNumberOfDecimal: columnToCopy.columnNumberOfDecimal,
            columnNumberUnit: columnToCopy.columnNumberUnit,
            hasValidator: columnToCopy.hasValidator,
            columnValidatorRegex: columnToCopy.columnValidatorRegex,
            isRequired: columnToCopy.isRequired,
            isRelatedServiceModule: columnToCopy.isRelatedServiceModule,
            isEditor: columnToCopy.isEditor,
            columnEditorTemplateContent:
              columnToCopy.columnEditorTemplateContent,
            hasValueRemark: columnToCopy.hasValueRemark,
            hasNextColumn: columnToCopy.hasNextColumn,
            isUniqueValue: columnToCopy.isUniqueValue,
            isRequiredValueRemark: columnToCopy.isRequiredValueRemark,
            organizationColumnGroup: columnToCopy.organizationColumnGroup,
            isCommentEnabled: columnToCopy.isCommentEnabled,
            maxOptionBeSelected: columnToCopy.maxOptionBeSelected,
            minOptionBeSelected: columnToCopy.minOptionBeSelected,
          },
        ],
      };
    return {
      organizationColumnList: [
        {
          columnId: "",
          columnName: "",
          columnType: ColumnType.TEXT,
          columnTable,
          isRequired: 0,
        },
      ],
    };
  }, [column, columnTable, columnToCopy]);

  const organizationOptionList = methods.watch(
    `organizationColumnList.0.organizationOptionList`
  );

  hasDuplicates(
    organizationOptionList?.map(
      ({ organizationOptionName }) => organizationOptionName
    )
  );

  const handlePreview = useCallback(() => {
    setPreview(!preview);
    const values = methods.getValues();
    setPreviewValue(values);
  }, [methods, preview]);

  const handleCloseDialog = () => {
    closeDialog();
    setPreview(false);
    setPreviewValue({
      organizationColumnList: [],
    });
    methods.reset();
  };

  const closeConfirm = useConfirmLeaveDialog({
    shouldOpen: formIsDirty,
    handleClose: handleCloseDialog,
    onConfirm: handleCloseDialog,
  });

  const handleSubmit = async (valuesParam?: DynamicColumnsFormInput) => {
    const values = valuesParam || methods.getValues();
    const { organizationColumnList } = values;
    try {
      if (deletedColumnOptionIds.length) {
        const results: AxiosPromise[] = [];
        deletedColumnOptionIds.forEach((el) => {
          if (el && column?.columnId) {
            results.push(
              deleteOrgDynamicColumnOption({
                organizationId,
                organizationOptionId: el,
                columnId: column.columnId,
              })
            );
          }
        });
        await Promise.all(results);
      }
      const nextList = organizationColumnList.map(
        ({ organizationOptionList, ...el }) => {
          const result = {
            ...el,
            organizationOptionList: organizationOptionList?.map(
              ({ id, ...o }) => {
                const r = { ...o };
                if (!r.organizationOptionId) {
                  delete r.organizationOptionId;
                }
                return r;
              }
            ),
          };
          if (!result.columnId) {
            delete result.columnId;
          }
          return result;
        }
      );
      const { data: newColumns } = await updateOrgDynamicColumn({
        organizationId,
        columnTable,
        organizationColumnList: nextList,
      });
      const defaultListOrder = column?.organizationOptionList?.map((el) => ({
        organizationOptionId: el.organizationOptionId as string,
      }));

      // Get new column options from newColumns by columnId
      const newOptions = newColumns?.filter(
        (col) => col.columnId === column?.columnId
      )[0];

      // Get sorted list order from newOptions
      const sortedListOrder = newOptions
        ? newOptions.organizationOptionList?.map((el) => ({
            organizationOptionId: el.organizationOptionId as string,
          }))
        : [];

      // Check if column is sorted and if the default list order is not equal to the sorted list order
      if (
        column &&
        sortedListOrder &&
        isSorted &&
        !isEqual(defaultListOrder, sortedListOrder)
      ) {
        await sortOrgDynamicColumnOptions({
          organizationId,
          columnId: column?.columnId,
          organizationOptionList: sortedListOrder,
        });
      }

      dispatch(setDeletedColumnOptionIds([]));
      dispatch(setIsSorted(false));
      closeDialog();
      setPreviewValue({
        organizationColumnList: [],
      });
      matchMutate(
        new RegExp(`^/organizations/${organizationId}/search/columns\\?`, "g")
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      apis.tools.createLog({
        function: "DynamicColumnsDialog: handleNext",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: error,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
    }
  };
  const { data: columnGroups, isValidating } =
    useOrgDynamicColumnGroupsFilterSearch(
      {
        organizationId,
      },
      undefined,
      { serviceModuleValue }
    );
  const [columnNameError, setColumnNameError] = useState<boolean>(false);

  const handleValidate = useCallback(() => {
    const values = methods.getValues();
    const { organizationColumnList } = values;
    const columnName = organizationColumnList[0]?.columnName;
    if (columnName !== "") {
      setColumnNameError(false);
    } else setColumnNameError(true);
    if (submitBtn.current) submitBtn.current.click();
  }, [methods]);

  useEffect(() => {
    if (!isOpen) setColumnNameError(false);
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        closeConfirm();
        setPreview(false);
      }}
      fullWidth
      maxWidth="md"
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
      disableEnforceFocus
    >
      <DialogTitle
        onClickClose={() => {
          closeConfirm();
          setPreview(false);
        }}
      >
        {!column &&
          (columnToCopy
            ? `${wordLibrary?.["duplicate dynamic field"] ?? "複製動態欄位"}`
            : `${wordLibrary?.["add dynamic field"] ?? "新增動態欄位"}`)}
        {column &&
          `${wordLibrary?.edit ?? "編輯"}${column.columnName}${
            wordLibrary?.field ?? "欄位"
          }`}
      </DialogTitle>
      <DialogFullPageContainer>
        <FormProvider {...methods}>
          {preview ? (
            <DynamicPreview
              defaultValues={defaultValues}
              previewValue={previewValue}
              organizationId={organizationId}
            />
          ) : (
            <DynamicColumnsForm
              dynamicFieldTypeEnable={dynamicFieldTypeEnable}
              defaultValues={defaultValues}
              previewValue={previewValue}
              column={column}
              setFormIsDirty={setFormIsDirty}
              serviceModuleValue={serviceModuleValue}
              onSubmit={handleSubmit}
              columnNameError={columnNameError}
              setColumnNameError={setColumnNameError}
              columnGroups={columnGroups?.source || []}
              isLoadingGroups={isValidating}
            />
          )}
        </FormProvider>
      </DialogFullPageContainer>
      <DialogActions>
        <DialogCloseButton sx={{ mr: 1 }} onClick={() => closeConfirm()} />
        <Box flexGrow={1} />
        <PermissionValid
          shouldBeOrgOwner
          modulePermissions={column ? ["UPDATE_ALL"] : ["CREATE"]}
          targetPath="/me/dynamic-columns"
        >
          <DialogConfirmButton
            disabled={
              isUpdating ||
              isSorting ||
              hasDuplicates(
                organizationOptionList?.map(
                  ({ organizationOptionName }) => organizationOptionName
                )
              )
            }
            onClick={handlePreview}
            id="dialog-preview-button"
            data-tid="dialog-preview-button"
          >
            {!preview
              ? `${wordLibrary?.preview ?? "預覽"}`
              : `${wordLibrary?.["return to edit mode"] ?? "回到編輯模式"}`}
          </DialogConfirmButton>

          <input
            ref={submitBtn}
            type="submit"
            style={{ display: "none" }}
            form={FORM}
          />

          <DialogConfirmButton
            disabled={
              isUpdating ||
              isSorting ||
              preview ||
              hasDuplicates(
                organizationOptionList?.map(
                  ({ organizationOptionName }) => organizationOptionName
                )
              )
            }
            loading={isUpdating || isSorting}
            onClick={handleValidate}
          >
            {wordLibrary?.save ?? "儲存"}
          </DialogConfirmButton>
        </PermissionValid>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(DynamicColumnsDialog);
