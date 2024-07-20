import {
  OrganizationShareTemplateEdit,
  OrganizationTag,
} from "interfaces/entities";
import { ServiceModuleValue } from "interfaces/utils";

export type FileTarget = {
  uploadFile: {
    uploadFileId: string;
  };
};

export type ShareTemplateEditValuesType = {
  organizationShareTemplateTitle: string;
  organizationShareTemplateTagList: OrganizationTag[];
  organizationShareTemplateEditList: OrganizationShareTemplateEdit[];
  organizationFinanceTemplateList: {
    organizationFinanceTemplateId: string;
  }[];
  uploadFileTargetList: FileTarget[];
  organizationShareTemplateEditNeedUpload?: string;
  organizationShareTemplateIsOneTime: string;
  organizationShareTemplateUploadDescription?: string;
  organizationShareTemplateWelcomeMessage?: string;
  organizationShareTemplateFinishMessage?: string;
  serviceModuleValueForPreviewData?: ServiceModuleValue;
} & (
  | {
      organizationShareTemplateExpiredDate?: string;
      organizationShareTemplateEndDaysInterval?: never;
    }
  | {
      organizationShareTemplateExpiredDate?: never;
      organizationShareTemplateEndDaysInterval?: number;
    }
);
