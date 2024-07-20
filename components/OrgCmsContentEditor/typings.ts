import { ReactNode } from "react";
import { EditSectionDialogProps } from "components/EditSectionDialog";
import { OrganizationCmsContent, OrganizationMedia } from "interfaces/entities";
import { CmsContentFormInput } from "interfaces/form";
import { SetFormIsDirty } from "utils/useSetFormIsDirty";
import { KeyedMutator } from "swr";
import { AxiosResponse } from "axios";
import { ContentType, Locale } from "interfaces/utils";
import { SetFormIsBusy } from "utils/useSetFormIsBusy";

export interface EditorBaseProps extends Omit<EditSectionDialogProps, "open"> {
  primary?: ReactNode;
  onEditClose?: () => void;
  isOpen?: boolean;
  handleClose?: () => void;
  handleOpen?: () => void;
}

export interface CmsContentEditorProps {
  tableSelectedLocale?: Locale;
  openAddDialog?: boolean;
  setOpenAddDialog?: any;
  sortOpenDialog?: boolean;
  setSortOpenDialog?: any;
  organizationProductId?: string;
  data: OrganizationCmsContent | undefined;
  contentType?: ContentType;
  primary?: ReactNode;
  onEditClose?: () => void;
  setSearchTableData?: any;
  searchTableData?: string;
  loading?: boolean;
  setAddable?: React.Dispatch<React.SetStateAction<boolean>>;
  useOneItemAtOnce?: boolean;
}

export interface ProductEditorProps extends CmsContentEditorProps {
  organizationProductId: string;
}

export interface CmsContentFormProps {
  setSortItems?: any;
  dialogElementShow?: boolean;
  sortOpenDialog?: boolean;
  onSubmit: (
    values: CmsContentFormInput,
    mutate: KeyedMutator<AxiosResponse<OrganizationCmsContent>>,
    handleClose?: () => void
  ) => void;
  cmsContentId: string | undefined;
  selectedLocale: Locale;
  setFormIsDirty?: SetFormIsDirty;
  setFormIsBusy?: SetFormIsBusy;
  handleClose?: () => void;
  setAddable?: React.Dispatch<React.SetStateAction<boolean>>;
  selectedEditItem?: OrganizationMedia;
  setSelectedEditItem?: React.Dispatch<
    React.SetStateAction<OrganizationMedia | undefined>
  >;
  useOneItemAtOnce?: boolean;
}
