/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable object-shorthand */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  FC,
  useEffect,
  useState,
  useRef,
  Dispatch,
  SetStateAction,
} from "react";
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
import FroalaEditor from "froala-editor";

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
  docId: string;
  username: string;
  setRefEditor?: Dispatch<SetStateAction<Partial<FroalaEditor> | undefined>>;
}

const RealTimeFroalaEditor: FC<FroalaEditorProps> = function (props) {
  const {
    filePathType,
    config,
    disabled = false,
    docId,
    username,
    setEditor: setRefEditor,
    ...other
  } = props;
  const { Codox } = window as any;
  const organizationId = useSelector(getSelectedOrgId);
  const settings = useSettingsContext();
  const { excute: uploadOrgFiles } = useUploadOrgFiles<
    UploadFile,
    ServiceModuleValue
  >();

  // deepcode ignore HardcodedNonCryptoSecret: <please specify a reason of ignoring this>
  const apiKey = "445bc3bd-da3d-483c-a367-a78730ff5a38";

  const [editor, setEditor] = useState<Partial<FroalaEditor> | undefined>();
  const [codox, setCodoxInstance] = useState<any>(null);
  const [codoxInitialized, setCodoxInitialized] = useState<boolean>(false);

  const timeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (Codox) {
      const codoxInstance = new Codox();
      setCodoxInstance(codoxInstance);
      settings.onUpdate("themeLayout", "mini");
    }
    return () => {
      setCodoxInstance(null);
    };
  }, []);

  useEffect(() => {
    if (setRefEditor) setRefEditor(editor);
    clearTimeout(timeout.current);
    if (editor && codox && username && docId) {
      timeout.current = setTimeout(() => {
        startCollaboration();
      }, 500);
    }
    return () => {
      codox && codox.stop();
      clearTimeout(timeout.current);
    };
  }, [editor, codox, username, docId]);

  const startCollaboration = () => {
    if (editor && codox && username && !codoxInitialized) {
      codox
        .init({
          app: "froala",
          username: username,
          docId: docId,
          // deepcode ignore HardcodedNonCryptoSecret: <please specify a reason of ignoring this>
          apiKey: apiKey,
          editor: editor,
        })
        .then(() => {
          setCodoxInitialized(true);
          codox.on("content_changed", (data) => {
            if (data?.source === "remote") {
              codox.awareness.repaint();
            }
          });
        })
        .catch(() => {
          setCodoxInitialized(false);
          startCollaboration();
        });
    }
  };

  const timeoutToUpdateContent = useRef<NodeJS.Timeout>();

  const handleTriggerSaveContentManually = () => {
    clearTimeout(timeoutToUpdateContent.current);
    timeoutToUpdateContent.current = setTimeout(() => {
      if (other?.triggerSaveContentManually) {
        other.triggerSaveContentManually();
      }
    }, 500);
  };

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
        editor.events.trigger("contentChanged");
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

          editor.events.trigger("contentChanged");
        } catch (error) {
          // eslint-disable-next-line no-console
          apis.tools.createLog({
            function: "RealTimeFroalaEditor.imageBeforeUpload: uploadOrgFiles",
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
          editor.events.trigger("contentChanged");
        } catch (error) {
          // eslint-disable-next-line no-console
          apis.tools.createLog({
            function: "RealTimeFroalaEditor.fileBeforeUpload: uploadOrgFiles",
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
      setEditor={setEditor}
      imageOnReplace={handleReplaceImage}
      handleSaveContentManually={handleTriggerSaveContentManually}
      {...other}
    />
  );
};

export default RealTimeFroalaEditor;
