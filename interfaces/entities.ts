import {
  ChartTimeGranularity,
  ColumnRelatedServiceModuleValue,
  ColumnType,
  FilterSearch,
  ModulePermission,
  OrganizationMember,
  OrganizationRole,
  OrgChartReportMode,
  TableColumn,
} from "@eGroupAI/typings/apis";
import { RemarkValues } from "components/DynamicField/types";
import {
  ColumnTable,
  ContentType,
  OrganizationCmsMenuType,
  OrganizationFinanceType,
  OrganizationFinanceItemType,
  OrganizationInvitationStatus,
  OrganizationMediaSizeType,
  OrganizationMediaType,
  OrganizationReviewStatusType,
  OrganizationSmsSendStatus,
  PageType,
  ServiceModuleValue,
} from "./utils";

export interface OrganizationInfoByDomain {
  organizationId: string;
  organizationLoginRegisterSectionAlignment: string;
  organizationLoginTitle: string;
  organizationRegisterTitle: string;
  organizationLoginBackgroundText: string;
  organizationRegisterBackgroundText: string;
}

export interface OrganizationSetting {
  organizationSettingId: string;
  organizationSettingCreateDate: string;
  organizationSettingUpdateDate: string;
  organizationSettingType: string;
  organizationSettingValue: string;
}

export interface WidgetTemplate {
  widgetTemplateId: string;
  widgetType: string;
  reportChartType: string;
  widgetTemplateName: string;
  widgetTemplateType: string;
  reportChartStackType: string;
  widgetConfig: {
    dataSourceList: [
      {
        mode: string;
        value: string;
        serviceModuleValue: ServiceModuleValue;
      }
    ];
    filterObject?: FilterSearch;
    maxDisplayQuantity: number;
  };
  serviceModuleValue: ServiceModuleValue;
  widgetTemplateCreateDate: string;
  widgetTemplateSort: number;
}

export interface WidgetTemplateReportColumn {
  [key: string]: {
    reportColumnName: "string";
    reportColumnType: "string";
  };
}

export interface WidgetTemplateReportData {
  [key: string]: number;
}

export interface WidgetTemplateDetail {
  reportColumnList: WidgetTemplateReportColumn[];
  reportDataList: WidgetTemplateReportData[];
}

export interface Organization {
  organizationId: string;
  creator: Creator;
  organizationCreateDate: string;
  organizationUpdateDate: string;
  organizationName: string;
  organizationCountry: string;
  organizationCity: string;
  organizationArea: string;
  organizationZIPCode: string;
  organizationAddress: string;
  organizationWebsite: string;
  organizationFacebookUrl: string;
  organizationYoutubeUrl: string;
  organizationInvoiceTaxIdNumber: string;
  organizationTelephone: string;
  organizationEmail: string;
}

export interface OrganizationGroup {
  organizationGroupId: string;
  organization: {
    organizationId: string;
  };
  creator?: {
    loginId: string;
    loginCheck: boolean;
    organizationMemberCheck: boolean;
  };
  updater?: {
    loginId: string;
    loginCheck: boolean;
    organizationMemberCheck: boolean;
  };
  organizationGroupZIPCode?: string;
  organizationGroupName?: string;
  organizationGroupCountry?: string;
  organizationGroupCity?: string;
  organizationGroupArea?: string;
  organizationGroupAddress?: string;
  organizationGroupTelephone?: string;
  organizationGroupFax?: string;
  organizationGroupEmail?: string;
  organizationGroupServiceArea?: string;
  organizationGroupSort?: number;
  dynamicColumnTargetList?: DynamicColumnTarget[];
  uploadFileList?: UploadFile[];
  dynamicColumnListAll?: OrganizationColumn[];
  organizationGroupCreateDate?: string;
  organizationGroupUpdateDate?: string;
}

export interface Creator {
  loginId: string;
  memberName: string;
  memberEmail: string;
  loginCheck: boolean;
  organizationMemberCheck: boolean;
}

export interface OrganizationMedia {
  organizationMediaCreateDate: string;
  organizationMediaId: string;
  organizationMediaType: OrganizationMediaType;
  organizationMediaTitle?: string;
  organizationMediaLinkURL?: string;
  organizationMediaYoutubeURL?: string;
  organizationMediaUpdateDate: string;
  targetId: string;
  uploadFile: UploadFile;
  organizationMediaSizeType: OrganizationMediaSizeType;
  organizationMediaDescription?: string;
  organizationTagTargetList?: OrganizationTagTarget[];
}

export interface OrganizationMediaSlider {
  organizationMediaSliderCreateDate: string;
  organizationMediaSliderId: string;
  organizationMediaSliderPageType: string;
  organizationMediaSliderSort: number;
  organizationMediaSliderUpdateDate: string;
  organizationMediaSliderTitle?: string;
  organizationMediaSliderDescription?: string;
  organizationMediaSliderYoutubeURL?: string;
  organizationMediaSliderLinkURL?: string;
  targetId: string;
  organizationMediaList: OrganizationMedia[];
}

