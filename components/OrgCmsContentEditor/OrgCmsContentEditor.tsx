import React, { FC } from "react";

import { ContentType } from "interfaces/utils";
import { CmsContentEditorProps } from "./typings";
import ProductDescriptionEditor from "./editors/ProductDescriptionEditor";
import ProductFeatureEditor from "./editors/ProductFeatureEditor";
import ProductFeatureListEditor from "./editors/ProductFeatureListEditor";
import ProductArticleEditor from "./editors/ProductArticleEditor";
import ProductVideoEditor from "./editors/ProductVideoEditor";
import ProductTargetRelationsEditor from "./editors/ProductTargetRelationsEditor";
import ProductUploadFileTargetEditor from "./editors/ProductUploadFileTargetEditor";
import AboutUsEditor from "./editors/AboutUsEditor";
import WhyChooseUsEditor from "./editors/WhyChooseUsEditor";
import CoreValueEditor from "./editors/CoreValueEditor";
import CoreSpiritEditor from "./editors/CoreSpiritEditor";
import AdvantageEditor from "./editors/AdvantageEditor";
import SustainableDevelopmentEditor from "./editors/SustainableDevelopmentEditor";
import OurClientEditor from "./editors/OurClientEditor";
import OurPartnerEditor from "./editors/OurPartnerEditor";
import PartnerImageSliderEditor from "./editors/PartnerImageSliderEditor";
import NoDataEditor from "./editors/NoDataEditor";

const OrgCmsContentEditor: FC<CmsContentEditorProps> = function (props) {
  const { data, contentType, organizationProductId } = props;

  if (organizationProductId) {
    const prodProps = { organizationProductId, ...props };
    switch (data?.organizationCmsContentType || contentType) {
      case ContentType.PRODUCT_PERIPHERAL_DEVICE:
        return (
          <ProductTargetRelationsEditor {...prodProps} primary="週邊裝置" />
        );
      case ContentType.DOWNLOAD_FILE:
        return (
          <ProductUploadFileTargetEditor {...prodProps} primary="檔案下載" />
        );
      default:
    }
  }

  switch (data?.organizationCmsContentType || contentType) {
    case ContentType.PRODUCT_DESCRIPTION:
      return <ProductDescriptionEditor {...props} primary="產品描述" />;
    case ContentType.PRODUCT_FEATURES_MEDIA:
      return <ProductFeatureEditor {...props} primary="產品特色-多媒體" />;
    case ContentType.PRODUCT_FEATURES_LIST:
      return <ProductFeatureListEditor {...props} primary="產品特色-卡片" />;
    case ContentType.PRODUCT_CONFIGURATION:
      return <ProductArticleEditor {...props} primary="產品配置" />;
    case ContentType.PRODUCT_SPECIFICATION:
      return <ProductArticleEditor {...props} primary="產品規格" />;
    case ContentType.PRODUCT_VIDEO:
      return <ProductVideoEditor {...props} primary="產品影片" />;
    case ContentType.ABOUTUS:
      return <AboutUsEditor {...props} primary="關於我們" />;
    case ContentType.WHY_CHOOSE_US:
      return <WhyChooseUsEditor {...props} primary="為何選擇我們" />;
    case ContentType.OUR_CLIENT:
      return <OurClientEditor {...props} primary="我們的服務對象" />;
    case ContentType.OUR_PARTNERS:
      return <OurPartnerEditor {...props} primary="合作夥伴" />;
    case ContentType.CORE_VALUE:
      return <CoreValueEditor {...props} primary="核心價值" />;
    case ContentType.CORE_SPIRIT:
      return <CoreSpiritEditor {...props} primary="精神" />;
    case ContentType.ADVANTAGE:
      return <AdvantageEditor {...props} primary="優勢" />;
    case ContentType.SUSTAINABLE_DEVELOPMENT:
      return <SustainableDevelopmentEditor {...props} primary="與世界同在" />;
    case ContentType.OUR_PARTNERS_SLIDER:
      return <PartnerImageSliderEditor {...props} primary="合作夥伴輪播圖" />;
    default:
      return <NoDataEditor />;
  }
};

export default OrgCmsContentEditor;
