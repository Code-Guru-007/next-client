/* eslint-disable no-underscore-dangle */
import React, { FC, useEffect, useState, useCallback } from "react";

import useUploadFilesHandler from "utils/useUploadFilesHandler";
import { OptionType, ShareReurl, UploadFile } from "interfaces/entities";
import { useSelector } from "react-redux";
import { OrganizationMediaSizeType, FilePathType } from "interfaces/utils";
import {
  setUserValues,
  setUserFileList,
  setUserRemarkValues,
  setUserColumnTargetValues,
} from "redux/filledUserInfo";
import { getValues } from "redux/filledUserInfo/selectors";
import { useAppDispatch } from "redux/configureAppStore";
import apis from "utils/apis";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import Stack from "@mui/material/Stack";
import Paper from "@eGroupAI/material/Paper";
import Typography from "@eGroupAI/material/Typography";
import MultilineArea from "@eGroupAI/material/MultilineArea";
import Button, { ButtonProps } from "@eGroupAI/material/Button";
import Box from "@eGroupAI/material/Box";
// import IconButton from "components/IconButton/StyledIconButton";
// import DeleteIcon from "@mui/icons-material/Delete";
import DynamicField, {
  RemarkValue,
  RemarkValues,
  Values,
} from "components/DynamicField";

import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import { Upload } from "minimal/components/upload";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { SNACKBAR } from "components/App";

import { DynamicValueType } from "interfaces/form";
import { ColumnType } from "@eGroupAI/typings/apis";

export interface UserInfoProps {
  data: ShareReurl;
  organizationShareShortUrl?: string;
  loading?: boolean;
  isFirstStep?: boolean;
  isFinalStep?: boolean;
  /**
   * If setp active.
   */
  active?: boolean;
  onPrevClick?: ButtonProps["onClick"];
  onSubmit?: (
    formValues?: Values,
    remarkValues?: RemarkValues,
    userFileList?: UploadFile[],
    columnTargetValues?: RemarkValues
  ) => void | Promise<void>;
  setStepperDisable?: (stepperDisable: boolean) => void;
}

