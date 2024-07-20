import { DropzoneOptions } from "react-dropzone";
// @mui
import { Theme, SxProps } from "@mui/material/styles";
import { IconButtonProps } from "@mui/material";

// ----------------------------------------------------------------------

export interface CustomFile extends File {
  path?: string;
  preview?: string;
  lastModifiedDate?: string;
}

export interface UploadProps extends DropzoneOptions {
  error?: boolean;
  sx?: SxProps<Theme>;
  thumbnail?: boolean;
  placeholder?: React.ReactNode;
  helperText?: React.ReactNode;
  disableMultiple?: boolean;
  //
  file?: CustomFile | string | null;
  onDelete?: IconButtonProps["onClick"];
  imgUrl?: string;
  //
  /**
   * used for both of single & multiple files
   */
  files?: (CustomFile | string)[];
  onUpload?: VoidFunction;
  onRemove?: (file: CustomFile | string) => void;
  onRemoveAll?: VoidFunction;
  onSelectFile?: React.Dispatch<
    React.SetStateAction<string | CustomFile | null | undefined>
  >;
  required?: boolean;
  name?: string;
  isHover?: boolean;
  setIsHover?: React.Dispatch<React.SetStateAction<boolean>>;
  isWaitingUpload?: boolean;
  deleteIconBtnType?: "cancel" | "delete" | "none";
  isSlider?: boolean;
}