export interface OrganizationSolution {
  organizationSolutionId: string;
  organizationSolutionCreateDate: string;
  organizationSolutionSort: number;
  organizationSolutionUpdateDate: string;
  organizationSolutionName?: string;
  organizationSolutionDescription?: string;
  organizationSolutionURL?: string;
  organizationMediaSliderList?: OrganizationMediaSlider[];
  organizationMediaList?: OrganizationMedia[];
}

export interface OrganizationCmsContent {
  organizationCmsContentId: string;
  organizationCmsContentSort: number;
  organizationCmsContentType: ContentType;
  organizationCmsContentDescription: string;
  organizationCmsContentTitle?: string;
  organizationMediaList?: OrganizationMedia[];
  organizationProductRelatedList?: OrganizationProduct[];
  uploadFileList?: UploadFile[];
}

export interface OrganizationProduct {
  organizationProductId: string;
  organizationProductIsVisible?: number;
  organizationProductCreateDate: string;
  organizationProductUpdateDate: string;
  organizationProductCustomizedQuantity: number;
  organizationProductIsFix: number;
  organizationProductSort: number;
  organizationProductAvailable: number;
  organizationProductName?: string;
  organizationProductDescription?: string;
  organizationMediaList: OrganizationMedia[];
  organizationMediaSliderList?: OrganizationMediaSlider[];
  organizationCmsContentList?: OrganizationCmsContent[];
  organizationTagTargetList?: OrganizationTagTarget[];
  organizationCmsSeo?: OrganizationCmsSeo;
}

export interface UploadFile {
  uploadFileTitle: string;
  organizationTagTargetList: OrganizationTagTarget[];
  uploadFileId: string;
  uploadFileName: string;
  uploadFileExtensionName: string;
  uploadFileFullTextSearch: string;
  uploadFilePath: string;
  uploadFileSize: number;
  uploadFileCreateDate: string;
  uploadFileUpdateDate: string;
  uploadFileReviewStatus: string;
  uploadFilePathType: ServiceModuleValue;
  uploadFileBucket: string;
  uploadFileBuckedUrl: string;
  dynamicColumnTargetList?: DynamicColumnTarget[];
  uploadFileTargetCreateDate: string;
  creator: Creator;
}

export interface OrganizationTag {
  tagId: string;
  tagCreateDate: string;
  tagUpdateDate?: string;
  tagName: string;
  tagScore: number;
  tagColor: string;
  organizationTagGroup: OrganizationTagGroup;
  organizationMediaList?: OrganizationMedia[];
  organizationRoleTargetAuthList?: {
    organizationRole: {
      organizationRoleId: string;
      organizationRoleNameZh: string;
    };
    organizationRoleTargetAuthPermission: string[];
  }[];
}

export interface OrganizationTagGroup {
  organization: {
    organizationId: string;
  };
  tagGroupId: string;
  tagGroupName: string;
  tagGroupCreateDate: string;
  tagGroupUpdateDate: string;
  serviceModuleValue: string;
  tagGroupValue: string;
  organizationTagList?: OrganizationTag[];
}

export interface OrganizationTagTarget {
  organizationTag: OrganizationTag;
  targetId: string;
  tagTargetCreateDate?: string;
  tagTargetUpdateDate?: string;
  id?: {
    tagId: string;
  };
}

export interface OrganizationBlog {
  organizationBlogCreateDate: string;
  organizationBlogId: string;
  organizationBlogShareCount: number;
  organizationBlogUpdateDate: string;
  organizationBlogVisitsCount: number;
  organizationBlogTitle: string;
  organizationBlogAuthor: string;
  organizationBlogContent: string;
  organizationMediaList: OrganizationMedia[];
  organizationMediaSliderList?: OrganizationMediaSlider[];
  organizationProductList?: OrganizationProduct[];
  organizationProductRelatedList?: OrganizationProduct[];
  organizationTagTargetList?: OrganizationTagTarget[];
  organizationBlogPre?: OrganizationBlog;
  organizationBlogNextBlog?: OrganizationBlog;
  organizationCmsSeo?: OrganizationCmsSeo;
}

export interface OrganizationFeedback {
  organizationFeedbackId: string;
  organizationFeedbackTitle: string | undefined;
  organizationFeedbackPersonName: string | undefined;
  organizationFeedbackContent: string | undefined;
  organizationFeedbackPersonPhone: number;
  organizationFeedbackPersonEmail: string;
  organizationFeedbackCountry: string | undefined;
  organizationFeedbackCompanyName: string | undefined;
  organizationFeedbackCreateDate: string;
  organizationTagTargetList: OrganizationTagTarget[];
}

export interface OrganizationInvitation {
  organization: Organization;
  organizationInvitationId: string;
  organizationInvitationEmail: string;
  organizationInvitationStatus: OrganizationInvitationStatus;
  organizationInvitationToken: string;
  organizationInvitationCreateDate: string;
}

