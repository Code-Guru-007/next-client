/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { forwardRef, HTMLAttributes, ReactNode, Ref } from "react";
import clsx from "clsx";
import { IconButton, useFormControl, IconButtonProps } from "@mui/material";
import { WithStyles } from "@mui/styles";
import createStyles from "@mui/styles/createStyles";
import withStyles from "@mui/styles/withStyles";
import useControlled from "@eGroupAI/hooks/useControlled";

const styles = createStyles({
  root: {
    padding: 9,
  },
  checked: {},
  disabled: {},
  uncontrolled: {},
  input: {
    cursor: "inherit",
    position: "absolute",
    opacity: 0,
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    margin: 0,
    padding: 0,
    zIndex: 1,
  },
});

export interface SwitchIconButtonProps
  extends Omit<IconButtonProps, "onChange" | "type"> {
  /**
   * If `true`, the `input` element will be focused during the first mount.
   */
  autoFocus?: boolean;
  /**
   * If `true`, the component is checked.
   */
  checked?: boolean;
  /**
   * The icon to display when the component is checked.
   */
  checkedIcon: ReactNode;
  /**
   * @ignore
   */
  className?: string;
  /**
   * @ignore
   */
  defaultChecked?: boolean;
  /**
   * If `true`, the switch will be disabled.
   */
  disabled?: boolean;
  /**
   * If `true`, the switch will be uncontrolled.
   */
  uncontrolled?: boolean;
  /**
   * The icon to display when the component is unchecked.
   */
  icon: ReactNode;
  /**
   * The id of the `input` element.
   */
  id?: string;
  /**
   * [Attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes) applied to the `input` element.
   */
  inputProps?: HTMLAttributes<HTMLInputElement>;
  /**
   * Pass a ref to the `input` element.
   */
  inputRef?: Ref<HTMLInputElement>;
  /*
   * @ignore
   */
  name?: string;
  /**
   * @ignore
   */
  onBlur?: (event) => void;
  /**
   * Callback fired when the state is changed.
   *
   * @param {object} event The event source of the callback.
   * You can pull out the new checked state by accessing `event.target.checked` (boolean).
   */
  onChange?: (event, checked: boolean) => void;
  /**
   * @ignore
   */
  onFocus?: (event) => void;
  /**
   * It prevents the user from changing the value of the field
   * (not from interacting with the field).
   */
  readOnly?: boolean;
  /**
   * If `true`, the `input` element will be required.
   */
  required?: boolean;
  /**
   * @ignore
   */
  tabIndex?: number;
  /**
   * The input component prop `type`.
   */
  type: string;
  /**
   * The value of the component.
   */
  value?: any;
}

const SwitchIconButton = forwardRef<
  HTMLButtonElement,
  SwitchIconButtonProps & WithStyles<typeof styles>
>((props, ref) => {
  const {
    autoFocus,
    checked: checkedProp,
    checkedIcon,
    classes,
    className,
    defaultChecked,
    disabled: disabledProp,
    uncontrolled: uncontrolledProp,
    icon,
    id,
    inputProps,
    inputRef,
    name,
    onBlur,
    onChange,
    onFocus,
    readOnly,
    required,
    tabIndex,
    type,
    value,
    ...other
  } = props;
  const [checked, setCheckedState] = useControlled({
    controlled: checkedProp,
    default: Boolean(defaultChecked),
  });

  const muiFormControl = useFormControl();

  const handleFocus = (event) => {
    if (onFocus) {
      onFocus(event);
    }

    if (muiFormControl && muiFormControl.onFocus) {
      muiFormControl.onFocus();
    }
  };

  const handleBlur = (event) => {
    if (onBlur) {
      onBlur(event);
    }

    if (muiFormControl && muiFormControl.onBlur) {
      muiFormControl.onBlur();
    }
  };

  const handleInputChange = (event) => {
    const newChecked = event.target.checked;

    setCheckedState(newChecked);

    if (onChange) {
      // TODO v5: remove the second argument.
      onChange(event, newChecked);
    }
  };

  let disabled = disabledProp;
  const uncontrolled = uncontrolledProp;

  if (muiFormControl) {
    if (typeof disabled === "undefined") {
      const { disabled: formControlDisabled } = muiFormControl;
      disabled = formControlDisabled;
    }
  }

  const hasLabelFor = type === "checkbox" || type === "radio";

  return (
    <IconButton
      component="span"
      className={clsx(
        classes.root,
        {
          [classes.checked]: checked,
          [classes.disabled]: disabled,
          [classes.uncontrolled]: uncontrolled,
        },
        className
      )}
      disabled={disabled}
      tabIndex={null as any}
      role={undefined}
      onFocus={handleFocus}
      onBlur={handleBlur}
      ref={ref}
      {...other}
      size="large"
    >
      {/* deepcode ignore ReactControlledUncontrolledFormElement: <It can be used for both cases...> */}
      <input
        checked={checkedProp}
        defaultChecked={defaultChecked}
        className={classes.input}
        disabled={disabled}
        id={hasLabelFor ? id : undefined}
        name={name}
        onChange={handleInputChange}
        readOnly={readOnly}
        ref={inputRef}
        required={required}
        tabIndex={tabIndex}
        type={type}
        value={value}
        {...inputProps}
      />
      {checked ? checkedIcon : icon}
    </IconButton>
  );
});

export default withStyles(styles, { name: "MuiEgSwitchIconButton" })(
  SwitchIconButton
);
