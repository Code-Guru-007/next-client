import React, { FC, useState, forwardRef } from "react";
import { styled, Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import Autocomplete, {
  autocompleteClasses,
  AutocompleteRenderOptionState,
} from "@mui/material/Autocomplete";
import InputBase, { InputBaseProps } from "@mui/material/InputBase";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import clsx from "clsx";

interface StyledInputProps extends InputBaseProps {
  /**
   * Initial Input Open state
   * @default false
   */
  initialState?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: "40px",
    height: "40px",
    overflow: "hidden",
    borderRadius: "10000px",
    transitionDuration: "300ms",
    transitionProperty: "width",
    padding: "11px 6px 9px 9px",
    background: theme.palette.grey[700],
    "& .MuiSvgIcon-root": {
      color: theme.palette.grey[300],
    },
    "& input": {
      "-moz-appearance": "none",
      "-webkit-appearance": "none",
      color: theme.palette.grey[300],
      fontStyle: "normal",
      fontWeight: 500,
      fontSize: "15px",
      lineHeight: "22px",
      paddingLeft: "8px",
    },
    "& input::placeholder": {
      color: theme.palette.grey[300],
      opacity: 1,
    },
  },
  active: {
    width: "320px",
  },
}));

const StyledInput: FC<StyledInputProps> = forwardRef((props, ref) => {
  const classes = useStyles(props);
  const { initialState = false, value, ...others } = props;
  const [mouseOver, setMouseOver] = useState(false);

  return (
    <InputBase
      ref={ref}
      className={clsx(classes.root, {
        [classes.active]: mouseOver || initialState || value,
      })}
      onMouseEnter={() => setMouseOver(true)}
      onMouseLeave={() => setMouseOver(false)}
      onBlur={() => setMouseOver(false)}
      {...others}
    />
  );
});

interface PopperComponentProps {
  anchorEl?: any;
  disablePortal?: boolean;
  open: boolean;
}

const StyledAutocompletePopper = styled("div")(({ theme }) => ({
  minWidth: "320px",
  paddingTop: "25px",
  background: "white",
  position: "absolute",
  [`& .${autocompleteClasses.paper}`]: {
    boxShadow: "none",
    padding: "0px 4px 15px 4px",
  },
  [`& .${autocompleteClasses.listbox}`]: {
    padding: "4.5px 0px",
  },
  [`& .${autocompleteClasses.listbox} .${autocompleteClasses.option}`]: {
    padding: "7.5px 16px",
  },
  [`& .${autocompleteClasses.listbox} .${autocompleteClasses.option}.${autocompleteClasses.focused}`]:
    {
      backgroundColor: theme.palette.primary.main,
    },
  [`& .${autocompleteClasses.listbox} .${autocompleteClasses.option}[aria-selected="true"]`]:
    {
      backgroundColor: theme.palette.grey[700],
    },
}));

const PopperComponent: FC<PopperComponentProps> = (props) => {
  //  wrapper
  const { disablePortal, anchorEl, open, ...other } = props;
  return (
    <StyledAutocompletePopper {...other}>
      <p
        style={{
          margin: 0,
          padding: "12px 0px 0px 20px",
          fontStyle: "normal",
          fontWeight: 500,
          fontSize: "15px",
          lineHeight: "22px",
        }}
      >
        Recent Search
      </p>
      {other.children}
    </StyledAutocompletePopper>
  );
};

interface FullTextSearchWithInputBaseProps<T> {
  options: T[];
  renderOption: (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: T,
    state?: AutocompleteRenderOptionState
  ) => React.ReactNode;
  optionKey?: string;
  searchOption?: T | null;
  onSearchOptionChange?: (value: T | null) => void;
}

export default function FullTextSearchWithInputBase<T>({
  options,
  renderOption,
  optionKey = "name",
  searchOption,
  onSearchOptionChange,
}: FullTextSearchWithInputBaseProps<T>) {
  const [inputActive, setInputActive] = useState(false);

  const handleClose = () => {
    setInputActive(false);
  };

  return (
    <div>
      <Autocomplete
        onOpen={() => setInputActive(true)}
        onClose={() => handleClose()}
        onChange={(event, value) => {
          if (onSearchOptionChange) onSearchOptionChange(value);
        }}
        autoHighlight
        disableCloseOnSelect
        PopperComponent={PopperComponent}
        ListboxProps={{ style: { maxHeight: "100%" } }}
        renderOption={renderOption}
        noOptionsText="No result."
        options={options}
        getOptionLabel={(option) => option[optionKey]}
        renderInput={(params) => (
          <StyledInput
            ref={params.InputProps.ref}
            inputProps={params.inputProps}
            placeholder="搜尋"
            startAdornment={<SearchRoundedIcon />}
            initialState={inputActive}
            value={searchOption}
          />
        )}
      />
    </div>
  );
}
