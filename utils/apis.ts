import {
  downloadFetcher,
  uploadFetcher,
  fetcher,
} from "@eGroupAI/hooks/apis/fetchers";
import { getUploadFileFormData } from "@eGroupAI/hooks/apis/apis";
import queryString from "query-string";
import {
  LogApiPayload,
  LoginApiPayload,
  NormalLoginApiPayload,
  MFALoginApiPayload,
  NormalSignupApiPayload,
  EmailVerifyPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  CreateOrgApiPayload,
  UpdateOrgInfoApiPayload,
  GetOrgMemberPermissionApiPayload,
  GetOrgMemberInfoApiPayload,
  UpdateMemberInfoApiPayload,
  UpdateMemberRoleApiPayload,
  ExportOrgMemberPdfApiPayload,
  DeleteOrgMemberApiPayload,
  BindingMemberApiPayload,
  GetBindingUrlApiPayload,
  CreateOrgRoleApiPayload,
  UpdateOrgRoleApiPayload,
  DeleteOrgRoleApiPayload,
  UpdateOrgRoleModuleAndPermissionApiPayload,
  CreateOrgMediaSliderApiPayload,
  UpdateOrgMediaSliderApiPayload,
  UpdateOrgMediaSliderMediaApiPayload,
  DeleteOrgMediaSliderApiPayload,
  UpdateOrgMediaSlidersSortApiPayload,
  CreateOrgSolutionApiPayload,
  UpdateOrgSolutionApiPayload,
  DeleteOrgSolutionApiPayload,
  UpdateOrgSolutionsSortApiPayload,
  CreateOrgMediaApiPayload,
  UpdateOrgMediaApiPayload,
  DeleteOrgMediaApiPayload,
  SortOrgMediaApiPayload,
  CreateOrgProductApiPayload,
  UpdateOrgProductApiPayload,
  UpdateOrgProductSortApiPayload,
  DeleteOrgProductApiPayload,
  UpdateOrgCmsContentApiPayload,
  UpdateOrgCmsContentSortApiPayload,
  DeleteOrgCmsContentApiPayload,
  CreateOrgTargetRelationApiPayload,
  DeleteOrgTargetRelationApiPayload,
  CreateOrgFileTargetApiPayload,
  DeleteOrgFileTargetApiPayload,
  FileApiPayload,
  CreateOrgBlogApiPayload,
  UpdateOrgBlogApiPayload,
  CreateOrgTargetTagsApiPayload,
  DeleteOrgTargetTagsApiPayload,
  DeleteOrgBlogApiPayload,
  CreateOrgTagApiPayload,
  UpdateOrgTagApiPayload,
  DeleteOrgTagApiPayload,
  UpdateOrgTagGroupApiPayload,
  CreateOrgTagGroupApiPayload,
  DeleteOrgTagGroupApiPayload,
  UpdateOrgCmsMenuApiPayload,
  UpdateOrgCmsSubMenuApiPayload,
  UpdateOrgCmsPageMenuApiPayload,
  UpdateOrgCmsSeoApiPayload,
  DeleteOrgInvitationApiPayload,
  CreateOrgInvitationApiPayload,
  UpdateOrgMemberInvitationApiPayload,
  ImportUsersExcelApiPayload,
  CreateOrgUsersApiPayload,
  CreateOrgSmsApiPayload,
  CreateOrgEventApiPayload,
  DeleteOrgEventApiPayload,
  UpdateOrgEventApiPayload,
  CreateOrgUserApiPayload,
  UpdateOrgUserApiPayload,
  CreateOrgGroupApiPayload,
  UpdateOrgGroupApiPayload,
  DeleteOrgGroupApiPayload,
  BatchUpdateOrgUserColumnApiPayload,
  DeleteOrgUserApiPayload,
  CreateOrgShareApiPayload,
  UpdateUserApiPayload,
  UploadFilesApiPayload,
  CreateOrgFinanceTemplateApiPayload,
  UpdateOrgFinanceTemplateApiPayload,
  DeleteOrgFinanceTemplateColumnApiPayload,
  CreateOrgSalaryTemplateApiPayload,
  UpdateOrgSalaryTemplateApiPayload,
  DeleteOrgSalaryTemplateApiPayload,
  DeleteOrgSalaryTemplateColumnApiPayload,
  CreateOrgReviewApiPayload,
  UpdateOrgReviewApiPayload,
  CreateFinanceTargetsApiPayload,
  CreateOrgSmsesApiPayload,
  DeleteOrgFinanceTemplateApiPayload,
  CreateOrgCommentApiPayload,
  CreateOrgFinanceTargetsApiPayload,
  ExportOrgUserPdfApiPayload,
  ExportOrgUsersExcelApiPayload,
  ExportOrgMembersExcelApiPayload,
  DeleteFinanceTargetApiPayload,
  UpdateOrgFileNameApiPayload,
  GetImportDynamicColumnsApiPayload,
  CreateOrgTargetsTagsApiPayload,
  DeleteOrgTargetsTagsApiPayload,
  UpdateOrgDynamicColumnApiPayload,
  DeleteColumnByFilterApiPayload,
  DeleteBatchColumnApiPayload,
  DeleteOrgDynamicColumnApiPayload,
  DeleteOrgDynamicColumnOptionApiPayload,
  SortOrgDynamicColumnApiPayload,
  SortOrgDynamicColumnOptionsApiPayload,
  UpdateMemberTargetAuthsApiPayload,
  CreateMemberTargetAuthsApiPayload,
  DeleteMemberTargetAuthsApiPayload,
  ExportSelectedOrgUsersExcelApiPayload,
  ExportSelectedOrgMembersExcelApiPayload,
  CreateOrgTargetsEventsApiPayload,
  DeleteMemberPermissionApiPayload,
  CreateMemberPermissionApiPayload,
  CreateMemberTargetModuleAuthPayload,
  DelteMemberTargetModuleAuthPayload,
  GetOrgEventsTargetRelationsApiPayload,
  CreateOrgTargetShareApiPayload,
  DeleteOrgTargetShareApiPayload,
  CreateBulletinApiPayload,
  UpdateBulletinApiPayload,
  DeleteBulletinApiPayload,
  CreateBulletinTagListPayload,
  DeleteBulletinTagApiPayload,
  CreateOrgArticleApiPayload,
  UpdateOrgArticleApiPayload,
  DeleteOrgArticleApiPayload,
  CreateOrgArticleCommentApiPayload,
  UpdateOrgArticleCommentApiPayload,
  DeleteOrgArticleCommentApiPayload,
  CreateOrDeleteOrgArticleCommentLikeApiPayload,
  FullTextSearchApiPayload,
  GetOrgCalendarEventsApiPayload,
  CreateOrgCalendarApiPayload,
  UpdateOrgCalendarApiPayload,
  DeleteOrgCalendarApiPayload,
  DeleteOrgCalendarOauthApiPayload,
  GetFilterViewApiPayload,
  CreateFilterViewApiPayload,
  DeleteFilterViewApiPayload,
  UpdateFilterViewApiPayload,
  GetOrgCalendarOAuthUrlApiPayload,
  UpdateFilterViewPublicApiPayload,
  CreateUploadFileApiPayload,
  UpdateUploadFileApiPayload,
  DeleteUploadFileApiPayload,
  UpdateMemberPasswordApiPayload,
  DeleteAccountApiPayload,
  VerifyAccountBy3rdParty,
  VerifyAccountByPassword,
  MemberInformationCopyApiPayload,
  CreateOrgPartnerApiPayload,
  UpdateOrgPartnerApiPayload,
  DeleteOrgPartnerApiPayload,
  CreateOrgPartnerEventPayload,
  SendCustomSmsToAllUsersPayload,
  SendCustomSmsPayload,
  SendCustomSesToAllUsersPayload,
  SendCustomSesPayload,
  SendCustomSesTestPayload,
  GetOrgSearchTextRecordsApiPayload,
  CreateOrgDynamicColumnGroupPayload,
  UpdateOrgDynamicColumnGroupPayload,
  DeleteOrgDynamicColumnGroupApiPayload,
  CreateOrgDynamicColumnTemplateEventPayload,
  UpdateOrgDynamicColumnTemplateEventPayload,
  CreateOrgDynamicColumnTemplateUserPayload,
  UpdateOrgDynamicColumnTemplateUserPayload,
  CreateOrgDynamicColumnTemplatePartnerPayload,
  UpdateOrgDynamicColumnTemplatePartnerPayload,
  DeleteOrgDynamicColumnTemplateApiPayload,
  GetOrgDynamicColumnTemplateApiPayload,
  CheckUniqueValueApiPayload,
  DeleteSmsTemplateApiPayload,
  CreateSmsTemplateApiPayload,
  UpdateSmsTemplateApiPayload,
  CreateSmsTemplateTagListPayload,
  DeleteSmsTemplateTagApiPayload,
  CreateSesTemplateApiPayload,
  UpdateSesTemplateApiPayload,
  DeleteSesTemplateApiPayload,
  CreateSesTemplateTagListPayload,
  DeleteSesTemplateTagApiPayload,
  SendCustomSmsToUserPayload,
  GetAssociatedDataApiPayload,
  GetAllMessagesPayload,
  GetUnreadMessagesPayload,
  MakeOneMessageHaveReadPayload,
  MakeAllMessageHaveReadPayload,
  UpdateMemberGroupApiPayload,
  CreateTargetCommentApiPayload,
  CreateOrDeleteTargetCommentLikeApiPayload,
  UpdateTargetCommentApiPayload,
  DeleteTargetCommentApiPayload,
  RestoreOrgTargetHistoryRecordApiPayload,
  GetOrgTargetHistoryRecordVersionApiPayload,
  CreateOrgModuleShareApiPayload,
  GetOrgModuleShareApiPayload,
  SendOrgModuleShareEmailInvitesApiPayload,
  updatePasswordOrgModuleShareApiPayload,
  AccessOrgModuleShareApiPayload,
  UpdateMemberOnboardingTourStepApiPayload,
  CreateOrgFeedbackApiPayload,
  DeleteOrgShareTemplateApiPayload,
  CreateOrgShareTemplateApiPayload,
  UpdateOrgShareTemplateApiPayload,
  GetOrgShareTemplateApiPayload,
  CreateTargetHistoryRecordApiPayload,
  GetOrganizationByDomainNameApiPayload,
  GetOrganizationSettingsApiPayload,
  MFAResendApiPayload,
  ExportOrgEventsExcelApiPayload,
  ExportSelectedOrgEventsExcelApiPayload,
  LoginAPIResponse,
  MFALoginAPIResponse,
  GetWidgetTemplateListApiPayload,
  GetWidgetTemplateDetailApiPayload,
  CreateOrgCmsContentApiPayload,
  UploadFilesBatchDeleteApiPayload,
  PostGetChartReportResultApiPayload,
  CreateOrgReportSavingApiPayload,
  GetOrgReportListApiPayload,
  GetOrgReportDetailApiPayload,
  UnbindLineApiPayload,
  UpdateOrgReportApiPayload,
  DeleteOrgReportApiPayload,
  MergeFilesApiPayload,
  ResendInvitationsApiPayload,
  UploadFilesBatchDownloadApiPayload,
  DeleteCmsFeedback,
  BatchDeleteCmsFeedback,
} from "interfaces/payloads";

