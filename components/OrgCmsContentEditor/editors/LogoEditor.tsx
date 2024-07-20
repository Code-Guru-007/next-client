import React, { FC } from "react";

import ClientAndPartnerForm, { FORM } from "./ClientAndPartnerForm";
import EditorBase from "../EditorBase";
import { CmsContentEditorProps } from "../typings";
import LogoSection from "./LogoSection";
import useCmsContentEditor from "./useCmsContentEditor";

/**
 * @Depreciated
 * Migrated to OurClientEditor and OurPartnerEditor
 */
const LogoEditor: FC<CmsContentEditorProps> = function (props) {
  const { data, onEditClose, primary } = props;
  const { handleSubmit, isUpdating } = useCmsContentEditor(props);

  return (
    <EditorBase
      onEditClose={onEditClose}
      updating={isUpdating}
      renderForm={(selectedLocale) => (
        <ClientAndPartnerForm
          onSubmit={handleSubmit(selectedLocale)}
          selectedLocale={selectedLocale}
          cmsContentId={data?.organizationCmsContentId}
        />
      )}
      form={FORM}
      primary={primary}
    >
      <LogoSection
        items={data?.organizationMediaList?.map((el) => ({
          id: el.organizationMediaId,
          primary: el.organizationMediaTitle,
          src: el.uploadFile.uploadFilePath,
        }))}
      />
    </EditorBase>
  );
};

export default LogoEditor;