export interface FeedbackType {
  feedbackTypeColor: string;
  feedbackTypeId: string;
  feedbackTypeName: string;
}

export interface OrganizationCmsSeo {
  organizationCmsSeoTitle: string;
  organizationCmsSeoDescription: string;
}

export interface OrganizationCmsMenu {
  organizationCmsMenuCreateDate: string;
  organizationCmsMenuId: string;
  organizationCmsMenuSort: number;
  organizationCmsMenuUpdateDate: string;
  organizationCmsMenuVisible: number;
  organizationCmsMenuTitle: string;
  organizationCmsMenuType: OrganizationCmsMenuType;
  organizationCmsSubmenuList: OrganizationCmsSubMenu[];
  organizationCmsSeo?: OrganizationCmsSeo;
  organizationCmsPageType: PageType;
}

export interface OrganizationCmsSubMenu {
  organizationCmsSubMenuCreateDate: string;
  organizationCmsSubMenuId: string;
  organizationCmsSubMenuSort: number;
  organizationCmsSubMenuUpdateDate: string;
  organizationCmsSubmenuVisible: number;
  organizationCmsSubMenuTitle: string;
}

export interface OrganizationCmsPageMenu {
  organizationCmsPageMenuId: string;
  organizationCmsPageMenuCreateDate: string;
  organizationCmsPageMenuUpdateDate: string;
  organizationCmsPageMenuSort: number;
  organizationCmsPageMenuVisible: number;
  organizationCmsPageMenuPageType: string;
  organizationCmsPageMenuContentType: string;
  organizationCmsPageMenuTitle: string;
}

export interface ImportData {
  dynamicColumnList: OrganizationColumn[];
  organizationUserList: OrganizationUser[];
}

export interface OrganizationUser {
  organizationUserId: string;
  organizationUserNameZh?: string;
  organizationUserNameEn?: string;
  organizationUserFacePath?: string;
  organizationUserEmail?: string;
  organizationUserIdCardNumber?: string;
  organizationUserGender?: number;
  organizationUserPhone?: string;
  organizationUserCity?: string;
  organizationUserZIPCode?: string;
  organizationUserArea?: string;
  organizationUserAddress?: string;
  organizationUserBirth?: string;
  organizationUserCreateDate?: string;
  organizationUserUpdateDate?: string;
  dynamicColumnTargetList?: DynamicColumnTarget[];
  organizationTagTargetList?: OrganizationTagTarget[];
  agreementFileList?: UploadFile[];
  userFileList?: UploadFile[];
  similarOrganizationUserList?: OrganizationUser[];
  importStatus?: "DB_UNIQUE" | "DB_DUPLICATE" | "FORMAT_ERROR";
  importStatusMessage?: string;
  dynamicColumnListAll?: OrganizationColumn[];
  // only useful when import user by excel
  total?: number; // total import
  number?: number; // current import index
  organization?: Organization;
  columnConditionList?: TableColumn[];
  creator?: Creator;
  updater?: Updater;
  uploadFileList?: UploadFile[];
  hasBindingLineId?: boolean;
  lineId?: string;
}

export interface OrganizationUserShare {
  organization: {
    organizationId: string;
  };
  organizationUserId: string;
  organizationUserNameZh?: string;
  organizationUserNameEn?: string;
  organizationUserPhone?: string;
  organizationUserEmail?: string;
  organizationUserZIPCode?: string;
  organizationUserCity?: string;
  organizationUserArea?: string;
  organizationUserAddress?: string;
  organizationUserIdCardNumber?: string;
  organizationUserGender?: number;
  organizationUserCreateDate?: string;
  organizationUserUpdateDate?: string;
  organizationUserBirth?: string;
}
export interface Bulletin {
  bulletinId: string;
  bulletinTitle?: string;
  bulletinContent?: string;
  bulletinCreateDate?: string;
  bulletinUpdateDate?: string;
  bulletinStartDate?: string;
  bulletinEndDate?: string;
  creatorName?: string;
  organizationTagTargetList?: OrganizationTagTarget[];
  agreementFileList?: UploadFile[];
  isEnd?: number;
  readCount: number;
  isRelease?: number;
  isPinned?: number;
  creator: Creator;
  updater: Updater;
  // only useful when import user by excel
  total?: number; // total import
  number?: number; // current import index
  organization?: Organization;
  columnConditionList?: TableColumn[];
  dynamicColumnTargetList?: DynamicColumnTarget[];
  bulletinFileList: UploadFile[];
}

export interface DynamicColumnTarget {
  organizationColumn: OrganizationColumn;
  targetId: string;
  columnTargetId: string;
  columnTargetValue: string | number;
  columnTargetValueList?: {
    organizationOptionId: string;
    organizationOptionName: string;
    columnTargetValueRemark?: string;
  }[];
  columnTargetRelatedTargetId: string;
  columnTargetValueRemarkList?: {
    organizationOptionId: string;
    organizationOptionName: string;
    columnTargetValueRemark?: string;
  }[];
}

