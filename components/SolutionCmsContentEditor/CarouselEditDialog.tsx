import React, {
  useEffect,
  useContext,
  FC,
  useMemo,
  useState,
  useCallback,
  ReactElement,
  cloneElement,
  SetStateAction,
} from "react";

import clsx from "clsx";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogActions from "@mui/material/DialogActions";
import { useSelector } from "react-redux";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { MenuItem, Select } from "@mui/material";
import { Upload } from "minimal/components/upload";
import {
  PageType,
  LocaleMap,
  OrganizationMediaSizeType,
  ServiceModuleValue,
} from "interfaces/utils";
import useConfirmLeaveDialog from "utils/useConfirmLeaveDialog";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useUploadFilesHandler from "utils/useUploadFilesHandler";
import { CarouselEditFormInput } from "interfaces/form";
import { OrganizationMediaSlider } from "interfaces/entities";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import Tooltip from "@eGroupAI/material/Tooltip";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";

import Dialog, { DialogProps } from "@eGroupAI/material/Dialog";
import Typography from "@eGroupAI/material/Typography";
import DialogFullPageContainer from "components/DialogFullPageContainer";
import IconButton from "components/IconButton/StyledIconButton";
import DialogCloseButton from "components/DialogCloseButton";
import Box from "@eGroupAI/material/Box";
import DialogConfirmButton from "components/DialogConfirmButton";
import CarouselManagementContext from "components/OrgSolutionsContentEditor/CarouselManagementContext";
import type { Item, EditDialogState, UploadedImg } from "./typing";
import uploadedImgToOrgMediaList from "./uploadedImgToOrgMediaList";

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
  dialogTitle: {
    display: "flex",
    justifyContent: "flex-end",
  },
  headerWrapper: {
    padding: "20px 0",
  },
  headerActions: {
    display: "flex",
  },
  device: {
    background: theme.palette.grey[200],
    color: theme.palette.grey[500],
    "&:hover": {
      background: theme.palette.primary.main,
      color: theme.palette.common.white,
    },
  },
  deviceSelected: {
    background: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
}));

export interface CarouselEditDialogProps {
  pageType: PageType | any;
  targetId?: string;
  renderForm?: (
    dialogState: EditDialogState,
    setSelectedItem: (rowState: SetStateAction<Item | undefined>) => void,
    selectedItem?: Item,
    handleUploadFiles?: () => Promise<
      | {
          primaryId: string;
          organizationMediaSliderId?: string | undefined;
          organizationProductId?: string | undefined;
          organizationSolutionId?: string | undefined;
          organizationMediaId?: string | undefined;
        }
      | OrganizationMediaSlider
      | undefined
    >
  ) => ReactElement;
  form?: string;
  title?: string;
  open: DialogProps["open"];
  onClose?: () => void;
  onDeleteClick?: (selectedItem?: Item) => void;
  updating?: boolean;
}

