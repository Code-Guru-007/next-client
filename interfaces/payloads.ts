import { Outcome } from "@eGroupAI/utils/getDeviceInfo";
import {
  ColumnType,
  Equal,
  FilterSearch,
  ModulePermission,
  OrgChartReportMode,
  Range,
  ServiceModuleMap,
  ChartTimeGranularity,
  UploadOrgFilesApiPayload,
  ChartRecentTimeGranularity,
} from "@eGroupAI/typings/apis";
import { SearchTextRecordReturnType } from "utils/useOrgSearchTextRecords";
import {
  Locale,
  PageType,
  OrganizationMediaSizeType,
  OrganizationMediaType,
  ContentType,
  ServiceModuleValue,
  FilePathType,
  OrganizationReviewStatusType,
  OrganizationFinanceType,
  ColumnTable,
  SmsSendType,
  Table,
} from "./utils";
import {
  ImportData,
  OrganizationShareEdit,
  OrganizationShareTemplateEdit,
  OrganizationUser,
} from "./entities";

export type LogApiPayload = {
  function: string;
  browserDescription: string;
  jsonData: {
    action?: unknown;
    store?: unknown;
    deviceInfo?: Outcome[];
    data?: unknown;
  };
  level: "ERROR" | "INFO";
  message?: string;
};

export type LoginApiPayload = {
  code: string;
  organizationId?: string;
};

export type GetOrganizationByDomainNameApiPayload = {
  organizationDomainName: string;
};

export type GetOrganizationSettingsApiPayload = {
  organizationId: string;
};

export type GetWidgetTemplateListApiPayload = {
  organizationId: string;
  serviceModuleValue: string;
};

export type GetWidgetTemplateDetailApiPayload = {
  organizationId: string;
  widgetTemplateId: string;
};

export interface LoginAPIResponse {
  loginId?: string;
  loginTokenId?: string;
  loginName?: string;
  hasNext?: boolean;

  isDefault?: string;
  isDelete?: number;
  organizationSettingCreateDate?: string;
  organizationSettingId?: string;
  organizationSettingType?: string;
  organizationSettingUpdateDate?: string;
  organizationSettingValue?: string;
}

export interface MFALoginAPIResponse {
  loginAccount?: string;
  loginId?: string;
  loginName?: string;
  loginTokenId?: string;
  loginTokenId_previous?: string;
  loginTokenKey?: string;
  loginTokenKey_previous?: string;
  createDate?: string;
  hasNext?: boolean;
  version?: number;
  isDelete?: number;
}

export interface NormalLoginApiPayload {
  memberAccount: string;
  memberPassword: string;
  organizationId?: string;
}
export interface MFALoginApiPayload {
  mfaTokenKey: string;
  organizationId?: string;
}
export interface MFAResendApiPayload {
  organizationId: string;
}
export interface NormalSignupApiPayload {
  memberEmail: string;
  memberName: string;
  memberPassword: string;
  confirmMemberPassword: string;
  organizationId?: string;
}

export interface EmailVerifyPayload {
  emailTokenId: string;
}

export interface ForgotPasswordPayload {
  memberEmail: string;
}

export interface ResetPasswordPayload {
  emailTokenId: string;
  memberPassword: string;
}

export interface UpdateMemberPasswordApiPayload {
  memberOldPassword: string;
  memberPassword: string;
}

export interface DeleteAccountApiPayload {
  isDelete: number;
}

export interface VerifyAccountBy3rdParty {
  thirdPartyName: string;
  code?: string;
}

export interface VerifyAccountByPassword {
  memberPassword: string;
}

export interface MemberInformationCopyApiPayload {
  memberInformationCopyId: string;
}

export interface UpdateMemberOnboardingTourStepApiPayload {
  organizationId: string;
  memberId: string;
  memberOnboardingTourStepId: string;
  memberOnboardingTourStepIndex: number;
  memberOnboardingTourStepStatus: "PROGRESSING" | "COMPLETED";
}
export interface CreateOrgApiPayload {
  locale: Locale;
  organizationName: string;
  organizationCountry: string;
  organizationCity: string;
  organizationArea: string;
  organizationAddress: string;
  organizationInvoiceTaxIdNumber: string;
  organizationZIPCode: string;
  organizationFanPage?: string;
  organizationWebsite?: string;
}

export interface UpdateOrgInfoApiPayload {
  locale: Locale;
  organizationId: string;
  organizationCountry: string;
  organizationCity: string;
  organizationArea: string;
  organizationAddress: string;
  organizationFacebookUrl: string;
  organizationYoutubeUrl: string;
  organizationInvoiceTaxIdNumber: string;
  organizationName: string;
  organizationWebsite: string;
  organizationZIPCode: string;
  organizationTelephone: string;
  organizationEmail: string;
}

export interface CreateOrgGroupApiPayload {
  organizationId: string;
  organizationGroupName?: string;
  organizationGroupCountry?: string;
  organizationGroupCity?: string;
  organizationGroupArea?: string;
  organizationGroupZIPCode?: string;
  organizationGroupAddress?: string;
  organizationGroupServiceArea?: string;
  organizationGroupTelephone?: string;
  organizationGroupFax?: string;
  organizationGroupEmail?: string;
  dynamicColumnTargetList?: DynamicColumnTargetApiPayload[];
  dynamicColumnTargetRemoveList?: { columnTargetId: string }[];
}

export interface UpdateOrgGroupApiPayload {
  organizationId: string;
  organizationGroupId: string;
  organizationGroupName?: string;
  organizationGroupCountry?: string;
  organizationGroupCity?: string;
  organizationGroupArea?: string;
  organizationGroupZIPCode?: string;
  organizationGroupAddress?: string;
  organizationGroupServiceArea?: string;
  organizationGroupTelephone?: string;
  organizationGroupFax?: string;
  organizationGroupEmail?: string;
  dynamicColumnTargetList?: DynamicColumnTargetApiPayload[];
  dynamicColumnTargetRemoveList?: { columnTargetId: string }[];
}

export interface DeleteOrgGroupApiPayload {
  organizationId: string;
  organizationGroupId: string;
}

export interface GetOrgMemberPermissionApiPayload {
  organizationId: string;
}

export interface GetOrgMemberInfoApiPayload {
  organizationId: string;
  memberLoginId: string;
}

export interface GetOrgSearchTextRecordsApiPayload {
  organizationId: string;
  query: string;
  type?: SearchTextRecordReturnType
}

export interface GetAssociatedDataApiPayload {
  organizationId?: string;
  columnId?: string;
  serviceModuleValue?: string;
  query: string;
}

export interface UpdateMemberInfoApiPayload {
  loginId?: string;
  memberCreateDate?: string;
  memberUpdateDate?: string;
  memberAccount?: string;
  memberName?: string;
  memberEmail?: string;
  memberAccountStatus?: string;
  memberPhone?: string;
  memberBirth?: string;
  memberGender?: number;
  isDelete?: number;

  memberGoogleId?: string;
  isTestList?: number;
  loginCheck?: false;
  organizationMemberCheck?: false;
}

export interface UpdateMemberRoleApiPayload {
  organizationId: string;
  loginId: string;
  organizationMemberRoleSet: string[];
}

export interface UpdateMemberGroupApiPayload {
  organizationId: string;
  loginId: string;
  organizationMemberGroupSet: string[];
}

