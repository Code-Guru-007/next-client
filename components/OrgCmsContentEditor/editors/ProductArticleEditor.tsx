import React, { FC } from "react";

import useIsOpen from "@eGroupAI/hooks/useIsOpen";
import FroalaEditorView from "components/FroalaEditorView";
import ProductArticleForm, { FORM } from "./ProductArticleForm";
import { CmsContentEditorProps } from "../typings";
import EditorBase from "../EditorBase";
import useCmsContentEditor from "./useCmsContentEditor";

const ProductArticleEditor: FC<CmsContentEditorProps> = function (props) {
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
        <ProductArticleForm
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
      isWidthSM={false}
    >
      <FroalaEditorView model={data?.organizationCmsContentDescription} />
    </EditorBase>
  );
};

export default ProductArticleEditor;
