import {
  ColumnType,
  ColumnRelatedServiceModuleValue,
  Locale,
  ChartTypes,
  OrgChartReportMode,
  SummaryMethodTypes,
  FilterConditionsTypes,
  ChartTimeGranularity,
  ChartRecentTimeGranularity,
} from "@eGroupAI/typings/apis";
// import { DialogFilterCondition } from "@eGroupAI/material-module/DataTable";
import { Option } from "@eGroupAI/material-lab/FilterDropDown";
import { DynamicColumnTargetApiPayload } from "interfaces/payloads";
import {
  ColumnTable,
  OrganizationFinanceType,
  OrganizationMediaSizeType,
  ServiceModuleValue,
} from "./utils";

export type DynamicValueType = {
  [name: string]: string | undefined;
};

export type NextColumnValues = {
  [columnId: string]: string | number | undefined;
};

export type DurationValueType = {
  [name: string]: string | string[] | undefined;
};

export type CarouselEditFormInput = {
  organizationMediaSliderTitle: string;
  organizationMediaSliderDescription: string;
  organizationMediaSliderLinkURL: string;
};

export interface OrganizationMediaField {
  organizationMediaId?: string;
  uploadFileId?: string;
  uploadFilePath?: string;
  organizationMediaYoutubeURL?: string;
  organizationMediaLinkURL?: string;
  organizationMediaTitle?: string;
  isUploading: boolean;
  organizationMediaDescription?: string;
  organizationTagList?: {
    tagId: string;
    tagName: string;
    tagColor: string;
  }[];
  tempNewImage?: File;
  mediaImageDeleted?: boolean;
  imageOnly?: boolean;
  isSliderImage?: boolean;
  organizationMediaSizeType?: OrganizationMediaSizeType;
}

export interface OrganizationMediaSliderMediaField {
  organizationMediaSliderId?: string;
  organizationMediaSliderPageType?: string;
  organizationMediaSliderSort?: number;
  organizationMediaSliderTitle?: string;
  organizationMediaSliderDescription?: string;
  organizationMediaSliderYoutubeURL?: string;
  organizationMediaSliderLinkURL?: string;
  targetId?: string;
  organizationMediaId?: string;
  uploadFileId?: string;
  uploadFilePath?: string;
  organizationMediaYoutubeURL?: string;
  organizationMediaLinkURL?: string;
  organizationMediaTitle?: string;
  isUploading: boolean;
  organizationMediaDescription?: string;
  organizationTagList?: {
    tagId: string;
    tagName: string;
    tagColor: string;
  }[];
  tempNewImage?: File;
  mediaImageDeleted?: boolean;
  imageOnly?: boolean;
  isSliderImage?: boolean;
  organizationMediaSizeType?: OrganizationMediaSizeType;
}

export interface OrganizationMediaSliderField {
  organizationMediaSliderCreateDate?: string;
  organizationMediaSliderId?: string;
  organizationMediaSliderPageType?: string;
  organizationMediaSliderSort?: number;
  organizationMediaSliderUpdateDate?: string;
  organizationMediaSliderTitle?: string;
  organizationMediaSliderDescription?: string;
  organizationMediaSliderYoutubeURL?: string;
  organizationMediaSliderLinkURL?: string;
  targetId?: string;
  organizationMediaList?: OrganizationMediaSliderMediaField[];
}

export interface OrganizationCmsContentField {
  organizationCmsContentId?: string;
  organizationCmsContentTitle?: string;
  organizationCmsContentSort?: number;
  organizationCmsContentDescription?: string;
  organizationMediaList?: OrganizationMediaField[];
  isEditing?: boolean;
  isUpdated?: boolean;
  isDeleted?: boolean;
  isNew?: boolean;
}

export interface CmsContentsFormInput {
  PAGE_TYPE_?: string;
  targetId?: string;
  locale?: Locale;
  organizationCmsContentList?: OrganizationCmsContentField[];
  isFormBusy?: boolean;
}

export interface CmsContentFormInput {
  organizationCmsContentTitle?: string;
  organizationCmsContentDescription?: string;
  organizationCmsContentLinkURL?: string;
  organizationMediaList?: OrganizationMediaField[];
  organizationMediaSliderMediaList?: OrganizationMediaSliderMediaField[];
  isFormBusy?: boolean;
}

export interface SolutionEditFormInput {
  organizationSolutionName: string;
  organizationSolutionDescription?: string;
  organizationSolutionURL?: string;
  organizationMediaList?: OrganizationMediaField[];
  organizationMediaSliderMediaList?: OrganizationMediaSliderMediaField[];
  isFormBusy?: boolean;
}