export interface ExportOrgMemberPdfApiPayload {
  organizationId: string;
  loginId: string;
}

export interface DeleteOrgMemberApiPayload {
  organizationId: string;
  loginId: string;
}

export interface BindingMemberApiPayload {
  type: "bind" | "unbind";
  thirdParty: string;
  code?: string;
}

export interface GetBindingUrlApiPayload {
  thirdParty: string;
}

export interface CreateOrgRoleApiPayload {
  organizationId: string;
  organizationRoleNameZh?: string;
}
export interface UpdateOrgRoleApiPayload {
  organizationId: string;
  organizationRoleId: string;
  organizationRoleNameZh?: string;
  organizationRoleStatus?: number;
}

export interface DeleteOrgRoleApiPayload {
  organizationId: string;
  organizationRoleId: string;
}

export interface UpdateOrgRoleModuleAndPermissionApiPayload {
  organizationId: string;
  organizationRoleId: string;
  data: {
    serviceModuleMap: ServiceModuleMap;
  };
}

export type OrganizationMediaSliderApiPayload = {
  organizationMediaSliderId: string;
};

export type OrganizationMediaApiPayload = {
  organizationMediaType: OrganizationMediaType;
  organizationMediaSizeType: OrganizationMediaSizeType;
  organizationMediaTitle?: string;
  organizationMediaYoutubeURL?: string;
  organizationMediaLinkURL?: string;
  uploadFile?: {
    uploadFileId?: string;
  };
  organizationTagList?: {
    tagId: string;
  }[];
  organizationMediaDescription?: string;
};

export interface CreateOrgMediaSliderApiPayload {
  organizationId: string;
  targetId?: string;
  organizationMediaSliderPageType: PageType;
  organizationMediaSliderTitle: string;
  organizationMediaSliderDescription: string;
  organizationMediaSliderLinkURL: string;
  organizationMediaSliderYoutubeURL?: string;
  locale: Locale;
  organizationMediaList: OrganizationMediaApiPayload[];
}

export interface DeleteOrgMediaSliderApiPayload {
  organizationId: string;
  organizationMediaSliderId: string;
}

export interface UpdateOrgMediaSliderApiPayload {
  organizationId: string;
  organizationMediaSliderId: string;
  organizationMediaSliderTitle: string;
  organizationMediaSliderDescription: string;
  organizationMediaSliderLinkURL: string;
  organizationMediaSliderYoutubeURL?: string;
  locale: Locale;
}

// This api is different from updateOrgMedia which can limit only one PC or Mobile
// Therefore it can accept update organizationMediaList
export interface UpdateOrgMediaSliderMediaApiPayload {
  organizationId: string;
  organizationMediaSliderId: string;
  organizationMediaList: OrganizationMediaApiPayload[];
}

export interface UpdateOrgMediaSlidersSortApiPayload {
  organizationId: string;
  organizationMediaSliderList: OrganizationMediaSliderApiPayload[];
  pageType: PageType;
}

export interface CreateOrgSolutionApiPayload {
  organizationId: string;
  organizationSolutionName: string;
  organizationSolutionDescription?: string;
  organizationSolutionURL?: string;
  locale: Locale;
  organizationMediaSliderList: OrganizationMediaSliderApiPayload[];
  organizationMediaList: OrganizationMediaApiPayload[];
}

export interface UpdateOrgSolutionApiPayload {
  organizationId: string;
  organizationSolutionId: string;
  locale: Locale;
  organizationSolutionName?: string;
  organizationSolutionDescription?: string;
  organizationSolutionURL?: string;
  organizationMediaSliderList?: OrganizationMediaSliderApiPayload[];
}

export interface DeleteOrgSolutionApiPayload {
  organizationId: string;
  organizationSolutionId: string;
}

export interface UpdateOrgSolutionsSortApiPayload {
  organizationId: string;
  organizationSolutionList: {
    organizationSolutionId: string;
  }[];
}

export interface CreateOrgMediaApiPayload {
  organizationId: string;
  targetId: string;
  organizationMediaList: OrganizationMediaApiPayload[];
  locale?: Locale;
}

export interface UpdateOrgMediaApiPayload {
  organizationId: string;
  organizationMediaId: string;
  organizationMediaTitle?: string;
  organizationMediaYoutubeURL?: string;
  organizationMediaLinkURL?: string;
  organizationMediaDescription?: string;
  organizationTagList?: {
    tagId: string;
  }[];
  locale?: Locale;
  uploadFile?: {
    uploadFileId: string;
  };
}

export interface DeleteOrgMediaApiPayload {
  organizationId: string;
  organizationMediaId: string;
}

export interface SortOrgMediaApiPayload {
  organizationId: string;
  targetId: string;
  organizationMediaList: {
    organizationMediaId: string;
  }[];
}

export interface OrganizationCmsContentApiPayload {
  organizationCmsContentSort?: number;
  organizationCmsContentType: ContentType;
  organizationMediaList?: OrganizationMediaApiPayload[];
  organizationCmsContentTitle?: string;
  organizationCmsContentDescription?: string;
}

export interface CreateOrgProductApiPayload {
  organizationId: string;
  organizationProductDescription?: string;
  organizationProductName?: string;
  organizationMediaSliderList?: OrganizationMediaSliderApiPayload[];
  organizationMediaList?: OrganizationMediaApiPayload[];
  organizationCmsContentList: OrganizationCmsContentApiPayload[];
  locale: Locale;
  organizationProductIsVisible?: number;
}

export interface UpdateOrgProductApiPayload {
  organizationId: string;
  organizationProductId: string;
  organizationProductDescription?: string;
  organizationProductName?: string;
  organizationMediaSliderList?: OrganizationMediaSliderApiPayload[];
  organizationCmsContentList?: OrganizationCmsContentApiPayload[];
  locale: Locale;
  organizationProductIsVisible?: number;
}

export type OrganizationProductApiPayload = {
  organizationProductId: string;
};

export interface UpdateOrgProductSortApiPayload {
  organizationId: string;
  organizationProductList: OrganizationProductApiPayload[];
}

export interface DeleteOrgProductApiPayload {
  organizationId: string;
  organizationProductId: string;
}

export interface CreateOrgCmsContentApiPayload {
  organizationId: string;
  /**
   * targetId = solutionId
   */
  targetId: string;
  organizationCmsPageType: PageType;
  locale?: Locale;
  organizationCmsContentTitle?: string;
  organizationCmsContentType?: ContentType;
  organizationCmsContentDescription?: string;
  organizationMediaList?: OrganizationMediaApiPayload[];
  organizationMediaSliderList?: OrganizationMediaSliderApiPayload[];
}

export interface UpdateOrgCmsContentApiPayload {
  locale: Locale;
  organizationId: string;
  organizationCmsContentId: string;
  organizationCmsContentTitle?: string;
  organizationCmsContentType?: ContentType;
  organizationCmsContentDescription?: string;
  organizationMediaList?: OrganizationMediaApiPayload[];
  organizationMediaSliderList?: OrganizationMediaSliderApiPayload[];
}

export interface UpdateOrgCmsContentSortApiPayload {
  organizationId: string;
  organizationCmsId: string;
  organizationCmsContentList: {
    organizationCmsContentId?: string;
  }[];
}

export interface DeleteOrgCmsContentApiPayload {
  organizationId: string;
  organizationCmsContentId: string;
}

