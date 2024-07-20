import { createContext, SetStateAction } from "react";
import { Locale } from "interfaces/utils";

export type SolutionInfoManagementContextProps = {
  selectedLocale: Locale;
  setSelectedLocale?: (rowState: SetStateAction<Locale>) => void;
  isSortDialogOpen?: boolean;
  isEditDialogOpen?: boolean;
  closeSortDialog?: () => void;
  closeEditDialog?: () => void;
  openSortDialog?: () => void;
  openEditDialog?: () => void;
};

const SolutionInfoManagementContext =
  createContext<SolutionInfoManagementContextProps>({
    selectedLocale: Locale.ZH_TW,
    setSelectedLocale: () => {},
    isSortDialogOpen: false,
    isEditDialogOpen: false,
    closeSortDialog: () => {},
    closeEditDialog: () => {},
    openSortDialog: () => {},
    openEditDialog: () => {},
  });

export default SolutionInfoManagementContext;