export interface FeatureEditFormInput {
  organizationSolutionName: string;
  organizationSolutionDescription?: string;
  organizationSolutionURL?: string;
  organizationMediaList?: OrganizationMediaField[];
  // organizationSliderMediaList?: OrganizationMediaField[];
  isFormBusy?: boolean;
}

export interface ProductInfoFormInput {
  organizationProductDescription: string;
  organizationProductName: string;
  organizationMediaList: OrganizationMediaField[];
  // organizationSliderMediaList?: OrganizationMediaField[];
  isFormBusy?: boolean;
}

export interface CreateProductFormInput {
  organizationProductDescription: string;
  organizationProductName: string;
  organizationMediaList: OrganizationMediaField[];
  // organizationSliderMediaList?: OrganizationMediaField[];
  isFormBusy?: boolean;
}

export interface CreateBlogFormInput {
  organizationBlogTitle: string;
  organizationBlogContent: string;
  organizationMediaList: OrganizationMediaField[];
  // organizationSliderMediaList?: OrganizationMediaField[];
  isFormBusy?: boolean;
}

export interface EditBlogFormInput {
  organizationBlogTitle: string;
  organizationBlogContent: string;
  organizationMediaList: OrganizationMediaField[];
  // organizationSliderMediaList?: OrganizationMediaField[];
  isFormBusy?: boolean;
}
export interface TagFormInput {
  tagName: string;
  tagColor: string;
  organizationMediaList?: OrganizationMediaField[];
  organizationRoleTargetAuthList?: {
    organizationRole: {
      organizationRoleId: string;
      organizationRoleNameZh: string;
    };
    organizationRoleTargetAuthPermission: string[];
  }[];
}
export interface TagGroupFormInput {
  tagGroupName: string;
  serviceModuleValue: string;
}