export interface OrganizationEvent {
  organizationEventAddress: string;
  organizationEventCreateDate: string;
  organizationEventEndDate: string;
  organizationEventId: string;
  organizationEventIsOpen: number;
  organizationEventStartDate: string;
  organizationEventTitle: string;
  organizationEventDescription: string;
  organizationEventUpdateDate: string;
  organizationMemberList?: OrganizationMember[];
  organizationUserList?: OrganizationUser[];
  dynamicColumnTargetList?: DynamicColumnTarget[];
  organizationTagTargetList?: OrganizationTagTarget[];
  organizationPartnerList?: OrganizationPartner[];
  organizationCommnetList?: OrganizationComment[];
  uploadFileList?: UploadFile[];
  isReviewing: boolean;
  creator: Member;
  updater: Member;
  organizationReview?: OrganizationReview;
  recurrence?: string[];
  reminders?: {
    overrides: {
      method: "popup" | "email";
      minutes: number;
    }[];
  };
  organizationCalendar: {
    organizationCalendarId: string;
  };
  organizationCalendarEventId: string;
  organizationCalendarEventTargetId: string;
  hasReviewPermission: boolean;
  isDateOnly?: number;
}

export interface Member {
  loginId: string;
  createDate?: string;
  createDateString?: string;
  memberAccount?: string;
  memberName: string;
  memberEmail: string;
  loginCheck: boolean;
  organizationMemberCheck: boolean;
}

export interface OrganizationPartner {
  organizationUserId: any;
  organizationPartnerId: string;
  organizationPartnerNameZh: string;
  organizationPartnerNameEn: string;
  organizationPartnerAddress: string;
  organizationPartnerWebsite: string;
  organizationPartnerInvoiceTaxIdNumber: string;
  organizationPartnerTelephone: string;
  organizationPartnerFax: string;
  organizationPartnerCreateDate: string;
  organizationPartnerUpdateDate: string;
  organizationPartnerArea: string;
  organizationPartnerCity: string;
  organizationPartnerCountry: string;
  organizationPartnerZIPCode: string;
  organization: Organization;
  dynamicColumnTargetList?: DynamicColumnTarget[];
  organizationTagTargetList: OrganizationTagTarget[];
  uploadFileList: UploadFile[];
  creator?: Creator;
  updater?: Updater;
}

export interface OrganizationOption {
  organizationOptionCreateDate: string;
  organizationOptionId: string;
  organizationOptionName: string;
  organizationOptionNextColumnId: string;
  organizationOptionUpdateDate: string;
  updaterLoginId: string;
}

export interface OrganizationColumn {
  columnId: string;
  columnName: string;
  columnType: ColumnType;
  columnRelatedServiceModuleValue?: ColumnRelatedServiceModuleValue;
  columnTargetRelatedTargetId?: string;
  columnSort: number;
  columnTable: ColumnTable;
  columnCreateDate: string;
  columnUpdateDate: string;
  organization: Organization;
  organizationOptionList?: OrganizationOption[];
  columnDescription?: string;
  updater: Updater;
  isRequired: number;
  isRelatedServiceModule: number;
  hasNextColumn: number;
  isEditor?: number;
  columnEditorTemplateContent?: string;
  hasValueRemark?: number;
  isRequiredValueRemark?: number;
  columnNumberMax?: number;
  columnNumberMin?: number;
  columnNumberUnit?: string;
  columnNumberOfDecimal?: number;
  hasValidator?: number;
  isUniqueValue?: number;
  columnValidatorRegex?: string;
  organizationColumnGroup?: {
    columnGroupId: ColumnGroup["columnGroupId"];
    columnGroupName: ColumnGroup["columnGroupName"];
  };
  isCommentEnabled?: string;
  maxOptionBeSelected?: number;
  minOptionBeSelected?: number;
}

export type ColumnPreview = OrganizationColumn & {
  focus: boolean;
  disabled: boolean;
};
export interface OrgColumnRelatedData {
  targetId: string;
  targetInformationList?: string[];
}
export interface RoleTargetAuth {
  [targetId: string]: string[];
}
export interface ColumnGroup {
  inputValue?: string;
  columnGroupId: string;
  columnGroupName: string;
  columnGroupCreateDate: string;
  columnGroupUpdateDate: string;
  creator: {
    loginCheck: boolean;
    organizationMemberCheck: boolean;
  };
  updater: {
    loginCheck: boolean;
    organizationMemberCheck: boolean;
  };
  serviceModuleValue: ServiceModuleValue;
  organizationColumnList: OrganizationColumn[];
  organizationColumnListCount: number;
  organizationTagTargetList: OrganizationTagTarget[];
}

