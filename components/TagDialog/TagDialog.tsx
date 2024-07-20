/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DeleteIcon from "@mui/icons-material/DeleteRounded";
import { Box, Dialog, DialogContent } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

import { useReduxDialog } from "@eGroupAI/redux-modules";
import Grid from "@eGroupAI/material/Grid";
import useOrgRoles from "@eGroupAI/hooks/apis/useOrgRoles";
import DialogActions from "@eGroupAI/material/DialogActions";
import { Button, IconButton, TextField, Typography } from "@eGroupAI/material";
import { Upload } from "minimal/components/upload";
import ColorPicker from "@eGroupAI/material/ColorPicker";
import CheckboxInputGroup, {
  Value,
} from "@eGroupAI/material/CheckboxInputGroup";
import { OrganizationRole } from "@eGroupAI/typings/apis";

import DialogConfirmButton from "components/DialogConfirmButton";
import DialogFullPageContainer from "components/DialogFullPageContainer";
import DialogCloseButton from "components/DialogCloseButton";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import LocaleDropDown from "components/LocaleDropDown";
import MenuItem from "components/MenuItem";

import { TagFormInput } from "interfaces/form";
import { OrganizationTag, UploadFile } from "interfaces/entities";
import {
  Locale,
  OrganizationMediaSizeType,
  OrganizationMediaType,
  ServiceModuleValue,
} from "interfaces/utils";

import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useUploadFilesHandler from "utils/useUploadFilesHandler";
import useOrgTag from "utils/useOrgTag";

import clsx from "clsx";
import { useSettingsContext } from "minimal/components/settings";

export const DIALOG = "TagDialog";
export const FORM = "TagForm";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
  dropzoneWrapper: {
    overflow: "hidden",
  },
  dropzone: {
    margin: "unset",
  },
  checkboxGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  addedRole: {
    padding: "10px 0 0 10px",
  },
  deleteRole: {
    margin: "0 0 0 20px",
  },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  showLoader: {
    display: "flex",
  },
  lightOpacity: {
    background: "rgba(255,255,255,0.6)",
  },
  darkOpacity: {
    background: "rgba(33, 43, 54, 0.6)",
  },
}));

export interface TagGroupDialogProps {
  organizationId: string;
  onSuccess?: () => void;
  tagGroupId: string;
  tagGroupName: string;
  tagId?: string;
  onCloseDialog: () => void;
  editable?: boolean;
}
const TagFormSchema = yup.object().shape({
  tagName: yup.string().required("此為必填欄位。"),
});

const resolver = yupResolver(TagFormSchema);

