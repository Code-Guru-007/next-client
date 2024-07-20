import React, { Dispatch, FC, SetStateAction } from "react";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import apis from "utils/apis";

import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import {
  ServiceModuleValue,
  OrganizationMediaSizeType,
} from "interfaces/utils";
import dynamic from "next/dynamic";
import useUploadOrgFiles from "@eGroupAI/hooks/apis/useUploadOrgFiles";
import { FroalaEditorProps as EgFroalaEditorProps } from "@eGroupAI/material-module/FroalaEditor";
import { UploadFile } from "interfaces/entities";
import { useSettingsContext } from "minimal/components/settings";
import _FroalaEditor from "froala-editor";

const EgFroalaEditor = dynamic(
  async () => {
    const values = await Promise.all([
      import("froala-editor/js/plugins.pkgd.min"),
      import("@eGroupAI/material-module/FroalaEditor/lang/zh_tw"),
      import("@eGroupAI/material-module/FroalaEditor"),
    ]);
    return values[2];
  },
  {
    loading: () => <div />,
    ssr: false,
  }
);

export interface FroalaEditorProps
  extends Omit<EgFroalaEditorProps, "licenseKey"> {
  filePathType: ServiceModuleValue;
  uploadTargetId?: string;
  disabled?: boolean;
  id?: string;
  testId?: string;
  setEditor?: Dispatch<SetStateAction<Partial<_FroalaEditor> | undefined>>;
}

const FroalaEditor: FC<FroalaEditorProps> = function (props) {
  const {
    filePathType,
    config,
    disabled = false,
    id,
    testId,
    setEditor,
    ...other
  } = props;
  const organizationId = useSelector(getSelectedOrgId);
  const settings = useSettingsContext();
  const { excute: uploadOrgFiles } = useUploadOrgFiles<
    UploadFile,
    ServiceModuleValue
  >();

  const handleReplaceImage = async (files, editor: any) => {
    try {
      if (files && files[0]) {
        const res = await uploadOrgFiles({
          organizationId,
          filePathType: ServiceModuleValue.ARTICLE,
          files: [files[0]],
          eGroupService: "WEBSITE",
        });

        const selectedImage = editor.image.get();

        if (selectedImage) {
          editor.image.insert(
            res.data[0]?.uploadFilePath,
            true,
            null,
            selectedImage,
            null
          );
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      apis.tools.createLog({
        function: "registerImageReplace: handleFileChange",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: error,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
    }
  };

  return (
    <EgFroalaEditor
      aria-disabled={disabled}
      licenseKey="bMA6aC5B5C2F3B1F2D2yQNDMIJg1IQNSEa1EUAi1XVFQd1EaG3C2A5A3C4E3C1D4D2C2=="
      imageBeforeUpload={async (files, editor, selectedImage) => {
        try {
          const res = await uploadOrgFiles({
            organizationId,
            filePathType,
            imageSizeType: OrganizationMediaSizeType.NORMAL,
            files,
            eGroupService: "WEBSITE",
          });
          editor.image.insert(
            res.data[0]?.uploadFilePath,
            null,
            null,
            selectedImage
          );
        } catch (error) {
          // eslint-disable-next-line no-console
          apis.tools.createLog({
            function: "FroalaEditor.imageBeforeUpload: uploadOrgFiles",
            browserDescription: window.navigator.userAgent,
            jsonData: {
              data: error,
              deviceInfo: getDeviceInfo(),
            },
            level: "ERROR",
          });
        }
      }}
      fileBeforeUpload={async (files, editor) => {
        try {
          const res = await uploadOrgFiles({
            organizationId,
            filePathType,
            files,
            eGroupService: "WEBSITE",
          });
          editor.file.insert(res.data[0]?.uploadFilePath, files[0]?.name);
        } catch (error) {
          // eslint-disable-next-line no-console
          apis.tools.createLog({
            function: "FroalaEditor.fileBeforeUpload: uploadOrgFiles",
            browserDescription: window.navigator.userAgent,
            jsonData: {
              data: error,
              deviceInfo: getDeviceInfo(),
            },
            level: "ERROR",
          });
        }
      }}
      config={{
        ...config,
        theme: settings.themeMode,
      }}
      id={id}
      testId={testId}
      setEditor={setEditor}
      imageOnReplace={handleReplaceImage}
      {...other}
    />
  );
};

export default FroalaEditor;