export interface ShareTemplateSearch {
  organizationShareTemplateEndDaysInterval: number;
  organizationShareTemplateId: string;
  organizationShareTemplateTitle: string;
  organizationShareTemplateCreateDate: string;
  organizationShareTemplateUpdateDate: string;
  organization: {
    organizationId: string;
    empty: boolean;
  };
  organizationShareTemplateEditNeedUpload: number;
  organizationShareTemplateTargetType: ServiceModuleValue;
  organizationShareTemplateUploadDescription: string;
  organizationShareTemplateWelcomeMessage: string;
  organizationShareTemplateFinishMessage: string;
  organizationShareTemplateIsOneTime: number;
  organizationShareTemplateExpiredDate: string;
  creator: {
    loginId: string;
    memberName: string;
    loginCheck: boolean;
    organizationMemberCheck: boolean;
    organization: {
      empty: boolean;
    };
  };
  organizationTagTargetList: OrganizationTagTarget[];
}

export interface ColumnTemplate {
  organizationColumnTemplateId: string;
  organizationColumnTemplateTitle: string;
  organizationColumnTemplateCreateDate: string;
  organizationColumnTemplateUpdateDate: string;
  organizationColumnTemplateSubstituteName: string;
  organizationColumnTemplateDescription: string;
  organizationColumnTemplateEventEndDaysInterval: number;
  creator: {
    loginCheck: boolean;
    organizationMemberCheck: boolean;
  };
  updater: {
    loginCheck: boolean;
    organizationMemberCheck: boolean;
  };
  serviceModuleValue: ServiceModuleValue;
  organizationColumnList: OrganizationColumn[];
  organizationTagTargetList: OrganizationTagTarget[];
  organizationMemberList?: OrganizationMember[];
}
export interface Updater {
  loginId?: string;
  memberName?: string;
}

export interface OrganizationShareTemplateEdit {
  organizationShareTemplateEditKey: string;
  organizationShareTemplateEditType: ColumnType;
  organizationShareTemplateEditId?: string;
  organizationShareTemplateEditCreateDate?: string;
  organizationShareTemplateEditSort?: number;
  organizationShareTemplateEditIsRequired?: number;
  isDynamicColumn?: string;
  isAutoFill?: string;
}

export interface OrganizationShareTemplate {
  organizationShareTemplateId: string;
  organization: {
    organizationId: string;
    empty: boolean;
  };
  organizationShareTemplateEndDaysInterval?: number;
  organizationShareTemplateCreateDate: string;
  organizationShareTemplateTitle: string;
  organizationShareTemplateEditNeedUpload: number;
  organizationShareTemplateTargetType: ServiceModuleValue;
  organizationShareTemplateUploadDescription: string;
  organizationShareTemplateWelcomeMessage: string;
  organizationShareTemplateFinishMessage: string;
  organizationShareTemplateIsOneTime: number;
  organizationShareTemplateExpiredDate: string;
  organizationShareTemplateEditList: OrganizationShareTemplateEdit[];
  uploadFileList: UploadFile[];
  organizationFinanceTemplateList: OrganizationFinanceTemplate[];
  organizationTagTargetList: OrganizationTagTarget[];
}

export interface OrganizationShareEdit {
  organizationShareEditKey: string;
  organizationShareEditType: ColumnType;
  organizationShareEditIsRequired?: number;
  isAutoFill?: string;
  isDynamicColumn?: string;
}

export interface OrganizationShare {
  organization: Organization;
  organizationShareShortUrl: string;
  organizationShareId: string;
  targetId: string;
  organizationShareEditNeedUpload: number;
  organizationShareUploadDescription?: string;
  organizationShareTargetType: ServiceModuleValue;
  organizationShareEditList: OrganizationShareEdit[];
  uploadFileTargetList: UploadFileTarget[];
  uploadFileList: UploadFile[];
}

export interface OrganizationModuleShare {
  organization: Pick<Organization, "organizationId">;
  organizationShareShortUrl: string;
  organizationShareId: string;
  targetId: string;
  organizationShareTargetType: ServiceModuleValue;
  isSharePasswordRequired: string;
}

export interface AccessOrganizationModuleShare {
  articleContent?: string;
  articleId?: string;
  articleTitle?: string;
  bulletinContent?: string;
  bulletinId?: string;
  bulletinTitle?: string;
}

export interface UploadFileTarget {
  targetId: string;
  uploadFile: UploadFile;
  uploadFileTargetId: string;
}

export interface ShareReurl {
  organizationShareTargetType: ServiceModuleValue;
  organizationShareEditList?: OrganizationShareEdit[];
  organizationFinanceTemplateList?: OrganizationFinanceTemplate[];
  uploadFileList?: UploadFile[];
  organizationUser: OrganizationUser;
  organizationShareEditNeedUpload?: number;
  organizationShareUploadDescription?: string;
  organizationShareWelcomeMessage?: string;
  organizationShareFinishMessage?: string;

  organization?: Organization;
  organizationShareShortUrl?: string;
  organizationShareId?: string;
  targetId?: string;
  isSharePasswordRequired?: string;
}

