export interface UrlParams {
  serviceProductId?: string;
  orderId?: string;
}

export enum FilePathType {
  USER_FILE = "USER_FILE",
  USER_AGREEMENT = "USER_AGREEMENT",
}

export enum ServiceModuleValue {
  // COMMON is only for client side common pages
  COMMON = "COMMON",
  // COMMON is only for client side common pages

  /**
   * SETTINGS_PRIVACY is only for client side setting pages
    This Routing could not be used in Sidebar menu, but other place.
    And need be found in privateLayout...
   */
  CALENDAR = "CALENDAR",
  SETTINGS_PRIVACY = "SETTINGS_PRIVACY",
  // SETTINGS_PRIVACY is only for client side setting pages
  SUPPORT = "SUPPORT",
  FEEDBACK = "FEEDBACK",
  // Here is not page module only for api.
  CMS = "CMS",
  CMS_IMAGE_SLIDER = "CMS_IMAGE_SLIDER",
  CMS_FEEDBACK = "CMS_FEEDBACK",
  USER_FILE = "USER_FILE",
  BULLETIN_FILE = "BULLETIN_FILE",
  WELCOME_IMAGE = "WELCOME_IMAGE",
  FINISH_IMAGE = "FINISH_IMAGE",
  USER_AGREEMENT = "USER_AGREEMENT",
  CMS_ABOUT_US_CUSTOMER = "CMS_ABOUT_US_CUSTOMER",
  // Here is not page module only for api.

  DASHBOARD_BILLING = "DASHBOARD_BILLING",
  DASHBOARD_CRM = "DASHBOARD_CRM",
  DASHBOARD_FEEDBACK = "DASHBOARD_FEEDBACK",
  DASHBOARD_FILES = "DASHBOARD_FILES",
  BILLING = "BILLING",
  CMS_ABOUT_US = "CMS_ABOUT_US",
  CMS_BLOG = "CMS_BLOG",
  CMS_HOMEPAGE = "CMS_HOMEPAGE",
  CMS_PRODUCT = "CMS_PRODUCT",
  CMS_MENU = "CMS_MENU",
  CMS_SOLUTION = "CMS_SOLUTION",
  CRM = "CRM",
  FILES = "FILES",
  HRM_MEMBERS = "HRM_MEMBERS",
  HRM_ROLES = "HRM_ROLES",
  NOTIFICATION = "NOTIFICATION",
  ORGANIZATION = "ORGANIZATION",
  ORGANIZATION_GROUP = "ORGANIZATION_GROUP",
  PRODUCT = "PRODUCT",
  TAG = "TAG",
  EVENT = "EVENT",
  FINANCE_TEMPLATE = "FINANCE_TEMPLATE",
  EVENT_REVIEW = "EVENT_REVIEW",
  CRM_USER = "CRM_USER",
  CRM_PARTNER = "CRM_PARTNER",
  DYNAMIC_COLUMN = "DYNAMIC_COLUMN",
  BULLETIN = "BULLETIN",
  FULL_TEXT_SEARCH = "FULL_TEXT_SEARCH",
  ARTICLE = "ARTICLE",
  UPLOADFILE = "UPLOADFILE",
  ORDER_MODULE = "ORDER_MODULE",
  SMS = "SMS",
  SMS_TEMPLATE = "SMS_TEMPLATE",
  SES = "SES",
  SES_TEMPLATE = "SES_TEMPLATE",
  MESSAGES = "MESSAGES",
}

export enum SmsSendType {
  SHARE = "SHARE",
  CUSTOMIZE = "CUSTOMIZE",
}

export enum ServiceModuleValueMap {
  CMS_PRODUCT = "網站管理-產品管理",
  CMS_BLOG = "網站管理-文章管理",
  ME_FEEDBACK = "聯絡我們",
  EVENT = "事件管理",
  CRM_USER = "CRM-個人",
  CRM_PARTNER = "CRM-單位",
  BULLETIN = "佈告欄",
  ARTICLE = "文章討論",
  FILES = "檔案管理",
}

