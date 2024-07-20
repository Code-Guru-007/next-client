import React, {
  HTMLAttributes,
  FC,
  KeyboardEvent,
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";

import clsx from "clsx";
import makeStyles from "@mui/styles/makeStyles";
import { SvgIconProps } from "@mui/material/SvgIcon";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import DoneIcon from "@mui/icons-material/DoneRounded";
import {
  Autocomplete,
  AutocompleteCloseReason,
  TextField,
  CircularProgress,
} from "@eGroupAI/material";
import {
  AutocompleteChangeReason,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { OrganizationTag } from "interfaces/entities";
import getTextColor from "@eGroupAI/utils/colorUtils";
import Chip from "@mui/material/Chip";

const useStyles = makeStyles((theme) => {
  const colors = {
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
  };

  return {
    root: ({ color = "primary" }: TagProps) => {
      let backgroundColor;
      if (Object.keys(colors).includes(color)) backgroundColor = colors[color];
      else backgroundColor = color;
      const textColor = getTextColor(backgroundColor);
      return {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "8px",
        letterSpacing: "0.5px",
        backgroundColor,
        color: textColor,
        fontFamily: "Public Sans,sans-serif",
        fontStyle: "normal",
        fontWeight: 700,
        fontSize: "15px",
        lineHeight: "22px",
      };
    },
    normalRoot: {
      padding: "4px 16px",
    },
    actionRoot: {
      padding: "6px 10px 6px 10px",
    },
    remove: {
      display: "inline-flex",
      borderRadius: "50%",
      border: "none",
      cursor: "pointer",
      position: "relative",
      "& .MuiSvgIcon-root": {
        zIndex: 1,
        width: "18px",
        height: "18px",
      },
      "&::before": {
        position: "absolute",
        width: "8px",
        height: "8px",
        backgroundColor: "#9E9E9E",
        content: "'\\00a0'",
        left: "50%",
        top: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        zIndex: 0,
      },
    },
    inputRoot: {
      "&::before, &::after": {
        boxSizing: "border-box",
      },

      display: "inline-grid",
      verticalAlign: "top",
      alignItems: "center",
      position: "relative",
      border: "none",

      "&::after": {
        width: "auto",
        gridArea: "1 / 2",
        font: "inherit",
        margin: 0,
        resize: "none",
        appearance: "none",
        border: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50px",
        letterSpacing: "0.5px",
        padding: "6px 50px 6px 12px",
        backgroundColor: "#EEEEEE",
        color: "#000",
        fontStyle: "normal",
        fontWeight: 400,
        fontSize: "15px",
        lineHeight: "22px",
        content: "attr(data-value) ' '",
        visibility: "hidden",
        whiteSpace: "pre-wrap",
      },
    },
    input: {
      width: "auto",
      gridArea: "1 / 2",
      font: "inherit",
      margin: 0,
      resize: "none",
      appearance: "none",
      border: "none",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "flex-start",
      letterSpacing: "0.5px",
      color: "#000",
      fontStyle: "normal",
      fontWeight: 400,
      fontSize: "15px",
      lineHeight: "22px",
      "&:focus": {
        outline: "none",
      },
      "& .MuiTextField-root": {
        border: "none",
      },
    },
    textInput: {
      padding: "6px 50px 6px 12px",
    },
  };
});

const computedClass = makeStyles(() => ({
  input: (mLength) => ({
    minWidth: `${mLength}px`,
  }),
}));

export interface TagInputProps {
  /**
   * the value of tag in edit state.
   */
  value?: string | string[];
  /**
   * the change event of input tag in edit state.
   */
  onChange?: (value?: string | string[]) => void;
  /**
   * the callback when the enter key is pressed.
   * for uncontrolled component, can use value parameter.
   */
  onSubmit?: (value?: string | string[]) => void;
  /**
   * the callback when the keyDown event fires
   */
  onKeyDown?: (event: KeyboardEvent) => void;
}

export interface TagProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The color of the tag.
   */
  color?: string;
  /**
   * Tag on delete click callback.
   */
  onDelete?: SvgIconProps["onClick"];
  /**
   * the flag of is edit status
   */
  edit?: boolean;
  /**
   * able to select multiple options in edit mode
   */
  multiple?: boolean;
  loading?: boolean;
  /**
   * Default variant is 'Text'
   * @default "Text"
   */
  variant?: "Text" | "Autocomplete";
  /**
   * options for autocomplete
   */
  options?: OrganizationTag[];
  /**
   * the props of input tag: value & onChange
   */
  inputProps?: TagInputProps;
  deletable?: boolean;
  isDrawer?: boolean;
  onCancel?: () => void;
  isTagDeleting?: boolean;
}

type OrganizationTagOption = OrganizationTag & { groupName: string };

const Tag: FC<TagProps> = (props) => {
  const classes = useStyles(props);
  const {
    className,
    onDelete,
    onCancel,
    children,
    edit = false,
    multiple: multipleProp = false,
    inputProps = {},
    variant = "Text",
    options: optionsProp = [],
    deletable = true,
    isDrawer = false,
    loading = true,
    isTagDeleting = false,
    ...other
  } = props;

  const theme = useTheme();
  const multiple = variant === "Autocomplete" ? multipleProp : false;
  const [inputValue, setInputValue] = useState<string | string[] | undefined>(
    ""
  );
  const [selectedTags, setSelectedTags] = useState<OrganizationTagOption[]>([]);
  const inputEl = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(edit);

  const isDownSm = useMediaQuery(theme.breakpoints.down("sm"));

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (inputProps.onChange) {
      inputProps.onChange(e);
    }
  };

  const handleChangeTagOptions = (option, reason: AutocompleteChangeReason) => {
    if (multiple && variant === "Autocomplete") {
      if (
        typeof option[option.length - 1] === "string" &&
        reason === "createOption"
      ) {
        return;
      }
      setInputValue(option.map((o) => o.tagName));
      if (inputProps.onChange) {
        inputProps.onChange(option.map((o) => o.tagId));
      }
    } else if (!multiple && variant === "Autocomplete") {
      setInputValue(option.tagName);
      if (inputProps.onChange) {
        inputProps.onChange(option.tagId);
      }
    }
  };

  const handleCancelButtonClick = () => {
    if (onCancel) onCancel();
  };

  useEffect(() => {
    setInputValue(inputProps?.value);
  }, [inputProps.value]);

  useEffect(() => {
    if (edit && inputEl.current) {
      inputEl.current.focus();
    }
  }, [edit]);

  const options = useMemo(
    () =>
      optionsProp.map((el) => {
        const groupName = el.organizationTagGroup.tagGroupName;
        return {
          ...el,
          groupName,
        };
      }),
    [optionsProp]
  );

  useEffect(() => {
    if (inputProps.value && options && options?.length !== 0) {
      if (
        Array.isArray(inputProps.value) &&
        inputProps.value.length &&
        multipleProp &&
        options?.length
      ) {
        const tags = options.filter((option) =>
          inputProps.value?.includes(option.tagId)
        );
        setSelectedTags(tags as OrganizationTagOption[]);
      } else {
        setSelectedTags([]);
      }
    }
  }, [inputProps.value, multipleProp, options]);

  const maxName = useMemo(
    () =>
      options
        .map((o) => o.tagName.length)
        .reduce((a, b) => {
          if (b > a) return b;
          return a;
        }, 0),
    [options]
  );

  const computedLength = useMemo(() => maxName * 16 + 65, [maxName]);
  let mLength = useMemo(
    () => (computedLength > 200 ? computedLength : 200),
    [computedLength]
  );

  if (isDownSm) mLength = 300;
  const mClasses = computedClass(isDrawer ? 337 : mLength);

  if (edit) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (inputProps.onSubmit) {
            inputProps.onSubmit(inputProps.value);
          }
        }}
      >
        <span
          className={classes.inputRoot}
          data-value={!multiple ? inputValue : ""}
          id="tag-autocomplete-width"
        >
          {variant === "Autocomplete" ? (
            <Autocomplete
              freeSolo
              autoHighlight
              disablePortal
              ref={inputEl}
              open={open}
              disableCloseOnSelect={multiple}
              multiple={multiple}
              onOpen={() => setOpen(true)}
              onClose={(_, reason: AutocompleteCloseReason) => {
                if (!multiple) setOpen(false);
                if (
                  multiple &&
                  (reason === "blur" ||
                    reason === "escape" ||
                    reason === "toggleInput")
                ) {
                  setOpen(false);
                }
              }}
              className={clsx(classes.input, mClasses.input)}
              size="small"
              value={selectedTags}
              clearIcon={false}
              options={options}
              groupBy={(option) => option.groupName}
              onChange={(_, value, reason) =>
                handleChangeTagOptions(value, reason)
              }
              renderInput={(params) => (
                <>
                  <TextField
                    {...params}
                    size="small"
                    autoFocus
                    inputRef={inputRef}
                    sx={{ width: "75%", marginRight: "10px" }}
                    InputProps={{
                      ...params.InputProps,
                      size: "small",
                      type: "text",
                      onKeyDown: inputProps?.onKeyDown,
                      inputProps: {
                        ...params.inputProps,
                        size: "small",
                        id: "tag-autocomplete-input",
                      },
                    }}
                  />
                  <>
                    {loading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <CheckCircleRoundedIcon
                        sx={{
                          color: theme.palette.success.main,
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          if (inputProps.onSubmit) inputProps.onSubmit();
                        }}
                        id="tag-save-btn"
                      />
                    )}

                    {!loading && (
                      <CancelRoundedIcon
                        sx={{
                          color: theme.palette.error.main,
                          cursor: "pointer",
                        }}
                        onClick={handleCancelButtonClick}
                        id="tag-cancel-btn"
                      />
                    )}
                  </>
                </>
              )}
              componentsProps={{
                paper: {
                  sx: {
                    ".MuiAutocomplete-popper:has(&)": {
                      width: `${isDrawer ? 337 : mLength}px !important`,
                    },
                  },
                },
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.tagName + index}
                    label={option.tagName}
                    sx={{
                      backgroundColor: option.tagColor,
                    }}
                  />
                ))
              }
              renderOption={(optionProps, option, state) => {
                const { key, ...otherOptionProps } = optionProps as Record<
                  string,
                  unknown
                >;
                const optionUniqueKey = (key as string) + optionProps.id;
                return (
                  <li {...otherOptionProps} key={optionUniqueKey}>
                    {multiple && (
                      <>
                        <Box
                          component={DoneIcon}
                          sx={{ width: 17, height: 17, mr: "5px", ml: "-2px" }}
                          style={{
                            visibility: state.selected ? "visible" : "hidden",
                          }}
                        />
                        <Box
                          component="span"
                          sx={{
                            width: 14,
                            height: 14,
                            flexShrink: 0,
                            borderRadius: "3px",
                            mr: 1,
                            mt: "2px",
                          }}
                          style={{ backgroundColor: option.tagColor }}
                        />
                      </>
                    )}
                    <Box
                      sx={{
                        flexGrow: 1,
                        "& span": {
                          color:
                            theme.palette.mode === "light"
                              ? "#586069"
                              : "#8b949e",
                        },
                      }}
                    >
                      {option.tagName}
                    </Box>
                  </li>
                );
              }}
              getOptionLabel={(option) => option.tagName}
            />
          ) : (
            <input
              ref={inputEl}
              type="text"
              className={clsx(classes.input, classes.textInput)}
              value={inputProps?.value}
              onChange={handleInputChange}
              size={1}
              {...other}
              id="tag-text-input"
            />
          )}
        </span>
      </form>
    );
  }
  return (
    <div
      className={clsx(className, classes.root, {
        [classes.normalRoot]: !onDelete,
        [classes.actionRoot]: onDelete,
      })}
      {...other}
    >
      {children}
      <Box sx={{ display: "inline-flex", width: "16px" }} />
      {onDelete &&
        deletable &&
        (isTagDeleting ? (
          <CircularProgress size={16} sx={{ color: theme.palette.grey[0] }} />
        ) : (
          <span className={classes.remove} id="tag-delete-btn">
            <CancelRoundedIcon
              fontSize="small"
              onClick={(e) => {
                onDelete(e);
                e.stopPropagation();
              }}
              sx={{
                color: "#FFF",
              }}
            />
          </span>
        ))}
    </div>
  );
};

export default Tag;
