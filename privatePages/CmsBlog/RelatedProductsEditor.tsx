import React, { FC } from "react";

import useOrgBlog from "utils/useOrgBlog";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import useIsOpen from "@eGroupAI/hooks/useIsOpen";
import parseOrgMediaListToImgSrc from "utils/parseOrgMediaListToImgSrc";

import IconButton from "components/IconButton/StyledIconButton";
import EditSectionHeader from "components/EditSectionHeader";
import EditSectionDialog from "components/EditSectionDialog";
import ProductList from "components/ProductList";
import Iconify from "minimal/components/iconify";
import RelatedProductsForm from "./RelatedProductsForm";

export interface RelatedProductsEditorProps {
  blogId: string;
}

const RelatedProductsEditor: FC<RelatedProductsEditorProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const { blogId } = props;
  const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);
  const { isOpen, handleClose, handleOpen } = useIsOpen(false);
  const { data } = useOrgBlog(
    {
      organizationId,
      organizationBlogId: blogId as string,
    },
    {
      locale,
    }
  );

  return (
    <>
      <EditSectionDialog
        primary={wordLibrary?.["related products"] ?? "相關產品"}
        open={isOpen}
        onClose={handleClose}
        disableSelectLocale
        hideSubmitButton
        renderForm={(selectedLocale) => (
          <RelatedProductsForm
            selectedLocale={selectedLocale}
            blogId={blogId}
          />
        )}
        isWidthSM={false}
      />
      <EditSectionHeader
        primary={wordLibrary?.["related products"] ?? "相關產品"}
      >
        <IconButton onClick={handleOpen}>
          <Iconify icon="solar:pen-bold" />
        </IconButton>
      </EditSectionHeader>
      <ProductList
        items={data?.organizationProductRelatedList?.map((el) => ({
          id: el.organizationProductId,
          title: el.organizationProductName,
          description: el.organizationProductDescription,
          imgSrc: parseOrgMediaListToImgSrc(el.organizationMediaList),
        }))}
      />
    </>
  );
};

export default RelatedProductsEditor;
