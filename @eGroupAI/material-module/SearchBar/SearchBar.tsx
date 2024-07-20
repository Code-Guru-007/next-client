import React, {
  FC,
  MouseEventHandler,
  ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";

import {
  PopoverProps,
  IconButton,
  Popover,
  InputAdornment,
} from "@mui/material";

import TextField, { TextFieldProps } from "@eGroupAI/material/TextField";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";

export interface SearchBarBaseProps {
  /**
   * Popover container.
   */
  container?: PopoverProps["container"];
  /**
   * A function called when search button is clicked.
   */
  onSearchClick?: MouseEventHandler<HTMLButtonElement>;
  /**
   * To customized search options.
   */
  renderOptions?: ({ handleDropDownOpen, handleDropDownClose }) => ReactNode;
  /**
   * trigger Search when typing or hit Enter
   * @default false
   */
  triggerSearchOnTyping?: boolean;
  /**
   * search Handler
   */
  handleSearch?: (value: unknown) => void;
}

export type SearchBarProps = SearchBarBaseProps & TextFieldProps;

const SearchBar: FC<SearchBarProps> = ({
  container,
  variant,
  onSearchClick,
  renderOptions,
  handleSearch,
  value: valueProp,
  triggerSearchOnTyping = false,
  ...others
}) => {
  const [value, setValue] = useState(valueProp);
  const [open, setOpen] = useState(false);
  const rootEl = useRef(null);
  const inputEl = useRef<HTMLInputElement>(null);

  const handleDropDownOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleDropDownClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (!triggerSearchOnTyping && handleSearch && inputEl.current) {
        handleSearch(inputEl.current.value);
      }
    }
  };

  const handleOnBlur = () => {
    if (!triggerSearchOnTyping && handleSearch && inputEl.current) {
      handleSearch(inputEl.current.value);
    }
  };

  const handleOnChange = (e) => {
    setValue(e.target.value);
    if (triggerSearchOnTyping && handleSearch) handleSearch(e.target.value);
  };

  return (
    <>
      <TextField
        {...others}
        variant={variant}
        value={value}
        onKeyPress={handleKeyPress}
        onChange={handleOnChange}
        onBlur={handleOnBlur}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton type="submit" onClick={onSearchClick} size="large">
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
          inputRef: inputEl,
        }}
      />
      {renderOptions && (
        <>
          <IconButton onClick={handleDropDownOpen} size="large">
            <FilterListIcon />
          </IconButton>
          <Popover
            open={open}
            container={container}
            anchorEl={rootEl.current}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            onClose={handleDropDownClose}
          >
            {renderOptions({ handleDropDownOpen, handleDropDownClose })}
          </Popover>
        </>
      )}
    </>
  );
};

export default SearchBar;