import {
  OrganizationColumn,
  ImportData,
  OrganizationEvent,
  OrganizationMediaSlider,
  OrganizationShare,
  OrganizationModuleShare,
  OrganizationTag,
  OrganizationTagGroup,
  UploadFile,
  OrganizationTargetHistoryFullContent,
  AccessOrganizationModuleShare,
  ColumnGroup,
  OrganizationShareTemplate,
  OrganizationInfoByDomain,
  OrganizationSetting,
  WidgetTemplate,
  WidgetTemplateDetail,
  OrganizationCmsContent,
  ChartReportResult,
  OrganizationReport,
  type OrganizationReportDetail,
} from "interfaces/entities";
import { AxiosRequestConfig } from "axios";
import {
  OnboardingTourUserProgress,
  OrganizationRole,
} from "@eGroupAI/typings/apis";

const tools = {
  /**
   * Log errors.
   */
  createLog: (payload?: LogApiPayload) => fetcher.post("/logs", payload),
};

const member = {
  /**
   * Get Google login URL
   */
  getGoogleLoginUrl: () => fetcher.get("/member/google/login-url"),
  /**
   * Get Facebook login URL
   */
  getFbLoginUrl: () => fetcher.get("/member/facebook/login-url"),
  /**
   * Google login
   */
  googleLogin: (payload?: LoginApiPayload) =>
    fetcher.post<LoginAPIResponse>("/member/google/login", payload),

  /**
   * Facebook login
   */
  fbLogin: (payload?: LoginApiPayload) =>
    fetcher.post<LoginAPIResponse>("/member/facebook/login", payload),
  /**
   * Normal login
   */
  normalLogin: (payload?: NormalLoginApiPayload) =>
    fetcher.post<LoginAPIResponse>("/login", payload),
  /**
   *
   * mfc-login
   */
  mfaLogin: (payload?: MFALoginApiPayload) =>
    fetcher.post<MFALoginAPIResponse>("/mfa-login", payload),
  /**
   *
   * mfc-resend
   */
  mfaResend: (payload?: MFAResendApiPayload) =>
    fetcher.post("/mfa-resend", payload),
  /**
   * Normal signup
   */
  normalSignup: (payload?: NormalSignupApiPayload) =>
    fetcher.post("/register", payload),
  /**
   * Logout
   */
  logout: () => fetcher.post("/logout"),
  /**
   * email verifycation
   */
  verifyAccount: (payload?: EmailVerifyPayload) =>
    fetcher.post("/verify-account", payload),
  /**
   * forgot password
   */
  forgotPassword: (payload?: ForgotPasswordPayload) =>
    fetcher.post("/forgot-password", payload),
  /**
   *reset password
   */
  resetPassword: (payload?: ResetPasswordPayload) =>
    fetcher.post("/reset-password", payload),
  /**
   * Member set password
   */
  updateMemberPassword: (payload?: UpdateMemberPasswordApiPayload) =>
    fetcher.patch("/member/password", payload),
  /**
   * Update org info
   */
  updateOrgInfo: (payload?: UpdateOrgInfoApiPayload) => {
    const { organizationId, locale, ...others } = payload ?? {};
    return fetcher.patch(
      `/member/organizations/${organizationId}?${queryString.stringify({
        locale,
      })}`,
      others
    );
  },
  /**
   * get Org Member Info
   */
  getOrgMemberInfo: (payload?: GetOrgMemberInfoApiPayload) => {
    const { organizationId, memberLoginId, ...others } = payload || {};
    return fetcher.get(
      `/organizations/${organizationId}/members/${memberLoginId}?${queryString.stringify(
        {
          others,
        }
      )}`
    );
  },
  /**
   * update Member Info
   */
  updateMemberInfo: (payload?: UpdateMemberInfoApiPayload) =>
    fetcher.patch("/member/info", payload),

  exportOrgMemberPdf: (payload?: ExportOrgMemberPdfApiPayload) => {
    const { organizationId, loginId } = payload || {};
    return downloadFetcher.post(
      `/organizations/${organizationId}/members/${loginId}/export-pdf`
    );
  },

  deleteOrgMember: (payload?: DeleteOrgMemberApiPayload) => {
    const { organizationId, loginId } = payload || {};
    return fetcher.delete(
      `/organizations/${organizationId}/members/${loginId}`
    );
  },

  bindingMemberWith3rdParty: (payload?: BindingMemberApiPayload) => {
    const { type, thirdParty, ...others } = payload || {};
    if (type === "bind")
      return fetcher.post(`member/bind/${thirdParty}`, others);
    return fetcher.post(`member/unbind/${thirdParty}`);
  },

  getBindingUrl: (payload?: GetBindingUrlApiPayload) => {
    const { thirdParty } = payload || {};
    return fetcher.get(`member/${thirdParty}/binding-url`);
  },

  requestDeleteAccount: (payload?: DeleteAccountApiPayload) =>
    fetcher.post("/member/delete-request", payload),

  verifyAccountBy3rdParty: (payload?: VerifyAccountBy3rdParty) => {
    const { thirdPartyName, ...other } = payload || {};
    return fetcher.post(`/member/verify/third-party/${thirdPartyName}`, other);
  },

  verifyAccountByPassword: (payload?: VerifyAccountByPassword) =>
    fetcher.post("/member/verify/password", payload),

  createMemberInformationCopy: () => fetcher.post("/member/information-copies"),

  deleteMemberInformationCopy: (payload?: MemberInformationCopyApiPayload) => {
    const { memberInformationCopyId } = payload || {};
    return fetcher.delete(
      `/membebr/information-copies/${memberInformationCopyId}`
    );
  },

  getMemberInformationCopyList: () => fetcher.get("/member/information-copies"),

  getMemberInformationCopyWithId: (
    payload?: MemberInformationCopyApiPayload
  ) => {
    const { memberInformationCopyId } = payload || {};
    return fetcher.get(`/member/information-copies/${memberInformationCopyId}`);
  },

  downloadMemberInformationCopy: (
    payload?: MemberInformationCopyApiPayload
  ) => {
    const { memberInformationCopyId } = payload || {};
    return fetcher.post(
      `/member/information-copies/${memberInformationCopyId}/download`
    );
  },

  updateMemberOnboardingTourStep: (
    payload?: UpdateMemberOnboardingTourStepApiPayload
  ) => {
    const { organizationId, memberId, memberOnboardingTourStepId, ...body } =
      payload || {};
    return fetcher.patch<OnboardingTourUserProgress>(
      `/organizations/${organizationId}/members/${memberId}/onboarding-tours/${memberOnboardingTourStepId}`,
      body
    );
  },
};

