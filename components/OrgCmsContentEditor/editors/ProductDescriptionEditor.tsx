import React, { FC } from "react";

import useIsOpen from "@eGroupAI/hooks/useIsOpen";
import FroalaEditorView from "components/FroalaEditorView";
import ProductDescriptionForm, { FORM } from "./ProductDescriptionForm";
import EditorBase from "../EditorBase";
import { CmsContentEditorProps } from "../typings";
import useCmsContentEditor from "./useCmsContentEditor";

const ProductDescriptionEditor: FC<CmsContentEditorProps> = function (props) {
  const { data, onEditClose, primary } = props;
  const { handleSubmit, isUpdating } = useCmsContentEditor(props);
  const { isOpen, handleClose, handleOpen } = useIsOpen(false);

  return (
    <EditorBase
      useLocaleTabs
      onEditClose={onEditClose}
      updating={isUpdating}
      isOpen={isOpen}
      handleClose={handleClose}
      handleOpen={handleOpen}
      renderForm={(selectedLocale) => (
        <ProductDescriptionForm
          onSubmit={handleSubmit(selectedLocale)}
          selectedLocale={selectedLocale}
          cmsContentId={data?.organizationCmsContentId}
          handleClose={() => {
            if (onEditClose) {
              onEditClose();
            }
            handleClose();
          }}
        />
      )}
      form={FORM}
      primary={primary}
    >
      <FroalaEditorView model={data?.organizationCmsContentDescription} />
    </EditorBase>
  );
};

export default ProductDescriptionEditor;
