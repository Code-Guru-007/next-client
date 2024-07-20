import React, {
  forwardRef,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
} from "react";
import { useSelector } from "react-redux";

import useFileEvents from "utils/useFileEvents";
import { ServiceModuleValue } from "interfaces/utils";

import Typography from "@eGroupAI/material/Typography";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { UploadFile } from "interfaces/entities";
import Button from "@eGroupAI/material/Button";
import Iconify from "minimal/components/iconify";
import { Upload } from "minimal/components/upload";
import { Stack } from "@mui/material";
import { useAppDispatch } from "redux/configureAppStore";
import { setFiles as setStoreUploadFiles } from "redux/eventDialog";

export interface FilesSectionProps {
  onFileUploading?: () => void;
  onFileUploadFinish?: (file?: UploadFile[]) => void;
  isFileUploadOnSubmitForm?: boolean;
}
export interface FilesSectionRef {
  isFileUploadOnSubmitForm?: boolean;
  selectedFile: (File | string)[];
  handleUploadFileOnSubmit: (targetId: string) => Promise<void>;
}

const FilesSection = forwardRef<FilesSectionRef, FilesSectionProps>(
  (props, ref) => {
    const {
      onFileUploading,
      onFileUploadFinish,
      isFileUploadOnSubmitForm = false,
    } = props;

    const uploadRef = useRef<HTMLDivElement>(null);
    const wordLibrary = useSelector(getWordLibrary);

    const dispatch = useAppDispatch();
    const [files, setFiles] = useState<(File | string)[]>([]);
    const { handleUploadFile } = useFileEvents();

    const handleDrop = useCallback(
      (acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        );

        setFiles([...files, ...newFiles]);
      },
      [files]
    );

    const handleUpload = async (targetId?: string) => {
      if (files) {
        if (onFileUploading) onFileUploading();
        await handleUploadFile({
          files: Array.from(files as File[]),
          filePathType: ServiceModuleValue.EVENT,
          targetId,
          onUploadSuccess: (uploadFiles) => {
            if (onFileUploadFinish) onFileUploadFinish(uploadFiles);
          },
        });
      }
    };

    const handleRemoveFile = (inputFile: File | string) => {
      const filtered = files.filter((file) => file !== inputFile);
      setFiles(filtered);
    };

    const handleRemoveAllFiles = async () => {
      await dispatch(
        setStoreUploadFiles({
          uploadFileList: [],
        })
      );
      setFiles([]);
    };

    // Expose a selected file and upload method to the ref from parent
    useImperativeHandle(ref, () => ({
      isFileUploadOnSubmitForm,
      selectedFile: files,
      handleUploadFileOnSubmit: async (targetId) => {
        await handleUpload(targetId);
      },
    }));

    return (
      <>
        <Typography variant="h4" gutterBottom>
          {wordLibrary?.upload ?? "上傳"}
        </Typography>
        <Stack>
          <Upload
            ref={uploadRef}
            files={files}
            multiple
            onDrop={handleDrop}
            onRemove={handleRemoveFile}
            onDelete={handleRemoveAllFiles}
          />
          <Stack
            direction="row"
            justifyContent="flex-end"
            marginTop={1}
            spacing={2}
          >
            {!!files.length && (
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleRemoveAllFiles}
              >
                移除所有
              </Button>
            )}
            {!!files.length && (
              <Button
                variant="contained"
                startIcon={<Iconify icon="eva:cloud-upload-fill" />}
                onClick={() => {
                  uploadRef.current?.click();
                }}
              >
                {wordLibrary?.upload ?? "上傳"}
              </Button>
            )}
          </Stack>
        </Stack>
      </>
    );
  }
);

export default React.memo(FilesSection);