export interface CreateOrgTargetRelationApiPayload {
  organizationId: string;
  targetIdA: string;
  targetTypeA: ServiceModuleValue | PageType;
  targetIdB: string;
  targetTypeB: ServiceModuleValue | PageType;
}

export interface DeleteOrgTargetRelationApiPayload {
  organizationId: string;
  targetIdA: string;
  targetIdB: string;
}

export interface GetOrgEventsTargetRelationsApiPayload {
  organizationId: string;
  targetType: string;
}

export interface CreateOrgFileTargetApiPayload {
  organizationId: string;
  uploadFileId: string;
  uploadFileTargetList: {
    targetId: string;
    uploadFile: {
      uploadFilePathType: string;
    };
  }[];
}

export interface UpdateOrgFileNameApiPayload {
  organizationId: string;
  uploadFileId: string;
  uploadFileName: string;
}

export interface DeleteOrgFileTargetApiPayload {
  organizationId: string;
  uploadFileId: string;
  uploadFileTargetList: {
    targetId: string;
  }[];
}

export interface FileApiPayload {
  organizationId: string;
  uploadFileId: string;
  eGroupService?: "WEBSITE";
}

export interface UploadFilesBatchDownloadApiPayload {
  organizationId: string;
  uploadFileIdList: string[];
  eGroupService?: "WEBSITE";
}
export interface UploadFilesBatchDeleteApiPayload {
  organizationId: string;
  uploadFileIdList: string[];
}

export interface CreateOrgBlogApiPayload {
  organizationId: string;
  organizationBlogTitle: string;
  organizationBlogContent: string;
  organizationMediaList?: OrganizationMediaApiPayload[];
  locale: Locale;
}

export interface UpdateOrgBlogApiPayload {
  organizationId: string;
  organizationBlogId: string;
  organizationBlogTitle: string;
  organizationBlogContent: string;
  locale: Locale;
}

export interface DeleteOrgBlogApiPayload {
  organizationId: string;
  organizationBlogId: string;
}

export interface CreateOrgTargetsTagsApiPayload {
  organizationId: string;
  filterObject?: FilterSearch;
  organizationTagList: {
    tagId: string;
  }[];
  targetIdList?: string[];
  isSelected: number;
  excludedTargetIdList?: string[];
  serviceModulValue: string;
}

export interface CreateOrgTargetTagsApiPayload {
  organizationId: string;
  targetId: string;
  organizationTagList: {
    tagId: string;
  }[];
}

export interface OrganizationEvent {
  organizationEventTitle: string;
  organizationEventDescription: string;
  organizationEventAddress: string;
  organizationEventStartDate: string;
  organizationEventEndDate: string;
  uploadFileList?: {
    uploadFileId: string;
  }[];
  organizationMemberList?: {
    member: {
      loginId: string;
    };
  }[];
  organizationTagList?: {
    tagId: string;
  }[];
  organizationPartnerList?: {
    organizationPartnerId: string;
  }[];
}

export interface CreateOrgTargetsEventsApiPayload {
  organizationId: string;
  isSelected: number;
  filterObject?: FilterSearch;
  organizationEvent: OrganizationEvent;
  targetIdList?: string[];
  excludedTargetIdList?: string[];
}

export interface DeleteOrgTargetsTagsApiPayload {
  organizationId: string;
  filterObject?: FilterSearch;
  organizationTagList: {
    tagId: string;
  }[];
  targetIdList?: string[];
  isSelected: number;
  serviceModulValue: string;
  excludedTargetIdList?: string[];
}

export interface DeleteOrgTargetTagsApiPayload {
  organizationId: string;
  targetId: string;
  tagId: string;
}

export interface CreateOrgTagApiPayload {
  locale: Locale;
  organizationId: string;
  tagGroupId: string;
  tagName: string;
  tagColor: string;
  organizationMediaList: OrganizationMediaApiPayload[];
  organizationRoleTargetAuthList?: {
    organizationRole: {
      organizationRoleId: string;
    };
    organizationRoleTargetAuthPermission: string[];
  }[];
}
export interface UpdateOrgTagApiPayload {
  locale: Locale;
  organizationId: string;
  tagId: string;
  tagGroupId: string;
  tagName: string;
  tagColor: string;
  organizationMediaList?: OrganizationMediaApiPayload[];
  organizationRoleTargetAuthList?: {
    organizationRole: {
      organizationRoleId: string;
    };
    organizationRoleTargetAuthPermission: string[];
  }[];
}
export interface DeleteOrgTagApiPayload {
  organizationId: string;
  tagGroupId: string;
  tagId: string;
}
export interface CreateOrgTagGroupApiPayload {
  locale: Locale;
  tagGroupName: string;
  serviceModuleValue: string;
  organizationId: string;
}
export interface UpdateOrgTagGroupApiPayload {
  locale: Locale;
  tagGroupName: string;
  serviceModuleValue: string;
  organizationId: string;
  tagGroupId: string;
}
export interface DeleteOrgTagGroupApiPayload {
  organizationId: string;
  tagGroupId: string;
}

export interface UpdateOrgCmsMenuApiPayload {
  organizationId: string;
  organizationCmsMenuId: string;
  organizationCmsMenuTitle: string;
  locale: Locale;
}

export interface UpdateOrgCmsSubMenuApiPayload {
  organizationId: string;
  organizationCmsMenuId: string;
  organizationCmsSubMenuId: string;
  organizationCmsSubMenuTitle: string;
  locale: Locale;
}

export interface UpdateOrgCmsPageMenuApiPayload {
  organizationId: string;
  organizationCmsPageMenuId: string;
  organizationCmsPageMenuTitle: string;
  locale: Locale;
}

export interface UpdateOrgCmsSeoApiPayload {
  organizationId: string;
  targetId: string;
  locale: Locale;
  organizationCmsSeoTitle: string;
  organizationCmsSeoDescription: string;
}

export interface CreateOrgInvitationApiPayload {
  organizationId: string;
  organizationInvitationEmailList: string[];
  organizationMemberRoleSet: string[];
}

export interface DeleteOrgInvitationApiPayload {
  organizationId: string;
  organizationInvitationId: string;
}

export interface UpdateOrgMemberInvitationApiPayload {
  organizationId: string;
  organizationInvitationToken: string;
  organizationInvitationStatus: number;
}

export interface ImportUsersExcelApiPayload {
  organizationId: string;
  uploadFileId: string;
}

export interface CreateOrgUsersApiPayload extends ImportData {
  organizationId: string;
}

export interface DeleteOrgUserApiPayload {
  organizationId: string;
  organizationUserId: string;
}

export interface CreateOrgSmsApiPayload {
  organizationId: string;
  smsSendType_: SmsSendType;
  organizationSmsSubject: string;
  organizationSmsContent: string;
  organizationSmsSendDate?: string;
  organizationSmsPhone: string;
  targetId: string;
}

export interface CreateOrgSmsesApiPayload {
  organizationId: string;
  organizationShareTargetType: ServiceModuleValue;
  isSelected: number;
  smsSendType_: SmsSendType;
  filterObject?: FilterSearch;
  organizationSms: {
    organizationSmsSubject: string;
    organizationSmsContent: string;
    organizationShare: {
      organizationShareEditList: OrganizationShareEdit[];
      uploadFileTargetList: {
        uploadFile: {
          uploadFileId: string;
        };
      }[];
      organizationFinanceTemplateList: {
        organizationFinanceTemplateId: string;
      }[];
    };
  };
  organizationUserList?: {
    organizationUserId: string;
    organizationUserPhone: string;
  }[];
  excludedTargetIdList?: string[];
}