// export interface OrgModuleShareReurl {
//   organizationShareTargetType: ServiceModuleValue;
//   organization: Organization;
//   organizationShareShortUrl: string;
//   organizationShareId: string;
//   targetId: string;
//   isSharePasswordRequired: string;

//   organizationShareEditList?: OrganizationShareEdit[];
//   organizationFinanceTemplateList?: OrganizationFinanceTemplate[];
//   uploadFileList?: UploadFile[];
//   organizationUser: OrganizationUser;
//   organizationShareEditNeedUpload?: number;
//   organizationShareUploadDescription?: string;
//   organizationShareWelcomeMessage?: string;
//   organizationShareFinishMessage?: string;
// }

export interface OrganizationFinanceColumn {
  organizationFinanceColumnCreateDate: string;
  organizationFinanceColumnId: string;
  organizationFinanceColumnName: string;
  organizationFinanceColumnType: string;
  organizationFinanceTemplate: {
    organizationFinanceTemplateId?: string;
  };
  organizationFinanceColumnUpdateDate: string;
  organizationFinanceType: OrganizationFinanceType;
  organizationFinanceItemType?: OrganizationFinanceItemType;
}

export interface OrganizationFinanceTemplate {
  organizationFinanceTemplateCreateDate: string;
  organizationFinanceTemplateDescription: string;
  organizationFinanceTemplateId: string;
  organizationFinanceTemplateName: string;
  organizationFinanceTemplateUpdateDate: string;
  updaterLoginId: string;
  organizationFinanceColumnList?: OrganizationFinanceColumn[];
  isSystemTemplate?: number;
  organizationFinanceTemplateType?: ServiceModuleValue;
}

export interface OrganizationSalaryTemplate {
  organizationFinanceTemplateCreateDate: string;
  organizationFinanceTemplateDescription: string;
  organizationFinanceTemplateId: string;
  organizationFinanceTemplateName: string;
  organizationFinanceTemplateUpdateDate: string;
  updaterLoginId: string;
  organizationFinanceTemplateType: string;
  organizationFinanceColumnList?: OrganizationFinanceColumn[];
}

export interface OrganizationReview {
  organizationReviewCreateDate: string;
  organizationReviewId: string;
  organizationReviewStatusType: OrganizationReviewStatusType;
  organizationReviewUpdateDate: string;
  targetId: string;
  organizationComment: OrganizationComment;
  organizationRole: OrganizationRole;
  submiter: Reviewer;
  reviewer: Reviewer;
}

export interface OrganizationComment {
  organizationCommentContent?: string;
  organizationCommentCreateDate: string;
  organizationCommentId: string;
  organizationCommentTitle?: string;
  organizationCommentUpdateDate: string;
  creator: Creator;
}

export interface Reviewer {
  loginId?: string;
  loginCheck: boolean;
  organizationMemberCheck: boolean;
  memberName: string;
}

export interface OrganizationSms {
  batchId: string;
  organizationSmsContent: string;
  organizationSmsCreateDate: string;
  organizationSmsId: string;
  organizationSmsPhone: string;
  organizationSmsSendDate: string;
  organizationSmsSendStatus: OrganizationSmsSendStatus;
  organizationSmsSendStatusMessage: string;
  organizationSmsShortUrl: string;
  organizationSmsSubject: string;
  organizationSmsUpdateDate: string;
  targetId: string;
  organizationShare: OrganizationShare;
  creator: Creator;
}

export interface OrganizationSes {
  batchId: string;
  organizationSesSubject: string;
  organizationSesContent: string;
  organizationSesCreateDate: string;
  organizationSesId: string;
  organizationSesEmail: string;
  organizationSesSendDate: string;
  organizationSesSendStatus: OrganizationSmsSendStatus;
  organizationSesSendStatusMessage: string;
  organizationSesShortUrl: string;
  organizationSesUpdateDate: string;
  targetId: string;
  organizationShare: OrganizationShare;
}

export interface LineEvent {
  lineEventId: string;
  botId: string;
  lineEventTargetType: string;
  lineEventTargetId: string;
  sourceTargetType: string;
  sourceTargetId: string;
  replyToken: string;
  lineEventCreateDate: string;
  lineMessage: LineMessage;
}

export interface LineMessage {
  lineMessageId: string;
  lineMessageType: string;
  lineMessageText: string;
  uploadFile: {
    uploadFileId: string;
  };
}

export interface OrganizationFinanceTarget {
  organizationFinanceColumn: OrganizationFinanceColumn;
  organizationFinanceTargetAmount: number;
  organizationFinanceTargetCreateDate: string;
  organizationFinanceTargetInsertDate: string;
  organizationFinanceTargetUpdateDate: string;
  organizationFinanceTargetId: string;
  organizationTagTargetList: OrganizationTagTarget[];
  targetId: string;
  updaterLoginId: string;
  insertBatchId: string;
  organization: Organization;
}