export type RoutesServiceModuleValue = Exclude<
  ServiceModuleValue,
  | ServiceModuleValue.CMS
  | ServiceModuleValue.CMS_IMAGE_SLIDER
  | ServiceModuleValue.USER_FILE
  | ServiceModuleValue.BULLETIN_FILE
  | ServiceModuleValue.WELCOME_IMAGE
  | ServiceModuleValue.FINISH_IMAGE
  | ServiceModuleValue.USER_AGREEMENT
  | ServiceModuleValue.CMS_ABOUT_US_CUSTOMER
>;

export enum Locale {
  EN_US = "en_US",
  ZH_TW = "zh_TW",
  JA_JP = "ja_JP",
}

export enum LocaleMap {
  en_US = "English",
  zh_TW = "繁體中文",
}

export enum PageType {
  INDEX = "INDEX",
  ABOUTUS = "ABOUTUS",
  PRODUCTLIST = "PRODUCTLIST",
  PRODUCTDETAIL = "PRODUCTDETAIL",
  SOLUTION = "SOLUTION",
  SOLUTIONLIST = "SOLUTIONLIST",
  SOLUTIONDETAIL = "SOLUTIONDETAIL",
  BLOG = "BLOG",
  BLOGDETAIL = "BLOGDETAIL",
  POLICY = "POLICY",
  CUSTOMIZE = "CUSTOMIZE",
}

export enum OrganizationMediaSizeType {
  MOBILE = "MOBILE",
  PC = "PC",
  NORMAL = "NORMAL",
}

export enum OrganizationMediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
}

export enum ContentType {
  INDEX_SLOGAN = "INDEX_SLOGAN",
  ABOUTUS = "ABOUTUS",
  WHY_CHOOSE_US = "WHY_CHOOSE_US",
  OUR_CLIENT = "OUR_CLIENT",
  OUR_PARTNERS = "OUR_PARTNERS",
  INFORMATION = "INFORMATION",
  PRODUCT_MEDIA_SLIDER = "PRODUCT_MEDIA_SLIDER",
  PRODUCT_DESCRIPTION = "PRODUCT_DESCRIPTION",
  PRODUCT_FEATURES = "PRODUCT_FEATURES",
  PRODUCT_FEATURES_MEDIA = "PRODUCT_FEATURES_MEDIA",
  PRODUCT_FEATURES_LIST = "PRODUCT_FEATURES_LIST",
  PRODUCT_CONFIGURATION = "PRODUCT_CONFIGURATION",
  PRODUCT_SPECIFICATION = "PRODUCT_SPECIFICATION",
  PRODUCT_PERIPHERAL_DEVICE = "PRODUCT_PERIPHERAL_DEVICE",
  PRODUCT_DOWNLOAD = "PRODUCT_DOWNLOAD",
  PRODUCT_VIDEO = "PRODUCT_VIDEO",
  PRODUCT_RELATION = "PRODUCT_RELATION",
  DOWNLOAD_FILE = "DOWNLOAD_FILE",
  POLICY_PRIVACY = "POLICY_PRIVACY",
  POLICY_COOKIE = "POLICY_COOKIE",
  CORE_VALUE = "CORE_VALUE",
  CORE_SPIRIT = "CORE_SPIRIT",
  ADVANTAGE = "ADVANTAGE",
  SUSTAINABLE_DEVELOPMENT = "SUSTAINABLE_DEVELOPMENT",
  OUR_PARTNERS_SLIDER = "OUR_PARTNERS_SLIDER",
  SOLUTION_RELATION = "SOLUTION_RELATION",
  CUSTOMIZE = "CUSTOMIZE",
}

export enum SolutionCmsContentType {}

export enum OrganizationCmsMenuType {
  SUB_MENU = "SUB_MENU",
  TAG_GROUP = "TAG_GROUP",
  OBJECT_NAME = "OBJECT_NAME",
}

