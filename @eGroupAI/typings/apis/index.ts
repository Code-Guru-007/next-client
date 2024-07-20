import { ReactNode } from "react";
import { AxiosError, AxiosResponse } from "axios";
import { SWRResponse } from "swr";
import { SWRInfiniteResponse } from "swr/infinite";
import { Step } from "react-joyride";

export interface PathParams {
  [key: string]: string | undefined;
}

export interface ReturnedValues<Data, ErrorData> {
  data?: Data;
  mutate: SWRResponse<AxiosResponse<Data>, AxiosError<ErrorData>>["mutate"];
  response?: AxiosResponse<Data>;
  error?: AxiosError<ErrorData>;
  isError: boolean;
  key: string | null;
  isValidating: boolean;
}

export interface ReturnedInfiniteValues<Data, ErrorData>
  extends Omit<
    ReturnedValues<Data, ErrorData>,
    "data" | "mutate" | "response" | "key"
  > {
  data?: Data[];
  mutate: SWRInfiniteResponse<
    AxiosResponse<Data>,
    AxiosError<ErrorData>
  >["mutate"];
  response?: AxiosResponse<Data>[];
  setSize: SWRInfiniteResponse["setSize"];
  size: SWRInfiniteResponse["size"];
}

export interface EntityList<T> {
  total: number;
  source: T[];
}

export interface FeedbackType {
  feedbackTypeId: string;
  feedbackTypeColor: string;
  feedbackTypeName: string;
  feedbackTypeCreateDate: string;
  feedbackTypeUpdateDate: string;
}

export interface CreateFeedbackApiPayload {
  organizationFeedbackCountry?: string;
  organizationFeedbackCompanyName?: string;
  organizationFeedbackPersonName: string;
  organizationFeedbackPersonEmail: string;
  organizationFeedbackPersonPhone?: string;
  organizationFeedbackTitle: string;
  organizationFeedbackContent: string;
  feedbackType?: {
    feedbackTypeId: string;
  };
  organizationFeedbackFilePathList?: string[];
  organizationTagList?: {
    tagId: string;
  }[];
}

export interface UploadFilesApiPayload<ServiceModuleValue> {
  files: File[];
  filePathType: ServiceModuleValue;
  targetId?: string;
}

export interface UploadOrgFilesApiPayload<ServiceModuleValue> {
  organizationId: string;
  files: File[];
  filePathType?: ServiceModuleValue;
  imageSizeType?: "PC" | "MOBILE" | "NORMAL";
  eGroupService?: "WEBSITE";
  timeZone?: string;
}

export interface SearchRecord {
  searchTextRecordReturnType: "HISTORY" | "AUTOCOMPLETE";
  searchTextRecordList: {
    searchTextRecordQuery: string;
  }[];
}

export interface SearchResult {
  searchId: string;
  searchTitle: string;
  searchContent: string;
  searchServiceModule: string;
  searchCreateDate: string;
  searchUpdateDate: string;
  searchHighlightContent?: string;
}

export interface ReportData {
  name?: string;
  total: number;
}

export interface Creator {
  loginId: string;
  memberName: string;
}

export interface Organization {
  organizationId: string;
  organizationCreateDate: string;
  organizationName: string;
  creator: Creator;
}

export interface Report {
  reportId: string;
  reportType: string;
  reportIcon?: string;
  reportTitle: string;
}

export interface OrganizationReport {
  organization: Organization;
  report: Report;
  organizationReportNo: number;
}

export interface OrganizationReportAnalytics {
  reportId: string;
  reportType: "COUNT" | "SIMPLE_PIE" | "SIMPLE_LINE" | "SIMPLE_BAR";
  reportIcon?: string;
  reportTitle: string;
  reportData: ReportData[];
}

export interface Data {
  name: string;
  value: string;
}