export interface OrganizationSmsTemplate {
  organizationTagTargetList: OrganizationTagTarget[];
  organizationId: string;
  organizationSmsTemplate: OrganizationSmsTemplate;
  organization: Organization;
  organizationSmsTemplateId: string;
  organizationSmsTemplateTitle?: string;
  organizationSmsTemplateContent?: string;
  organizationSmsTemplateCreateDate?: string;
  organizationSmsTemplateUpdateDate?: number;
  creator?: Creator;
  updater?: Updater;
}

export interface OrganizationSesTemplate {
  organizationTagTargetList: OrganizationTagTarget[];
  organizationId: string;
  organizationSesTemplate: OrganizationSesTemplate;
  organization: Organization;
  organizationSesTemplateId: string;
  organizationSesTemplateTitle?: string;
  organizationSesTemplateContent?: string;
  organizationSesTemplateCreateDate?: string;
  organizationSesTemplateUpdateDate?: string;
  creator?: Creator;
  updater?: Updater;
}

export interface OrganizationRecordTarget {
  organizationRecordTargetId: string;
  targetId: string;
  organizationRecordTargetKey: string;
  organizationRecordTargetValue: string;
  organizationRecordTargetCreateDate: string;
  organizationRecordTargetUpdateDate: string;
  updater: Updater;
  uploadFileId?: string;
}

export interface OrganizationTargetHistoryRecord {
  targetHistoryRecordId: string;
  organization: {
    organizationId: string;
  };
  targetId: string;
  serviceModuleValue: ServiceModuleValue;
  targetHistoryRecordContent?: string;
  targetHistoryRecordContentAdded?: string;
  targetHistoryRecordContentDeleted?: string;
  targetHistoryRecordTitle?: string;
  targetHistoryRecordTitleAdded?: string;
  targetHistoryRecordTitleDeleted?: string;
  targetHistoryRecordCreateDate?: string;
  targetHistoryRecordCreateDateString?: string;
  targetHistoryRecordUpdateDate?: string;
  targetHistoryRecordUpdateDateString?: string;
  updater?: {
    loginId?: string;
    memberName?: string;
    loginCheck?: boolean;
    organizationMemberCheck?: boolean;
  };
}

