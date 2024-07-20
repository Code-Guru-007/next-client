import React, { FC } from "react";

import useIsOpen from "@eGroupAI/hooks/useIsOpen";
import WhyChooseUsForm, { FORM } from "./WhyChooseUsForm";
import EditorBase from "../EditorBase";
import { CmsContentEditorProps } from "../typings";
import FeatureSection from "./FeatureSection";
import useCmsContentEditor from "./useCmsContentEditor";

const WhyChooseUsEditor: FC<CmsContentEditorProps> = function (props) {
  const { data, onEditClose, primary } = props;
  const { handleSubmit, isUpdating } = useCmsContentEditor(props);
  const { isOpen, handleClose, handleOpen } = useIsOpen(false);

  return (
    <EditorBase
      onEditClose={onEditClose}
      updating={isUpdating}
      isOpen={isOpen}
      handleClose={handleClose}
      handleOpen={handleOpen}
      renderForm={(selectedLocale) => (
        <WhyChooseUsForm
          onSubmit={handleSubmit(selectedLocale)}
          selectedLocale={selectedLocale}
          cmsContentId={data?.organizationCmsContentId}
        />
      )}
      form={FORM}
      primary={primary}
    >
      <FeatureSection
        items={data?.organizationMediaList?.map((el) => ({
          id: el.organizationMediaId,
          primary: el.organizationMediaTitle,
          src: el.uploadFile.uploadFilePath,
        }))}
      />
    </EditorBase>
  );
};

export default WhyChooseUsEditor;
