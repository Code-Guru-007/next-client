import React, { createContext } from "react";
import {
  ExtendedDynamicColumn,
  ExtendedStaticColumn,
  ExtendedUploadFile,
} from "./typings";

export interface UploadFileTarget {
  uploadFileId: string;
}

export interface UserExportDialogApiPayload {
  isExportTag?: string;
  exportStaticColumnList?: Partial<ExtendedStaticColumn>[];
  exportAgreementFileList?: UploadFileTarget[];
  exportDynamicColumnList?: Partial<ExtendedDynamicColumn>[];
}

export interface UserExportDialogContextProps {
  exportStaticColumnList: ExtendedStaticColumn[];
  setExportStaticColumnList: React.Dispatch<
    React.SetStateAction<ExtendedStaticColumn[]>
  >;

  isExportTag: boolean;
  setIsExportTag: React.Dispatch<React.SetStateAction<boolean>>;

  exportAgreementFileList: ExtendedUploadFile[];
  setExportAgreementFileList: React.Dispatch<
    React.SetStateAction<ExtendedUploadFile[]>
  >;

  exportDynamicColumnList: ExtendedDynamicColumn[];
  setExportDynamicColumnList: React.Dispatch<
    React.SetStateAction<ExtendedDynamicColumn[]>
  >;
}

export const UserExportDialogContext =
  createContext<UserExportDialogContextProps>({
    exportStaticColumnList: [],
    setExportStaticColumnList: () => {},
    isExportTag: false,
    setIsExportTag: () => {},
    exportAgreementFileList: [],
    setExportAgreementFileList: () => {},
    exportDynamicColumnList: [],
    setExportDynamicColumnList: () => {},
  });
