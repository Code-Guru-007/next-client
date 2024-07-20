import React, {
  useEffect,
  useContext,
  FC,
  useState,
  useCallback,
  ReactElement,
  cloneElement,
} from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogActions from "@mui/material/DialogActions";
import { useSelector } from "react-redux";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { MenuItem, Select } from "@mui/material";
import {
  PageType,
  OrganizationMediaSizeType,
  ServiceModuleValue,
  Locale,
} from "interfaces/utils";
import useConfirmLeaveDialog from "utils/useConfirmLeaveDialog";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useUploadFilesHandler from "utils/useUploadFilesHandler";
import { CarouselEditFormInput } from "interfaces/form";
import { OrganizationMediaSlider } from "interfaces/entities";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import I18nTabs from "components/I18nTabs";

import Dialog, { DialogProps } from "@eGroupAI/material/Dialog";
import Typography from "@eGroupAI/material/Typography";
import DialogFullPageContainer from "components/DialogFullPageContainer";
import DialogCloseButton from "components/DialogCloseButton";
import Box from "@eGroupAI/material/Box";
import DialogConfirmButton from "components/DialogConfirmButton";
import uploadedImgToOrgMediaList from "components/SolutionCmsContentEditor/uploadedImgToOrgMediaList";
import { useReduxDialog } from "@eGroupAI/redux-modules";

import type { Item, UploadedImg } from "./typing";
import SolutionCmsContentsManagementContext from "./SolutionCmsContentsManagementContext";

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

export const DIALOG = "SOLUTION_CMS_CONTENTS_MANAGE_DAILOG";

export interface SolutionCmsContentsManageDialogProps {
  open: DialogProps["open"];
  pageType: PageType;
  targetId: string;
  cmsContentId?: string;
  title?: string;
  subTitle?: string;
  updating?: boolean;
  selectedLocale?: Locale;
  disableSelectLocale?: boolean;
  useLocaleTabs?: boolean;
  onClose?: () => void;
  onDeleteClick?: (selectedItem?: Item) => void;
  renderForm?: (
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
}

const SolutionCmsContentsManageDialog: FC<SolutionCmsContentsManageDialogProps> =
  function (props) {
    const {
      pageType,
      targetId,
      renderForm,
      form,
      title,
      subTitle,
      disableSelectLocale,
      useLocaleTabs,
      selectedLocale = Locale.ZH_TW,
      open,
      onClose,
      updating,
    } = props;
    const theme = useTheme();
    const classes = useStyles();

    const organizationId = useSelector(getSelectedOrgId);
    const wordLibrary = useSelector(getWordLibrary);

    const { setSelectedLocale } = useContext(
      SolutionCmsContentsManagementContext
    );

    const { uploadOrgFiles, isUploading, setCompleted, clearValue } =
      useUploadFilesHandler();

    const [formIsDirty, setFormIsDirty] = useState(false);
    const [formIsBusy, setFormIsBusy] = useState(false);
    const [formValues, setFormValues] = useState<CarouselEditFormInput>();
    const [uploadedImgs, setUploadedImgs] = useState<UploadedImg[]>([]);
    const [selectedDesktop, setSelectedDesktop] = useState(true);
    const { excute: createOrgMediaSlider } = useAxiosApiWrapper(
      apis.org.createOrgMediaSlider,
      "Create"
    );
    const [file, setFile] = useState<File | string | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    useEffect(() => {
      if (!open) {
        handleClose();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

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
      createOrgMediaSlider,
      targetId,
      selectedLocale,
      pageType,
      formValues?.organizationMediaSliderTitle,
      formValues?.organizationMediaSliderDescription,
      formValues?.organizationMediaSliderLinkURL,
    ]);

    const { closeDialog } = useReduxDialog(DIALOG);

    // Close dialog and clear states
    const handleClose = () => {
      closeDialog();
      setFormIsBusy(false);
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

    return (
      <Dialog
        open={open}
        onClose={() => closeConfirm()}
        disableEscapeKeyDown={updating || formIsBusy}
        maxWidth="sm"
        fullWidth
        className={classes.dialogPaper}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: theme.transitions.duration.shortest - 80,
        }}
      >
        <DialogTitle onClickClose={() => closeConfirm()}>
          <div>
            <Typography variant="h3" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h5">{subTitle}</Typography>
          </div>
        </DialogTitle>
        <DialogFullPageContainer>
          {!disableSelectLocale && useLocaleTabs && selectedLocale && (
            <I18nTabs
              TabsProps={{
                value: selectedLocale,
                onChange: (_, v) => {
                  if (formIsDirty) {
                    closeConfirm(() => {
                      if (setSelectedLocale) setSelectedLocale(v);
                    });
                  } else if (setSelectedLocale) {
                    setSelectedLocale(v);
                  }
                },
              }}
              disabled={updating || formIsBusy}
            />
          )}
          {!disableSelectLocale && !useLocaleTabs && (
            <DialogActions>
              <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                size="small"
                value={selectedLocale}
                onChange={(e) => {
                  if (setSelectedLocale)
                    setSelectedLocale(e.target.value as Locale);
                }}
              >
                <MenuItem value="zh_TW">繁體中文</MenuItem>
                <MenuItem value="en_US">English</MenuItem>
              </Select>
            </DialogActions>
          )}
          {renderForm &&
            cloneElement(renderForm(handleUploadFiles), {
              setFormIsDirty,
              setFormValues,
              setFormIsBusy,
              selectedDesktop,
            })}
        </DialogFullPageContainer>
        <DialogActions>
          <Box flexGrow={1} />
          <DialogCloseButton
            onClick={() => closeConfirm()}
            disabled={isUploading || updating || formIsBusy}
          />
          <DialogConfirmButton
            type="submit"
            form={form}
            disabled={isUploading || updating}
            loading={isUploading || formIsBusy}
          >
            {wordLibrary?.save ?? "儲存"}
          </DialogConfirmButton>
        </DialogActions>
      </Dialog>
    );
  };

export default SolutionCmsContentsManageDialog;