export enum OrganizationInvitationStatus {
  INVITED_BUT_NOT_ACCEPTED = 1,
  DECLINE_THE_INVITATION = 2,
  ACCEPT_THE_INVITATION = 3,
  CANCEL_THE_INVITATION = 4,
  INVITATION_EXPIRED = 5,
}

export enum OrganizationInvitationStatusMap {
  "",
  "已邀請未接受",
  "已邀請拒絕",
  "接受邀請",
  "取消邀請",
  "邀請過期",
}

export enum ColumnTable {
  OrganizationUser = "ORGANIZATION_USER",
  OrganizatonPartner = "ORGANIZATION_PARTNER",
  OrganizationEvent = "ORGANIZATION_EVENT",
  OrganizationGroup = "ORGANIZATION_GROUP",
}

export enum Table {
  MEMBERS = "members",
  USERS = "users",
  EVENTS = "events",
  PERMISSION = "permission",
  USER_SHARES = "user-shares",
  BULLETIN = "bulletins",
  FEEDBACK = "feedbacks",
  TAGS = "tags",
  TAGGROUPS = "tag-groups",
  UPLOADFILE = "files",
  ARTICLES = "articles",
  SMS = "sms",
  PARTNERS = "partners",
  SMS_TEMPLATE = "SmsTemplate",
  SES_TEMPLATE = "SesTemplate",
  COLUMNS = "columns",
  SES = "ses",
  COLUMN_GROUPS = "column-groups",
  COLUMN_TEMPLATES = "column-templates",
  FINANCE_TEMPLATE = "finance-templates",
  ORGANIZATION_GROUP = "groups",
}

export enum GenderMap {
  "男" = 1,
  "女" = 2,
}

export enum OrganizationReviewStatusType {
  REJECT = "REJECT",
  PROCESSING = "PROCESSING",
  SUCCESS = "SUCCESS",
}

export enum OrganizationReviewStatusTypeMap {
  REJECT = "審核駁回",
  PROCESSING = "審核中",
  SUCCESS = "審核成功",
}

export enum OrganizationFinanceType {
  INCOME = "INCOME",
  EXPENDITURE = "EXPENDITURE",
  ASSET = "ASSET",
  DEBT = "DEBT",
}

export enum OrganizationFinanceItemType {
  SALARY = "SALARY",
  BOUNS = "BOUNS",
}

export enum OrganizationSmsSendStatus {
  SUCCESS = "SUCCESS",
  FAIL = "FAIL",
}

export enum OrganizationSesSendStatus {
  SUCCESS = "SUCCESS",
  FAIL = "FAIL",
}

export enum ColumnTypeMap {
  TEXT = "文字",
  CHOICE_MULTI = "多選",
  CHOICE_ONE = "單選",
  DATE = "日期",
  DATETIME = "日期時間",
  FILE = "檔案",
  NUMBER = "數字",
  CHOICE_ONE_DROPDOWN = "下拉單選",
  TEXT_MULTI = "多行文字",
}

export enum ColumnRelatedServiceModuleValueMap {
  CRM_USER = "客戶管理-個人",
  CRM_PARTNER = "客戶管理-單位",
  HRM_MEMBERS = "人員管理-成員",
  EVENT = "事件",
  BULLETIN = "佈告欄",
  ARTICLE = "文章",
}

export enum LineEventTargetTypeMap {
  MESSAGE = "訊息",
  FOLLOW = "追蹤",
  UNFOLLOW = "取消追蹤",
}

export enum SourceTargetTypeMap {
  USER = "個人",
  GROUP = "群組",
  ROOM = "房間",
}

export enum LineMessageTypeMap {
  TEXT = "文字",
  AUDIO = "音訊",
  VIDEO = "影片",
  IMAGE = "圖片",
  FILE = "檔案",
  LOCATION = "位置",
  STICKER = "貼圖",
}