export interface CreateOrgEventApiPayload {
  organizationId: string;
  organizationEventTitle: string;
  organizationEventDescription?: string;
  organizationEventAddress: string;
  organizationEventStartDate: string;
  organizationEventEndDate: string;
  dynamicColumnTargetList?: DynamicColumnTargetApiPayload[];
  uploadFileList?: {
    uploadFileId: string;
  }[];
  organizationMemberList?: {
    member: {
      loginId: string;
    };
  }[];
  organizationTagList?: {
    tagId: string;
  }[];
  organizationUserList?: {
    organizationUserId: string;
  }[];
  organizationPartnerList?: {
    organizationPartnerId: string;
  }[];
  recurrence?: string[];
  reminders?: {
    overrides: {
      method: "popup" | "email";
      minutes: number;
    }[];
  };
  attendees?: {
    loginId: string;
    email: string;
  }[];
}

export interface UpdateOrgEventApiPayload {
  organizationId: string;
  organizationEventId: string;
  organizationEventTitle?: string;
  organizationEventAddress?: string;
  organizationEventDescription?: string;
  organizationEventStartDate?: string;
  organizationEventEndDate?: string;
  organizationEventIsOpen?: number;
  organizationMemberList?: {
    member: {
      loginId: string;
    };
  }[];
  removeOrganizationMemberList?: {
    member: {
      loginId: string;
    };
  }[];
  organizationTagList?: {
    tagId: string;
  }[];
  removeOrganizationTagList?: {
    tagId: string;
  }[];
  dynamicColumnTargetList?: DynamicColumnTargetApiPayload[];
  organizationUserList?: {
    organizationUserId: string;
  }[];
  removeOrganizationUserList?: {
    organizationUserId: string;
  }[];
  uploadFileList?: {
    uploadFileId: string;
  }[];
  removeUploadFileList?: {
    uploadFileId: string;
  }[];
  organizationPartnerList?: {
    organizationPartnerId: string;
  }[];
  removeOrganizationPartnerList?: {
    organizationPartnerId: string;
  }[];
  recurrence?: string[];
  reminders?: {
    overrides: {
      method: "popup" | "email";
      minutes: number;
    }[];
  };
  attendees?: {
    loginId: string;
    email: string;
  }[];
}

export interface UploadFilesApiPayload
  extends Omit<
    UploadOrgFilesApiPayload<ServiceModuleValue>,
    "organizationId" | "eGroupService" | "filePathType"
  > {
  organizationShareShortUrl: string;
  filePathType: FilePathType;
}

export interface CreateUploadFileApiPayload {
  organizationId: string;
  files?: File[];
  filePathType?: FilePathType;
  ImageResizeType?: string;
  uploadFileId?: string;
  uploadFileName?: string;
  uploadFileExtensionName?: string;
  uploadFileFullTextSearch?: string;
  uploadFilePath?: string;
  uploadFileSize?: number;
  uploadFileCreateDate?: string;
  uploadFileUpdateDate?: string;
  uploadFileReviewStatus?: string;
  uploadFilePathType?: ServiceModuleValue;
  uploadFileBucket?: string;
  uploadFileBuckedUrl?: string;
}

export interface UpdateUploadFileApiPayload {
  organizationId: string;
  uploadFileId: string;
  uploadFileName?: string;
  uploadFileExtensionName?: string;
  uploadFileFullTextSearch?: string;
  uploadFilePath?: string;
  uploadFileSize?: number;
  uploadFileCreateDate?: string;
  uploadFileUpdateDate?: string;
  uploadFileReviewStatus?: string;
  uploadFilePathType?: ServiceModuleValue;
  uploadFileBucket?: string;
  uploadFileBuckedUrl?: string;
}
export interface DeleteUploadFileApiPayload {
  organizationId: string;
  uploadFileId?: string;
}
export interface DeleteOrgEventApiPayload {
  organizationId: string;
  organizationEventId: string;
}

export type DynamicColumnTargetApiPayload = {
  organizationColumn: {
    columnId: string;
    columnName: string;
    columnType: string;
  };
  multiSelectMode?: string;
  targetId?: string;
  columnTargetId?: string;
  columnTargetValue: string | number;
  columnTargetRelatedTargetId?: string;
  columnTargetValueList?: {
    organizationOptionId: string;
    organizationOptionName: string;
    columnTargetValueRemark?: string;
  }[];
  columnTargetValueRemarkList?: {
    organizationOptionId: string;
    organizationOptionName: string;
    columnTargetValueRemark?: string;
  }[];
};

export type DynamicColumnApiPayload = {
  organizationId: string;
  columnTable?: string;
  size?: number;
  startIndex?: number;
};

export interface CreateOrgUserApiPayload {
  organizationId: string;
  organizationUserNameZh?: string;
  organizationUserGender?: string;
  organizationUserEmail?: string;
  organizationUserPhone?: string;
  organizationUserCity?: string;
  organizationUserZIPCode?: string;
  organizationUserArea?: string;
  organizationUserAddress?: string;
  dynamicColumnTargetList?: DynamicColumnTargetApiPayload[];
  isFromImport?: number;
}

export interface UpdateOrgUserApiPayload {
  organizationId: string;
  organizationUserId: string;
  organizationUserNameZh?: string;
  organizationUserNameEn?: string;
  organizationUserGender?: string;
  organizationUserBirth?: string;
  organizationUserIdCardNumber?: string;
  organizationUserEmail?: string;
  organizationUserPhone?: string;
  organizationUserCity?: string;
  organizationUserZIPCode?: string;
  organizationUserArea?: string;
  organizationUserAddress?: string;
  dynamicColumnTargetList?: DynamicColumnTargetApiPayload[];
  dynamicColumnTargetRemoveList?: { columnTargetId: string }[];
  isFromImport?: number;
}

export interface BatchUpdateOrgUserColumnApiPayload {
  organizationId: string;
  filterObject?: FilterSearch;
  isSelected?: number;
  targetIdList?: string[];
  dynamicColumnRemoveList?: { columnId: string }[];
  dynamicColumnTargetList?: DynamicColumnTargetApiPayload[];
  dynamicColumnTargetRemoveList?: { columnTargetId: string }[];
}

export interface UpdateUserApiPayload
  extends Omit<
    UpdateOrgUserApiPayload,
    "organizationId" | "organizationUserId"
  > {
  organizationShareShortUrl: string;
  agreementFileList: {
    uploadFileId: string;
  }[];
  userFileList: {
    uploadFileId: string;
  }[];
}

export interface CreateFinanceTargetsApiPayload {
  organizationShareShortUrl: string;
  organizationFinanceColumnList: {
    organizationFinanceColumnId?: string;
    organizationFinanceColumnName?: string;
    organizationFinanceType: OrganizationFinanceType;
    organizationFinanceTarget: {
      organizationFinanceTargetId?: string;
      organizationFinanceTargetAmount: number;
      organizationFinanceTargetInsertDate: string;
      organizationTagList?: {
        tagId?: string;
      }[];
    };
  }[];
}

export interface DeleteFinanceTargetApiPayload {
  organizationId: string;
  organizationFinanceTargetId: string;
}

