import React, { FC } from "react";

import useIsOpen from "@eGroupAI/hooks/useIsOpen";
import useFileEvents from "utils/useFileEvents";

import FileList from "@eGroupAI/material-module/infocenter/product/FileList";
import ProductUploadFileTargetForm from "./ProductUploadFileTargetForm";
import { ProductEditorProps } from "../typings";
import EditorBase from "../EditorBase";

const ProductUploadFileTargetEditor: FC<ProductEditorProps> = function (props) {
  const { data, onEditClose, primary, organizationProductId } = props;
  const { handlePreviewFile, handleDownloadFile } = useFileEvents();
  const { isOpen, handleClose, handleOpen } = useIsOpen(false);

  return (
    <EditorBase
      onEditClose={onEditClose}
      isOpen={isOpen}
      handleClose={handleClose}
      handleOpen={handleOpen}
      renderForm={(selectedLocale) => (
        <ProductUploadFileTargetForm
          selectedLocale={selectedLocale}
          cmsContentId={data?.organizationCmsContentId}
          organizationProductId={organizationProductId}
        />
      )}
      primary={primary}
      disableSelectLocale
      hideSubmitButton
      isWidthSM={false}
    >
      <FileList
        items={data?.uploadFileList?.map((el) => ({
          id: el.uploadFileId,
          date: el.uploadFileCreateDate,
          tagName: "MANUAL",
          name: el.uploadFileName,
          // change size from kb to bytes
          size: el.uploadFileSize * 1000,
          previewUrl: el.uploadFilePath,
          shareUrl: el.uploadFilePath,
        }))}
        disableDelete
        onDownloadClick={(item) => {
          handleDownloadFile(item.id);
        }}
        onPreviewClick={(item) => {
          handlePreviewFile(item.id);
        }}
      />
    </EditorBase>
  );
};

export default ProductUploadFileTargetEditor;
