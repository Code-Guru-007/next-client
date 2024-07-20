import { createContext, SetStateAction } from "react";
import { Locale } from "interfaces/utils";
import { Item } from "./typing";

export type CarouselManagementContextProps = {
  selectedItem?: Item;
  setSelectedItem: (rowState: SetStateAction<Item | undefined>) => void;
  selectedLocale: Locale;
  setSelectedLocale: (rowState: SetStateAction<Locale>) => void;
  isSortDialogOpen?: boolean;
  isEditDialogOpen: boolean;
  closeSortDialog?: () => void;
  closeEditDialog: () => void;
  openSortDialog?: () => void;
  openEditDialog: () => void;
};

const CarouselManagementContext = createContext<CarouselManagementContextProps>(
  {
    setSelectedItem: () => {},
    selectedLocale: Locale.ZH_TW,
    setSelectedLocale: () => {},
    isSortDialogOpen: false,
    isEditDialogOpen: false,
    closeSortDialog: () => {},
    closeEditDialog: () => {},
    openSortDialog: () => {},
    openEditDialog: () => {},
  }
);

export default CarouselManagementContext;