export interface FilterCondition {
  filterKey: string;
  columnId: string;
  filterName: string;
  type: string;
  columnType?: string;
  filterIcon?: string;
  dataList?: Data[];
  targetType?: string;
  singleLayerTagServiceModuleValue?: string;
  multiLayerTagServiceModuleValue?: string;
  reviewServiceModuleValue?: string;
  noTargetRelationValue?: string[];
  serviceModuleId?: string;
  loginId?: string;
}

export interface FilterConditionGroup {
  filterConditionGroupName: "STATIC" | "DYNAMIC" | "RELATION" | "TAG";
  filterConditionList: FilterCondition[];
}

export enum ChartTimeGranularity {
  YEARLY = "YEARLY",
  QUARTERLY = "QUARTERLY",
  MONTHLY = "MONTHLY",
  WEEKLY = "WEEKLY",
  DAILY = "DAILY",
}

export enum ChartRecentTimeGranularity {
  ALL_TIME = "ALL_TIME",
  LAST_YEAR = "LAST_YEAR",
  LAST_QUARTER = "LAST_QUARTER",
  LAST_MONTH = "LAST_MONTH",
  LAST_WEEK = "LAST_WEEK",
  LAST_DAY = "LAST_DAY",
  SPECIFIC_DATE = "SPECIFIC_DATE",
}

export enum OrgChartReportMode {
  TAG = "TAG",
  DYNAMIC = "DYNAMIC",
  STATIC = "STATIC",
}

export enum ChartTypes {
  // STACK = "bar",
  PIE = "pie",
  BAR = "bar",
  LINE = "line",
}

export enum SummaryMethodTypes {
  RECORDS = "RECORDS",
  TOTAL = "TOTAL",
  AVERAGE = "AVERAGE",
  MAXIMUM = "MAXIMUM",
  MINIMUM = "MINIMUM",
}

export enum FilterConditionsTypes {
  AND = "AND",
  OR = "OR",
}

export enum ColumnType {
  CHOICE_MULTI = "CHOICE_MULTI",
  CHOICE_ONE = "CHOICE_ONE",
  DATE = "DATE",
  DATETIME = "DATETIME",
  DATERANGE = "DATERANGE",
  DATETIMERANGE = "DATETIMERANGE",
  TEXT = "TEXT",
  FILE = "FILE",
  NUMBER = "NUMBER",
  CHOICE_ONE_DROPDOWN = "CHOICE_ONE_DROPDOWN",
  TEXT_MULTI = "TEXT_MULTI",
}

export enum ColumnRelatedServiceModuleValue {
  CRM_User = "CRM_USER",
  CRM_Partner = "CRM_PARTNER",
  HRM_Member = "HRM_MEMBERS",
  Event = "EVENT",
  Bulletin = "BULLETIN",
  Article = "ARTICLE",
}

export enum DateRangeLimit {
  DISABLE_FEATURE = "DISABLE_FEATURE",
  DISABLE_PAST = "DISABLE_PAST",
}

export interface TableColumn {
  id: number;
  columnName: string;
  isSort: 0 | 1;
  sortKey?: string;
  // For table
  isTable?: 0 | 1;
  // For edit column
  isEdit?: 0 | 1;
  isEditFix?: 0 | 1;
  columnType?: ColumnType;
  dateRangeLimit_?: DateRangeLimit;
  verifyType_?: string;
  keyValueMap?: {
    [label: string]: string;
  };
  columnValidatorRegex?: string;
}

export interface OrganizationRole {
  organizationRoleId: string;
  organization: Organization;
  organizationRoleCreateDate: string;
  organizationRoleUpdateDate: string;
  organizationRoleNameZh: string;
  organizationRoleNameEn?: string;
  organizationRoleStatus: number;
  organizationRoleFix: number;
  organizationRoleAdmin: number;
  serviceModule: ServiceModule;
}

export interface OrganizationMember {
  organization: Organization;
  member: Member;
  organizationRoleList: OrganizationRole[];
  organizationMemberCreateDate?: string;
  organizationMemberUpdateDate?: string;
  organizationMemberHourSalary?: number;
  organizationMemberMonthSalary?: number;
  loginId?: string;
}