export interface CreateSmsTemplateApiPayload {
  organizationId: string;
  organizationSmsTemplateTitle?: string;
  organizationSmsTemplateContent?: string;
}

export interface UpdateSmsTemplateApiPayload {
  organizationId: string;
  organizationSmsTemplateId?: string;
  organizationSmsTemplateTitle?: string;
  organizationSmsTemplateContent?: string;
  organizationSmsTemplateCreateDate?: string;
  organizationSmsTemplateUpdateDate?: string;
  dynamicColumnTargetList?: DynamicColumnTargetApiPayload[];
  organizationTagTargetList?: {
    tagId: string;
  }[];
}
export interface DeleteSmsTemplateApiPayload {
  organizationId: string;
  organizationSmsTemplateId: string;
}

export interface CreateSmsTemplateTagListPayload {
  organizationId: string;
  organizationSmsTemplateId?: string;
  organizationTagList?: {
    tagId: string;
  }[];
}

export interface DeleteSmsTemplateTagApiPayload {
  organizationId: string;
  organizationSmsTemplateId?: string;
  tagId?: string;
}
export interface CreateSesTemplateApiPayload {
  organizationId: string;
  organizationSesTemplateTitle?: string;
  organizationSesTemplateContent?: string;
}

export interface UpdateSesTemplateApiPayload {
  organizationId: string;
  organizationSesTemplateId?: string;
  organizationSesTemplateTitle?: string;
  organizationSesTemplateContent?: string;
  organizationSesTemplateCreateDate?: string;
  organizationSesTemplateUpdateDate?: string;
  dynamicColumnTargetList?: DynamicColumnTargetApiPayload[];
  organizationTagTargetList?: {
    tagId: string;
  }[];
}
export interface DeleteSesTemplateApiPayload {
  organizationId: string;
  organizationSesTemplateId: string;
}

export interface CreateSesTemplateTagListPayload {
  organizationId: string;
  organizationSesTemplateId?: string;
  organizationTagList?: {
    tagId: string;
  }[];
}

export interface DeleteSesTemplateTagApiPayload {
  organizationId: string;
  organizationSesTemplateId?: string;
  tagId?: string;
}
export interface CreateOrgFinanceTargetsApiPayload
  extends Omit<CreateFinanceTargetsApiPayload, "organizationShareShortUrl"> {
  organizationId: string;
  targetId: string;
}

export interface CreateOrgShareApiPayload {
  organizationId: string;
  targetId: string;
  organizationShareTargetType: ServiceModuleValue;
  organizationShareEditList: OrganizationShareEdit[];
  organizationFinanceTemplateList: {
    organizationFinanceTemplateId: string;
  }[];
  uploadFileTargetList: {
    uploadFile: {
      uploadFileId: string;
    };
  }[];
  organizationShareEditNeedUpload?: string;
  organizationShareUploadDescription?: string;
  organizationShareWelcomeMessage?: string;
  organizationShareFinishMessage?: string;
  organizationShareIsOneTime: string;
  organizationShareExpiredDate?: string;
  organizationShareExpiredDateString?: string;
  organizationShareEndDaysInterval?: number;
}

export interface CreateOrgModuleShareApiPayload {
  organizationId: string;
  targetId: string;
  organizationShareTargetType: ServiceModuleValue;
  isSharePasswordRequired?: string;
}

export interface GetOrgModuleShareApiPayload {
  organizationId: string;
  shareId: string;
}

export interface AccessOrgModuleShareApiPayload {
  organizationId: string;
  shareId: string;
  organizationSharePassword: string;
}

export interface updatePasswordOrgModuleShareApiPayload {
  organizationId: string;
  shareId: string;
  isSharePasswordRequired: string;
  organizationSharePassword?: string;
}

export interface SendOrgModuleShareEmailInvitesApiPayload {
  organizationId: string;
  organizationInvitationEmailList: string[];
  shareUrl: string;
  isSharePasswordRequired: string;
  organizationSharePassword?: string;
  organizationInvitationTargetType?: string;
  targetId?: string;
}

export type OrgaFinanceColumnApiPayload = {
  organizationFinanceColumnId?: string;
  organizationFinanceColumnName: string;
  organizationFinanceType: OrganizationFinanceType;
  organizationFinanceColumnType: string;
  organizationTag?: {
    tagId: string;
  };
};

export interface CreateOrgFinanceTemplateApiPayload {
  organizationId: string;
  organizationFinanceTemplateName: string;
  organizationFinanceTemplateDescription: string;
  organizationFinanceColumnList: OrgaFinanceColumnApiPayload[];
}

export interface UpdateOrgFinanceTemplateApiPayload {
  organizationId: string;
  organizationFinanceTemplateId: string;
  organizationFinanceTemplateName: string;
  organizationFinanceTemplateDescription: string;
  organizationFinanceColumnList: OrgaFinanceColumnApiPayload[];
}

export interface DeleteOrgFinanceTemplateApiPayload {
  organizationId: string;
  organizationFinanceTemplateId: string;
}

export interface DeleteOrgFinanceTemplateColumnApiPayload {
  organizationId: string;
  organizationFinanceTemplateId: string;
  organizationFinanceColumnId: string;
}

export interface CreateOrgSalaryTemplateApiPayload {
  organizationId: string;
  organizationFinanceTemplateName: string;
  organizationFinanceTemplateDescription: string;
  organizationFinanceTemplateType?: string;
  organizationFinanceColumnList: OrgaFinanceColumnApiPayload[];
}

export interface UpdateOrgSalaryTemplateApiPayload {
  organizationId: string;
  organizationFinanceTemplateId: string;
  organizationFinanceTemplateName: string;
  organizationFinanceTemplateDescription: string;
  organizationFinanceColumnList: OrgaFinanceColumnApiPayload[];
}

export interface DeleteOrgSalaryTemplateApiPayload {
  organizationId: string;
  organizationFinanceTemplateId: string;
}

export interface DeleteOrgSalaryTemplateColumnApiPayload {
  organizationId: string;
  organizationFinanceTemplateId: string;
  organizationFinanceColumnId: string;
}

export interface CreateOrgReviewApiPayload {
  organizationId: string;
  targetId: string;
  organizationReviewStatusType: OrganizationReviewStatusType;
  organizationRole: {
    organizationRoleId: string;
  };
  serviceModuleValue: ServiceModuleValue;
}

export interface UpdateOrgReviewApiPayload {
  organizationId: string;
  organizationReviewId: string;
  organizationReviewStatusType: OrganizationReviewStatusType;
  organizationComment: {
    organizationCommentTitle: string;
    organizationCommentContent: string;
  };
  serviceModuleValue: ServiceModuleValue;
}

export interface CreateOrgCommentApiPayload {
  organizationId: string;
  targetId: string;
  organizationCommentTitle: string;
  organizationCommentContent: string;
  targetRelationType: ServiceModuleValue;
}

export interface ExportOrgUserPdfApiPayload {
  organizationId: string;
  organizationUserId: string;
}

export interface ExportOrgUsersExcelApiPayload {
  organizationId: string;
  locale: Locale;
  timeZone: string;
  filterObject: FilterSearch;
  excludedTargetIdList?: string[];
  exportStaticColumnList?: {
    columnName?: string;
    sortKey?: string;
  }[];
  exportDynamicColumnList?: {
    columnId?: string;
    columnName?: string;
  }[];
  exportAggrementFileList?: {
    uploadFileId: string;
  }[];
  isExportTag?: string;
}

