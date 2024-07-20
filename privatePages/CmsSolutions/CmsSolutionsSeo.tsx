import React from "react";

import { PageType } from "interfaces/utils";
import CmsSeoPageEditSection from "components/CmsSeoPageEditSection";

const CmsSolutionsSeo = function (props) {
  const { selectedLocale } = props;

  return (
    <CmsSeoPageEditSection
      dialogTabShow
      selectedLocale={selectedLocale}
      primary="解決方案 SEO"
      pageType={PageType.SOLUTIONLIST}
      sx={{ mt: 3 }}
    />
  );
};

export default CmsSolutionsSeo;
