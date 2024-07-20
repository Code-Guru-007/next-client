import { OrganizationShareEdit } from "interfaces/entities";
import { ServiceModuleValue } from "interfaces/utils";

export type FileTarget = {
  uploadFile: {
    uploadFileId: string;
  };
};

export type ShareEditValuesType = {
  organizationShareEditList: OrganizationShareEdit[];
  organizationFinanceTemplateList: {
    organizationFinanceTemplateId: string;
  }[];
  uploadFileTargetList: FileTarget[];
  organizationShareEditNeedUpload?: string;
  organizationShareIsOneTime: string;
  organizationShareUploadDescription?: string;
  organizationShareWelcomeMessage?: string;
  organizationShareFinishMessage?: string;
  serviceModuleValueForPreviewData?: ServiceModuleValue;
  organizationShareExpiredDate?: string;
};