export interface ExportOrgMembersExcelApiPayload {
  organizationId: string;
  locale: Locale;
  timeZone: string;
  filterObject?: FilterSearch;
}

export interface ExportSelectedOrgMembersExcelApiPayload {
  organizationId: string;
  orgMemberIdList: DeleteOrgMemberApiPayload[];
  locale: Locale;
  timeZone: string;
}

export interface ExportSelectedOrgUsersExcelApiPayload {
  organizationId: string;
  locale: Locale;
  timeZone: string;
  organizationUserList: OrganizationUser[];
  exportStaticColumnList?: {
    columnName?: string;
    sortKey?: string;
  }[];
  exportDynamicColumnList?: {
    columnId?: string;
    columnName?: string;
  }[];
  exportAggrementFileList?: {
    uploadFileId: string;
  }[];
  isExportTag?: string;
}

export interface GetImportDynamicColumnsApiPayload {
  organizationId: string;
  uploadFileId: string;
}

interface ColumnApiPayload {
  columnId?: string;
  columnName: string;
  columnType: ColumnType;
  columnTable: ColumnTable;
  organizationOptionList?: {
    organizationOptionName: string;
  }[];
}

export interface UpdateOrgDynamicColumnApiPayload {
  organizationId: string;
  columnTable: ColumnTable;
  organizationColumnList: ColumnApiPayload[];
}

export interface SortOrgDynamicColumnApiPayload {
  organizationId: string;
  columnTable: ColumnTable;
  organizationColumnList: {
    columnId: string;
  }[];
}

export interface DeleteColumnByFilterApiPayload {
  organizationId: string;
  columnTable?: string;
  filterObject?: FilterSearch;
}

export interface DeleteBatchColumnApiPayload {
  organizationId: string;
  targetIdList: string[];
}

export interface DeleteOrgDynamicColumnApiPayload {
  organizationId: string;
  columnId: string;
}

export interface DeleteOrgDynamicColumnOptionApiPayload {
  organizationId: string;
  organizationOptionId: string;
  columnId: string;
}

export interface SortOrgDynamicColumnOptionsApiPayload {
  organizationId: string;
  columnId: string;
  organizationOptionList: {
    organizationOptionId: string;
  }[];
}

export interface CreateMemberTargetAuthsApiPayload {
  organizationId: string;
  targetId: string;
  member: {
    loginId: string;
  };
  organizationMemberTargetAuthPermission: ModulePermission[];
  organizationMemberTargetAuthName: string;
  organizationMemberTargetAuthServiceModule: "SPECIFICATION";
  organizationMemberTargetAuthDescription: string;
}

export interface UpdateMemberTargetAuthsApiPayload {
  organizationId: string;
  organizationMemberTargetAuthId: string;
  organizationMemberTargetAuthPermission: ModulePermission[];
  organizationMemberTargetAuthName: string;
  organizationMemberTargetAuthDescription: string;
}

export interface DeleteMemberTargetAuthsApiPayload {
  organizationId: string;
  organizationMemberTargetAuthId: string;
}
export interface DeleteMemberPermissionApiPayload {
  organizationId: string;
  memberList: {
    loginId: string;
  }[];
  targetIdList: string[];
}

export interface CreateMemberPermissionApiPayload {
  organizationId: string;
  filterObject?: FilterSearch;
  organizationMemberTargetAuth: {
    targetIdList: string[];
    organizationMemberTargetAuthPermission: string[];
  };
  targetIdList?: string[];
  excludedTargetIdList?: string[];
  organizationMemberTargetAuthServiceModule: string;
  isSelected: number;
}

export interface CreateMemberTargetModuleAuthPayload {
  organizationId: string;
  filterObject?: FilterSearch;
  targetIdList: string[];
  memberList?: {
    loginId: string;
  }[];
  serviceSubModuleList: {
    serviceSubModuleId: string;
    serviceSubModulePermission: string[];
  }[];
  isSelected?: number;
  serviceModuleValue?: string;
}

export interface DelteMemberTargetModuleAuthPayload {
  organizationId?: string;
  targetIdList?: string[];
  memberList?: {
    loginId: string;
  }[];
}

export interface CreateOrgTargetShareApiPayload {
  organizationId: string;
  isSelected?: number;
  organizationVerifyTokenId?: string;
  sharerOrganizationId?: string;
  memberEmail?: string;
  filterObject?: FilterSearch;
  targetIdList?: string[];
  organizationTargetRelationPermission?: string[];
  excludedTargetIdList?: string[];
}

export interface DeleteOrgTargetShareApiPayload {
  organizationId: string;
  sharerOrganizationId: string;
  isSelected: number;
  filterObject?: FilterSearch;
  targetIdList?: string[];
  excludedTargetIdList?: string[];
}

export interface FullTextSearchApiPayload {
  organizationId: string;
  query: string;
  size: number;
  startIndex: number;
  searchServiceModule?: string;
}

export interface GetOrgCalendarEventsApiPayload {
  organizationId: string;
  organizationCalendarId: string;
  eventStartDateString: string;
  eventEndDateString: string;
  query?: string;
  equal?: Equal[];
  range?: Range[];
}

export interface CreateOrgCalendarApiPayload {
  organizationId: string;
  organizationCalendarName: string;
  organizationCalendarBackgroundColor: string;
  organizationCalendarTimeZone: string;
  organizationCalendarServiceModuleValue: ServiceModuleValue;
  organizationCalendarStartDateColumnType: string;
  organizationCalendarEndDateColumnType: string;
}

export interface UpdateOrgCalendarApiPayload {
  organizationId: string;
  organizationCalendarId: string;
  organizationCalendarName: string;
  organizationCalendarBackgroundColor: string;
  organizationCalendarTimeZone: string;
  organizationCalendarServiceModuleValue: ServiceModuleValue;
  organizationCalendarStartDateColumnType: string;
  organizationCalendarEndDateColumnType: string;
}

export interface DeleteOrgCalendarApiPayload {
  organizationId: string;
  organizationCalendarId: string;
}

export interface DeleteOrgCalendarOauthApiPayload {
  organizationId: string;
}

export interface CreateBulletinApiPayload {
  organizationId: string;
  bulletinTitle?: string;
  bulletinContent?: string;
  bulletinStartDate?: string;
  bulletinEndDate?: string;
  isRelease?: number;
  isPinned?: number;
  organizationTagList?: {
    tagId: string;
  }[];
  uploadFileList?: {
    uploadFileId: string;
  }[];
  dynamicColumnTargetList?: DynamicColumnTargetApiPayload[];
}

export interface UpdateBulletinApiPayload {
  organizationId: string;
  bulletinId?: string;
  bulletinTitle?: string;
  bulletinContent?: string;
  bulletinStartDate?: string;
  bulletinEndDate?: string;
  isRelease?: number;
  isPinned?: number;
  dynamicColumnTargetList?: DynamicColumnTargetApiPayload[];
  organizationTagList?: {
    tagId: string;
  }[];
}

export interface DeleteBulletinApiPayload {
  organizationId: string;
  bulletinId?: string;
}

export interface CreateBulletinTagListPayload {
  organizationId: string;
  bulletinId?: string;
  organizationTagList?: {
    tagId: string;
  }[];
}

