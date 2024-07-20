import React, { FC } from "react";
import Select, {
  Props,
  OptionTypeBase,
  MenuPlacement,
  MenuPosition,
  MultiValueProps,
} from "react-select";
import CreatableSelect from "react-select/creatable";
import { emphasize, useTheme, TextFieldProps } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Typography from "@eGroupAI/material/Typography";
import ListItem from "@eGroupAI/material/ListItem";
import ListItemText from "@eGroupAI/material/ListItemText";
import Avatar from "@eGroupAI/material/Avatar";
import ListItemAvatar from "@eGroupAI/material/ListItemAvatar";
import PersonIcon from "@mui/icons-material/Person";
import Chip from "@eGroupAI/material/Chip";
import Paper from "@eGroupAI/material/Paper";
import muiComponents from "./components";

export interface OptionType extends OptionTypeBase {
  value: string;
  label: string;
}

export interface ReactSelectProps extends Props<OptionType, boolean> {
  /**
   * Mui `TextField` props.
   */
  MuiTextFieldProps?: TextFieldProps;
  /**
   * The variant to use.
   */
  variant?: "normal" | "creatable";
}

export const useStyles = makeStyles(
  (theme) => ({
    input: {
      display: "flex",
    },
    single: {},
    multi: {},
    multiStandard: {},
    multiFilled: {},
    multiOutlined: {},
    valueContainer: {
      width: "fit-content",
      overflow: "hidden",
      flexWrap: "nowrap",
      display: "flex",
      flex: 1,
      alignItems: "center",
      "& > div": {},
    },
    chip: {
      margin: "0 3px",
    },
    chipFocused: {
      backgroundColor: emphasize(
        theme.palette.mode === "light"
          ? theme.palette.grey[300]
          : theme.palette.grey[700],
        0.08
      ),
    },
    noOptionsMessage: {
      padding: `${theme.spacing()} ${theme.spacing(2)}`,
    },
    singleValue: {},
    indicator: {
      cursor: "pointer",
    },
    separator: {
      alignSelf: "center",
      backgroundColor: "hsl(0,0%,80%)",
      width: 1,
      height: theme.spacing(2),
    },
    select: () => ({
      width: "550px",
      height: "55.61px",
      background: theme.palette.grey[500],
      borderRadius: "26px",
      fontFamily: theme.typography.fontFamily,
      fontSize: "15px",
      lineHeight: "22px",
      fontWeight: 400,
      margin: "10px 0 30px 0px",
      "& .MuiEgReactSelect-separator, .MuiInputLabel-root": {
        display: "none",
      },
      "& p.MuiTypography-body1": {
        fontSize: "15px",
        lineHeight: "22px",
        color: theme.palette.grey[300],
        marginLeft: "18px",
        marginRight: "-15px",
      },
      "& .MuiChip-filled:last-child": {
        marginRight: "-15px",
      },
      "& .MuiChip-deleteIcon:hover": {
        color: theme.palette.grey[600],
      },
      "& .MuiFormControl-root, & .MuiOutlinedInput-root": {
        height: "100%",
        marginTop: "0px",
      },
      "& .MuiButtonBase-root": {
        background: theme.palette.primary.main,
        color: theme.palette.grey[700],
        padding: "5px",
        height: "31.78px",
        fontSize: "15px",
      },
      "& .css-1t8l2tu-MuiInputBase-input-MuiOutlinedInput-input": {
        padding: "11.92px 25.51px 11.92px 12px",
        height: "auto",
      },
      "& .MuiEgReactSelect-valueContainer input": {
        margin: 0,
        marginLeft: "16px",
      },
      "& .MuiChip-label": {
        padding: 0,
      },
      "& fieldset": {
        borderColor: theme.palette.grey[300],
        borderWidth: "1px",
        borderRadius: "26px",
      },
      "& .MuiOutlinedInput-root:hover fieldset, & .Mui-focused fieldset, .Mui-focused .MuiOutlinedInput-notchedOutline":
        {
          borderColor: theme.palette.primary.main,
          borderWidth: "1px",
        },
      "& .MuiOutlinedInput-root.Mui-error:hover .MuiOutlinedInput-notchedOutline, & .Mui-error .MuiOutlinedInput-notchedOutline":
        {
          borderColor: theme.palette.error.main,
        },
      "& .Mui-focused p": {
        color: "#000",
      },
    }),
  }),
  {
    name: "MuiEgReactSelect",
  }
);