const CarouselEditDialog: FC<CarouselEditDialogProps> = function (props) {
  const {
    pageType,
    targetId,
    renderForm,
    form,
    title,
    open,
    onClose,
    updating,
  } = props;
  const theme = useTheme();
  const { uploadOrgFiles, isUploading, setCompleted, clearValue } =
    useUploadFilesHandler();
  const organizationId = useSelector(getSelectedOrgId);
  const classes = useStyles();
  const { selectedItem, setSelectedItem, setSelectedLocale, selectedLocale } =
    useContext(CarouselManagementContext);
  const [formIsDirty, setFormIsDirty] = useState(false);
  const [formValues, setFormValues] = useState<CarouselEditFormInput>();
  const [uploadedImgs, setUploadedImgs] = useState<UploadedImg[]>([]);
  const [selectedDesktop, setSelectedDesktop] = useState(true);
  const { excute: createOrgMediaSlider } = useAxiosApiWrapper(
    apis.org.createOrgMediaSlider,
    "Create"
  );
  const { excute: updateOrgMediaSliderMedia } = useAxiosApiWrapper(
    apis.org.updateOrgMediaSliderMedia,
    "Update"
  );
  const { excute: deleteOrgMediaSlider } = useAxiosApiWrapper(
    apis.org.deleteOrgMediaSlider,
    "Delete"
  );

  const [file, setFile] = useState<File | string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!open) {
      handleClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const url = selectedDesktop
      ? selectedFiles[0] ||
        uploadedImgs[0]?.desktopUrl ||
        selectedItem?.imgSrc?.desktop
      : selectedFiles[1] ||
        uploadedImgs[1]?.mobileUrl ||
        selectedItem?.imgSrc?.mobile;
    setFile(url || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem, selectedDesktop]);

  const handleChooseFile = useCallback(
    (acceptedFiles: File[]) => {
      const newFile = acceptedFiles[0];
      if (newFile) {
        setFile(
          Object.assign(newFile, {
            preview: URL.createObjectURL(newFile),
          })
        );
        const files = [...selectedFiles];
        if (selectedDesktop) {
          files[0] = newFile;
          setSelectedFiles(files);
        } else {
          files[1] = newFile;
          setSelectedFiles(files);
        }
      }
    },
    [selectedDesktop, selectedFiles]
  );

  const handleUploadFiles = useCallback(async () => {
    try {
      if (!file) return undefined;
      const res = await uploadOrgFiles({
        organizationId,
        files: selectedFiles.filter(Boolean),
        filePathType: ServiceModuleValue.CMS_IMAGE_SLIDER,
        imageSizeType: selectedDesktop
          ? OrganizationMediaSizeType.PC
          : OrganizationMediaSizeType.MOBILE,
        eGroupService: "WEBSITE",
      });
      const nextUploadedImg = [...uploadedImgs];
      if (res) {
        if (selectedDesktop) {
          if (res.data.length > 1) {
            nextUploadedImg[0] = {
              desktopId: res.data[0]?.uploadFileId,
              desktopUrl: res.data[0]?.uploadFilePath || "",
            };
            nextUploadedImg[1] = {
              mobileId: res.data[1]?.uploadFileId,
              mobileUrl: res.data[1]?.uploadFilePath || "",
            };
          } else {
            nextUploadedImg[0] = {
              desktopId: res.data[0]?.uploadFileId,
              desktopUrl: res.data[0]?.uploadFilePath || "",
            };
          }
        } else if (res.data.length > 1) {
          nextUploadedImg[0] = {
            desktopId: res.data[0]?.uploadFileId,
            desktopUrl: res.data[0]?.uploadFilePath || "",
          };
          nextUploadedImg[1] = {
            mobileId: res.data[1]?.uploadFileId,
            mobileUrl: res.data[1]?.uploadFilePath || "",
          };
        } else {
          nextUploadedImg[1] = {
            mobileId: res.data[0]?.uploadFileId,
            mobileUrl: res.data[0]?.uploadFilePath || "",
          };
        }

        setUploadedImgs(nextUploadedImg);
        if (selectedItem?.ids.organizationMediaSliderId) {
          // Update PC or Mobile
          await updateOrgMediaSliderMedia({
            organizationId,
            organizationMediaSliderId:
              selectedItem?.ids.organizationMediaSliderId,
            organizationMediaList: uploadedImgToOrgMediaList(nextUploadedImg),
          });
          return selectedItem?.ids;
        }
        const response = await createOrgMediaSlider({
          organizationId,
          targetId,
          locale: selectedLocale,
          organizationMediaSliderPageType: pageType,
          organizationMediaSliderTitle:
            formValues?.organizationMediaSliderTitle || "",
          organizationMediaSliderDescription:
            formValues?.organizationMediaSliderDescription || "",
          organizationMediaSliderLinkURL:
            formValues?.organizationMediaSliderLinkURL || "",
          organizationMediaList: uploadedImgToOrgMediaList(nextUploadedImg),
        });
        setSelectedItem((val) => ({
          ...val,
          title: response.data.organizationMediaSliderTitle,
          description: response.data.organizationMediaSliderDescription,
          linkURL: response.data.organizationMediaSliderLinkURL,
          ids: {
            ...val?.ids,
            primaryId: targetId || response.data.organizationMediaSliderId,
            organizationMediaSliderId: response.data.organizationMediaSliderId,
          },
        }));
        return response.data;
      }
      return undefined;
    } catch (error) {
      // eslint-disable-next-line no-console
      apis.tools.createLog({
        function: "CarouselEditDailog: handleUploadFiles",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: error,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
      return undefined;
    }
  }, [
    file,
    uploadOrgFiles,
    organizationId,
    selectedFiles,
    selectedDesktop,
    uploadedImgs,
    selectedItem?.ids,
    createOrgMediaSlider,
    targetId,
    selectedLocale,
    pageType,
    formValues?.organizationMediaSliderTitle,
    formValues?.organizationMediaSliderDescription,
    formValues?.organizationMediaSliderLinkURL,
    setSelectedItem,
    updateOrgMediaSliderMedia,
  ]);

  // Close dialog and clear states
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    setCompleted(0);
    clearValue();
    setUploadedImgs([]);
    setSelectedDesktop(true);
    setFile(null);
    setSelectedFiles([]);
    setFormValues({
      organizationMediaSliderTitle: "",
      organizationMediaSliderDescription: "",
      organizationMediaSliderLinkURL: "",
    });
  };

  const closeConfirm = useConfirmLeaveDialog({
    shouldOpen: formIsDirty,
    handleClose,
    onConfirm: handleClose,
  });

  const url = useMemo(() => {
    if (selectedDesktop) {
      return uploadedImgs[0]?.desktopUrl || selectedItem?.imgSrc?.desktop;
    }
    return uploadedImgs[1]?.mobileUrl || selectedItem?.imgSrc?.mobile;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDesktop]);

  return (
    <Dialog
      open={open}
      onClose={() => closeConfirm()}
      maxWidth="md"
      fullWidth
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={onClose}>
        <div>
          <Typography variant="h3" gutterBottom>
            {title}
          </Typography>
        </div>
      </DialogTitle>
      <DialogFullPageContainer>
        <DialogActions sx={{ justifyContent: "space-between" }}>
          <div className={classes.headerActions}>
            <div>
              <Tooltip title="上傳 PC 輪播圖">
                <IconButton
                  className={clsx(classes.device, {
                    [classes.deviceSelected]: selectedDesktop,
                  })}
                  size="large"
                  onClick={() => setSelectedDesktop(true)}
                >
                  <DesktopWindowsIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="上傳 Mobile 輪播圖">
                <IconButton
                  className={clsx(classes.device, {
                    [classes.deviceSelected]: !selectedDesktop,
                  })}
                  size="large"
                  onClick={() => setSelectedDesktop(false)}
                  sx={{ marginLeft: 1 }}
                >
                  <PhoneAndroidIcon />
                </IconButton>
              </Tooltip>
            </div>
            <Box flexGrow={1} />
          </div>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            size="small"
            value={selectedLocale}
            onChange={(e: any) => setSelectedLocale(e.target.value)}
          >
            <MenuItem value="zh_TW">繁體中文</MenuItem>
            <MenuItem value="en_US">English</MenuItem>
          </Select>
        </DialogActions>
        {renderForm &&
          cloneElement(
            renderForm(
              {
                isUploading,
                uploadedImgs,
                selectedLocale,
                selectedDesktop,
              },
              setSelectedItem,
              selectedItem,
              handleUploadFiles
            ),
            {
              setFormIsDirty,
              setFormValues,
            }
          )}
        <div className={classes.headerWrapper}>
          <Upload
            file={file}
            imgUrl={encodeURI(url || "")}
            onDropAccepted={handleChooseFile}
            accept="image/*"
            onRemove={async () => {
              setFile(null);
              setSelectedFiles([]);
              if (selectedItem?.ids.organizationMediaSliderId) {
                await deleteOrgMediaSlider({
                  organizationId,
                  organizationMediaSliderId:
                    selectedItem?.ids.organizationMediaSliderId,
                });
              }
            }}
            onDelete={async () => {
              setFile(null);
              setSelectedFiles([]);
              if (selectedItem?.ids.organizationMediaSliderId) {
                await deleteOrgMediaSlider({
                  organizationId,
                  organizationMediaSliderId:
                    selectedItem?.ids.organizationMediaSliderId,
                });
              }
            }}
          />
        </div>
      </DialogFullPageContainer>
      <DialogActions>
        <Box flexGrow={1} />
        <DialogCloseButton
          onClick={() => closeConfirm()}
          disabled={isUploading || updating}
        />
        <DialogConfirmButton
          type="submit"
          form={form}
          disabled={isUploading}
          loading={updating}
        >
          {selectedItem
            ? `儲存${LocaleMap[selectedLocale]}`
            : `新增${LocaleMap[selectedLocale]}`}
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default CarouselEditDialog;