export interface Member {
  loginId: string;
  memberCreateDate: string;
  memberCreateDateString: string;
  memberUpdateDate: string;
  memberUpdateDateString: string;
  memberAccount: string;
  memberName: string;
  memberEmail: string;
  memberAccountStatus: string;
  memberPhone: string;
  memberBirth?: string;
  memberGender?: number;
  isDelete: number;

  hasMemberPassword?: number;
  memberGoogleId?: string;
  isTestList?: number;
  loginCheck?: false;
  organizationMemberCheck?: false;
}

export interface MemberInformationCopy {
  memberInformationCopyId: string;
  creator: {
    loginId: string;
    loginCheck: boolean;
    organizationMemberCheck: boolean;
  };
  memberInformationCopyType: "JSON" | "HTML";
  memberInformationCopyStatus: "PENDING" | "SUCCESS";
  memberInformationCopyFileSize: number;
  memberInformationCopyCreateDate: string;
  memberInformationCopyExpiredDate: string;
}

export enum Locale {
  EN_US = "en_US",
  ZH_TW = "zh_TW",
  JA_JP = "ja_JP",
}

export interface FilterSearch {
  startIndex?: number;
  size?: number;
  query?: string;
  equal?: Equal[];
  range?: Range[];
  sort?: Sort;
  locale?: Locale;
}

export interface FilterMessageSearch {
  startIndex?: number;
  size?: number;
  equal?: Equal[];
  locale?: string;
}

export interface FilterView {
  filterViewId: string;
  filterViewName: string;
  serviceModuleValue: string;
  filterViewNo: number;
  isPublic: number;
  organization: { organizationId: string };
  creator: { loginId: string };
  filterObject: FilterSearch;
}

export interface Equal {
  filterKey: string;
  value?: string[];
  columnId?: string;
  type?: string;
}

export interface Range {
  filterKey: string;
  from: string | number;
  to: string | number;
  columnId?: string;
  type?: string;
}

export interface Sort {
  sortKey: string;
  order: string;
}

export interface OrganizationMemberRole {
  organizationMemberRoleId: string;
  organizationRole: OrganizationRole;
  organizationMember: OrganizationMember;
  organizationMemberRoleCreateDate: string;
  organizationMemberRoleUpdateDate: string;
  organizationRoleModulePermissionList: ModulePermission[];
}

export interface OrganizationMemberGroup {
  organizationMemberGroupId: string;
  organizationGroup: {
    organizationGroupId: string;
    organizationGroupName: string;
  };
  organizationMember: OrganizationMember;
  organizationMemberGroupCreateDate: string;
  organizationMemberGroupUpdateDate: string;
}

export interface ServiceModule {
  serviceModuleId: string;
  serviceMainModule: ServiceMainModule;
  serviceModuleCreateDate: string;
  serviceModuleUpdateDate: string;
  serviceModuleNameZh: string;
  serviceModuleNameEn: string;
  serviceModuleValue: string;
  serviceModuleStandard: number;
  serviceModulePermissionList: ModulePermission[];
  serviceModuleNo: number;
}

export interface ServiceMainModule {
  serviceMainModuleId: string;
  serviceMainModuleNameZh: string;
  serviceMainModuleNameEn: string;
  serviceModuleList?: ServiceModule[];
}

export interface OrganizationModule {
  organizationModuleId: string;
  organization: Organization;
  serviceMainModule: ServiceMainModule;
  organizationModuleCreateDate: string;
  organizationModuleUpdateDate: string;
}

export interface OrganizationRoleModule {
  organizationRoleModuleId: string;
  organizationRole: {
    organizationRoleId: string;
  };
  serviceModule: {
    serviceModuleId: string;
  };
  organizationRoleModuleCreateDate: string;
  organizationRoleModuleUpdateDate: string;
  organizationRoleModulePermissionList: ModulePermission[];
}