const ReactSelect: FC<ReactSelectProps> = (props) => {
  const { components, variant = "normal", ...other } = props;
  const classes = useStyles(props);
  const theme = useTheme();

  // To fixed input text color in type=dark
  const selectStyles = {
    input: (provided: any) => ({
      ...provided,
      color: theme.palette.grey[300],
      borderRadius: "26px",
      "& input": {
        font: "inherit",
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: theme.palette.grey[700],
      boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.161)",
      borderRadius: "none",
      width: "500px",
      marginTop: "3px",
      marginLeft: "25px",
      color: theme.palette.grey[300],
      fontSize: "15px",
      "& .MuiEgReactSelect-noOptionsMessage": {
        color: theme.palette.grey[300],
      },
      "& div::-webkit-scrollbar": {
        width: "0px",
      },
    }),
    menuPortal: (provided: any) => ({
      ...provided,
      zIndex: 9999,
    }),
  };

  const ClearIndicator = (props: any) => {
    const {
      innerProps: { ref, ...restInnerProps },
    } = props;
    return (
      <svg
        {...restInnerProps}
        ref={ref}
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        style={{ marginRight: "11.48px", cursor: "pointer" }}
      >
        <path
          d="M1 1.17188L9 9.11595"
          stroke={theme.palette.grey[300]}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M9 1.17188L1 9.11595"
          stroke={theme.palette.grey[300]}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  const DropdownIndicator = (props) => {
    const {
      selectProps: { menuIsOpen },
    } = props;
    return (
      <svg
        width="13"
        height="8"
        viewBox="0 0 13 8"
        fill="none"
        style={{
          transform: menuIsOpen ? "rotate(180deg)" : "initial",
          cursor: "pointer",
        }}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.48001 7.05936C6.33677 7.05743 6.19958 7.00173 6.09601 6.90346L0.640008 1.6147C0.590784 1.56588 0.551861 1.50781 0.525519 1.44387C0.499176 1.37994 0.485943 1.31142 0.486595 1.24235C0.487247 1.17327 0.50177 1.10502 0.529315 1.04158C0.556859 0.978146 0.596871 0.920806 0.647008 0.872917C0.749161 0.774304 0.885644 0.71856 1.02811 0.717266C1.17057 0.715971 1.30806 0.769226 1.41201 0.865966L6.48001 5.77838L11.549 0.865966C11.652 0.763797 11.7914 0.706008 11.937 0.705099C12.0828 0.70385 12.2232 0.759478 12.328 0.860008C12.379 0.909436 12.4195 0.96853 12.447 1.03378C12.4748 1.09841 12.4888 1.16807 12.488 1.23834C12.4871 1.30891 12.4719 1.37856 12.4434 1.4432C12.4149 1.50784 12.3736 1.56615 12.322 1.6147L6.86601 6.90346C6.76199 7.00228 6.62396 7.05803 6.48001 7.05936Z"
          fill={theme.palette.grey[300]}
        />
      </svg>
    );
  };

  const selectProps = {
    classes,
    styles: selectStyles,
    components: {
      ...muiComponents,
      ...components,
      DropdownIndicator,
      ClearIndicator,
      // ...Option
    },
    menuPortalTarget: document.body,
    menuPlacement: "auto" as MenuPlacement,
    menuPosition: "absolute" as MenuPosition,
    ...other,
  };

  if (variant === "creatable") {
    return <CreatableSelect className={classes.select} {...selectProps} />;
  }

  return <Select className={classes.select} {...selectProps} />;
};

export default ReactSelect;

export function DefaultReactSelect(props: ReactSelectProps) {
  const { components } = props;
  const theme = useTheme();

  const MultiValue = (props: MultiValueProps<any>) => {
    const { data, removeProps, innerProps } = props;
    const { label } = data;
    return (
      <Chip
        sx={{
          backgroundColor: theme.palette.primary.main,
          marginLeft: "6px",
          padding: "3.97px 7px 4.96px 15px",
          "&:first-of-type": { marginLeft: 0 },
        }}
        label={
          <div style={{ display: "inline-flex", alignItems: "center" }}>
            <Typography
              variant="h5"
              sx={{
                maxWidth: "70px",
                fontSize: "15px",
                color: `${theme.palette.grey[700]} !important`,
                lineHeight: "22.5px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {label}
            </Typography>
            <svg
              width="18"
              height="19"
              viewBox="0 0 18 19"
              style={{ cursor: "pointer", marginLeft: "5px" }}
              {...removeProps}
            >
              <path
                d="M9 0.867188C10.78 0.867187 12.5201 1.39134 14.0001 2.37336C15.4802 3.35538 16.6337 4.75116 17.3149 6.3842C17.9961 8.01723 18.1743 9.81418 17.8271 11.5478C17.4798 13.2814 16.6226 14.8739 15.364 16.1237C14.1053 17.3736 12.5016 18.2248 10.7558 18.5696C9.00998 18.9145 7.20038 18.7375 5.55585 18.0611C3.91131 17.3846 2.50571 16.2391 1.51677 14.7694C0.527841 13.2998 0 11.5719 0 9.80427C0 7.43401 0.948212 5.16083 2.63604 3.4848C4.32387 1.80877 6.61305 0.867188 9 0.867188V0.867188Z"
                fill={theme.palette.grey[700]}
              />
              <path
                d="M5 5.83203L13 13.7761"
                stroke={theme.palette.grey[300]}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M13 5.83203L5 13.7761"
                stroke={theme.palette.grey[300]}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        }
        {...innerProps}
      />
    );
  };

  const nextProps = {
    components: {
      MultiValue,
      ...components,
    },
    ...props,
  };

  return <ReactSelect {...nextProps} />;
}

export function ReactSelectWithImageTitle(props: ReactSelectProps) {
  const { components } = props;
  const theme = useTheme();
  const Option = (props: any) => {
    const { isSelected, data, innerRef, isFocused, innerProps } = props;
    const { type, label, value, image } = data;
    return (
      <Paper
        sx={{
          width: "100%",
          borderTop:
            type === "item" ? "none" : `1px solid ${theme.palette.grey[400]}`,
          margin: "0",
          ":first-of-type": { paddingTop: "20px" },
        }}
      >
        <ListItem
          buttonRef={innerRef}
          selected={isFocused}
          button
          sx={{
            fontWeight: isSelected ? 500 : 400,
            width: "auto",
            padding:
              type === "item" ? "14px 20px 20px 22px" : "9.02px 20px 15px 22px",
            margin: "0 10px",
            "&.Mui-selected, &.Mui-selected:hover": {
              backgroundColor: theme.palette.grey[600],
            },
            borderRadius: "5px",
          }}
          {...innerProps}
        >
          <ListItemAvatar>
            <Avatar
              src={image}
              sx={{
                width: "54px",
                height: "54px",
                marginRight: "20px",
                bgcolor:
                  type === "item" ? theme.palette.grey[300] : "transparent",
              }}
            >
              {type === "item" ? (
                value
              ) : (
                <svg width="31" height="27" viewBox="0 0 31 27" fill="none">
                  <path
                    d="M15.5001 6.20833V3.29167C15.5001 1.6875 14.1876 0.375 12.5834 0.375H3.83342C2.22925 0.375 0.916748 1.6875 0.916748 3.29167V23.7083C0.916748 25.3125 2.22925 26.625 3.83342 26.625H27.1668C28.7709 26.625 30.0834 25.3125 30.0834 23.7083V9.125C30.0834 7.52083 28.7709 6.20833 27.1668 6.20833H15.5001ZM12.5834 23.7083H3.83342V20.7917H12.5834V23.7083ZM12.5834 17.875H3.83342V14.9583H12.5834V17.875ZM12.5834 12.0417H3.83342V9.125H12.5834V12.0417ZM12.5834 6.20833H3.83342V3.29167H12.5834V6.20833ZM27.1668 23.7083H15.5001V9.125H27.1668V23.7083ZM24.2501 12.0417H18.4167V14.9583H24.2501V12.0417ZM24.2501 17.875H18.4167V20.7917H24.2501V17.875Z"
                    fill={theme.palette.grey[300]}
                  />
                </svg>
              )}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={label}
            sx={{ color: theme.palette.grey[300] }}
          />
          <svg
            width="35"
            height="35"
            viewBox="0 0 35 35"
            fill="none"
            style={{ display: isSelected ? "flex" : "none" }}
          >
            <g clipPath="url(#clip0_3041_15664)">
              <path
                d="M17.5001 2.9165C9.45008 2.9165 2.91675 9.44984 2.91675 17.4998C2.91675 25.5498 9.45008 32.0832 17.5001 32.0832C25.5501 32.0832 32.0834 25.5498 32.0834 17.4998C32.0834 9.44984 25.5501 2.9165 17.5001 2.9165ZM13.548 23.7561L8.31258 18.5207C7.74383 17.9519 7.74383 17.0332 8.31258 16.4644C8.88133 15.8957 9.80008 15.8957 10.3688 16.4644L14.5834 20.6644L24.6167 10.6311C25.1855 10.0623 26.1042 10.0623 26.673 10.6311C27.2417 11.1998 27.2417 12.1186 26.673 12.6873L15.6042 23.7561C15.0501 24.3248 14.1167 24.3248 13.548 23.7561Z"
                fill={theme.palette.success.main}
              />
            </g>
            <defs>
              <clipPath id="clip0_3041_15664">
                <rect width="35" height="35" fill={theme.palette.grey[700]} />
              </clipPath>
            </defs>
          </svg>
        </ListItem>
      </Paper>
    );
  };

  const SingleValue = (props: any) => {
    const { data, isSelected, innerProps } = props;
    const { label, value, image } = data;
    return (
      <ListItem
        style={{
          fontWeight: isSelected ? 500 : 400,
          padding: 0,
        }}
        {...innerProps}
      >
        <ListItemAvatar sx={{ minWidth: "25px" }}>
          <Avatar
            src={image}
            sx={{
              width: "25px",
              height: "25px",
              bgcolor: theme.palette.grey[300],
              marginRight: "10px",
              fontSize: "18px",
            }}
          >
            {value}
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={label} sx={{ color: theme.palette.grey[300] }} />
      </ListItem>
    );
  };

  const MultiValue = (props: MultiValueProps<any>) => {
    const { data, innerProps, removeProps } = props;
    const { label, value, image } = data;
    return (
      <ListItem
        style={{
          width: "fit-content",
          height: "30.78px",
          padding: "6px",
          marginRight: "5px",
          border: `1px solid ${theme.palette.grey[300]}`,
          borderRadius: "20px",
          backgroundColor: theme.palette.grey[700],
        }}
        {...innerProps}
      >
        <ListItemAvatar sx={{ minWidth: "25px" }}>
          <Avatar
            src={image}
            sx={{
              width: "20px",
              height: "20px",
              bgcolor: theme.palette.grey[300],
              marginRight: "5px",
              fontSize: "10px",
            }}
          >
            {value}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography style={{ margin: "4px 0", fontSize: "10px" }}>
              {label}
            </Typography>
          }
          sx={{ color: theme.palette.grey[300] }}
        />
        <svg
          width="18"
          height="19"
          viewBox="0 0 18 19"
          style={{ cursor: "pointer", marginLeft: "5px" }}
          {...removeProps}
        >
          <path
            d="M9 0.867188C10.78 0.867187 12.5201 1.39134 14.0001 2.37336C15.4802 3.35538 16.6337 4.75116 17.3149 6.3842C17.9961 8.01723 18.1743 9.81418 17.8271 11.5478C17.4798 13.2814 16.6226 14.8739 15.364 16.1237C14.1053 17.3736 12.5016 18.2248 10.7558 18.5696C9.00998 18.9145 7.20038 18.7375 5.55585 18.0611C3.91131 17.3846 2.50571 16.2391 1.51677 14.7694C0.527841 13.2998 0 11.5719 0 9.80427C0 7.43401 0.948212 5.16083 2.63604 3.4848C4.32387 1.80877 6.61305 0.867188 9 0.867188V0.867188Z"
            fill={theme.palette.grey[600]}
          />
          <path
            d="M5 5.83203L13 13.7761"
            stroke={theme.palette.grey[300]}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M13 5.83203L5 13.7761"
            stroke={theme.palette.grey[300]}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </ListItem>
    );
  };

  const selectStyles = {
    menu: (provided: any) => ({
      ...provided,
      width: "491px",
      height: "auto",
      marginLeft: "28px",
      marginTop: "6px",
      boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.161)",
      "& div::-webkit-scrollbar": {
        width: "0px",
      },
      "& .css-4ljt47-MenuList": {
        minHeight: "370px",
        paddingTop: "0px",
        paddingBottom: "0px",
      },
    }),
  };

  const nextProps = {
    components: {
      // MenuList,
      Option,
      SingleValue,
      MultiValue,
      ...components,
    },
    styles: selectStyles,
    ...props,
  };

  return <ReactSelect {...nextProps} />;
}

export function ReactSelectWithImageContentTitle(props: ReactSelectProps) {
  const { components } = props;
  const theme = useTheme();
  const Option = (props: any) => {
    const { data, innerRef, isFocused, isSelected, innerProps } = props;
    const { label, image, desc } = data;
    return (
      <ListItem
        buttonRef={innerRef}
        selected={isFocused}
        button
        sx={{
          fontWeight: isSelected ? 500 : 400,
          padding: "1px 10px",
          "&.Mui-selected, &.Mui-selected:hover": {
            backgroundColor: theme.palette.grey[600],
          },
          "&:hover .css-128rle-MuiAvatar-root, &.Mui-selected .css-128rle-MuiAvatar-root":
            {
              backgroundColor: theme.palette.grey[700],
            },
        }}
        {...innerProps}
      >
        <ListItemAvatar sx={{ minWidth: "auto" }}>
          <Avatar
            src={image}
            sx={{
              bgcolor: theme.palette.grey[600],
              color: theme.palette.grey[300],
            }}
          >
            <PersonIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          sx={{ marginLeft: "5px" }}
          primary={
            <Typography
              sx={{
                fontSize: "15px",
                color: `${theme.palette.grey[300]} !important`,
              }}
            >
              {label}
            </Typography>
          }
          secondary={
            <Typography
              sx={{
                fontSize: "10px",
                color: `${theme.palette.grey[300]} !important`,
              }}
            >
              {desc}
            </Typography>
          }
        />
        <svg
          width="35"
          height="35"
          viewBox="0 0 35 35"
          fill="none"
          style={{ display: isSelected ? "flex" : "none" }}
        >
          <g clipPath="url(#clip0_3041_15664)">
            <path
              d="M17.5001 2.9165C9.45008 2.9165 2.91675 9.44984 2.91675 17.4998C2.91675 25.5498 9.45008 32.0832 17.5001 32.0832C25.5501 32.0832 32.0834 25.5498 32.0834 17.4998C32.0834 9.44984 25.5501 2.9165 17.5001 2.9165ZM13.548 23.7561L8.31258 18.5207C7.74383 17.9519 7.74383 17.0332 8.31258 16.4644C8.88133 15.8957 9.80008 15.8957 10.3688 16.4644L14.5834 20.6644L24.6167 10.6311C25.1855 10.0623 26.1042 10.0623 26.673 10.6311C27.2417 11.1998 27.2417 12.1186 26.673 12.6873L15.6042 23.7561C15.0501 24.3248 14.1167 24.3248 13.548 23.7561Z"
              fill={theme.palette.success.main}
            />
          </g>
          <defs>
            <clipPath id="clip0_3041_15664">
              <rect width="35" height="35" fill={theme.palette.grey[700]} />
            </clipPath>
          </defs>
        </svg>
      </ListItem>
    );
  };

  const SingleValue = (props: any) => {
    const { data } = props;
    const { label, image, isFocused, isSelected, innerProps } = data;
    return (
      <ListItem
        selected={isFocused}
        style={{
          fontWeight: isSelected ? 500 : 400,
          padding: 0,
        }}
        {...innerProps}
      >
        <ListItemAvatar sx={{ minWidth: "25px" }}>
          <Avatar
            src={image}
            sx={{
              width: "25px",
              height: "25px",
              bgcolor: theme.palette.grey[700],
              color: theme.palette.grey[300],
              marginRight: "8px",
              fontSize: "12px",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path
                d="M6.49992 6.50016C8.06534 6.50016 9.33325 5.23225 9.33325 3.66683C9.33325 2.10141 8.06534 0.833496 6.49992 0.833496C4.9345 0.833496 3.66659 2.10141 3.66659 3.66683C3.66659 5.23225 4.9345 6.50016 6.49992 6.50016ZM6.49992 7.91683C4.60867 7.91683 0.833252 8.866 0.833252 10.7502V11.4585C0.833252 11.8481 1.152 12.1668 1.54159 12.1668H11.4583C11.8478 12.1668 12.1666 11.8481 12.1666 11.4585V10.7502C12.1666 8.866 8.39117 7.91683 6.49992 7.91683Z"
                fill={theme.palette.grey[300]}
              />
            </svg>
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={label} sx={{ color: theme.palette.grey[300] }} />
      </ListItem>
    );
  };

  const MultiValue = (props: MultiValueProps<any>) => {
    const { data, innerProps, removeProps } = props;
    const { label, image } = data;
    return (
      <ListItem
        style={{
          // fontWeight: props.isSelected ? 500 : 400,
          width: "fit-content",
          height: "30.78px",
          padding: "6px",
          marginRight: "5px",
          border: `1px solid ${theme.palette.grey[300]}`,
          borderRadius: "20px",
          backgroundColor: theme.palette.grey[700],
        }}
        {...innerProps}
      >
        <ListItemAvatar sx={{ minWidth: "25px" }}>
          <Avatar
            src={image}
            sx={{
              width: "20px",
              height: "20px",
              bgcolor: theme.palette.grey[600],
              color: theme.palette.grey[300],
              padding: "5px",
              marginRight: "5px",
              fontSize: "10px",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M4.99992 5.00016C6.28908 5.00016 7.33325 3.956 7.33325 2.66683C7.33325 1.37766 6.28908 0.333496 4.99992 0.333496C3.71075 0.333496 2.66659 1.37766 2.66659 2.66683C2.66659 3.956 3.71075 5.00016 4.99992 5.00016ZM4.99992 6.16683C3.44242 6.16683 0.333252 6.9485 0.333252 8.50016V9.0835C0.333252 9.40433 0.595752 9.66683 0.916585 9.66683H9.08325C9.40409 9.66683 9.66658 9.40433 9.66658 9.0835V8.50016C9.66658 6.9485 6.55742 6.16683 4.99992 6.16683Z"
                fill={theme.palette.grey[300]}
              />
            </svg>
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography style={{ margin: "4px 0", fontSize: "10px" }}>
              {label}
            </Typography>
          }
          sx={{ color: theme.palette.grey[300] }}
        />
        <svg
          width="18"
          height="19"
          viewBox="0 0 18 19"
          style={{ cursor: "pointer", marginLeft: "5px" }}
          {...removeProps}
        >
          <path
            d="M9 0.867188C10.78 0.867187 12.5201 1.39134 14.0001 2.37336C15.4802 3.35538 16.6337 4.75116 17.3149 6.3842C17.9961 8.01723 18.1743 9.81418 17.8271 11.5478C17.4798 13.2814 16.6226 14.8739 15.364 16.1237C14.1053 17.3736 12.5016 18.2248 10.7558 18.5696C9.00998 18.9145 7.20038 18.7375 5.55585 18.0611C3.91131 17.3846 2.50571 16.2391 1.51677 14.7694C0.527841 13.2998 0 11.5719 0 9.80427C0 7.43401 0.948212 5.16083 2.63604 3.4848C4.32387 1.80877 6.61305 0.867188 9 0.867188V0.867188Z"
            fill={theme.palette.grey[600]}
          />
          <path
            d="M5 5.83203L13 13.7761"
            stroke={theme.palette.grey[300]}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M13 5.83203L5 13.7761"
            stroke={theme.palette.grey[300]}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </ListItem>
    );
  };

  const newProps = {
    components: {
      Option,
      SingleValue,
      MultiValue,
      ...components,
    },
    ...props,
  };

  return <ReactSelect {...newProps} />;
}