export interface DeleteBulletinTagApiPayload {
  organizationId: string;
  bulletinId?: string;
  tagId?: string;
}

export interface CreateOrgArticleApiPayload {
  organizationId: string;
  organizationTagList?: {
    tagId: string;
  }[];
  articleTitle: string;
  articleContent?: string;
  isRelease?: number;
  isPinned?: number;
}

export interface UpdateOrgArticleApiPayload {
  organizationId: string;
  articleId: string;
  organizationTagList?: {
    tagId: string;
  }[];
  articleTitle?: string;
  articleContent?: string;
  isRelease?: number;
  isPinned?: number;
}

export interface DeleteOrgArticleApiPayload {
  organizationId: string;
  articleId: string;
}

export interface CreateTargetCommentApiPayload {
  organizationId: string;
  targetTable: string;
  targetId: string;
  targetCommentParentId?: string;
  targetCommentContent: string;
  mentionedMemberList?: MentionedMember[];
}

export interface MentionedMember {
  loginId: string;
}

export interface CreateOrDeleteTargetCommentLikeApiPayload {
  organizationId: string;
  targetTable: string;
  targetId: string;
  targetCommentId: string;
}

export interface UpdateTargetCommentApiPayload {
  organizationId: string;
  targetTable: string;
  targetId: string;
  targetCommentId: string;
  targetCommentContent: string;
  mentionedMemberList?: MentionedMember[];
}

export interface DeleteTargetCommentApiPayload {
  organizationId: string;
  targetTable: string;
  targetId: string;
  targetCommentId: string;
}

export interface CreateOrgArticleCommentApiPayload {
  organizationId: string;
  articleId: string;
  articleCommentParentId?: string;
  articleCommentContent: string;
  mentionedMemberList?: string[];
}
export interface UpdateOrgArticleCommentApiPayload {
  organizationId: string;
  articleId: string;
  articleCommentId: string;
  articleCommentContent: string;
  mentionedMemberList?: string[];
}

export interface DeleteOrgArticleCommentApiPayload {
  organizationId: string;
  articleId: string;
  articleCommentId: string;
}

export interface CreateOrDeleteOrgArticleCommentLikeApiPayload {
  organizationId: string;
  articleId: string;
  articleCommentId: string;
}
export interface GetFilterViewApiPayload {
  organizationId: string;
  serviceModuleValue?: ServiceModuleValue;
}

export interface CreateFilterViewApiPayload {
  organizationId: string;
  serviceModuleValue: ServiceModuleValue;
  filterObject: FilterSearch;
}

export interface DeleteFilterViewApiPayload {
  organizationId: string;
  filterViewId: string;
}

export interface UpdateFilterViewApiPayload {
  organizationId: string;
  filterViewId: string;
  filterViewName: string;
  filterObject: FilterSearch;
}

export interface GetOrgCalendarOAuthUrlApiPayload {
  organizationId: string;
}

export interface UpdateFilterViewPublicApiPayload {
  organizationId: string;
  filterViewId: string;
  isPublic: number;
}

export interface CreateOrgPartnerApiPayload {
  organizationId: string;
  organizationPartnerNameZh?: string;
  organizationPartnerNameEn?: string;
  organizationPartnerCountry?: string;
  organizationPartnerCity?: string;
  organizationPartnerArea?: string;
  organizationPartnerZIPCode?: string;
  organizationPartnerAddress?: string;
  organizationPartnerWebsite?: string;
  organizationPartnerInvoiceTaxIdNumber?: string;
  organizationPartnerTelephone?: string;
  organizationPartnerFax?: string;
  dynamicColumnTargetList?: DynamicColumnTargetApiPayload[];
}

export interface UpdateOrgPartnerApiPayload extends CreateOrgPartnerApiPayload {
  organizationPartnerId: string;
  dynamicColumnTargetRemoveList?: { columnTargetId: string }[];
}

export interface DeleteOrgPartnerApiPayload {
  organizationId: string;
  organizationPartnerId: string;
}

export interface CreateOrgPartnerEventPayload {
  organizationId: string;
  organizationEvent: OrganizationEvent;
  targetIdList?: string[];
}

export interface SendCustomSmsToAllUsersPayload {
  organizationId: string;
  filterObject: FilterSearch;
  organizationSms: {
    organizationSmsSubject: string;
    organizationSmsContent: string;
    organizationSmsSendDate: string;
  };
}

export interface SendCustomSmsPayload {
  organizationId: string;
  organizationSms: {
    organizationSmsSubject: string;
    organizationSmsContent: string;
    organizationSmsSendDate?: string;
  };
  organizationUserList: {
    organizationUserId: string;
    organizationUserPhone: string;
  }[];
}
export interface SendCustomSmsToUserPayload {
  organizationId: string;
  organizationSms: {
    organizationSmsSubject: string;
    organizationSmsContent: string;
    organizationSmsSendDate?: string;
    targetId: string;
  };
  organizationUserList: {
    organizationUserId: string;
    organizationUserPhone: string;
  }[];
}
export interface SendCustomSesToAllUsersPayload {
  organizationId: string;
  filterObject: FilterSearch;
  organizationSes: {
    organizationSesSubject: string;
    organizationSesContent: string;
  };
}

export interface SendCustomSesPayload {
  organizationId: string;
  organizationSes: {
    organizationSesSubject: string;
    organizationSesContent: string;
  };
  organizationUserList: {
    organizationUserId: string;
    organizationUserEmail: string;
  }[];
}

export interface SendCustomSesTestPayload {
  organizationId?: string;
  organizationSesSubject: string;
  organizationSesContent: string;
}

export interface CreateOrgDynamicColumnGroupPayload {
  organizationId: string;
  columnGroupName: string;
  organizationColumnList: {
    columnId: string;
  }[];
  organizationTagList: { tagId: string }[];
  serviceModuleValue: ServiceModuleValue;
}

export interface UpdateOrgDynamicColumnGroupPayload {
  columnGroupId: string;
  organizationId: string;
  columnGroupName: string;
  organizationColumnList: {
    columnId: string;
  }[];
  organizationTagList: { tagId: string }[];
}

export interface DeleteOrgDynamicColumnGroupApiPayload {
  organizationId: string;
  columnGroupId: string;
}

export interface CreateOrgShareTemplateApiPayload {
  organizationId: string;
  organizationShareTemplateTargetType: ServiceModuleValue;
  organizationShareTemplateTitle: string;
  organizationShareTemplateEditList: OrganizationShareTemplateEdit[];
  organizationFinanceTemplateList: {
    organizationFinanceTemplateId: string;
  }[];
  uploadFileTargetList: {
    uploadFile: {
      uploadFileId: string;
    };
  }[];
  organizationTagList: {
    tagId: string;
  }[];
  organizationShareTemplateEditNeedUpload: string;
  organizationShareTemplateIsOneTime: string;
  organizationShareTemplateExpiredDate?: string;
  organizationShareTemplateUploadDescription: string;
  organizationShareTemplateWelcomeMessage: string;
  organizationShareTemplateFinishMessage: string;
  organizationShareTemplateEndDaysInterval?: number;
}

