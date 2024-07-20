import { createContext } from "react";

export type SearchPanelContextProps = {
  handleCloseSearchPanel: () => void;
  match: boolean;
  setMatch: React.Dispatch<React.SetStateAction<boolean>>;
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
  replaceText: string;
  setReplaceText: React.Dispatch<React.SetStateAction<string>>;
  expand: boolean;
  setExpand: React.Dispatch<React.SetStateAction<boolean>>;
};

const SearchPanelContext = createContext<SearchPanelContextProps>({
  handleCloseSearchPanel: () => {},
  match: false,
  setMatch: () => {},
  searchText: "",
  setSearchText: () => {},
  replaceText: "",
  setReplaceText: () => {},
  expand: false,
  setExpand: () => {},
});

export default SearchPanelContext;