const org = {
  getOrgCalendarOAuthUrl: (payload?: GetOrgCalendarOAuthUrlApiPayload) => {
    const { organizationId } = payload || {};
    return fetcher.get(`/organizations/${organizationId}/calendars/oauth-url`);
  },
  getOrgMemberPermission: (payload?: GetOrgMemberPermissionApiPayload) => {
    const { organizationId } = payload || {};
    return fetcher.get(`/member/organizations/${organizationId}/module-auth`);
  },
  getOrgModule: (payload?: GetOrgMemberPermissionApiPayload) => {
    const { organizationId } = payload || {};
    return fetcher.get(`/organizations/${organizationId}/modules`);
  },
  createOrgCalendar: (payload?: CreateOrgCalendarApiPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post(`/organizations/${organizationId}/calendars`, others);
  },
  updateOrgCalendar: (payload?: UpdateOrgCalendarApiPayload) => {
    const { organizationId, organizationCalendarId, ...others } = payload || {};
    return fetcher.patch(
      `/organizations/${organizationId}/calendars/${organizationCalendarId}`,
      others
    );
  },
  deleteOrgCalendar: (payload?: DeleteOrgCalendarApiPayload) => {
    const { organizationId, organizationCalendarId } = payload || {};
    return fetcher.delete(
      `/organizations/${organizationId}/calendars/${organizationCalendarId}`
    );
  },
  deleteOrgCalendarOauth: (payload?: DeleteOrgCalendarOauthApiPayload) => {
    const { organizationId } = payload || {};
    return fetcher.delete(`/organizations/${organizationId}/calendars/oauth`);
  },
  getOrgCalendarEvents: (payload?: GetOrgCalendarEventsApiPayload) => {
    const {
      organizationId,
      organizationCalendarId,
      eventStartDateString,
      eventEndDateString,
      ...other
    } = payload || {};
    return fetcher.post<OrganizationEvent[]>(
      `organizations/${organizationId}/search/calendar-events?${queryString.stringify(
        {
          organizationCalendarId,
          eventStartDateString,
          eventEndDateString,
        }
      )}`,
      other
    );
  },
  getOauthCalendarEvents: (payload?: GetOrgCalendarEventsApiPayload) => {
    const {
      organizationId,
      organizationCalendarId,
      eventStartDateString,
      eventEndDateString,
      ...other
    } = payload || {};
    return fetcher.post<OrganizationEvent[]>(
      `organizations/${organizationId}/search/oauth-calendar-events?${queryString.stringify(
        {
          organizationCalendarId,
          eventStartDateString,
          eventEndDateString,
        }
      )}`,
      other
    );
  },
  createOrg: (payload?: CreateOrgApiPayload) => {
    const { locale, ...others } = payload || {};
    return fetcher.post(
      `/member/organizations?${queryString.stringify({
        locale,
      })}`,
      others
    );
  },
  updateMemberRole: (payload?: UpdateMemberRoleApiPayload) => {
    const { organizationId, loginId, ...others } = payload || {};
    return fetcher.post(
      `/organizations/${organizationId}/members/${loginId}/roles`,
      others
    );
  },
  updateMemberGroup: (payload?: UpdateMemberGroupApiPayload) => {
    const { organizationId, loginId, ...others } = payload || {};
    return fetcher.post(
      `/organizations/${organizationId}/members/${loginId}/groups`,
      others
    );
  },
  deleteOrgMember: (payload?: DeleteOrgMemberApiPayload) => {
    const { organizationId, loginId } = payload || {};
    return fetcher.delete(
      `/organizations/${organizationId}/members/${loginId}`
    );
  },
  createOrgRole: (payload?: CreateOrgRoleApiPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post<OrganizationRole>(
      `/organizations/${organizationId}/roles`,
      others
    );
  },
  updateOrgRole: (payload?: UpdateOrgRoleApiPayload) => {
    const { organizationId, organizationRoleId, ...others } = payload || {};
    return fetcher.patch(
      `/organizations/${organizationId}/roles/${organizationRoleId}`,
      others
    );
  },
  deleteOrgRole: (payload?: DeleteOrgRoleApiPayload) => {
    const { organizationId, organizationRoleId } = payload || {};
    return fetcher.delete(
      `/organizations/${organizationId}/roles/${organizationRoleId}`
    );
  },
  updateOrgRoleModuleAndPermission: (
    payload?: UpdateOrgRoleModuleAndPermissionApiPayload
  ) => {
    const { organizationId, organizationRoleId, data } = payload || {};
    return fetcher.post(
      `/organizations/${organizationId}/roles/${organizationRoleId}/modules`,
      data
    );
  },
  createOrgMediaSlider: (payload?: CreateOrgMediaSliderApiPayload) => {
    const { organizationId, locale, ...others } = payload || {};
    return fetcher.post<OrganizationMediaSlider>(
      `/V4/organizations/${organizationId}/media-sliders?${queryString.stringify(
        {
          locale,
        }
      )}`,
      others
    );
  },
  updateOrgMediaSlider: (payload?: UpdateOrgMediaSliderApiPayload) => {
    const { organizationId, organizationMediaSliderId, locale, ...others } =
      payload || {};
    return fetcher.patch<OrganizationMediaSlider>(
      `/V4/organizations/${organizationId}/media-sliders/${organizationMediaSliderId}?${queryString.stringify(
        {
          locale,
        }
      )}`,
      others
    );
  },
  deleteOrgMediaSlider: (payload?: DeleteOrgMediaSliderApiPayload) => {
    const { organizationId, organizationMediaSliderId } = payload || {};
    return fetcher.delete(
      `/V4/organizations/${organizationId}/media-sliders/${organizationMediaSliderId}`
    );
  },
  updateOrgMediaSliderMedia: (
    payload?: UpdateOrgMediaSliderMediaApiPayload
  ) => {
    const { organizationId, organizationMediaSliderId, ...others } =
      payload || {};
    return fetcher.post(
      `/V4/organizations/${organizationId}/media-sliders/${organizationMediaSliderId}/media`,
      others
    );
  },
  updateOrgMediaSlidersSort: (
    payload?: UpdateOrgMediaSlidersSortApiPayload
  ) => {
    const { organizationId, pageType, ...others } = payload || {};
    return fetcher.patch(
      `/V4/organizations/${organizationId}/media-sliders/sort?${queryString.stringify(
        {
          PAGE_TYPE_: pageType,
        }
      )}`,
      others
    );
  },
  createOrgSolution: (payload?: CreateOrgSolutionApiPayload) => {
    const { organizationId, locale, ...others } = payload || {};
    return fetcher.post(
      `/V4/organizations/${organizationId}/solutions?${queryString.stringify({
        locale,
      })}`,
      others
    );
  },
  updateOrgSolution: (payload?: UpdateOrgSolutionApiPayload) => {
    const { organizationId, organizationSolutionId, locale, ...others } =
      payload || {};
    return fetcher.patch(
      `/V4/organizations/${organizationId}/solutions/${organizationSolutionId}?${queryString.stringify(
        {
          locale,
        }
      )}`,
      others
    );
  },
  deleteOrgSolution: (payload?: DeleteOrgSolutionApiPayload) => {
    const { organizationId, organizationSolutionId } = payload || {};
    return fetcher.delete(
      `/V4/organizations/${organizationId}/solutions/${organizationSolutionId}`
    );
  },
  updateOrgSolutionsSort: (payload?: UpdateOrgSolutionsSortApiPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.patch(
      `/V4/organizations/${organizationId}/solutions/sort`,
      others
    );
  },
  createOrgMedia: (payload?: CreateOrgMediaApiPayload) => {
    const { organizationId, locale, targetId, ...others } = payload || {};
    return fetcher.post(
      `/V4/organizations/${organizationId}/medias?${queryString.stringify({
        locale,
        targetId,
      })}`,
      others
    );
  },
  updateOrgMedia: (payload?: UpdateOrgMediaApiPayload) => {
    const { organizationId, organizationMediaId, locale, ...others } =
      payload || {};
    return fetcher.patch(
      `/V4/organizations/${organizationId}/medias/${organizationMediaId}?${queryString.stringify(
        {
          locale,
        }
      )}`,
      others
    );
  },
  deleteOrgMedia: (payload?: DeleteOrgMediaApiPayload) => {
    const { organizationId, organizationMediaId } = payload || {};
    return fetcher.delete(
      `/V4/organizations/${organizationId}/medias/${organizationMediaId}`
    );
  },
  sortOrgMedia: (payload?: SortOrgMediaApiPayload) => {
    const { organizationId, targetId, ...others } = payload || {};
    return fetcher.patch(
      `/V4/organizations/${organizationId}/medias/sort?${queryString.stringify({
        targetId,
      })}`,
      others
    );
  },
  createOrgProduct: (payload?: CreateOrgProductApiPayload) => {
    const { organizationId, locale, ...others } = payload || {};
    return fetcher.post(
      `/V4/organizations/${organizationId}/products?${queryString.stringify({
        locale,
      })}`,
      others
    );
  },
  updateOrgProduct: (payload?: UpdateOrgProductApiPayload) => {
    const { organizationId, organizationProductId, locale, ...others } =
      payload || {};
    return fetcher.patch(
      `/V4/organizations/${organizationId}/products/${organizationProductId}?${queryString.stringify(
        {
          locale,
        }
      )}`,
      others
    );
  },
  updateOrgProductSort: (payload?: UpdateOrgProductSortApiPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.patch(
      `/V4/organizations/${organizationId}/products/sort`,
      others
    );
  },
  deleteOrgProduct: (payload?: DeleteOrgProductApiPayload) => {
    const { organizationId, organizationProductId } = payload || {};
    return fetcher.delete(
      `/V4/organizations/${organizationId}/products/${organizationProductId}`
    );
  },
  createOrgCmsContent: (payload?: CreateOrgCmsContentApiPayload) => {
    const {
      organizationId,
      organizationCmsPageType,
      targetId,
      locale,
      ...others
    } = payload || {};
    return fetcher.post<OrganizationCmsContent>(
      `/V4/organizations/${organizationId}/cms-contents?${queryString.stringify(
        {
          organizationCmsPageType,
          targetId,
          locale,
        }
      )}`,
      others
    );
  },
  deleteOrgCmsContent: (payload?: DeleteOrgCmsContentApiPayload) => {
    const { organizationId, organizationCmsContentId } = payload || {};
    return fetcher.delete(
      `/V4/organizations/${organizationId}/cms-contents/${organizationCmsContentId}`
    );
  },
  updateOrgCmsContent: (payload?: UpdateOrgCmsContentApiPayload) => {
    const { organizationId, organizationCmsContentId, locale, ...others } =
      payload || {};
    return fetcher.patch(
      `/V4/organizations/${organizationId}/cms-contents/${organizationCmsContentId}?${queryString.stringify(
        {
          locale,
        }
      )}`,
      others
    );
  },
  updateOrgCmsContentSort: (payload?: UpdateOrgCmsContentSortApiPayload) => {
    const { organizationId, organizationCmsId, ...others } = payload || {};
    return fetcher.patch(
      `/V4/organizations/${organizationId}/cms-contents/sort?organizationCmsId=${organizationCmsId}`,
      others
    );
  },
  createOrgTargetRelation: (payload?: CreateOrgTargetRelationApiPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post(
      `/V4/organizations/${organizationId}/target-relations`,
      others
    );
  },
  deleteOrgTargetRelation: (payload?: DeleteOrgTargetRelationApiPayload) => {
    const { organizationId, targetIdA, targetIdB } = payload || {};
    return fetcher.delete(
      `/V4/organizations/${organizationId}/target-relations?${queryString.stringify(
        {
          targetIdA,
          targetIdB,
        }
      )}`
    );
  },
  getOrgEventsTargetRelations: (
    payload?: GetOrgEventsTargetRelationsApiPayload
  ) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post(
      `/organizations/${organizationId}/search/events/target-relations`,
      others
    );
  },
  createOrgFileTarget: (payload?: CreateOrgFileTargetApiPayload) => {
    const { organizationId, uploadFileId, ...others } = payload || {};
    return fetcher.post(
      `/organizations/${organizationId}/upload-files/${uploadFileId}/target`,
      others
    );
  },
  deleteOrgFileTarget: (payload?: DeleteOrgFileTargetApiPayload) => {
    const { organizationId, uploadFileId, ...others } = payload || {};
    return fetcher.delete(
      `/organizations/${organizationId}/upload-files/${uploadFileId}/target`,
      {
        data: others,
      }
    );
  },
  downloadOrgFile: (payload?: FileApiPayload) => {
    const { organizationId, uploadFileId, eGroupService } = payload || {};
    return downloadFetcher.post(
      `/organizations/${organizationId}/upload-files/${uploadFileId}/download?${queryString.stringify(
        {
          EGROUP_SERVICE_: eGroupService,
        }
      )}`
    );
  },
  previewOrgFile: (payload?: FileApiPayload) => {
    const { organizationId, uploadFileId, eGroupService } = payload || {};
    return fetcher.post(
      `/organizations/${organizationId}/upload-files/${uploadFileId}/preview?${queryString.stringify(
        {
          EGROUP_SERVICE_: eGroupService,
        }
      )}`
    );
  },
  downloadOrgFilesBatch: (payload?: UploadFilesBatchDownloadApiPayload) => {
    const { organizationId, uploadFileIdList, eGroupService } = payload || {};
    return downloadFetcher.post(
      `/organizations/${organizationId}/upload-files/batch-download?${queryString.stringify(
        {
          EGROUP_SERVICE_: eGroupService,
        }
      )}`,
      {
        uploadFileIdList: uploadFileIdList as string[],
      }
    );
  },

  deleteOrgFile: (payload?: FileApiPayload) => {
    const { organizationId, uploadFileId } = payload || {};
    return fetcher.delete(
      `/organizations/${organizationId}/upload-files/${uploadFileId}`
    );
  },
  deleteOrgFiles: (payload?: UploadFilesBatchDeleteApiPayload) => {
    const { organizationId, uploadFileIdList } = payload || {};
    return fetcher.delete(
      `/organizations/${organizationId}/upload-files/batch-delete`,
      {
        data: {
          uploadFileIdList: uploadFileIdList as string[],
        },
      }
    );
  },
  updateOrgFileName: (payload?: UpdateOrgFileNameApiPayload) => {
    const { organizationId, uploadFileId, ...others } = payload || {};
    return fetcher.patch(
      `/organizations/${organizationId}/upload-files/${uploadFileId}/name`,
      others
    );
  },
  createOrgBlog: (payload?: CreateOrgBlogApiPayload) => {
    const { organizationId, locale, ...others } = payload || {};
    return fetcher.post(
      `/V4/organizations/${organizationId}/blogs?${queryString.stringify({
        locale,
      })}`,
      others
    );
  },
  updateOrgBlog: (payload?: UpdateOrgBlogApiPayload) => {
    const { organizationId, organizationBlogId, locale, ...others } =
      payload || {};
    return fetcher.patch(
      `/V4/organizations/${organizationId}/blogs/${organizationBlogId}?${queryString.stringify(
        {
          locale,
        }
      )}`,
      others
    );
  },
  deleteOrgBlog: (payload?: DeleteOrgBlogApiPayload) => {
    const { organizationId, organizationBlogId } = payload || {};
    return fetcher.delete(
      `/V4/organizations/${organizationId}/blogs/${organizationBlogId}`
    );
  },
  createOrgTargetsTags: (payload?: CreateOrgTargetsTagsApiPayload) => {
    const { organizationId, isSelected, serviceModulValue, ...others } =
      payload || {};
    const url = `/organizations/${organizationId}/search/${serviceModulValue}/tag?isSelected=${isSelected}`;
    return fetcher.post(url, others);
  },
  createOrgTargetTags: (payload?: CreateOrgTargetTagsApiPayload) => {
    const { organizationId, targetId, ...others } = payload || {};
    return fetcher.post(
      `/organizations/${organizationId}/targets/${targetId}`,
      others
    );
  },
  createOrgTargetsEvents: (payload?: CreateOrgTargetsEventsApiPayload) => {
    const { organizationId, isSelected, ...others } = payload || {};
    const url =
      isSelected === 2
        ? `/organizations/${organizationId}/search/users/event`
        : `/organizations/${organizationId}/search/users/event?isSelected=${isSelected}`;
    return fetcher.post(url, others);
  },
  deleteOrgTargetsTags: (payload?: DeleteOrgTargetsTagsApiPayload) => {
    const { organizationId, isSelected, serviceModulValue, ...others } =
      payload || {};
    const url = `/organizations/${organizationId}/search/${serviceModulValue}/tag?isSelected=${isSelected}`;
    return fetcher.delete(url, { data: others });
  },
  deleteOrgTargetTag: (payload?: DeleteOrgTargetTagsApiPayload) => {
    const { organizationId, targetId, tagId } = payload || {};
    return fetcher.delete(
      `/organizations/${organizationId}/targets/${targetId}?${queryString.stringify(
        {
          tagId,
        }
      )}`
    );
  },
  createTag: (payload?: CreateOrgTagApiPayload) => {
    const { organizationId, tagGroupId, locale, ...others } = payload || {};
    return fetcher.post<OrganizationTag>(
      `/organizations/${organizationId}/tag-groups/${tagGroupId}/tags?${queryString.stringify(
        {
          locale,
        }
      )}`,
      others
    );
  },
  updateTag: (payload?: UpdateOrgTagApiPayload) => {
    const { organizationId, tagGroupId, tagId, locale, ...others } =
      payload || {};
    return fetcher.patch<OrganizationTag>(
      `/organizations/${organizationId}/tag-groups/${tagGroupId}/tags/${tagId}?${queryString.stringify(
        {
          locale,
        }
      )}`,
      others
    );
  },
  deleteTag: (payload?: DeleteOrgTagApiPayload) => {
    const { organizationId, tagGroupId, tagId } = payload || {};
    return fetcher.delete(
      `/organizations/${organizationId}/tag-groups/${tagGroupId}/tags/${tagId}`
    );
  },
  updateTagGroup: (payload?: UpdateOrgTagGroupApiPayload) => {
    const { organizationId, tagGroupId, locale, ...others } = payload || {};
    return fetcher.patch<OrganizationTagGroup>(
      `/organizations/${organizationId}/tag-groups/${tagGroupId}?${queryString.stringify(
        {
          locale,
        }
      )}`,
      others
    );
  },
  createTagGroup: (payload?: CreateOrgTagGroupApiPayload) => {
    const { organizationId, locale, ...others } = payload || {};
    return fetcher.post<OrganizationTagGroup>(
      `/organizations/${organizationId}/tag-groups?${queryString.stringify({
        locale,
      })}`,
      others
    );
  },
  deleteTagGroup: (payload?: DeleteOrgTagGroupApiPayload) => {
    const { organizationId, tagGroupId } = payload || {};
    return fetcher.delete(
      `/organizations/${organizationId}/tag-groups/${tagGroupId}`
    );
  },
  updateOrgCmsMenu: (payload?: UpdateOrgCmsMenuApiPayload) => {
    const { organizationId, organizationCmsMenuId, locale, ...others } =
      payload || {};
    return fetcher.patch(
      `/V4/organizations/${organizationId}/cms-menus/${organizationCmsMenuId}?${queryString.stringify(
        {
          locale,
        }
      )}`,
      others
    );
  },
  updateOrgCmsSubMenu: (payload?: UpdateOrgCmsSubMenuApiPayload) => {
    const {
      organizationId,
      organizationCmsMenuId,
      organizationCmsSubMenuId,
      locale,
      ...others
    } = payload || {};
    return fetcher.patch(
      `/V4/organizations/${organizationId}/cms-menus/${organizationCmsMenuId}/sub-menus/${organizationCmsSubMenuId}?${queryString.stringify(
        {
          locale,
        }
      )}`,
      others
    );
  },
  updateOrgCmsPageMenu: (payload?: UpdateOrgCmsPageMenuApiPayload) => {
    const { organizationId, organizationCmsPageMenuId, locale, ...others } =
      payload || {};
    return fetcher.patch(
      `/V4/organizations/${organizationId}/cms-page-menus/${organizationCmsPageMenuId}?${queryString.stringify(
        {
          locale,
        }
      )}`,
      others
    );
  },
  updateOrgCmsSeo: (payload?: UpdateOrgCmsSeoApiPayload) => {
    const { organizationId, targetId, locale, ...others } = payload || {};
    return fetcher.post(
      `/V4/organizations/${organizationId}/cms-seo?${queryString.stringify({
        locale,
        targetId,
      })}`,
      others
    );
  },
  createOrgInvitation: (payload?: CreateOrgInvitationApiPayload) => {
    const { organizationId, ...other } = payload || {};
    return fetcher.post(`/organizations/${organizationId}/invitations`, other);
  },
  deleteOrgInvitation: (payload?: DeleteOrgInvitationApiPayload) => {
    const { organizationId, organizationInvitationId } = payload || {};
    return fetcher.delete(
      `/organizations/${organizationId}/invitations/${organizationInvitationId}`
    );
  },
  updateOrgMemberInvitation: (
    payload?: UpdateOrgMemberInvitationApiPayload
  ) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post(`/organizations/${organizationId}/members`, others);
  },
  importUsersExcel: (payload?: ImportUsersExcelApiPayload) => {
    const { organizationId, uploadFileId } = payload || {};
    return fetcher.post<ImportData>(
      `/organizations/${organizationId}/users/import?${queryString.stringify({
        uploadFileId,
      })}`
    );
  },
  createOrgUsers: (payload?: CreateOrgUsersApiPayload) => {
    const { organizationId, ...other } = payload || {};
    return fetcher.post(
      `/organizations/${organizationId}/users/batch-insert`,
      other
    );
  },
  deleteOrgUser: (payload?: DeleteOrgUserApiPayload) => {
    const { organizationId, organizationUserId } = payload || {};
    return fetcher.delete(
      `/organizations/${organizationId}/users/${organizationUserId}`
    );
  },
  createOrgSms: (payload?: CreateOrgSmsApiPayload) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { organizationId, smsSendType_, ...other } = payload || {};
    return fetcher.post(
      `/organizations/${organizationId}/sms/send?${queryString.stringify({
        smsSendType_,
      })}`,
      other
    );
  },
  createOrgSmses: (payload?: CreateOrgSmsesApiPayload) => {
    const {
      organizationId,
      organizationShareTargetType,
      isSelected,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      smsSendType_,
      ...other
    } = payload || {};
    const url =
      isSelected === 1
        ? `/organizations/${organizationId}/sms/send-search/users?${queryString.stringify(
            {
              organizationShareTargetType,
              isSelected,
              smsSendType_,
            }
          )}`
        : `/organizations/${organizationId}/sms/send-search/users?${queryString.stringify(
            {
              smsSendType_,
            }
          )}`;
    return fetcher.post(url, other);
  },
  // createOrgEvent: (payload?: CreateOrgEventApiPayload) => {
  //   const { organizationId, ...others } = payload || {};
  //   return fetcher.post(`/organizations/${organizationId}/events`, others);
  // },
  createOrgEvent: (payload?: CreateOrgEventApiPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post(`/organizations/${organizationId}/events`, others);
  },
  updateOrgEvent: (payload?: UpdateOrgEventApiPayload) => {
    const { organizationId, organizationEventId, ...others } = payload || {};
    return fetcher.patch(
      `/organizations/${organizationId}/events/${organizationEventId}`,
      others
    );
  },
  deleteOrgEvent: (payload?: DeleteOrgEventApiPayload) => {
    const { organizationId, organizationEventId } = payload || {};
    return fetcher.delete(
      `/organizations/${organizationId}/events/${organizationEventId}`
    );
  },
  createOrgGroup: (payload?: CreateOrgGroupApiPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post(`/organizations/${organizationId}/groups`, others);
  },
  updateOrgGroup: (payload?: UpdateOrgGroupApiPayload) => {
    const { organizationId, organizationGroupId, ...others } = payload || {};
    return fetcher.patch(
      `/organizations/${organizationId}/groups/${organizationGroupId}`,
      others
    );
  },
  deleteOrgGroup: (payload?: DeleteOrgGroupApiPayload) => {
    const { organizationId, organizationGroupId } = payload || {};
    return fetcher.delete(
      `/organizations/${organizationId}/groups/${organizationGroupId}`
    );
  },
  createOrgUser: (payload?: CreateOrgUserApiPayload) => {
    const { organizationId, isFromImport, ...others } = payload || {};
    let createUserApiUri = `/organizations/${organizationId}/users`;
    if (isFromImport === 1) {
      createUserApiUri = `/organizations/${organizationId}/users?isFromImport=1`;
    }
    return fetcher.post(createUserApiUri, others);
  },
  updateOrgUser: (payload?: UpdateOrgUserApiPayload) => {
    const { organizationId, organizationUserId, isFromImport, ...others } =
      payload || {};
    let updateUserApiUri = `/organizations/${organizationId}/users/${organizationUserId}`;
    if (isFromImport === 1)
      updateUserApiUri = `/organizations/${organizationId}/users/${organizationUserId}?isFromImport=1`;
    return fetcher.patch(updateUserApiUri, others);
  },
  batchUpdateOrgUserColumnTarget: (
    payload?: BatchUpdateOrgUserColumnApiPayload
  ) => {
    const { organizationId, isSelected, ...others } = payload || {};
    let apiUrl = `organizations/${organizationId}/search/users/batch-update-column-target`;
    if (isSelected === 1)
      apiUrl = `organizations/${organizationId}/search/users/batch-update-column-target?isSelected=1`;
    return fetcher.post(apiUrl, others);
  },
  createOrgShare: (payload?: CreateOrgShareApiPayload) => {
    const { organizationId, targetId, organizationShareTargetType, ...others } =
      payload || {};
    return fetcher.post<OrganizationShare>(
      `/organizations/${organizationId}/shares?${queryString.stringify({
        targetId,
        organizationShareTargetType,
      })}`,
      others
    );
  },
  createOrgModuleShare: (payload?: CreateOrgModuleShareApiPayload) => {
    const { organizationId, targetId, organizationShareTargetType, ...others } =
      payload || {};
    return fetcher.post<OrganizationModuleShare>(
      `/organizations/${organizationId}/shares?${queryString.stringify({
        targetId,
        organizationShareTargetType,
      })}`,
      others
    );
  },

  getOrgModuleShare: (payload?: GetOrgModuleShareApiPayload) => {
    const { organizationId, shareId } = payload || {};
    return fetcher.get<OrganizationModuleShare>(
      `/organizations/${organizationId}/shares/${shareId}`
    );
  },

  accessOrgModuleShare: (payload?: AccessOrgModuleShareApiPayload) => {
    const { organizationId, shareId, ...other } = payload || {};
    return fetcher.post<AccessOrganizationModuleShare>(
      `/organizations/${organizationId}/shares/${shareId}`,
      other
    );
  },

  updatePasswordOrgModuleShare: (
    payload?: updatePasswordOrgModuleShareApiPayload
  ) => {
    const { organizationId, shareId, ...others } = payload || {};
    return fetcher.patch<OrganizationModuleShare>(
      `/organizations/${organizationId}/shares/${shareId}`,
      others
    );
  },

  sendOrgModuleShareEmailInvites: (
    payload?: SendOrgModuleShareEmailInvitesApiPayload
  ) => {
    const {
      organizationId,
      organizationInvitationEmailList,
      organizationInvitationTargetType,
      targetId,
    } = payload || {};
    return fetcher.post(`/organizations/${organizationId}/invitations`, {
      organizationInvitationEmailList,
      organizationInvitationTargetType,
      targetId,
    });
  },

  createOrgFinanceTemplate: (payload?: CreateOrgFinanceTemplateApiPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post(
      `/organizations/${organizationId}/finance-templates`,
      others
    );
  },
  updateOrgFinanceTemplate: (payload?: UpdateOrgFinanceTemplateApiPayload) => {
    const { organizationId, organizationFinanceTemplateId, ...others } =
      payload || {};
    return fetcher.patch(
      `/organizations/${organizationId}/finance-templates/${organizationFinanceTemplateId}`,
      others
    );
  },
  deleteOrgFinanceTemplate: (payload?: DeleteOrgFinanceTemplateApiPayload) => {
    const { organizationId, organizationFinanceTemplateId } = payload || {};
    return fetcher.delete(
      `/organizations/${organizationId}/finance-templates/${organizationFinanceTemplateId}`
    );
  },
  deleteOrgFinanceTemplateColumn: (
    payload?: DeleteOrgFinanceTemplateColumnApiPayload
  ) => {
    const {
      organizationId,
      organizationFinanceTemplateId,
      organizationFinanceColumnId,
    } = payload || {};
    return fetcher.delete(
      `/organizations/${organizationId}/finance-templates/${organizationFinanceTemplateId}/columns/${organizationFinanceColumnId}`
    );
  },
  createOrgSalaryTemplate: (payload?: CreateOrgSalaryTemplateApiPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post(
      `/organizations/${organizationId}/finance-templates`,
      others
    );
  },
  updateOrgSalaryTemplate: (payload?: UpdateOrgSalaryTemplateApiPayload) => {
    const { organizationId, organizationFinanceTemplateId, ...others } =
      payload || {};
    return fetcher.patch(
      `/organizations/${organizationId}/finance-templates/${organizationFinanceTemplateId}`,
      others
    );
  },
  deleteOrgSalaryTemplate: (payload?: DeleteOrgSalaryTemplateApiPayload) => {
    const { organizationId, organizationFinanceTemplateId } = payload || {};
    return fetcher.delete(
      `/organizations/${organizationId}/finance-templates/${organizationFinanceTemplateId}`
    );
  },
  deleteOrgSalaryTemplateColumn: (
    payload?: DeleteOrgSalaryTemplateColumnApiPayload
  ) => {
    const {
      organizationId,
      organizationFinanceTemplateId,
      organizationFinanceColumnId,
    } = payload || {};
    return fetcher.delete(
      `/organizations/${organizationId}/finance-templates/${organizationFinanceTemplateId}/columns/${organizationFinanceColumnId}`
    );
  },
  createOrgReview: (payload?: CreateOrgReviewApiPayload) => {
    const { organizationId, targetId, serviceModuleValue, ...others } =
      payload || {};
    return fetcher.post(
      `/organizations/${organizationId}/reviews?${queryString.stringify({
        targetId,
        SERVICE_MODULE_VALUE_: serviceModuleValue,
      })}`,
      others
    );
  },
  updateOrgReview: (payload?: UpdateOrgReviewApiPayload) => {
    const {
      organizationId,
      organizationReviewId,
      serviceModuleValue,
      ...others
    } = payload || {};
    return fetcher.patch(
      `/organizations/${organizationId}/reviews/${organizationReviewId}?${queryString.stringify(
        {
          SERVICE_MODULE_VALUE_: serviceModuleValue,
        }
      )}`,
      others
    );
  },
  createOrgComment: (payload?: CreateOrgCommentApiPayload) => {
    const { organizationId, targetId, targetRelationType, ...others } =
      payload || {};
    return fetcher.post(
      `/organizations/${organizationId}/comments?${queryString.stringify({
        targetId,
        TARGET_RELATION_TYPE_: targetRelationType,
      })}`,
      others
    );
  },
  createOrgFinanceTargets: (payload?: CreateOrgFinanceTargetsApiPayload) => {
    const { organizationId, targetId, ...others } = payload || {};
    return fetcher.post(
      `/organizations/${organizationId}/finance-targets?${queryString.stringify(
        {
          targetId,
        }
      )}`,
      others
    );
  },
  exportOrgUserPdf: (payload?: ExportOrgUserPdfApiPayload) => {
    const { organizationId, organizationUserId } = payload || {};
    return downloadFetcher.post(
      `/organizations/${organizationId}/users/${organizationUserId}/export-pdf`
    );
  },
  exportOrgUsersExcel: (payload?: ExportOrgUsersExcelApiPayload) => {
    const { organizationId, locale, timeZone, ...others } = payload || {};
    return downloadFetcher.post(
      `/organizations/${organizationId}/search/users/users-export?${queryString.stringify(
        {
          locale,
          timeZone,
        }
      )}`,
      { ...others }
    );
  },
  exportOrgMembersExcel: (payload?: ExportOrgMembersExcelApiPayload) => {
    const { organizationId, locale, timeZone, ...others } = payload || {};
    return downloadFetcher.post(
      `/organizations/${organizationId}/search/members/export?${queryString.stringify(
        {
          locale,
          timeZone,
        }
      )}`,
      { ...others }
    );
  },
  exportSelectedOrgMembersExcel: (
    payload?: ExportSelectedOrgMembersExcelApiPayload
  ) => {
    const { organizationId, locale, timeZone, orgMemberIdList } = payload || {};
    return downloadFetcher.post(
      `/organizations/${organizationId}/search/members/batch-export?${queryString.stringify(
        {
          locale,
          timeZone,
        }
      )}`,

      orgMemberIdList?.map((id) => ({
        id: {
          organizationId: id.organizationId,
          loginId: id.loginId,
        },
      }))
    );
  },
  exportSelectedOrgUsersExcel: (
    payload?: ExportSelectedOrgUsersExcelApiPayload
  ) => {
    const { organizationId, locale, timeZone, ...others } = payload || {};
    return downloadFetcher.post(
      `/organizations/${organizationId}/search/users/batch-export?${queryString.stringify(
        {
          locale,
          timeZone,
        }
      )}`,
      { ...others }
    );
  },
  exportOrgEventsExcel: (payload?: ExportOrgEventsExcelApiPayload) => {
    const {
      organizationId,
      locale,
      timeZone,
      filterObject,
      excludedTargetIdList,
    } = payload || {};
    return downloadFetcher.post(
      `/organizations/${organizationId}/search/event-comments/export?${queryString.stringify(
        {
          locale,
          timeZone,
        }
      )}`,
      {
        ...filterObject,
        excludedTargetIdList,
      }
    );
  },
  exportSelectedOrgEventsExcel: (
    payload?: ExportSelectedOrgEventsExcelApiPayload
  ) => {
    const { organizationId, locale, timeZone, organizationEvents } =
      payload || {};
    return downloadFetcher.post(
      `/organizations/${organizationId}/search/event-comments/batch-export?${queryString.stringify(
        {
          locale,
          timeZone,
        }
      )}`,
      organizationEvents
    );
  },
  deleteFinanceTarget: (payload?: DeleteFinanceTargetApiPayload) => {
    const { organizationId, organizationFinanceTargetId } = payload || {};
    return fetcher.delete(
      `/organizations/${organizationId}/finance-targets/${organizationFinanceTargetId}`
    );
  },
  getImportDynamicColumns: (payload?: GetImportDynamicColumnsApiPayload) => {
    const { organizationId, uploadFileId } = payload || {};
    return fetcher.get<{
      dynamicColumnList: OrganizationColumn[];
    }>(
      `/organizations/${organizationId}/users/import/dynamic-columns?${queryString.stringify(
        {
          uploadFileId,
        }
      )}`
    );
  },
  updateOrgDynamicColumn: (payload?: UpdateOrgDynamicColumnApiPayload) => {
    const { organizationId, columnTable, ...others } = payload || {};
    return fetcher.post(
      `/organizations/${organizationId}/columns?${queryString.stringify({
        columnTable,
      })}`,
      others
    );
  },
  sortOrgDynamicColumn: (payload?: SortOrgDynamicColumnApiPayload) => {
    const { organizationId, columnTable, ...others } = payload || {};
    return fetcher.patch(
      `/organizations/${organizationId}/columns/sort?${queryString.stringify({
        columnTable,
      })}`,
      others
    );
  },
  deleteColumnByFilter: (payload?: DeleteColumnByFilterApiPayload) => {
    const { organizationId, columnTable, ...others } = payload || {};
    return fetcher.delete(
      `/organizations/${organizationId}/search/columns/targets?${queryString.stringify(
        {
          columnTable,
        }
      )}`,
      { data: others }
    );
  },
  deleteBatchColumn: (payload?: DeleteBatchColumnApiPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.delete(
      `/organizations/${organizationId}/search/columns/targets?isSelected=1`,
      { data: others }
    );
  },
  deleteOrgDynamicColumn: (payload?: DeleteOrgDynamicColumnApiPayload) => {
    const { organizationId, columnId } = payload || {};
    return fetcher.delete(
      `/organizations/${organizationId}/columns/${columnId}`
    );
  },
  deleteOrgDynamicColumnOption: (
    payload?: DeleteOrgDynamicColumnOptionApiPayload
  ) => {
    const { organizationId, organizationOptionId, columnId } = payload || {};
    return fetcher.delete(
      `/organizations/${organizationId}/options/${organizationOptionId}?${queryString.stringify(
        {
          columnId,
        }
      )}`
    );
  },
  sortOrgDynamicColumnOptions: (
    payload?: SortOrgDynamicColumnOptionsApiPayload
  ) => {
    const { organizationId, columnId, ...others } = payload || {};
    return fetcher.patch(
      `/organizations/${organizationId}/options/sort?${queryString.stringify({
        columnId,
      })}`,
      others
    );
  },
  createMemberTargetAuth: (payload?: CreateMemberTargetAuthsApiPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post(
      `organizations/${organizationId}/member-target-auths`,
      others
    );
  },
  updateMemberTargetAuth: (payload?: UpdateMemberTargetAuthsApiPayload) => {
    const { organizationId, organizationMemberTargetAuthId, ...others } =
      payload || {};
    return fetcher.patch(
      `organizations/${organizationId}/member-target-auths/${organizationMemberTargetAuthId}`,
      others
    );
  },
  deleteMemberTargetAuth: (payload?: DeleteMemberTargetAuthsApiPayload) => {
    const { organizationId, organizationMemberTargetAuthId } = payload || {};
    return fetcher.delete(
      `organizations/${organizationId}/member-target-auths/${organizationMemberTargetAuthId}`
    );
  },
  deleteMemberPermission: (payload?: DeleteMemberPermissionApiPayload) => {
    const { organizationId, ...others } = payload || {};

    return fetcher.delete(
      `organizations/${organizationId}/member-target-auths`,
      {
        data: others,
      }
    );
  },
  createMembersPermission: (payload?: CreateMemberPermissionApiPayload) => {
    const { organizationId, isSelected, ...others } = payload || {};
    let url = `organizations/${organizationId}/search/members/permission`;
    if (isSelected !== 2) {
      url = `organizations/${organizationId}/search/members/permission?isSelected=${isSelected}`;
    }
    return fetcher.post(url, others);
  },
  createMemberTargetModuleAuth: (
    payload?: CreateMemberTargetModuleAuthPayload
  ) => {
    const { organizationId, isSelected, serviceModuleValue, ...others } =
      payload || {};
    const url = `organizations/${organizationId}/search/members/target-module-auths?${queryString.stringify(
      {
        isSelected,
        serviceModuleValue,
      }
    )}`;
    return fetcher.post(url, others);
  },
  deleteMembertargetModuleAuth: (
    payload?: DelteMemberTargetModuleAuthPayload
  ) => {
    const { organizationId, ...others } = payload || {};
    const url = `organizations/${organizationId}/target-module-auths`;
    return fetcher.delete(url, { data: others });
  },
  createOrgTargetShare: (payload?: CreateOrgTargetShareApiPayload) => {
    const { organizationId, isSelected, organizationVerifyTokenId, ...others } =
      payload || {};

    return fetcher.post(
      `/organizations/${organizationId}/search/users/shares?${queryString.stringify(
        {
          isSelected,
          organizationVerifyTokenId,
        }
      )}`,
      others
    );
  },
  deleteOrgTargetShare: (payload?: DeleteOrgTargetShareApiPayload) => {
    const { organizationId, isSelected, ...others } = payload || {};

    return fetcher.delete(
      `/organizations/${organizationId}/search/users/shares?${queryString.stringify(
        {
          isSelected,
        }
      )}`,
      {
        data: others,
      }
    );
  },
  createBulletin: (payload?: CreateBulletinApiPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post(`/organizations/${organizationId}/bulletins`, others);
  },
  updateBulletin: (payload?: UpdateBulletinApiPayload) => {
    const { organizationId, bulletinId, ...others } = payload || {};
    return fetcher.patch(
      `/organizations/${organizationId}/bulletins/${bulletinId}`,
      others
    );
  },
  deleteBulletin: (payload?: DeleteBulletinApiPayload) => {
    const { organizationId, bulletinId } = payload || {};
    return fetcher.delete(
      `/organizations/${organizationId}/bulletins/${bulletinId}`
    );
  },
  createBulletinTagList: (payload?: CreateBulletinTagListPayload) => {
    const { organizationId, bulletinId, ...others } = payload || {};
    return fetcher.post(
      `/organizations/${organizationId}/targets/${bulletinId}`,
      others
    );
  },
  deleteBulletinTag: (payload?: DeleteBulletinTagApiPayload) => {
    const { organizationId, bulletinId, tagId } = payload || {};
    return fetcher.delete(
      `organizations/${organizationId}/targets/${bulletinId}?tagId=${tagId}`
    );
  },
  createOrgArticle: (payload?: CreateOrgArticleApiPayload) => {
    const { organizationId, ...others } = payload || {};

    return fetcher.post(`/organizations/${organizationId}/articles`, others);
  },
  updateOrgArticle: (payload?: UpdateOrgArticleApiPayload) => {
    const { organizationId, articleId, ...others } = payload || {};

    return fetcher.patch(
      `/organizations/${organizationId}/articles/${articleId}`,
      others
    );
  },
  deleteOrgArticle: (payload?: DeleteOrgArticleApiPayload) => {
    const { organizationId, articleId } = payload || {};

    return fetcher.delete(
      `/organizations/${organizationId}/articles/${articleId}`
    );
  },

  createOrgArticleCommentParent: (
    payload?: CreateOrgArticleCommentApiPayload
  ) => {
    const {
      organizationId,
      articleId,
      articleCommentContent,
      mentionedMemberList,
    } = payload || {};

    return fetcher.post(
      `/organizations/${organizationId}/articles/${articleId}/comments`,
      {
        articleCommentContent,
        mentionedMemberList,
      }
    );
  },
  createOrgArticleCommentChild: (
    payload?: CreateOrgArticleCommentApiPayload
  ) => {
    const { organizationId, articleId, ...others } = payload || {};

    return fetcher.post(
      `/organizations/${organizationId}/articles/${articleId}/comments`,
      others
    );
  },
  updateOrgArticleComment: (payload?: UpdateOrgArticleCommentApiPayload) => {
    const { organizationId, articleId, articleCommentId, ...others } =
      payload || {};

    return fetcher.patch(
      `/organizations/${organizationId}/articles/${articleId}/comments/${articleCommentId}`,
      others
    );
  },
  deleteOrgArticleComment: (payload?: DeleteOrgArticleCommentApiPayload) => {
    const { organizationId, articleId, articleCommentId } = payload || {};

    return fetcher.delete(
      `/organizations/${organizationId}/articles/${articleId}/comments/${articleCommentId}`
    );
  },
  toggleOrgArticleCommentLike: (
    payload?: CreateOrDeleteOrgArticleCommentLikeApiPayload
  ) => {
    const { organizationId, articleId, articleCommentId } = payload || {};

    return fetcher.post(
      `/organizations/${organizationId}/articles/${articleId}/comments/${articleCommentId}/likes`
    );
  },

  createTargetCommentParent: (payload?: CreateTargetCommentApiPayload) => {
    const {
      organizationId,
      targetTable,
      targetId,
      targetCommentContent,
      mentionedMemberList,
    } = payload || {};

    return fetcher.post(
      `/organizations/${organizationId}/${targetTable}/${targetId}/target-comments`,
      {
        targetCommentContent,
        mentionedMemberList,
      }
    );
  },
  createTargetCommentChild: (payload?: CreateTargetCommentApiPayload) => {
    const { organizationId, targetTable, targetId, ...others } = payload || {};

    return fetcher.post(
      `/organizations/${organizationId}/${targetTable}/${targetId}/target-comments`,
      others
    );
  },
  toggleTargetCommentLike: (
    payload?: CreateOrDeleteTargetCommentLikeApiPayload
  ) => {
    const { organizationId, targetTable, targetId, targetCommentId } =
      payload || {};

    return fetcher.post(
      `/organizations/${organizationId}/${targetTable}/${targetId}/target-comments/${targetCommentId}/likes`
    );
  },
  updateTargetComment: (payload?: UpdateTargetCommentApiPayload) => {
    const {
      organizationId,
      targetTable,
      targetId,
      targetCommentId,
      ...others
    } = payload || {};

    return fetcher.patch(
      `/organizations/${organizationId}/${targetTable}/${targetId}/target-comments/${targetCommentId}`,
      others
    );
  },
  deleteTargetComment: (payload?: DeleteTargetCommentApiPayload) => {
    const { organizationId, targetTable, targetId, targetCommentId } =
      payload || {};

    return fetcher.delete(
      `/organizations/${organizationId}/${targetTable}/${targetId}/target-comments/${targetCommentId}`
    );
  },

  fullTextSearch: (payload?: FullTextSearchApiPayload) => {
    const { organizationId, ...others } = payload || {};

    return fetcher.post(
      `/organizations/${organizationId}/full-text-search`,
      others
    );
  },
  getListFilterViews: (payload?: GetFilterViewApiPayload) => {
    const { organizationId, serviceModuleValue } = payload || {};

    return fetcher.get(
      `/organizations/${organizationId}/filter-views?serviceModuleValue=${serviceModuleValue}

      `
    );
  },
  createFilterView: (payload?: CreateFilterViewApiPayload) => {
    const { organizationId, ...others } = payload || {};

    return fetcher.post(
      `/organizations/${organizationId}/filter-views`,
      others
    );
  },
  deleteFilterView: (payload?: DeleteFilterViewApiPayload) => {
    const { organizationId, filterViewId } = payload || {};

    return fetcher.delete(
      `/organizations/${organizationId}/filter-views/${filterViewId}`
    );
  },
  updateFilterView: (payload?: UpdateFilterViewApiPayload) => {
    const { organizationId, filterViewId, ...others } = payload || {};
    return fetcher.patch(
      `/organizations/${organizationId}/filter-views/${filterViewId}`,
      others
    );
  },
  updateFilterViewPublic: (payload?: UpdateFilterViewPublicApiPayload) => {
    const { organizationId, filterViewId, isPublic } = payload || {};
    return fetcher.patch(
      `/organizations/${organizationId}/filter-views/${filterViewId}/public`,
      { isPublic }
    );
  },

  createUploadFile: (payload?: CreateUploadFileApiPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post(`/organizations/${organizationId}/bulletins`, others);
  },
  updateUploadFile: (payload?: UpdateUploadFileApiPayload) => {
    const { organizationId, uploadFileId, ...others } = payload || {};
    return fetcher.patch(
      `/organizations/${organizationId}/bulletins/${uploadFileId}`,
      others
    );
  },
  deleteUploadFile: (payload?: DeleteUploadFileApiPayload) => {
    const { organizationId, uploadFileId } = payload || {};
    return fetcher.delete(
      `/organizations/${organizationId}/bulletins/${uploadFileId}`
    );
  },
  createOrgPartner: (payload?: CreateOrgPartnerApiPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post(`organizations/${organizationId}/partners`, others);
  },
  updateOrgPartner: (payload?: UpdateOrgPartnerApiPayload) => {
    const { organizationId, organizationPartnerId, ...others } = payload || {};
    return fetcher.patch(
      `organizations/${organizationId}/partners/${organizationPartnerId}`,
      others
    );
  },
  deleteOrgPartner: (payload?: DeleteOrgPartnerApiPayload) => {
    const { organizationId, organizationPartnerId } = payload || {};
    return fetcher.delete(
      `organizations/${organizationId}/partners/${organizationPartnerId}`
    );
  },
  // createOrgPartnerEvent: (payload?: CreateOrgPartnerEventPayload) => {
  //   const { organizationId, organizationPartnerId, ...others } = payload || {};
  //   return fetcher.post(
  //     `organizations/${organizationId}/partners/${organizationPartnerId}/events`,
  //     others
  //   );
  // },
  createOrgPartnerEvent: (payload?: CreateOrgPartnerEventPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post(
      `/organizations/${organizationId}/search/partners/event?isSelected=1`,
      others
    );
  },
  sendCustomSmsToAllUsers: (payload?: SendCustomSmsToAllUsersPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post(
      `organizations/${organizationId}/sms/send-search/users?smsSendType_=CUSTOMIZE`,
      others
    );
  },
  sendCustomSmsToUsers: (payload?: SendCustomSmsPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post(
      `organizations/${organizationId}/sms/send-search/users?isSelected=1&smsSendType_=CUSTOMIZE
      `,
      others
    );
  },
  sendCustomSmsToUser: (payload?: SendCustomSmsToUserPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post(
      `organizations/${organizationId}/sms/send-search/users?isSelected=1&smsSendType_=CUSTOMIZE
      `,
      others
    );
  },
  sendCustomSesToAllUsers: (payload?: SendCustomSesToAllUsersPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post(
      `organizations/${organizationId}/ses/send-search/users?smsSendType_=CUSTOMIZE`,
      others
    );
  },
  sendCustomSesToUsers: (payload?: SendCustomSesPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post(
      `organizations/${organizationId}/ses/send-search/users?isSelected=1&smsSendType_=CUSTOMIZE
      `,
      others
    );
  },
  sendCustomSesTest: (payload?: SendCustomSesTestPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post(
      `organizations/${organizationId}/ses/send-test?smsSendType_=CUSTOMIZE
      `,
      others
    );
  },
  /**
   * get Org Search Text
   */
  getOrgSearchTextRecords: (payload?: GetOrgSearchTextRecordsApiPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.get(
      `member/organizations/${organizationId}/search-text-records?${queryString.stringify(
        {
          ...others,
        }
      )}`
    );
  },

  /**
   * get Associated Data
   */
  getAssociatedData: (payload?: GetAssociatedDataApiPayload) => {
    const { organizationId, columnId, serviceModuleValue, query } =
      payload || {};
    return fetcher.get(
      `/organizations/${organizationId}/columns/${columnId}/related/${serviceModuleValue}/data-list?${queryString.stringify(
        {
          query,
        }
      )}`
    );
  },

  /**
   * get Associated Data Preview
   */
  getAssociatedDataPreview: (payload?: GetAssociatedDataApiPayload) => {
    const { organizationId, serviceModuleValue, query } = payload || {};
    return fetcher.get(
      `/organizations/${organizationId}/columns/related/${serviceModuleValue}/data-list?${queryString.stringify(
        {
          query,
        }
      )}`
    );
  },

  createOrgDynamicColumnGroup: (
    payload?: CreateOrgDynamicColumnGroupPayload
  ) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post<ColumnGroup>(
      `organizations/${organizationId}/column-groups`,
      others
    );
  },
  updateOrgDynamicColumnGroup: (
    payload?: UpdateOrgDynamicColumnGroupPayload
  ) => {
    const { organizationId, columnGroupId, ...others } = payload || {};
    return fetcher.patch(
      `organizations/${organizationId}/column-groups/${columnGroupId}`,
      others
    );
  },
  deleteOrgDynamicColumnGroup: (
    payload?: DeleteOrgDynamicColumnGroupApiPayload
  ) => {
    const { organizationId, columnGroupId } = payload || {};
    return fetcher.delete(
      `organizations/${organizationId}/column-groups/${columnGroupId}`
    );
  },
  createOrgShareTemplate: (payload?: CreateOrgShareTemplateApiPayload) => {
    const { organizationId, organizationShareTemplateTargetType, ...others } =
      payload || {};
    return fetcher.post(
      `organizations/${organizationId}/share-templates?${queryString.stringify({
        organizationShareTemplateTargetType,
      })}`,
      others
    );
  },
  updateOrgShareTemplate: (payload?: UpdateOrgShareTemplateApiPayload) => {
    const { organizationId, organizationShareTemplateId, ...others } =
      payload || {};
    return fetcher.patch(
      `organizations/${organizationId}/share-templates/${organizationShareTemplateId}`,
      others
    );
  },
  getOrgShareTemplate: (payload?: GetOrgShareTemplateApiPayload) => {
    const { organizationId, organizationShareTemplateId } = payload || {};
    return fetcher.get<OrganizationShareTemplate>(
      `organizations/${organizationId}/share-templates/${organizationShareTemplateId}`
    );
  },
  deleteOrgShareTemplate: (payload?: DeleteOrgShareTemplateApiPayload) => {
    const { organizationId, organizationShareTemplateId } = payload || {};
    return fetcher.delete(
      `organizations/${organizationId}/share-templates/${organizationShareTemplateId}`
    );
  },

  createOrgDynamicColumnTemplateEvent: (
    payload?: CreateOrgDynamicColumnTemplateEventPayload
  ) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post(
      `organizations/${organizationId}/column-templates`,
      others
    );
  },
  updateOrgDynamicColumnTemplateEvent: (
    payload?: UpdateOrgDynamicColumnTemplateEventPayload
  ) => {
    const { organizationId, organizationColumnTemplateId, ...others } =
      payload || {};
    return fetcher.patch(
      `organizations/${organizationId}/column-templates/${organizationColumnTemplateId}`,
      others
    );
  },
  createOrgDynamicColumnTemplateUser: (
    payload?: CreateOrgDynamicColumnTemplateUserPayload
  ) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post(
      `organizations/${organizationId}/column-templates`,
      others
    );
  },
  updateOrgDynamicColumnTemplateUser: (
    payload?: UpdateOrgDynamicColumnTemplateUserPayload
  ) => {
    const { organizationId, organizationColumnTemplateId, ...others } =
      payload || {};
    return fetcher.patch(
      `organizations/${organizationId}/column-templates/${organizationColumnTemplateId}`,
      others
    );
  },
  createOrgDynamicColumnTemplatePartner: (
    payload?: CreateOrgDynamicColumnTemplatePartnerPayload
  ) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post(
      `organizations/${organizationId}/column-templates`,
      others
    );
  },
  updateOrgDynamicColumnTemplatePartner: (
    payload?: UpdateOrgDynamicColumnTemplatePartnerPayload
  ) => {
    const { organizationId, organizationColumnTemplateId, ...others } =
      payload || {};
    return fetcher.patch(
      `organizations/${organizationId}/column-templates/${organizationColumnTemplateId}`,
      others
    );
  },
  deleteOrgDynamicColumnTemplate: (
    payload?: DeleteOrgDynamicColumnTemplateApiPayload
  ) => {
    const { organizationId, organizationColumnTemplateId } = payload || {};
    return fetcher.delete(
      `organizations/${organizationId}/column-templates/${organizationColumnTemplateId}`
    );
  },
  getOrgDynamicColumnTemplate: (
    payload?: GetOrgDynamicColumnTemplateApiPayload
  ) => {
    const { organizationId, organizationColumnTemplateId } = payload || {};
    return fetcher.get(
      `organizations/${organizationId}/column-templates/${organizationColumnTemplateId}`
    );
  },
  checkUniqueValue: (payload?: CheckUniqueValueApiPayload) => {
    const { organizationId, columnId, ...others } = payload || {};
    return fetcher.post(
      `organizations/${organizationId}/columns/${columnId}/check-unique-value`,
      others
    );
  },
  createSmsTemplate: (payload?: CreateSmsTemplateApiPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post(
      `/organizations/${organizationId}/sms-templates`,
      others
    );
  },
  updateSmsTemplate: (payload?: UpdateSmsTemplateApiPayload) => {
    const { organizationId, organizationSmsTemplateId, ...others } =
      payload || {};
    return fetcher.patch(
      `/organizations/${organizationId}/sms-templates/${organizationSmsTemplateId}`,
      others
    );
  },
  deleteSmsTemplate: (payload?: DeleteSmsTemplateApiPayload) => {
    const { organizationId, organizationSmsTemplateId } = payload || {};
    return fetcher.delete(
      `/organizations/${organizationId}/sms-templates/${organizationSmsTemplateId}`
    );
  },
  createSmsTemplateTagList: (payload?: CreateSmsTemplateTagListPayload) => {
    const { organizationId, organizationSmsTemplateId, ...others } =
      payload || {};
    return fetcher.post(
      `/organizations/${organizationId}/targets/${organizationSmsTemplateId}`,
      others
    );
  },
  deleteSmsTemplateTag: (payload?: DeleteSmsTemplateTagApiPayload) => {
    const { organizationId, organizationSmsTemplateId, tagId } = payload || {};
    return fetcher.delete(
      `organizations/${organizationId}/targets/${organizationSmsTemplateId}?tagId=${tagId}`
    );
  },
  createSesTemplate: (payload?: CreateSesTemplateApiPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post(
      `/organizations/${organizationId}/ses-templates`,
      others
    );
  },
  updateSesTemplate: (payload?: UpdateSesTemplateApiPayload) => {
    const { organizationId, organizationSesTemplateId, ...others } =
      payload || {};
    return fetcher.patch(
      `/organizations/${organizationId}/ses-templates/${organizationSesTemplateId}`,
      others
    );
  },
  deleteSesTemplate: (payload?: DeleteSesTemplateApiPayload) => {
    const { organizationId, organizationSesTemplateId } = payload || {};
    return fetcher.delete(
      `/organizations/${organizationId}/ses-templates/${organizationSesTemplateId}`
    );
  },
  createSesTemplateTagList: (payload?: CreateSesTemplateTagListPayload) => {
    const { organizationId, organizationSesTemplateId, ...others } =
      payload || {};
    return fetcher.post(
      `/organizations/${organizationId}/targets/${organizationSesTemplateId}`,
      others
    );
  },
  deleteSesTemplateTag: (payload?: DeleteSesTemplateTagApiPayload) => {
    const { organizationId, organizationSesTemplateId, tagId } = payload || {};
    return fetcher.delete(
      `organizations/${organizationId}/targets/${organizationSesTemplateId}?tagId=${tagId}`
    );
  },

  targetHistoryRecordsRestore: (
    payload?: RestoreOrgTargetHistoryRecordApiPayload
  ) => {
    const {
      organizationId,
      advancedSearchTable,
      targetId,
      title,
      content,
      isRelease,
    } = payload || {};

    return fetcher.post(
      `/organizations/${organizationId}/${advancedSearchTable?.toLowerCase()}/${targetId}/target-history-records/restore`,
      {
        targetHistoryRecordTitle: title,
        targetHistoryRecordContent: content,
        isRelease,
      }
    );
  },

  restoreOrgTargetHistoryRecord: (
    payload?: RestoreOrgTargetHistoryRecordApiPayload
  ) => {
    const {
      organizationId,
      advancedSearchTable,
      targetId,
      title,
      content,
      isRelease,
    } = payload || {};

    const targetTitle =
      advancedSearchTable === "articles" ? "articleTitle" : "bulletinTitle";
    const targetContent =
      advancedSearchTable === "articles" ? "articleContent" : "bulletinContent";

    return fetcher.patch(
      `/organizations/${organizationId}/${advancedSearchTable?.toLowerCase()}/${targetId}`,
      {
        [targetTitle]: title,
        [targetContent]: content,
        isRelease,
      }
    );
  },

  createTargetHistoryRecord: (
    payload?: CreateTargetHistoryRecordApiPayload
  ) => {
    const { organizationId, advancedSearchTable, targetId } = payload || {};
    return fetcher.post(
      `/organizations/${organizationId}/${advancedSearchTable}/${targetId}/target-history-records`
    );
  },

  getOrgTargetHistoryRecordVersion: (
    payload?: GetOrgTargetHistoryRecordVersionApiPayload
  ) => {
    const {
      organizationId,
      advancedSearchTable,
      targetId,
      targetHistoryRecordId,
    } = payload || {};
    return fetcher.get<OrganizationTargetHistoryFullContent>(
      `/organizations/${organizationId}/${advancedSearchTable}/${targetId}/target-history-records/${targetHistoryRecordId}`
    );
  },

  createOrgFeedback: (payload?: CreateOrgFeedbackApiPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post(
      `/member/organizations/${organizationId}/feedbacks`,
      others
    );
  },

  /**
   * get organization from domain URL info
   */
  getOrganizationByDomainName: (
    payload?: GetOrganizationByDomainNameApiPayload
  ) => fetcher.post<OrganizationInfoByDomain | undefined>("/domains", payload),

  getOrganizationSettings: (payload?: GetOrganizationSettingsApiPayload) => {
    const { organizationId } = payload || {};
    return fetcher.get<OrganizationSetting[]>(
      `/organizations/${organizationId}/settings`
    );
  },

  getWidgetTemplateList: (payload?: GetWidgetTemplateListApiPayload) => {
    const { organizationId, serviceModuleValue } = payload || {};
    return fetcher.post<WidgetTemplate[]>(
      `/organizations/${organizationId}/widget-templates/list?${queryString.stringify(
        { serviceModuleValue }
      )}`
    );
  },

  getWidgetTemplateDetail: (payload?: GetWidgetTemplateDetailApiPayload) => {
    const { organizationId, widgetTemplateId } = payload || {};
    return fetcher.get<WidgetTemplateDetail>(
      `/organizations/${organizationId}/widget-templates/${widgetTemplateId}`
    );
  },

  postGetChartReportResult: (payload?: PostGetChartReportResultApiPayload) => {
    const { organizationId, serviceModuleValue, ...others } = payload || {};
    return fetcher.post<ChartReportResult>(
      `/organizations/${organizationId}/reports/result?${queryString.stringify({
        serviceModuleValue,
      })}`,
      others
    );
  },

  createOrgReportSave: (payload?: CreateOrgReportSavingApiPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post<OrganizationReport>(
      `/organizations/${organizationId}/reports`,
      others
    );
  },

  getOrgReportList: (payload?: GetOrgReportListApiPayload) => {
    const { organizationId, serviceModuleValue } = payload || {};
    return fetcher.get<OrganizationReport[]>(
      `/organizations/${organizationId}/reports?${queryString.stringify({
        serviceModuleValue,
      })}`
    );
  },

  getOrgReportDetail: (payload?: GetOrgReportDetailApiPayload) => {
    const { organizationId, organizationReportId } = payload || {};
    return fetcher.get<OrganizationReportDetail>(
      `/organizations/${organizationId}/reports/${organizationReportId}`
    );
  },

  updateOrgReport: (payload?: UpdateOrgReportApiPayload) => {
    const { organizationId, organizationReportId, ...others } = payload || {};
    return fetcher.patch<OrganizationReport>(
      `/organizations/${organizationId}/reports/${organizationReportId}`,
      others
    );
  },

  deleteOrgReport: (payload?: DeleteOrgReportApiPayload) => {
    const { organizationId, organizationReportId } = payload || {};
    return fetcher.delete(
      `/organizations/${organizationId}/reports/${organizationReportId}`
    );
  },

  unbindLine: (payload?: UnbindLineApiPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.delete(`/organizations/${organizationId}/line/unbind`, {
      data: others,
    });
  },

  mergeFiles: (payload?: MergeFilesApiPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post<UploadFile[]>(
      `/organizations/${organizationId}/pdfs/merge`,
      others
    );
  },

  resendInvitations: (payload?: ResendInvitationsApiPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post(
      `/organizations/${organizationId}/invitations/re-invite`,
      others
    );
  },

  deleteOrgFeedback: (payload?: DeleteCmsFeedback) => {
    const { organizationId, organizationFeedbackId } = payload || {};
    return fetcher.delete<DeleteCmsFeedback>(
      `/organizations/${organizationId}/feedbacks/${organizationFeedbackId}`
    );
  },
  batchDeleteOrgFeedback: (payload?: BatchDeleteCmsFeedback) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.delete<DeleteCmsFeedback>(
      `/organizations/${organizationId}/feedbacks/batch-delete`,
      { data: others }
    );
  },
};