const TagGroupDialog: FC<TagGroupDialogProps> = function (props) {
  const {
    organizationId,
    tagGroupId,
    tagId,
    onSuccess,
    tagGroupName,
    onCloseDialog,
    editable = false,
  } = props;
  const classes = useStyles();
  const theme = useTheme();
  const settings = useSettingsContext();
  const [file, setFile] = useState<File | string | null>(null);
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const globalLocale = useSelector(getGlobalLocale);
  const methods = useForm<TagFormInput>({
    defaultValues: {
      tagName: "",
      tagColor: "#000000",
      organizationMediaList: [],
      organizationRoleTargetAuthList: [],
    },
    resolver,
  });

  const {
    setValue,
    control,
    reset,
    watch,
    handleSubmit,
    formState: { errors },
  } = methods;

  const contentRef = useRef<HTMLDivElement>(null);

  const roleTargetAuthList = watch("organizationRoleTargetAuthList");
  const wordLibrary = useSelector(getWordLibrary);
  const [locale, setLocale] = useState<string>(globalLocale);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [addFlag, setAddFlag] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<OrganizationTag | undefined>();
  const [uploadedFile, setUploadedFile] = useState<UploadFile | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [createdLocale, setCreatedLocale] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<
    OrganizationRole | undefined
  >();
  const [completedError, setCompletedError] = useState<boolean>(false);

  const [roleValue, setRoleValue] = useState<string[]>([]);

  const { data: roles } = useOrgRoles({
    organizationId,
  });
  const { excute: createTag, isLoading: isCreating } = useAxiosApiWrapper(
    apis.org.createTag,
    "Create"
  );
  const { excute: updateTag, isLoading: isUpdating } = useAxiosApiWrapper(
    apis.org.updateTag,
    "Update"
  );
  const { excute: createOrgMedia } = useAxiosApiWrapper(
    apis.org.createOrgMedia,
    "Create"
  );
  const { excute: deleteOrgMedia } = useAxiosApiWrapper(
    apis.org.deleteOrgMedia
  );
  const {
    data: tag,
    mutate,
    isValidating: tagLoading,
  } = useOrgTag(
    {
      organizationId,
      tagGroupId,
      tagId,
    },
    {
      locale,
    }
  );

  useEffect(() => {
    reset({
      tagName: tag ? tag.tagName : "",
      tagColor: tag ? tag.tagColor : "#000000",
      organizationMediaList: tag?.organizationMediaList || [],
      organizationRoleTargetAuthList: tag?.organizationRoleTargetAuthList || [],
    });
    setSelectedTag(tag);
    if (
      tag?.organizationMediaList &&
      tag?.organizationMediaList[0]?.uploadFile
    ) {
      if (!uploadedFile) {
        setImageUrl(tag?.organizationMediaList[0]?.uploadFile.uploadFilePath);
      }
    } else {
      setImageUrl(undefined);
    }
  }, [reset, tag]);

  const { uploadOrgFiles, isOrgUploading, setCompleted, clearValue } =
    useUploadFilesHandler();

  const handleClose = () => {
    setSelectedTag(undefined);
    setCreatedLocale(null);
    setLocale(globalLocale);
    setFile(null);
    setSelectedFiles([]);
    setImageUrl(undefined);
    setUploadedFile(null);
    setSelectedRole(undefined);
    setRoleValue([]);
    closeDialog();
    onCloseDialog();
    reset();
  };

  const handleUpload = async () => {
    try {
      const res = await uploadOrgFiles({
        organizationId,
        files: selectedFiles,
        filePathType: ServiceModuleValue.TAG,
        imageSizeType: OrganizationMediaSizeType.NORMAL,
      });
      if (res) {
        if (res.data[0]) {
          setUploadedFile(res.data[0]);
          return res.data[0];
        }
        clearValue();
        setCompleted(0);
        return undefined;
      }
      return undefined;
    } catch (error) {
      // eslint-disable-next-line no-console
      apis.tools.createLog({
        function: "DatePicker: handleUploadFiles",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: error,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
      clearValue();
      setCompleted(0);
      return undefined;
    }
  };

  const handleAddTag = async (formValues) => {
    if (addFlag === false || (addFlag === true && selectedRole)) {
      const resUpload = await handleUpload();
      try {
        if (!selectedTag) {
          const res = await createTag({
            organizationId,
            locale: Locale[locale.toUpperCase()],
            tagGroupId,
            tagColor: formValues.tagColor,
            tagName: formValues.tagName,
            organizationMediaList: [],
            organizationRoleTargetAuthList:
              formValues.organizationRoleTargetAuthList,
          });
          if (resUpload) {
            await createOrgMedia({
              organizationId,
              targetId: res.data.tagId,
              organizationMediaList: [
                {
                  organizationMediaType: OrganizationMediaType.IMAGE,
                  organizationMediaSizeType: OrganizationMediaSizeType.NORMAL,
                  uploadFile: {
                    uploadFileId: resUpload?.uploadFileId,
                  },
                },
              ],
            });
          }
          if (onSuccess) onSuccess();
          handleClose();
        } else {
          await updateTag({
            organizationId,
            locale: Locale[locale.toUpperCase()],
            tagColor: formValues.tagColor,
            tagName: formValues.tagName,
            tagGroupId,
            tagId: selectedTag.tagId,
            organizationRoleTargetAuthList:
              formValues.organizationRoleTargetAuthList,
          });
          if (
            selectedTag.organizationMediaList &&
            selectedTag.organizationMediaList[0]
          ) {
            await deleteOrgMedia({
              organizationId,
              organizationMediaId:
                selectedTag.organizationMediaList[0].organizationMediaId,
            });
          }
          if (resUpload) {
            await createOrgMedia({
              organizationId,
              targetId: selectedTag.tagId,
              organizationMediaList: [
                {
                  organizationMediaType: OrganizationMediaType.IMAGE,
                  organizationMediaSizeType: OrganizationMediaSizeType.NORMAL,
                  uploadFile: {
                    uploadFileId: resUpload?.uploadFileId,
                  },
                },
              ],
            });
          }
          mutate();
          if (onSuccess) onSuccess();
          handleClose();
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        apis.tools.createLog({
          function: "DatePicker: handleAddTag",
          browserDescription: window.navigator.userAgent,
          jsonData: {
            data: error,
            deviceInfo: getDeviceInfo(),
          },
          level: "ERROR",
        });
      }
    } else {
      setCompletedError(true);
    }
  };

  const handleChangeLocale = (loca) => {
    setLocale(loca);
  };

  const handleUploadFiles = useCallback(
    async (acceptedFiles: File[]) => {
      const newFile = acceptedFiles[0];
      if (newFile) {
        setFile(
          Object.assign(newFile, {
            preview: URL.createObjectURL(newFile),
          })
        );
        setSelectedFiles(acceptedFiles);
      }
    },
    [clearValue, organizationId, setCompleted, uploadOrgFiles]
  );

  const handleAddRole = () => {
    setAddFlag(true);

    if (selectedRole) {
      setSelectedRole(undefined);
      setRoleValue([]);
    }
  };

  const selectRole = (role) => {
    const newAuthList = [
      ...(roleTargetAuthList || []),
      {
        organizationRole: {
          organizationRoleId: role?.organizationRoleId,
          organizationRoleNameZh: role?.organizationRoleNameZh,
        },
        organizationRoleTargetAuthPermission: roleValue,
      },
    ];
    setValue("organizationRoleTargetAuthList", newAuthList);
  };

  useEffect(() => {
    const url = tag?.organizationMediaList?.[0]?.uploadFile.uploadFilePath;
    setFile(url || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tag]);

  useEffect(() => {
    setAddFlag(false);
  }, [roleTargetAuthList]);

  const handleDeleteRole = () => {
    setAddFlag(false);
  };

  const handleRoleChange = (value) => {
    const roles = Object.keys(value).reduce<string[]>((a, b) => {
      if (value[b].checked) {
        return [...a, b];
      }
      return a;
    }, []);

    setRoleValue(roles);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <div
        className={clsx(classes.loader, tagLoading && classes.showLoader, {
          [classes.lightOpacity]: settings.themeMode === "light",
          [classes.darkOpacity]: settings.themeMode !== "light",
        })}
      >
        <CircularProgress />
      </div>
      <DialogTitle onClickClose={handleClose}>
        <Typography variant="h4" color="text">
          {!tagId ? `在${tagGroupName}中新增` : "編輯"}
        </Typography>
        <Box flexGrow={1} />
      </DialogTitle>
      <DialogFullPageContainer>
        <DialogContent ref={contentRef} id={FORM}>
          <Grid container spacing={2}>
            <Grid item xs={12} display="flex" justifyContent="flex-end">
              <LocaleDropDown
                defaultLocale={locale}
                onChange={handleChangeLocale}
                editable={editable}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="h4"
                color="textSecondary"
                sx={{ marginLeft: "15px" }}
              >
                {wordLibrary?.["tag name"] ?? "標籤名稱"}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Controller
                control={control}
                name="tagName"
                render={({ field }) => (
                  <TextField
                    {...field}
                    error={!!errors.tagName}
                    helperText={errors.tagName?.message}
                    placeholder={wordLibrary?.["tag name"] ?? "標籤名稱"}
                    label="名稱"
                    fullWidth
                    disabled={!editable}
                    id="tag-name-input"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="h4"
                color="textSecondary"
                sx={{ marginLeft: "15px" }}
              >
                {wordLibrary?.["tag color"] ?? "標籤顏色"}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Controller
                control={control}
                name="tagColor"
                render={({ field }) => (
                  <ColorPicker
                    text={wordLibrary?.["tag color"] ?? "標籤顏色"}
                    onChange={field.onChange}
                    color={field.value}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="h4"
                color="textSecondary"
                sx={{ marginLeft: "15px" }}
              >
                {wordLibrary?.["tag icon"] ?? "標籤圖示"}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <div className={classes.dropzoneWrapper}>
                <Upload
                  file={file}
                  imgUrl={encodeURI(imageUrl || "")}
                  onDropAccepted={handleUploadFiles}
                  accept="image/*"
                  disabled={!editable}
                  onRemove={() => {
                    setFile(null);
                    setSelectedFiles([]);
                  }}
                  onDelete={() => {
                    setFile(null);
                    setSelectedFiles([]);
                  }}
                />
              </div>
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="h4"
                color="textSecondary"
                sx={{ marginLeft: "15px" }}
              >
                {wordLibrary?.["tag permissions"] ?? "標籤權限"}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                rounded
                color="primary"
                fullWidth
                onClick={handleAddRole}
                id="tag-add-role-button"
              >
                {wordLibrary?.["add permissions"] ?? "新增權限"}
              </Button>
            </Grid>
            {roleTargetAuthList?.map((li, i) => (
              <Grid item xs={12} key={li.organizationRole.organizationRoleId}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={5}>
                    <Box className={classes.addedRole}>
                      {
                        roles?.source.find(
                          (role) =>
                            role.organizationRoleId ===
                            li.organizationRole.organizationRoleId
                        )?.organizationRoleNameZh
                      }
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <Grid container justifyContent="space-between">
                      <Box display="flex">
                        <Grid xs={10}>
                          <CheckboxInputGroup
                            value={li.organizationRoleTargetAuthPermission.reduce<Value>(
                              (a, b) => ({
                                ...a,
                                [b]: {
                                  checked: true,
                                  text: b,
                                },
                              }),
                              {} as Value
                            )}
                            onChange={(value) => {
                              const roles = Object.keys(value).reduce<string[]>(
                                (a, b) => {
                                  if (value[b].checked) {
                                    return [...a, b];
                                  }
                                  return a;
                                },
                                []
                              );
                              const index = roleTargetAuthList.findIndex(
                                (el) =>
                                  el.organizationRole.organizationRoleId ===
                                  li.organizationRole.organizationRoleId
                              );
                              roleTargetAuthList[index] = {
                                organizationRole: {
                                  organizationRoleId:
                                    li.organizationRole.organizationRoleId,
                                  organizationRoleNameZh:
                                    li.organizationRole.organizationRoleNameZh,
                                },
                                organizationRoleTargetAuthPermission: roles,
                              };
                            }}
                            options={[
                              {
                                name: "USE",
                                label: `${
                                  wordLibrary?.taggable ?? "可使用此標籤"
                                }`,
                                id: `tag-role-${i}-use`,
                              },
                              {
                                name: "READ",
                                label: `${
                                  wordLibrary?.["tagged readable"] ??
                                  "被標註可讀取"
                                }`,
                                id: `tag-role-${i}-read`,
                              },
                              {
                                name: "WRITE",
                                label: `${
                                  wordLibrary?.["tagged editable"] ??
                                  "被標註可編輯"
                                }`,
                                id: `tag-role-${i}-write`,
                              },
                            ]}
                            MuiFormGroupProps={{
                              className: classes.checkboxGroup,
                            }}
                          />
                        </Grid>
                        <Grid xs={2}>
                          <IconButton
                            className={classes.deleteRole}
                            onClick={() => {
                              const authList = roleTargetAuthList?.filter(
                                (el) =>
                                  el.organizationRole.organizationRoleId !==
                                  li.organizationRole.organizationRoleId
                              );
                              setValue(
                                "organizationRoleTargetAuthList",
                                authList
                              );
                            }}
                            id={`tag-role-${i}-delete-btn`}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            ))}
            {addFlag === true && (
              <Grid
                ref={() => {
                  contentRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "end",
                  });
                }}
                item
                xs={12}
              >
                <Grid container spacing={4}>
                  <Grid item xs={12} md={12}>
                    <TextField
                      required
                      select
                      label="標籤權限"
                      fullWidth
                      size="small"
                      value={selectedRole?.organizationRoleId}
                      onChange={(e) => {
                        const roleId = e.target.value;
                        const role = roles?.source.find(
                          (r) => r.organizationRoleId === e.target.value
                        );
                        setSelectedRole(role);
                        selectRole(role);
                        setCompletedError(roleId === "");
                      }}
                      error={completedError}
                      helperText={completedError && "請選擇標籤權限"}
                      id="tag-role-new-select"
                    >
                      {roles?.source
                        .filter(
                          (el) =>
                            roleTargetAuthList?.findIndex(
                              (li) =>
                                li.organizationRole.organizationRoleId ===
                                el.organizationRoleId
                            ) === -1
                        )
                        .map((role) => (
                          <MenuItem
                            value={role.organizationRoleId}
                            key={role.organizationRoleId}
                          >
                            {role.organizationRoleNameZh}
                          </MenuItem>
                        ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={7} display="flex">
                    <Grid xs={10}>
                      <CheckboxInputGroup
                        value={roleValue.reduce<Value>(
                          (a, b) => ({
                            ...a,
                            [b]: {
                              checked: true,
                              text: b,
                            },
                          }),
                          {} as Value
                        )}
                        onChange={handleRoleChange}
                        options={[
                          {
                            name: "USE",
                            label: `${wordLibrary?.taggable ?? "可使用此標籤"}`,
                            id: "tag-role-new-use",
                          },
                          {
                            name: "READ",
                            label: `${
                              wordLibrary?.["tagged readable"] ?? "被標註可讀取"
                            }`,
                            id: "tag-role-new-read",
                          },
                          {
                            name: "WRITE",
                            label: `${
                              wordLibrary?.["tagged editable"] ?? "被標註可編輯"
                            }`,
                            id: "tag-role-new-write",
                          },
                        ]}
                        MuiFormGroupProps={{
                          className: classes.checkboxGroup,
                        }}
                      />
                    </Grid>
                    <Grid xs={2}>
                      <IconButton
                        className={classes.deleteRole}
                        onClick={handleDeleteRole}
                        id="tag-role-new-delete-btn"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Grid>
        </DialogContent>
      </DialogFullPageContainer>
      <DialogActions>
        <DialogCloseButton sx={{ mr: 1 }} onClick={handleClose} />
        <DialogConfirmButton
          loading={isCreating || isUpdating}
          onClick={handleSubmit((data) => handleAddTag(data))}
          type="submit"
          disabled={
            isCreating ||
            isUpdating ||
            isOrgUploading ||
            (!tagId && createdLocale === locale) ||
            !editable
          }
        >
          {wordLibrary?.save ?? "儲存"}
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default TagGroupDialog;
