import React from "react";

import { PageType } from "interfaces/utils";
import CmsSeoPageEditSection from "components/CmsSeoPageEditSection";

const CmsProductsSeo = function (props) {
  const { selectedLocale } = props;

  return (
    <CmsSeoPageEditSection
      dialogTabShow
      selectedLocale={selectedLocale}
      primary="產品列表 SEO"
      pageType={PageType.PRODUCTLIST}
      sx={{ mt: 3 }}
    />
  );
};

export default CmsProductsSeo;