const UserInfo: FC<UserInfoProps> = function (props) {
  const { openSnackbar, closeSnackbar } =
    useReduxSnackbar<SnackbarProps>(SNACKBAR);
  const {
    data,
    organizationShareShortUrl,
    onPrevClick,
    onSubmit,
    setStepperDisable,
    loading,
    isFirstStep,
    isFinalStep,
    active = false,
  } = props;
  const dispatch = useAppDispatch();
  const storeValues = useSelector(getValues);
  const [formUserValues, setFormUserValues] = useState(storeValues.userValues);
  const wordLibrary = useSelector(getWordLibrary);
  const [errors, setErrors] = useState<{ [name: string]: string | undefined }>(
    {}
  );

  const [remarkValues, setRemarkValues] = useState<RemarkValues>({});
  const [columnTargetValues, setColumnTargetValues] = useState<RemarkValues>(
    {}
  );

  useEffect(() => {
    setFormUserValues(storeValues.userValues);
  }, [storeValues]);

  const { organizationUser, organizationShareEditList } = data;
  const { dynamicColumnListAll, columnConditionList, dynamicColumnTargetList } =
    organizationUser || {};

  useEffect(() => {
    const columnIdList = organizationShareEditList?.map(
      (el) => el?.organizationShareEditKey
    );
    const filteredColumns = Object.entries(storeValues.userValues).reduce(
      (acc, [key, value]) =>
        columnIdList?.includes(key) ? { ...acc, [key]: value } : acc,
      {}
    );
    setFormUserValues(filteredColumns);

    const columnTargets = dynamicColumnTargetList
      ?.filter((target) =>
        columnIdList?.includes(target.organizationColumn.columnId)
      )
      .reduce<RemarkValues>(
        (a, el) => ({
          ...a,
          [el.organizationColumn.columnId]:
            el.columnTargetValueRemarkList as RemarkValue,
        }),
        {}
      );
    setColumnTargetValues(columnTargets || {});
  }, [organizationShareEditList, storeValues, dynamicColumnTargetList]);

  const [dynamicOptions, setDynamicOptions] = useState<{
    [name: string]: OptionType[] | undefined;
  }>({});

  const [files, setFiles] = useState<(File | string)[]>([]);
  const { uploadFiles, isUploading } = useUploadFilesHandler({
    useImageCompress: false,
  });
  const [isFileHandling, setIsFileHandling] = useState<boolean>(false);

  const isNeedFilledForm = !!data?.organizationShareEditList?.length;
  const isNeedUpload = !!data?.organizationShareEditNeedUpload;

  if (setStepperDisable)
    setStepperDisable(
      active &&
        (isNeedUpload
          ? files.length === 0 || Boolean(loading)
          : Boolean(loading))
    );

  const handleChange = useCallback((name: string, value?: DynamicValueType) => {
    try {
      const orgValue = value?.value;
      const transformedValue = orgValue
        ? orgValue.charAt(0).toUpperCase() + orgValue.slice(1)
        : "";
      setFormUserValues((val) => ({
        ...val,
        [name]:
          name === "organizationUserIdCardNumber" ? transformedValue : orgValue,
      }));
    } catch (error) {
      apis.tools.createLog({
        function: "DatePicker: filledUserInfo handleChange",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: error,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
    }
  }, []);

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
      setFiles([...files, ...newFiles]);
    },
    [files]
  );

  const handleRemoveFile = (inputFile: File | string) => {
    const filtered = files.filter((file) => file !== inputFile);
    setFiles(filtered);
  };

  const handleErrors = useCallback((name: string, error?: string) => {
    setErrors((err) => ({
      ...err,
      [name]: error,
    }));
  }, []);

  const handleChangeRemark = useCallback(
    (
      type: ColumnType,
      colId: string,
      optionId: string,
      optionName: string,
      value?: string
    ) => {
      const remarkOfCol = remarkValues[colId] || [];
      const idx = remarkOfCol?.findIndex(
        (el) => el.organizationOptionId === optionId
      );
      if (type === ColumnType.CHOICE_MULTI) {
        if (idx === -1) {
          remarkOfCol?.push({
            organizationOptionId: optionId,
            organizationOptionName: optionName,
            columnTargetValueRemark: value,
          });
        } else if (remarkOfCol && idx >= 0) {
          remarkOfCol[idx] = {
            organizationOptionId: optionId,
            organizationOptionName: optionName,
            columnTargetValueRemark: value,
          };
        }
        setColumnTargetValues((prev) => {
          const columnTargetValueList = prev[colId] || [];
          const idxOfValueList = columnTargetValueList.findIndex(
            (el) => el?.organizationOptionId === optionId
          );
          if (idxOfValueList === -1) {
            return {
              ...prev,
              [colId]: [
                ...columnTargetValueList,
                {
                  organizationOptionId: optionId,
                  organizationOptionName: optionName,
                  columnTargetValueRemark: value ?? undefined,
                },
              ],
            };
          }
          const newColumnTargetValueList = [...columnTargetValueList];
          newColumnTargetValueList[idxOfValueList] = {
            organizationOptionId: optionId,
            organizationOptionName: optionName,
            columnTargetValueRemark: value ?? undefined,
          };
          return { ...prev, [colId]: newColumnTargetValueList };
        });
      }
      if (
        type === ColumnType.CHOICE_ONE ||
        type === ColumnType.CHOICE_ONE_DROPDOWN
      ) {
        remarkOfCol[0] = {
          organizationOptionId: optionId,
          organizationOptionName: optionName,
          columnTargetValueRemark: value,
        };
        setColumnTargetValues((prev) => ({
          ...prev,
          [colId]: [
            {
              organizationOptionId: optionId,
              organizationOptionName: optionName,
              columnTargetValueRemark: value ?? undefined,
            },
          ],
        }));
      }
      setRemarkValues((prev) => ({
        ...prev,
        [colId]: remarkOfCol || [],
      }));
    },
    [remarkValues]
  );

  useEffect(() => {
    organizationShareEditList?.map((el) => {
      if (el.isDynamicColumn) {
        // set options of dynamic columns
        const dynamicColumn = dynamicColumnListAll?.find(
          (d) => el.organizationShareEditKey === d.columnId
        );
        if (!dynamicColumn?.columnType) return undefined;
        const dynamicColumnOption = dynamicColumn?.organizationOptionList?.map(
          (o) => ({
            optionId: o.organizationOptionId,
            label: o.organizationOptionName,
            value: o.organizationOptionName,
            nextColumnId: o.organizationOptionNextColumnId,
          })
        );

        setDynamicOptions((prev) => ({
          ...prev,
          [el.organizationShareEditKey as string]: dynamicColumnOption,
        }));
      }

      // set options of static columns
      else {
        const staticColumn = columnConditionList?.find(
          (d) => el.organizationShareEditKey === d.sortKey
        );
        if (!staticColumn?.columnType) return undefined;

        const staticColumnOption = staticColumn?.keyValueMap
          ? Object.keys(staticColumn.keyValueMap).map((key) => ({
              optionId: key,
              label: key,
              value: staticColumn.keyValueMap
                ? staticColumn.keyValueMap[key] || ""
                : "",
            }))
          : undefined;
        setDynamicOptions((prev) => ({
          ...prev,
          [el.organizationShareEditKey as string]: staticColumnOption,
        }));
      }
      return null;
    });
  }, [columnConditionList, dynamicColumnListAll, organizationShareEditList]);

  const handleClickPrevButton = async (e) => {
    await dispatch(
      setUserValues({
        ...formUserValues,
      })
    );

    if (onPrevClick) onPrevClick(e);
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    const isValid =
      Object.values(errors).filter((v) => typeof v !== "undefined").length ===
      0;
    if (!isValid) {
      const firstError = Object.entries(errors).find(
        (v) => typeof v[1] !== "undefined"
      );
      document
        .querySelector(`input[name=${firstError?.[0]}]`)
        ?.scrollIntoView();
      openSnackbar({
        message: "請正確填寫內容",
        severity: "error",
      });
      return;
    }
    if (formUserValues.organizationUserIdCardNumber) {
      const userIdCardNumber = formUserValues.organizationUserIdCardNumber;
      const isValidUserIdCardNumber = new RegExp("^[A-Z][12]\\d{8}$").test(
        userIdCardNumber.toString()
      );
      if (!isValidUserIdCardNumber) {
        document
          .querySelector('input[name="organizationUserIdCardNumber"]')
          ?.scrollIntoView();
        openSnackbar({
          message: "請正確填寫內容",
          severity: "error",
        });
        return;
      }
    }

    if (files.length !== 0) {
      setIsFileHandling(true);
      try {
        setIsFileHandling(true);
        const res = await uploadFiles({
          organizationShareShortUrl: organizationShareShortUrl as string,
          files: Array.from(files as File[]),
          filePathType: FilePathType.USER_FILE,
          imageSizeType: OrganizationMediaSizeType.NORMAL,
        });
        if (res) {
          setIsFileHandling(false);
          closeSnackbar({
            autoHideDuration: 4000,
          });
          openSnackbar({
            message: wordLibrary?.["added successfully"] ?? "新增成功",
            severity: "success",
            autoHideDuration: 4000,
          });

          if (res.data[0]) {
            const next = [...storeValues.userFileList];
            res.data.map((d) => next.push(d));
            await dispatch(setUserFileList(next));
            await dispatch(
              setUserValues({
                ...formUserValues,
              })
            );
            await dispatch(setUserRemarkValues(remarkValues));
            await dispatch(setUserColumnTargetValues(columnTargetValues));
            if (onSubmit) {
              onSubmit(formUserValues, remarkValues, next, columnTargetValues);
            }
          } else {
            return;
          }
        } else {
          return;
        }
      } catch (error) {
        setIsFileHandling(false);
        apis.tools.createLog({
          function: "filledUserInfo: file input onChange",
          browserDescription: window.navigator.userAgent,
          jsonData: {
            data: error,
            deviceInfo: getDeviceInfo(),
          },
          level: "ERROR",
        });
      }
      setIsFileHandling(false);
    } else {
      await dispatch(
        setUserValues({
          ...formUserValues,
        })
      );
      await dispatch(setUserRemarkValues(remarkValues));
      await dispatch(setUserColumnTargetValues(columnTargetValues));
      if (onSubmit) {
        onSubmit(formUserValues, remarkValues, undefined, columnTargetValues);
      }
    }
  };
  return (
    <form onSubmit={handleOnSubmit}>
      {isNeedFilledForm && (
        <>
          <Typography variant="h4" sx={{ mb: 1, mt: 2 }}>
            填寫個人資訊
          </Typography>
          {organizationShareEditList?.map((el) => {
            // render dynamic column
            if (el.isDynamicColumn) {
              const options = dynamicOptions[el.organizationShareEditKey];

              const column = dynamicColumnListAll?.find(
                (d) => el.organizationShareEditKey === d.columnId
              );
              const selectedColumnTarget = dynamicColumnTargetList?.filter(
                (target) =>
                  target.organizationColumn.columnId ===
                  el.organizationShareEditKey
              );

              if (!column?.columnType) return undefined;
              const value = formUserValues[el.organizationShareEditKey];
              const filePath = organizationUser?.uploadFileList?.find(
                (item) => item.uploadFileId === value
              )?.uploadFilePath;
              const fileName = `${
                organizationUser?.uploadFileList?.find(
                  (item) => item.uploadFileId === value
                )?.uploadFileName
              }.${
                organizationUser?.uploadFileList?.find(
                  (item) => item.uploadFileId === value
                )?.uploadFileExtensionName
              }`;
              return (
                <Paper
                  sx={{ px: 3, py: 2, mb: 2 }}
                  key={el.organizationShareEditKey}
                >
                  <Stack>
                    <DynamicField
                      value={formUserValues[el.organizationShareEditKey]}
                      errorState={errors[el.organizationShareEditKey]}
                      handleChange={handleChange}
                      handleErrors={handleErrors}
                      variant="standard"
                      name={el.organizationShareEditKey}
                      type={column?.columnType}
                      label={column?.columnName}
                      fullWidth
                      labelFlag
                      filePath={filePath}
                      fileName={fileName}
                      options={options}
                      required={el.organizationShareEditIsRequired === 1}
                      isAutoFill={el.isAutoFill !== "FALSE"}
                      isEditor={column.isEditor === 1}
                      min={column.columnNumberMin}
                      max={column.columnNumberMax}
                      editorTemplateContent={column.columnEditorTemplateContent}
                      hasValidator={column.hasValidator === 1}
                      validator={column.columnValidatorRegex}
                      hasRemark={column.hasValueRemark === 1}
                      remarkList={
                        selectedColumnTarget?.[0]?.columnTargetValueRemarkList
                      }
                      requiredRemark={column.isRequiredValueRemark === 1}
                      numberUnit={column.columnNumberUnit}
                      numberDecimal={column.columnNumberOfDecimal}
                      isRelatedServiceModule={Boolean(
                        column.isRelatedServiceModule
                      )}
                      columnRelatedServiceModuleValue={
                        column.columnRelatedServiceModuleValue
                      }
                      hasNextColumn={column.hasNextColumn === 1}
                      handleChangeRemark={handleChangeRemark}
                      setColumnTargetValues={setColumnTargetValues}
                      organizationIdforShareShortUrl={
                        organizationUser.organization?.organizationId
                      }
                      maxOptionBeSelected={column.maxOptionBeSelected}
                      minOptionBeSelected={column.minOptionBeSelected}
                    />
                  </Stack>
                </Paper>
              );
            }
            // render static column
            const column = columnConditionList?.find(
              (d) => el.organizationShareEditKey === d.sortKey
            );

            if (
              el.organizationShareEditKey === "organizationUserIdCardNumber" &&
              column
            ) {
              column.columnValidatorRegex = "^[A-Z][12]\\d{8}$";
            }
            if (!column?.columnType) return undefined;

            return (
              <Paper
                sx={{ px: 3, py: 2, mb: 2 }}
                key={el.organizationShareEditKey}
              >
                <DynamicField
                  capitalize={
                    el.organizationShareEditKey ===
                    "organizationUserIdCardNumber"
                  }
                  value={formUserValues[el.organizationShareEditKey]}
                  errorState={errors[el.organizationShareEditKey]}
                  handleChange={handleChange}
                  handleErrors={handleErrors}
                  variant="standard"
                  name={el.organizationShareEditKey}
                  type={column?.columnType}
                  verifyType={column?.verifyType_}
                  dateRangeLimit={column.dateRangeLimit_}
                  label={column?.columnName as string}
                  fullWidth
                  labelFlag
                  // filePath={filePath}
                  // fileName={fileName}
                  options={dynamicOptions[el.organizationShareEditKey]}
                  required={el.organizationShareEditIsRequired === 1}
                  isAutoFill={el.isAutoFill !== "FALSE"}
                  hasValidator={
                    el.organizationShareEditKey ===
                    "organizationUserIdCardNumber"
                  }
                  validator={column?.columnValidatorRegex}
                  setColumnTargetValues={setColumnTargetValues}
                />
              </Paper>
            );
          })}
        </>
      )}
      {isNeedUpload && (
        <Paper sx={{ px: 3, py: 2, mt: 2 }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            {wordLibrary?.upload ?? "上傳"} *
          </Typography>
          <MultilineArea
            variant="body1"
            text={data.organizationShareUploadDescription}
            sx={{ mb: 2 }}
          />
          <Upload
            multiple
            files={files}
            onDrop={handleDrop}
            onRemove={handleRemoveFile}
            disabled={isFileHandling || isUploading}
          />
        </Paper>
      )}
      <Box mt={2} display="flex" justifyContent="flex-end">
        {!isFirstStep && (
          <Button
            color="primary"
            variant="contained"
            onClick={(e) => handleClickPrevButton(e)}
            sx={{ mr: 1 }}
          >
            {wordLibrary?.["go back to the previous step"] ?? "回上一步"}
          </Button>
        )}
        <Button
          color="primary"
          variant="contained"
          loading={loading || isUploading || isFileHandling}
          type="submit"
          disabled={
            isNeedUpload
              ? files.length === 0 || loading || isUploading || isFileHandling
              : loading
          }
        >
          {(() => {
            let output = "";
            if (isFinalStep) {
              output = wordLibrary?.complete ?? "完成";
            } else {
              output = wordLibrary?.["next step"] ?? "下一步";
            }
            return output;
          })()}
          {isNeedUpload &&
            files.length === 0 &&
            `(${
              wordLibrary?.["please upload the file to proceed"] ??
              "請上傳檔案以繼續"
            })`}
        </Button>
      </Box>
    </form>
  );
};

export default UserInfo;
