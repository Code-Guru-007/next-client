import {
  // OrganizationMedia,
  OrganizationMediaSlider,
} from "interfaces/entities";
import {
  OrganizationMediaSliderField,
  // OrganizationMediaField,
} from "interfaces/form";
// import parseOrgMediaListFormValues from "./parseOrgMediaListFormValues";
import parseOrgMediaSliderMediaListFormValues from "./parseOrgMediaSliderMediaListFormValues";

export default function parseOrgMediaSliderListFormValues(
  sliderList?: OrganizationMediaSlider[],
  targetId?: string
): {
  mediaSliderItems?: OrganizationMediaSliderField[];
  mediaSliderMediaItems?: OrganizationMediaSliderField[];
} {
  const mediaSliderItems = sliderList?.map((el) => ({
    organizationMediaSliderId: el.organizationMediaSliderId,
    organizationMediaSliderPageType: el.organizationMediaSliderPageType,
    organizationMediaSliderSort: el.organizationMediaSliderSort,
    organizationMediaSliderTitle: el.organizationMediaSliderTitle,
    organizationMediaSliderDescription: el.organizationMediaSliderDescription,
    organizationMediaSliderYoutubeURL: el.organizationMediaSliderYoutubeURL,
    organizationMediaSliderLinkURL: el.organizationMediaSliderLinkURL,
    targetId,
    organizationMediaList: parseOrgMediaSliderMediaListFormValues(
      el.organizationMediaList,
      el,
      targetId
    ),
  }));
  const mediaSliderMediaItems = mediaSliderItems?.[0]?.organizationMediaList;
  // const items = sliderList?.map((el) => ({
  //   organizationMediaSliderCreateDate: el.organizationMediaSliderCreateDate,
  //   organizationMediaSliderId: el.organizationMediaSliderId,
  //   organizationMediaSliderPageType: el.organizationMediaSliderPageType,
  //   organizationMediaSliderSort: el.organizationMediaSliderSort,
  //   organizationMediaSliderUpdateDate: el.organizationMediaSliderUpdateDate,
  //   organizationMediaSliderTitle: el.organizationMediaSliderTitle,
  //   organizationMediaSliderDescription: el.organizationMediaSliderDescription,
  //   organizationMediaSliderYoutubeURL: el.organizationMediaSliderYoutubeURL,
  //   organizationMediaSliderLinkURL: el.organizationMediaSliderLinkURL,
  //   targetId,
  //   organizationMediaList: parseOrgMediaListFormValues(
  //     el.organizationMediaList
  //   ),
  // }));
  // return [...(sliderItems || [])];
  return { mediaSliderItems, mediaSliderMediaItems };
}
