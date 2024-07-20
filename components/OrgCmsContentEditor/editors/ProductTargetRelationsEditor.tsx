import React, { FC } from "react";

import useIsOpen from "@eGroupAI/hooks/useIsOpen";
import parseOrgMediaListToImgSrc from "utils/parseOrgMediaListToImgSrc";

import ProductList from "components/ProductList";
import ProductTargetRelationsForm from "./ProductTargetRelationsForm";
import { ProductEditorProps } from "../typings";
import EditorBase from "../EditorBase";

const ProductTargetRelationsEditor: FC<ProductEditorProps> = function (props) {
  const { data, onEditClose, primary, organizationProductId } = props;
  const { isOpen, handleClose, handleOpen } = useIsOpen(false);

  return (
    <EditorBase
      onEditClose={onEditClose}
      isOpen={isOpen}
      handleClose={handleClose}
      handleOpen={handleOpen}
      renderForm={(selectedLocale) => (
        <ProductTargetRelationsForm
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
      <ProductList
        items={data?.organizationProductRelatedList?.map((el) => ({
          id: el.organizationProductId,
          title: el.organizationProductName,
          description: el.organizationProductDescription,
          imgSrc: parseOrgMediaListToImgSrc(el.organizationMediaList),
        }))}
      />
    </EditorBase>
  );
};

export default ProductTargetRelationsEditor;