export interface UpdateOrgShareTemplateApiPayload {
  organizationId: string;
  organizationShareTemplateTargetType: ServiceModuleValue;
  organizationShareTemplateId: string;
  organizationShareTemplateTitle: string;
  organizationShareTemplateEditList: OrganizationShareTemplateEdit[];
  organizationFinanceTemplateList: {
    organizationFinanceTemplateId: string;
  }[];
  uploadFileTargetList: {
    uploadFile: {
      uploadFileId: string;
    };
  }[];
  organizationTagList: {
    tagId: string;
  }[];
  organizationShareTemplateEditNeedUpload: string;
  organizationShareTemplateEndDaysInterval?: number;
  organizationShareTemplateIsOneTime: string;
  organizationShareTemplateExpiredDate?: string;
  organizationShareTemplateUploadDescription: string;
  organizationShareTemplateWelcomeMessage: string;
  organizationShareTemplateFinishMessage: string;
}

export interface GetOrgShareTemplateApiPayload {
  organizationId: string;
  organizationShareTemplateId: string;
}

export interface DeleteOrgShareTemplateApiPayload {
  organizationId: string;
  organizationShareTemplateId: string;
}

export interface CreateOrgDynamicColumnTemplateEventPayload {
  organizationId: string;
  organizationColumnTemplateTitle: string;
  organizationColumnTemplateSubstituteName: string;
  organizationColumnTemplateDescription: string;
  organizationColumnTemplateEventEndDaysInterval: number;
  organizationColumnList: {
    columnId: string;
  }[];
  organizationTagList: {
    tagId: string;
  }[];
  organizationMemberList?: {
    member: {
      loginId: string;
    };
  }[];
  serviceModuleValue: ServiceModuleValue;
}

export interface UpdateOrgDynamicColumnTemplateEventPayload {
  organizationColumnTemplateId: string;
  organizationId: string;
  organizationColumnTemplateTitle: string;
  organizationColumnTemplateSubstituteName: string;
  organizationColumnTemplateDescription: string;
  organizationColumnTemplateEventEndDaysInterval: number;
  organizationColumnList: {
    columnId: string;
  }[];
  organizationTagList: {
    tagId: string;
  }[];
  organizationMemberList?: {
    member: {
      loginId: string;
    };
  }[];
  removeOrganizationMemberList?: {
    member: {
      loginId: string;
    };
  }[];
}

export interface CreateOrgDynamicColumnTemplateUserPayload {
  organizationId: string;
  organizationColumnTemplateTitle: string;
  organizationColumnList: {
    columnId: string;
  }[];
  serviceModuleValue: ServiceModuleValue;
}

export interface UpdateOrgDynamicColumnTemplateUserPayload {
  organizationColumnTemplateId: string;
  organizationId: string;
  organizationColumnTemplateTitle: string;
  organizationColumnList: {
    columnId: string;
  }[];
}

export interface CreateOrgDynamicColumnTemplatePartnerPayload {
  organizationId: string;
  organizationColumnTemplateTitle: string;
  organizationColumnList: {
    columnId: string;
  }[];
  serviceModuleValue: ServiceModuleValue;
}

export interface UpdateOrgDynamicColumnTemplatePartnerPayload {
  organizationColumnTemplateId: string;
  organizationId: string;
  organizationColumnTemplateTitle: string;
  organizationColumnList: {
    columnId: string;
  }[];
}

export interface DeleteOrgDynamicColumnTemplateApiPayload {
  organizationId: string;
  organizationColumnTemplateId: string;
}

export interface GetOrgDynamicColumnTemplateApiPayload {
  organizationId: string;
  organizationColumnTemplateId: string;
}

export interface CheckUniqueValueApiPayload {
  organizationId: string;
  columnId: string;
  columnTargetValue?: string;
}

export interface GetAllMessagesPayload {
  organizationId: string;
  startIndex: number;
  size: number;
  locale: string;
}

export interface GetUnreadMessagesPayload {
  organizationId: string;
  startIndex: number;
  size: number;
  locale: string;
  equal: [
    {
      filterKey: string;
      value: [string];
    }
  ];
}

export interface MakeOneMessageHaveReadPayload {
  organizationId: string;
  messageId: string;
  isRead: number;
}

export interface MakeAllMessageHaveReadPayload {
  organizationId: string;
}

export interface RestoreOrgTargetHistoryRecordApiPayload {
  organizationId: string;
  targetId: string;
  advancedSearchTable: Table;
  title: string;
  content: string;
  isRelease: number;
}

export interface CreateTargetHistoryRecordApiPayload {
  organizationId: string;
  advancedSearchTable: Table;
  targetId: string;
}

export interface GetOrgTargetHistoryRecordVersionApiPayload {
  organizationId: string;
  targetId: string;
  advancedSearchTable: Table;
  targetHistoryRecordId: string;
}

export interface CreateOrgFeedbackApiPayload {
  organizationId: string;
  organizationMemberFeedbackContent: string;
  organizationMemberFeedbackBrowserDescription: string;
}
export interface OrganizationEventId {
  organizationEventId: string;
}
export interface ExportOrgEventsExcelApiPayload {
  organizationId: string;
  locale: Locale;
  timeZone: string;
  filterObject: FilterSearch;
  excludedTargetIdList?: string[];
}
export interface ExportSelectedOrgEventsExcelApiPayload {
  organizationId: string;
  locale: Locale;
  timeZone: string;
  organizationEvents: OrganizationEventId[];
}

export type ChartReportDataSource = {
  mode: OrgChartReportMode | string;
  value: string | undefined;
  serviceModuleValue: ServiceModuleValue | string;
  timeGranularity?: ChartTimeGranularity | string;
  recentTimeGranularity?: ChartRecentTimeGranularity | string;
  startDate?: string;
  endDate?: string;
  axisName?: string;
  valueMapping?: {
    [key: string]: string;
  };
};

export interface PostGetChartReportResultApiPayload {
  organizationId: string;
  serviceModuleValue: ServiceModuleValue | string;
  widgetConfig: {
    dataSourceList: ChartReportDataSource[];
    filterObject?: FilterSearch;
  };
}

export interface CreateOrgReportSavingApiPayload {
  organizationId: string;
  organizationReportName: string;
  reportChartType: string;
  serviceModuleValue: string;
  hasFixedResult: string;
  isPublic: number;
  widgetConfig: {
    dataSourceList: ChartReportDataSource[];
    filterObject?: FilterSearch;
  };
}

export interface GetOrgReportListApiPayload {
  organizationId: string;
  serviceModuleValue: ServiceModuleValue;
}

export interface GetOrgReportDetailApiPayload {
  organizationId: string;
  organizationReportId: string;
}

export interface UpdateOrgReportApiPayload
  extends CreateOrgReportSavingApiPayload {
  organizationReportId: string;
}

export interface DeleteOrgReportApiPayload {
  organizationId: string;
  organizationReportId: string;
}

export interface UnbindLineApiPayload {
  organizationId: string;
  targetId: string;
  targetServiceModule: ServiceModuleValue;
  lineId: string;
}

export interface MergeFilesApiPayload {
  organizationId: string;
  uploadFileIdList: string[];
  filePathType: ServiceModuleValue;
  isDeleteAfterMerge: boolean;
}

export interface ResendInvitationsApiPayload {
  organizationId: string;
  organizationInvitationList: {
    organizationInvitationId: string;
  }[];
}
export interface DeleteCmsFeedback {
  organizationId: string;
  organizationFeedbackId: string;
}
export interface BatchDeleteCmsFeedback {
  organizationId: string;
  organizationFeedbackIdList: string[];
}