export interface OrgInfoFormInput {
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

export interface OrgCmsMenuFormInput {
  title: string;
}

export interface OrgCmsSubMenuFormInput {
  main_title: string;
  [key: string]: string;
}

export interface CmsSeoPageFormInput {
  organizationCmsSeoTitle: string;
  organizationCmsSeoDescription: string;
}

export interface CmsSeoProductFormInput {
  organizationCmsSeoTitle: string;
  organizationCmsSeoDescription: string;
}

export interface CmsSeoBlogFormInput {
  organizationCmsSeoTitle: string;
  organizationCmsSeoDescription: string;
}

export interface InvitateMemberFormInput {
  organizationInvitationEmailList: string[];
  organizationMemberRoleSet: string[];
}

export interface OrganizationFinanceColumnFeild {
  organizationFinanceColumnId?: string;
  organizationFinanceColumnName: string;
  organizationFinanceType: OrganizationFinanceType;
}

export interface FinanceTemplatesFormInput {
  organizationFinanceTemplateName: string;
  organizationFinanceTemplateDescription: string;
  organizationFinanceColumnList: OrganizationFinanceColumnFeild[];
}
export interface SalaryTemplatesFormInput {
  organizationFinanceTemplateName: string;
  organizationFinanceTemplateDescription: string;
  organizationFinanceTemplateType?: string;
  organizationFinanceColumnList: OrganizationFinanceColumnFeild[];
}

export interface OrgColumnFormInput {
  columnId?: string;
  columnName: string;
  columnType: ColumnType;
  columnRelatedServiceModuleValue?: ColumnRelatedServiceModuleValue;
  columnTable: ColumnTable;
  columnDescription?: string;
  organizationOptionList?: {
    id: string;
    organizationOptionId?: string;
    organizationOptionName: string;
    organizationOptionNextColumnId: string;
  }[];
  isRequired: number;
  isRelatedServiceModule?: number;
  hasNextColumn?: number;
  isEditor?: number;
  columnEditorTemplateContent?: string;
  hasValueRemark?: number;
  isRequiredValueRemark?: number;
  columnNumberMax?: number;
  columnNumberMin?: number;
  columnNumberUnit?: string;
  columnNumberOfDecimal?: number;
  hasValidator?: number;
  columnValidatorRegex?: string;
  isUniqueValue?: number;
  organizationColumnGroup?: {
    columnGroupId: string;
  };
  maxOptionBeSelected?: number;
  minOptionBeSelected?: number;
  isCommentEnabled?: string;
}

export interface DynamicColumnsFormInput {
  organizationColumnList: OrgColumnFormInput[];
}

export interface DynamicColumnGroupFormInput {
  columnGroupName: string;
  organizationTagList: { tagId: string }[];
  organizationColumnList: { columnId: string }[];
  serviceModuleValue: ServiceModuleValue;
}

export interface DynamicColumnTemplateEventFormInput {
  organizationColumnTemplateTitle: string;
  organizationColumnTemplateSubstituteName: string;
  organizationColumnTemplateDescription: string;
  organizationColumnTemplateEventEndDaysInterval: number;
  organizationTagList: { tagId: string }[];
  organizationColumnList: { columnId: string }[];
  organizationMemberList: {
    member: {
      loginId: string;
      memberName: string;
    };
  }[];
  serviceModuleValue: ServiceModuleValue;
}

export interface DynamicColumnTemplateUserFormInput {
  organizationColumnTemplateTitle: string;
  organizationColumnList: { columnId: string }[];
  serviceModuleValue: ServiceModuleValue;
}

export interface DynamicColumnTemplatePartnerFormInput {
  organizationColumnTemplateTitle: string;
  organizationColumnList: { columnId: string }[];
  serviceModuleValue: ServiceModuleValue;
}

export interface FinanceFormInput {
  organizationFinanceColumnList: {
    organizationFinanceColumnId?: string;
    organizationFinanceColumnName?: string;
    organizationFinanceType: OrganizationFinanceType;
    organizationFinanceTemplate: {
      organizationFinanceTemplateId?: string;
    };
    organizationFinanceTarget: {
      organizationFinanceTargetId?: string;
      organizationFinanceTargetAmount: number;
      organizationFinanceTargetInsertDate: string;
      organizationTagList: {
        tagId: string;
      }[];
    };
  }[];
}

export interface SMSFormInput {
  organizationSmsTemplateTitle?: string;
  organizationSmsTemplateContent?: string;
}

export interface SESFormInput {
  organizationSesTemplateTitle?: string;
  organizationSesTemplateContent?: string;
}

export interface CreateCommentFormInput {
  organizationCommentTitle: string;
  organizationCommentContent: string;
}

export interface CreateOrgCalendarFormInput {
  organizationCalendarName: string;
  organizationCalendarBackgroundColor: string;
  organizationCalendarTimeZone: string;
  organizationCalendarServiceModuleValue: ServiceModuleValue;
  organizationCalendarStartDateColumnType: string;
  organizationCalendarEndDateColumnType: string;
}

export type Granularity = "minutes" | "hours" | "days" | "weeks";
export interface ScheduleEventFormInput {
  organizationEventTitle: string;
  organizationEventStartDate: string;
  organizationEventEndDate: string;
  organizationEventDescription: string;
  organizationEventAddress: string;
  recurrence?: string;
  reminders?: {
    method: "popup" | "email";
    minutes: number;
    granularity: Granularity;
  }[];
}
export interface CreateEventFormInput {
  organizationEventTitle: string;
  organizationEventStartDate: string;
  organizationEventEndDate: string;
  organizationEventAddress?: string;
  organizationEventDescription?: string;
}

export interface BulletinFormInput {
  organizationId?: string;
  bulletinTitle: string;
  bulletinContent?: string;
  bulletinStartDate: string;
  bulletinEndDate: string;
  isRelease: number;
  organizationTagList?: {
    tagId: string;
  }[];
  uploadFileList?: {
    uploadFileId: string;
  }[];
  dynamicColumnTargetList?: DynamicColumnTargetApiPayload[];
}

export interface ArticleFormInput {
  articleTitle: string;
  articleContent?: string;
  isRelease?: number;
}

export interface CreateCustomizeSMSFormInput {
  organizationSmsSubject: string;
  organizationSmsContent: string;
}

export interface InviteShareLinkFormInput {
  organizationInvitationEmailList: string[];
  shareUrl: string;
  isSharePasswordRequired: boolean;
  organizationSharePassword?: string;
}

export interface ReportValueMapping {
  label: string;
  value: string;
  alias: string;
}

export interface ReportVariable {
  mode: OrgChartReportMode | string;
  value?: string;
  name: string;
  columnType: ColumnType | string;
  timeGranularity?: ChartTimeGranularity;
  recentTimeGranularity?: ChartRecentTimeGranularity;
  startDate?: string;
  endDate?: string;
  axisName?: string;
  valueMapping?: ReportValueMapping[];
}

export interface SummaryMethod {
  value: SummaryMethodTypes;
}

export interface OrgChartReportFormInput {
  reportChartType: { type1?: ChartTypes; type2?: ChartTypes };
  reportVariables: ReportVariable[];
  summaryMethods: SummaryMethod[];
  filterConditions: Option[];
  filterConditionsType: FilterConditionsTypes;
  organizationReportName?: string;
  hasFixedResult?: boolean;
}
