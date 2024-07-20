import { OrganizationColumn, UploadFile } from "interfaces/entities";
import { StaticColumn } from "utils/useStaticColumns";

export interface SelectColumnStepProps {
  staticColumns?: StaticColumn[];
  orgColumns?: OrganizationColumn[];
  disableStaticColumns?: boolean;
  disableDynamicColumns?: boolean;
  useTagExport?: boolean;
}

export interface SelectStatementStepProps {
  uploadFiles?: UploadFile[];
}

export type ExtendedColumnType = {
  checked: boolean;
};

export type ExtendedStaticColumn = ExtendedColumnType & StaticColumn;

export type ExtendedDynamicColumn = ExtendedColumnType & OrganizationColumn;

export type ExtendedUploadFile = ExtendedColumnType & UploadFile;

export type UploadFileTarget = {
  uploadFileId: string;
};
