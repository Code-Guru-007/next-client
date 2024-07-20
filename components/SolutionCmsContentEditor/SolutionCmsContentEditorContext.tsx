import { createContext, SetStateAction } from "react";
import { Locale } from "interfaces/utils";

export type SolutionCmsContentEditorContextProps = {
  selectedLocale: Locale;
  setSelectedLocale: (rowState: SetStateAction<Locale>) => void;
  isSortDialogOpen?: boolean;
  isEditDialogOpen?: boolean;
  closeSortDialog?: () => void;
  closeEditDialog?: () => void;
  openSortDialog?: () => void;
  openEditDialog?: () => void;
};

const SolutionCmsContentEditorContext =
  createContext<SolutionCmsContentEditorContextProps>({
    selectedLocale: Locale.ZH_TW,
    setSelectedLocale: () => {},
    isSortDialogOpen: false,
    isEditDialogOpen: false,
    closeSortDialog: () => {},
    closeEditDialog: () => {},
    openSortDialog: () => {},
    openEditDialog: () => {},
  });

export default SolutionCmsContentEditorContext;