export interface Sort_APIResponseDataType {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface OrganizationTargetHistoryRecord_APIResponseDataType {
  content: OrganizationTargetHistoryRecord[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
  sort: Sort_APIResponseDataType;
  pageable: {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
    sort: Sort_APIResponseDataType;
  };
}

export interface OrganizationTargetHistoryFullContent {
  targetHistoryRecordId: string;
  organization: {
    organizationId: string;
  };
  targetId: string;
  serviceModuleValue: ServiceModuleValue;
  targetHistoryRecordContent: string;
  targetHistoryRecordTitle: string;
  targetHistoryRecordCreateDate?: string;
  targetHistoryRecordCreateDateString?: string;
  updater?: {
    loginId?: string;
    memberName?: string;
    loginCheck?: boolean;
    organizationMemberCheck?: boolean;
  };
}

export interface OrganizationMemberTargetAuth {
  organizationMemberTargetAuthId: string;
  organizationMemberTargetAuthCreateDate: string;
  organizationMemberTargetAuthUpdateDate: string;
  targetId: string;
  member: Member;
  organization: Organization;
  organizationMemberTargetAuthPermission: ModulePermission[];
  organizationMemberTargetAuthDescription: string;
  organizationMemberTargetAuthName: string;
  isAutoCreatedByRole: number;
}

export declare type RolePermissionMap = {
  [key: string]: ModulePermission;
};

export interface PermissionMember {
  member: Creator;
  rolePermissionMap: RolePermissionMap;
}

export interface MemberLoginId {
  loginId: string;
}

export interface ServiceSubModule {
  serviceSubModuleId: string;
  serviceModule: {
    serviceModuleId: string;
  };
  serviceSubModuleNameZh: string;
  serviceSubModuleNameEn: string;
  serviceSubModuleValue: string;
  serviceSubModulePermission: string[];
  serviceSubModuleNo: number;
  serviceSubModuleCreateDate: string;
  serviceSubModuleUpdateDate: string;
  permissionMap: {
    [key: string]: string;
  };
}
export interface UserDetailPermission {
  organization: {
    organizationId: string;
  };
  member: Omit<
    Member,
    "isDeleted" | "memberUpdateDate" | "memberAccountStatus" | "memberPhone"
  >;
  organizationMemberMonthSalary: number;
  organizationMemberHourSalary: number;
  organizationRoleList: Pick<
    OrganizationRole,
    "organizationRoleId" | "organizationRoleNameZh" | "organizationRoleStatus"
  >[];
  serviceSubModuleList: ServiceSubModule[];
}

export interface OrganizationCalendar {
  organizationCalendarId: string;
  organization: Organization;
  organizationCalendarName: string;
  organizationCalendarBackgroundColor: string;
  isSelected: number;
  isDefault?: number;
  isOAuthCalendar?: number;
  organizationCalendarCreateDate: string;
  organizationCalendarUpdateDate: string;
  organizationCalendarServiceModuleValue: ServiceModuleValue;
  organizationCalendarStartDateColumnType: string;
  organizationCalendarEndDateColumnType: string;
  organizationCalendarTimeZone: string;
}

export interface MemberDetailPermission {
  organization: {
    organizationId: string;
  };
  member: Omit<
    Member,
    "isDeleted" | "memberUpdateDate" | "memberAccountStatus" | "memberPhone"
  >;
  organizationMemberMonthSalary: number;
  organizationMemberHourSalary: number;
  organizationRoleList: Pick<
    OrganizationRole,
    "organizationRoleId" | "organizationRoleNameZh" | "organizationRoleStatus"
  >[];
  serviceSubModuleList: ServiceSubModule[];
}

export interface OrganizationArticle {
  articleId: string;
  organization: {
    organizationId: string;
  };
  articleTitle: string;
  articleDescription: string;
  articleContent?: string;
  articleCreateDate: string;
  articleUpdateDate?: string;
  creator: Omit<Creator, "memberName" | "memberEmail">;
  articleCommentCount: number;
  isPinned: number;
  isRelease: number;
  organizationTagTargetList: OrganizationTagTarget[];
  latestUpdaterName?: string;
  readCount: number;
}

export interface OrganizationArticleReads {
  creator: Creator;
  targetActionCreateDate: string;
  lastTargetActionRecordCreateDate: string;
}

export interface OrganizationArticleComment {
  articleCommentId: string;
  article: {
    articleId: string;
  };
  articleCommentContent: string;
  articleCommentLikeCount: number;
  articleCommentCreateDate: string;
  articleCommentUpdateDate: string;
  creator: Omit<Creator, "memberEmail">;
  articleCommentChildCount?: number;
  hasLikeByCurrentLoginAccount?: 0 | 1;
  mentionedMemberList?: Member[];
}

export interface TargetComment {
  targetCommentId: string;
  targetId: string;
  targetCommentContent: string;
  targetCommentCreateDate: string;
  targetCommentUpdateDate: string;
  creator: Creator;
  targetCommentChildCount?: number;
  targetCommentLikeCount: number;
  hasLikeByCurrentLoginAccount?: number;
  mentionedMemberList?: Member[];
}

export type Values = {
  [name: string]: string | number | null | undefined;
};

export type OptionType = {
  optionId: string;
  label: string;
  value: string;
  nextColumnId?: string;
  nextColumn?: OrganizationColumn;
};

export interface DynamicColumnData {
  orgColumnsGroupByGroup: any;
  values: Values;
  errors: {
    [name: string]: string | undefined;
  };
  handleChange: (
    name: string,
    value?: {
      [name: string]: string | undefined;
    }
  ) => void;
  handleErrors: (name: string, error?: string) => void;
  dynamicOptions: {
    [name: string]: OptionType[] | undefined;
  };
  setColumnTargetValues?: React.Dispatch<React.SetStateAction<RemarkValues>>;
  handleChangeRemark: (
    type: ColumnType,
    colId: string,
    optionId: string,
    optionName: string,
    value?: string
  ) => void;
}

export interface OrgChartReportVariableData {
  mode: OrgChartReportMode;
  modeName?: string;
  value: string;
  name: string;
  columnType: ColumnType;
}

export interface OrgChartReportVariables {
  reportVariableModeName: string;
  reportVariableDataList: OrgChartReportVariableData[];
}

export type ReportColumnList = {
  [key: number | string]: {
    columnId?: string;
    filterKey?: string;
    reportColumnName: string;
    reportColumnType: ColumnType;
  };
};

export type ReportData = {
  [key: number | string]: string | number;
};

export interface ChartReportResult {
  reportColumnList: ReportColumnList;
  reportDataList: ReportData[];
}

type ChartReportDataSource = {
  mode: OrgChartReportMode | string;
  value: string;
  serviceModuleValue: ServiceModuleValue | string;
  timeGranularity?: ChartTimeGranularity | string;
  axisName?: string;
  valueMapping?: Record<string, string>;
};

export interface OrganizationReport {
  organizationReportId: string;
  organization: Organization;
  organizationReportName: string;
  reportChartType: string;
  widgetConfig: {
    dataSourceList?: ChartReportDataSource[];
    filterObject?: FilterSearch;
  };
  hasFixedResult: "TRUE" | "FALSE";
  organizationReportFixedResultFilePath: string;
  isPublic: 0 | 1;
  organizationReportCreateDate: string;
  organizationReportUpdateDate: string;
  serviceModuleValue: ServiceModuleValue;
  creator: Creator;
  updater: Updater;
}

export interface OrganizationReportDetail extends OrganizationReport {
  reportResult: ChartReportResult;
}