const publicapi = {
  /**
   * Upload Org files.
   */
  uploadFiles: (
    payload?: UploadFilesApiPayload,
    config?: AxiosRequestConfig<FormData>
  ) => {
    const {
      filePathType,
      imageSizeType,
      files: filesPayload,
      organizationShareShortUrl,
    } = payload || {};
    const formData = getUploadFileFormData(
      filePathType,
      imageSizeType,
      filesPayload
    );
    return uploadFetcher.post<UploadFile[]>(
      `/upload-files?${queryString.stringify({
        organizationShareShortUrl,
      })}`,
      formData,
      config
    );
  },
  updateUser: (payload?: UpdateUserApiPayload) => {
    const { organizationShareShortUrl, ...others } = payload || {};
    return fetcher.patch(
      `/share-reurl/${organizationShareShortUrl}/user`,
      others
    );
  },
  createFinanceTargets: (payload?: CreateFinanceTargetsApiPayload) => {
    const { organizationShareShortUrl, ...others } = payload || {};
    return fetcher.post(
      `/share-reurl/${organizationShareShortUrl}/finance`,
      others
    );
  },
};

const message = {
  /**
   * get all messages
   */
  getAllMessages: (payload?: GetAllMessagesPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post(
      `/organizations/${organizationId}/search/messages`,
      others
    );
  },
  /**
   * get unread messages
   */
  getUnreadMessages: (payload?: GetUnreadMessagesPayload) => {
    const { organizationId, ...others } = payload || {};
    return fetcher.post(
      `/organizations/${organizationId}/search/messages`,
      others
    );
  },
  /**
   * make one message have read
   */
  makeOneMessageHaveRead: (payload?: MakeOneMessageHaveReadPayload) => {
    const { organizationId, messageId, ...others } = payload || {};
    return fetcher.patch(
      `/member/organizations/${organizationId}/messages/${messageId}`,
      others
    );
  },
  /**
   * make all message have read
   */
  makeAllMessageHaveRead: (payload?: MakeAllMessageHaveReadPayload) => {
    const { organizationId } = payload || {};
    return fetcher.patch(
      `/member/organizations/${organizationId}/messages/batch-update-all-read`
    );
  },
};

export default {
  tools,
  member,
  org,
  publicapi,
  message,
};
