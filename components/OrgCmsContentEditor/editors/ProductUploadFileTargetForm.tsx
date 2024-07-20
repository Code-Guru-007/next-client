import React, { FC, useCallback } from "react";

import { useSelector } from "react-redux";
import { makeStyles } from "@mui/styles";
import { Box } from "@mui/material";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import apis from "utils/apis";
import useOrgCmsContent from "utils/useOrgCmsContent";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { Locale, ServiceModuleValue } from "interfaces/utils";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useFileEvents from "utils/useFileEvents";

import FileList from "@eGroupAI/material-module/infocenter/product/FileList";
import FileUploadDropzone from "components/FileUploadDropzone";
import Form from "components/Form";
import clsx from "clsx";

export interface ProductUploadFileTargetFormProps {
  cmsContentId: string | undefined;
  organizationProductId: string;
  selectedLocale: Locale;
}

const useStyle = makeStyles((theme) => ({
  dropzoneWrapper: {
    position: "relative",
    margin: "20px 0px",
    height: 250,
    width: "100%",
  },
  dropzone: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    maxWidth: "100%",
    width: "100%",
    "--border-color": theme.palette.grey[300],
  },
}));

const ProductUploadFileTargetForm: FC<ProductUploadFileTargetFormProps> =
  function (props) {
    const { cmsContentId, organizationProductId, selectedLocale } = props;
    const classes = useStyle(props);
    const organizationId = useSelector(getSelectedOrgId);
    const { excute: deleteOrgFileTarget, isLoading: isDeleting } =
      useAxiosApiWrapper(apis.org.deleteOrgFileTarget, "Delete");
    const {
      handlePreviewFile,
      handleDownloadFile,
      handleUploadFile,
      isCreating,
      isUploading,
      completed,
      inputEl,
    } = useFileEvents();

    const { data: cmsContent, mutate } = useOrgCmsContent(
      {
        organizationId,
        organizationCmsContentId: cmsContentId,
      },
      {
        locale: selectedLocale,
      }
    );

    const handleUploadFiles = useCallback(
      (acceptedFiles: File[]) => {
        handleUploadFile({
          files: acceptedFiles,
          filePathType: ServiceModuleValue.CMS,
          targetId: organizationProductId,
          onSuccess: () => {
            mutate();
          },
        });
      },
      [handleUploadFile, mutate, organizationProductId]
    );

    return (
      <Form loading={isCreating || isDeleting}>
        <FileList
          items={cmsContent?.uploadFileList?.map((el) => ({
            id: el.uploadFileId,
            date: el.uploadFileCreateDate,
            tagName: "MANUAL",
            name: el.uploadFileName,
            // change size from kb to bytes
            size: el.uploadFileSize * 1000,
            previewUrl: el.uploadFilePath,
            shareUrl: el.uploadFilePath,
          }))}
          onDeleteClick={async (item) => {
            try {
              await deleteOrgFileTarget({
                organizationId,
                uploadFileId: item.id,
                uploadFileTargetList: [
                  {
                    targetId: organizationProductId,
                  },
                ],
              });
              mutate();
            } catch (error) {
              // eslint-disable-next-line no-console
              apis.tools.createLog({
                function: "deleteOrgFileTarget: error",
                browserDescription: window.navigator.userAgent,
                jsonData: {
                  data: error,
                  deviceInfo: getDeviceInfo(),
                },
                level: "ERROR",
              });
            }
          }}
          onDownloadClick={(item) => {
            handleDownloadFile(item.id);
          }}
          onPreviewClick={(item) => {
            handlePreviewFile(item.id);
          }}
        />
        {cmsContent && (
          <Box width="100%" display="flex" justifyContent="center">
            <Box className={classes.dropzoneWrapper}>
              <FileUploadDropzone
                className={clsx(classes.dropzone)}
                onDropAccepted={handleUploadFiles}
                uploading={isUploading}
                completed={completed}
                inputRef={inputEl}
                accept="image/*, video/*, audio/*, .pdf, .doc, .docx, .xls, .xlsx, .csv, .txt, .rtf, .html, .zip"
              />
            </Box>
          </Box>
        )}
      </Form>
    );
  };

export default ProductUploadFileTargetForm;