export type ServiceModuleMap =
  | {
      [key: string]: ModulePermission[];
    }
  | Record<string, never>;

export type ModuleRouteMapping<K extends string> = {
  [key in K]: string[];
};

export interface Route {
  path?: string;
  pathParent?: string;
  breadcrumbName?: string;
  menuIcon?: ReactNode;
  collapse?: boolean;
  routes?: Route[];
}

export enum ModulePermission {
  READ = "READ",
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  UPDATE_ALL = "UPDATE_ALL",
  DELETE = "DELETE",
  DELETE_ALL = "DELETE_ALL",
  LIST = "LIST",
  COMMENT = "COMMENT",
  AUTH = "AUTH",
  SUBMIT_REVIEW = "SUBMIT_REVIEW",
  AUDIT = "AUDIT",
  SHARE = "SHARE",
}

export enum ServiceModulePermissionMapping {
  LIST = "瀏覽所有資料",
  READ = "瀏覽被授權資料",
  CREATE = "新增",
  UPDATE = "修改",
  UPDATE_ALL = "修改全部",
  DELETE = "刪除",
  DELETE_ALL = "刪除全部",
  COMMENT = "評論",
  SUBMIT_REVIEW = "提交審核",
  AUDIT = "審核",
  AUTH = "授權",
  SHARE = "分享",
}

export interface UserModulePermission {
  serviceSubModuleId: string;
  serviceModule: {
    serviceModuleId: string;
  };
  serviceSubModuleNameZh: string;
  serviceSubModuleNameEn: string;
  serviceSubModuleValue: string;
  erviceSubModuleNo: number;
  permissionMap: {
    [key: string]: string;
  };
}

export interface MessagesModule {
  total: number;
  source: MessageItem[];
}
export interface MessageItem {
  messageId: string;
  organization: {
    organizationId: string;
  };
  sender: {
    memberName: string;
    loginCheck: boolean;
    organizationMemberCheck: boolean;
  };
  messageInfo: {
    messageInfoId: string;
    messageInfoTargetId: string;
    messageInfoAction: string;
    messageInfoTargetName: string;
    messageInfoType: string;
    messageInfoTitle: string;
  };
  isRead: number;
  messageCreateDate: string;
}
export interface WordLibrary {
  [key: string]: string;
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
  serviceSubModuleCreateDateString: string;
  serviceSubModuleUpdateDate: string;
  serviceSubModuleUpdateDateString: string;
  permissionMap: {
    [key: string]: string;
  };
}

export interface ShareModuleList extends OrganizationMember {
  serviceSubModuleList: ServiceSubModule[];
}

export interface OrganizationModuleShare {
  organization: {
    organizationId: string;
  };
  organizationShareShortUrl: string;
  organizationShareId: string;
  targetId: string;
  organizationShareTargetType: string;
  isSharePasswordRequired: string;
}

export interface OnboardingTourType {
  tabName: string;
  tabType: string;
  steps: Step[];
}

export interface OnboardingTourAPIData {
  [seviceModuleName: string]: OnboardingTourType[];
}

export interface OnboardingTourUserProgress {
  memberOnboardingTourStepId: string;
  member: Member;
  onboardingTourStep: {
    onboardingTourStepId: string;
    onboardingTourStepTotal: number;
    serviceModuleValue: string;
    serviceSubModuleValue: string;
    onboardingTourStepCreateDate: string;
    onboardingTourStepUpdateDate: string;
  };
  memberOnboardingTourStepIndex: number;
  memberOnboardingTourStepCreateDate: string;
  memberOnboardingTourStepUpdateDate: string;
  memberOnboardingTourStepStatus: string;
}

export interface OnboardingTourUserProgressAPISort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface OnboardingTourUserProgressAPIResponseData {
  content: OnboardingTourUserProgress[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
    sort: OnboardingTourUserProgressAPISort;
  };
  sort: OnboardingTourUserProgressAPISort;
  size: number;
  totalElements: number;
  totalPages: number;
}
