import React, {
  FC,
  useEffect,
  useRef,
  useState,
  SetStateAction,
  useMemo,
  useCallback,
} from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useSelector } from "react-redux";
import apis from "utils/apis";
import makeStyles from "@mui/styles/makeStyles";
import useControlled from "@eGroupAI/hooks/useControlled";
import clsx from "clsx";
import serialize from "form-serialize";
import InfiniteScroll from "react-infinite-scroll-component";

import Typography from "@eGroupAI/material/Typography";
import TextField from "@mui/material/TextField";
import Button, { ButtonProps } from "@eGroupAI/material/Button";
import EnhancePopover from "@eGroupAI/material/EnhancePopover";
import styled from "@mui/styles/styled";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";

import IconButton from "@mui/material/IconButton";

import Iconify from "minimal/components/iconify";

import { format, toDate, DateVariant } from "@eGroupAI/utils/dateUtils";
import { Box, CircularProgress, InputAdornment } from "@mui/material";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import UncontrolledCheckboxWithLabel from "./UncontrolledCheckboxWithLabel";
import ChoiceMultiText from "./ChoiceMultiText";
import DateTimeRangePicker from "./DateTimeRangePicker";
import NumberRange from "./NumberRange";
import { Item, NumberRangeStates, Option, Value } from "./types";
import { optionToValueType, optionsToValue } from "./utils";

const useStyles = makeStyles((theme) => ({
  popover: {
    "& .MuiEnhancePopover-paper": {
      maxHeight: "calc(100vh - 335px)",
      maxWidth: 550,
      minWidth: 300,
      paddingBottom: 65.5,
    },
    "& .MuiEnhancePopover-container": {
      display: "flex",
      maxHeight: "calc(100vh - 400px)",
      flexDirection: "column",
    },
  },
  enhancePopoverFullHeight: {
    "& .MuiEnhancePopover-paper": {
      maxHeight: "calc(100vh - 335px)",
    },
  },
  header: {
    padding: "30px 30px 8px 24px",
    position: "relative",
    lineHeight: "50px",
  },
  closeIcon: {
    color: theme.palette.grey[300],
    "&:hover": {
      backgroundColor: theme.palette.grey[600],
    },
    "& .MuiSvgIcon-root": {
      fontWeight: 900,
    },
  },
  container: {
    display: "flex",
    flexDirection: "column",
    padding: "0px 24px 35px",
    maxHeight: "calc(100vh - 540px)",
    overflowY: "auto",
    minWidth: "10rem",
    maxWidth: "100%",
    gap: theme.spacing(1),
    [theme.breakpoints.down("md")]: {
      width: "100%",
      alignItems: "center",
    },
  },
  actions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "flex-end",
    padding: "12px 32px 13px",
  },
  item: {
    width: "100%",
    padding: "18px 0px 0px 0px",
  },
  optionContent: {
    display: "flex",
    flexWrap: "wrap",
    width: "100%",
    padding: "10px 0px 0px 0px",
    margin: 0,
    gap: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      width: "300px",
    },
  },
  vertical: {
    flexDirection: "column",
  },
  numberRange: {
    padding: theme.spacing(0, 1),
    width: "100%",
  },
  multiText: {
    paddingTop: theme.spacing(1),
    width: "100%",
  },
  checkbox: {
    "&.MuiFormControlLabel-root": {
      margin: 0,
    },
    "& .MuiTypography-root": {},
    "& span.MuiCheckbox-root": {
      padding: "2px",
      margin: "0px 4px",
    },
  },
  numberRangeHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  numberRangeHeaderContent: {
    display: "inline-flex",
  },
  searchContent: {
    marginTop: "15px",
    marginBottom: "5px",
    "&.MuiEgTextField-mediumSize .MuiInputBase-root input": {
      padding: "13px 30px 12px 10px",
    },
  },
}));

export interface NewFilterDropDownProps
  extends Omit<
    ButtonProps,
    "onChange" | "onSubmit" | "value" | "defaultValue"
  > {
  options: Option[];
  defaultRangeNumberMinValue?: number | null;
  defaultRangeNumberMaxValue?: number | null;
  value?: Value;
  savedValue?: Value;
  defaultValue?: Value;
  onChange?: (value: Value) => void;
  onSubmit?: (value: Value) => void;
  onClear?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onSave?: (value: Value) => void;
  onCancel?: (value: Value) => void;
  defaultNumberRangeStates?: NumberRangeStates;
}

interface InputCheckboxRefsType {
  [id: string]: HTMLInputElement;
}

const StyledButton = styled(Button)(() => ({
  display: "flex",
  justifyContent: "space-between",
  minWidth: "138px",
}));

const NewFilterDropDown: FC<NewFilterDropDownProps> = (props) => {
  const classes = useStyles();
  const {
    onClick,
    options: optionsProp,
    defaultRangeNumberMinValue = null,
    defaultRangeNumberMaxValue = null,
    value: valueProp,
    savedValue: savedValueProp,
    defaultValue,
    onChange,
    onSubmit,
    onSave,
    onCancel,
    endIcon,
    defaultNumberRangeStates: numberRangeList,
    ...other
  } = props;
  const { excute: getOrgEventsTargetRelations } = useAxiosApiWrapper(
    apis.org.getOrgEventsTargetRelations,
    "None"
  );
  const btnRef = useRef<HTMLButtonElement>(null);
  const [scrollIndex, setScrollIndex] = useState<number>(0);
  const [scrollNumber, setScrollNumber] = useState<number>(scrollIndex);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scrollTo, setScrollTo] = useState<number>(0);
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [hasRun, setHasRun] = useState(false);
  const wordLibrary = useSelector(getWordLibrary);
  const organizationId = useSelector(getSelectedOrgId);
  const [initialValue, setInitialValue] = useControlled({
    controlled: valueProp
      ? optionsToValue(
          optionsProp,
          defaultRangeNumberMinValue,
          defaultRangeNumberMaxValue,
          valueProp
        )
      : undefined,
    default: optionsToValue(
      optionsProp,
      defaultRangeNumberMinValue,
      defaultRangeNumberMaxValue,
      defaultValue
    ),
  });
  const [savedValue, setSavedValue] = useState(initialValue);
  const [tempValue, setTempValue] = useState(savedValue);

  const paperEl = useRef<HTMLDivElement>(null);
  const [shouldFullHeight, setShouldFullHeight] = useState(false);

  const inputRefs = useRef<InputCheckboxRefsType>({});
  const [isClearDatePicker, setIsClearDatePicker] = useState<boolean>(false);
  const [isClearNumberRange, setIsClearNumberRange] = useState<boolean>(false);
  const [isClearAutoComplete, setIsClearAutoComplete] =
    useState<boolean>(false);

  const [savedPaperWidth, setSavedPaperWidth] = useState<number>(
    paperEl.current?.offsetWidth as number
  );

  useEffect(() => {
    setSavedValue(savedValueProp as SetStateAction<Value>);
    setTempValue(savedValueProp as SetStateAction<Value>);
  }, [savedValueProp]);

  useEffect(() => {
    if (isOpen && containerEl && paperEl.current) {
      setShouldFullHeight(
        containerEl.scrollHeight > paperEl.current.offsetHeight
      );
    }
  }, [containerEl, isOpen]);

  const handleClearOptionValues = useCallback(() => {
    Object.values(inputRefs.current).forEach((inputEl) => {
      const el = inputEl.querySelector("input");
      if (el) {
        if (el.checked === true) el.click();
      }
    });
    setIsClearDatePicker(true);
    setIsClearNumberRange(true);
    setIsClearAutoComplete(true);
    setTempValue(
      optionsToValue(
        optionsProp,
        defaultRangeNumberMinValue,
        defaultRangeNumberMaxValue,
        defaultValue
      )
    );
  }, [
    defaultRangeNumberMaxValue,
    defaultRangeNumberMinValue,
    defaultValue,
    optionsProp,
  ]);

  const handleClose = useCallback(() => {
    setHasMore(true);
    setTempValue(savedValue);
    setInitialValue(savedValue);
    if (onCancel) onCancel(savedValue);
    setIsOpen(false);
  }, [onCancel, savedValue, setInitialValue]);

  const containerRender = useCallback(
    (ref) => {
      setContainerEl(ref);
      if (ref !== null) {
        setIsLoading(false);
        containerEl?.scrollTo({
          top: scrollTo,
          behavior: "smooth",
        });
        if (paperEl.current) setSavedPaperWidth(paperEl.current.clientWidth);
      }
    },
    [containerEl, scrollTo]
  );

  const optionsShowStatus = useMemo(() => {
    let showStatus = {};
    if (searchText === "") {
      showStatus = optionsProp.reduce(
        (a, b) => ({ ...a, [b.filterId]: true }),
        {}
      );
      return showStatus;
    }
    const escapedSearchText = escapeRegExp(searchText.toLowerCase()); // 轉義特殊字符並轉為小寫
    showStatus = optionsProp.reduce((a, b) => {
      if (b.filterName.toLowerCase().search(escapedSearchText) !== -1)
        return { ...a, [b.filterId]: true };
      const matchedItems = b.items?.filter(
        (item) =>
          item?.label &&
          item?.label.toLowerCase().search(escapedSearchText) !== -1
      );
      if (matchedItems && matchedItems.length > 0)
        return { ...a, [b.filterId]: true };
      return { ...a, [b.filterId]: false };
    }, {});
    return showStatus;
  }, [optionsProp, searchText]);
  const enabledOptionFilterIds = Object.keys(optionsShowStatus).filter(
    (key) => optionsShowStatus[key] === true
  );

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // 將特殊字符前加上反斜杠進行轉義
  }

  const filteredOptions = optionsProp.filter((option) =>
    enabledOptionFilterIds.includes(option.filterId)
  );

  const optionsToRender = searchText ? filteredOptions : optionsProp;

  const renderedOptions = useMemo(
    () => (isOpen ? optionsToRender.slice(0, scrollNumber + 5) : []),
    [isOpen, optionsToRender, scrollNumber]
  );

  useEffect(() => {
    if (paperEl.current && renderedOptions.length !== 0) {
      setSavedPaperWidth(paperEl.current.clientWidth);
    }
  }, [renderedOptions.length]);

  const fetchData = useCallback(() => {
    setScrollNumber(scrollNumber + 1);
    if (scrollNumber + 5 >= optionsToRender.length) setHasMore(false);
  }, [optionsToRender.length, scrollNumber]);

  const renderOptionContent = useCallback(
    (option: Option, key: number) => {
      const { type, filterId, items } = option;

      const controlledValue =
        tempValue[filterId] ||
        optionToValueType(
          option,
          defaultRangeNumberMinValue,
          defaultRangeNumberMaxValue
        );

      switch (type) {
        case "CHOICEMULTI":
          return items?.map((item) => (
            <UncontrolledCheckboxWithLabel
              ref={(el) => {
                if (el) inputRefs.current[`${filterId}-${item.label}`] = el;
              }}
              className={classes.checkbox}
              key={item.value}
              label={item.label}
              value={item.value}
              name={filterId}
              defaultChecked={(controlledValue as string[]).includes(
                item.value
              )}
              MuiCheckboxProps={{
                color: "primary",
              }}
              onClick={() => setScrollIndex(key)}
              setFilterOptionsTempValue={setTempValue}
            />
          ));
        case "DATETIME_RANGE":
          return (
            <DateTimeRangePicker
              showTime
              defaultStartDate={
                toDate(controlledValue[0] as DateVariant) as Date
              }
              defaultStartTime={format(
                controlledValue[0] as DateVariant,
                "HH:mm"
              )}
              defaultEndDate={toDate(controlledValue[1] as DateVariant) as Date}
              defaultEndTime={format(
                controlledValue[1] as DateVariant,
                "HH:mm"
              )}
              variant="standard"
              size="small"
              name={filterId}
              onClick={() => setScrollIndex(key)}
              isClearDateTime={isClearDatePicker}
              onClearDatePicker={setIsClearDatePicker}
              setFilterOptionsTempValue={setTempValue}
            />
          );
        case "DATE_RANGE":
          return (
            <DateTimeRangePicker
              defaultStartDate={
                toDate(controlledValue[0] as DateVariant) as Date
              }
              defaultEndDate={toDate(controlledValue[1] as DateVariant) as Date}
              variant="standard"
              size="small"
              name={filterId}
              onClick={() => setScrollIndex(key)}
              isClearDateTime={isClearDatePicker}
              onClearDatePicker={setIsClearDatePicker}
              setFilterOptionsTempValue={setTempValue}
            />
          );
        case "NUMBER_RANGE": {
          return (
            <NumberRange
              className={classes.numberRange}
              valueLabelDisplay="auto"
              name={filterId}
              defaultValue={controlledValue as number[] | undefined}
              onClick={() => setScrollIndex(key)}
              showSliderBar={false}
              isClearNumberRange={isClearNumberRange}
              onClearNumberRange={setIsClearNumberRange}
              setFilterOptionsTempValue={setTempValue}
            />
          );
        }
        case "CHOICEMULTI_TEXT": {
          return (
            <ChoiceMultiText
              className={classes.multiText}
              items={items}
              name={filterId}
              defaultValue={controlledValue as Item[]}
              isClearAutoComplete={isClearAutoComplete}
              onClearAutoComplete={setIsClearAutoComplete}
              setFilterOptionsTempValue={setTempValue}
            />
          );
        }
        default:
          return undefined;
      }
    },
    [
      defaultRangeNumberMinValue,
      defaultRangeNumberMaxValue,
      tempValue,
      isClearDatePicker,
      classes.checkbox,
      classes.numberRange,
      classes.multiText,
      isClearNumberRange,
      isClearAutoComplete,
    ]
  );

  const renderOptions = useCallback(
    () => (
      <div
        ref={containerRender}
        id="filterOptionsScroll"
        className={classes.container}
      >
        {renderedOptions.map((option, key) => (
          <Box
            key={option.filterId}
            className={classes.item}
            sx={{
              display:
                optionsShowStatus[option.filterId] === true ? "block" : "none",
            }}
          >
            <Box className={classes.numberRangeHeader}>
              <Typography
                gutterBottom
                fontWeight={400}
                variant="body1"
                color="text"
                className={classes.numberRangeHeaderContent}
              >
                {option.filterName}
              </Typography>
            </Box>
            <Box
              className={clsx(
                classes.optionContent,
                renderedOptions.length === 1 && classes.vertical
              )}
            >
              {renderOptionContent(option, key)}
            </Box>
          </Box>
        ))}
      </div>
    ),
    [
      containerRender,
      classes.container,
      classes.item,
      classes.numberRangeHeader,
      classes.numberRangeHeaderContent,
      classes.optionContent,
      classes.vertical,
      renderedOptions,
      optionsShowStatus,
      renderOptionContent,
    ]
  );

  const handleOnChange = (e) => {
    setSearchText(e.target.value);
  };

  const ClearSearchText = () => {
    setSearchText("");
  };

  const renderPopover = useCallback(
    () => (
      <EnhancePopover
        open
        anchorEl={btnRef.current}
        onCloseClick={handleClose}
        onClickAway={(e) => {
          if (!btnRef.current?.contains(e.target as Node)) {
            handleClose();
          }
        }}
        PaperProps={{
          ref: paperEl,
        }}
        className={clsx(classes.popover, {
          [classes.enhancePopoverFullHeight]: shouldFullHeight,
        })}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setIsOpen(false);
            setHasMore(true);
            setScrollTo(
              containerEl?.scrollTop ? Number(containerEl?.scrollTop) - 30 : 0
            );
            const serialValues = serialize(e.nativeEvent.target, {
              hash: true,
            });

            const values = {};
            Object.keys(serialValues).forEach((key) => {
              if (typeof serialValues[key] === "string") {
                try {
                  const v = JSON.parse(serialValues[key]);
                  if (typeof v === "string") values[key] = [v];
                  else if (typeof v === "number") values[key] = [`${v}`];
                  else values[key] = v;
                } catch (error) {
                  values[key] = [serialValues[key]];
                }
                return;
              }
              values[key] = serialValues[key];
            });

            // number range value parse
            Object.keys(numberRangeList || {}).forEach((key) => {
              delete values[`${key}-from`];
              delete values[`${key}-to`];
              const from = serialValues[`${key}-from`]
                ? Number(serialValues[`${key}-from`])
                : null;
              const to = serialValues[`${key}-to`]
                ? Number(serialValues[`${key}-to`])
                : null;
              values[key] = [from, to];
            });

            setSavedValue({ ...tempValue });
            if (onSubmit) onSubmit({ ...tempValue });
            if (onSave) onSave({ ...tempValue });
            setScrollNumber(scrollIndex);
          }}
          style={{
            width:
              renderedOptions.length === 0 ? `${savedPaperWidth}px` : "auto",
          }}
        >
          <div className={classes.header}>
            <Box sx={{ display: "flex" }}>
              <Typography fontWeight={500} variant="h4" color="text">
                {other.children}
              </Typography>
              <Box flexGrow={1} />
              <IconButton onClick={handleClose} className={classes.closeIcon}>
                <Iconify icon="mingcute:close-line" />
              </IconButton>
            </Box>
            <TextField
              className={classes.searchContent}
              value={searchText}
              onChange={handleOnChange}
              fullWidth
              size="small"
              placeholder="搜尋..."
              InputProps={{
                endAdornment:
                  searchText === "" ? undefined : (
                    <InputAdornment position="end">
                      <IconButton onClick={ClearSearchText}>
                        <CloseIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify
                      icon="eva:search-fill"
                      sx={{ color: "text.disabled" }}
                    />
                  </InputAdornment>
                ),
              }}
              id="filter-condition-search-input"
            />
          </div>
          <InfiniteScroll
            dataLength={renderedOptions.length}
            next={fetchData}
            hasMore={hasMore}
            loader={<></>}
            scrollableTarget="filterOptionsScroll"
            style={{
              overflow: "unset",
            }}
            scrollThreshold={0.9}
          >
            {renderOptions()}
          </InfiniteScroll>
          <div className={classes.actions}>
            <Button
              color="grey"
              variant="contained"
              onClick={() => {
                handleClose();
              }}
              sx={{ mr: 1 }}
              id="filter-close-button"
            >
              {wordLibrary?.close ?? "關閉"}
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={() => {
                setHasMore(true);
                handleClearOptionValues();
              }}
              sx={{ mr: 1 }}
              id="filter-clear-button"
            >
              {wordLibrary?.clear ?? "清除"}
            </Button>
            <Button
              color="primary"
              variant="contained"
              type="submit"
              id="filter-save-button"
            >
              {wordLibrary?.save ?? "儲存"}
            </Button>
          </div>
        </form>
      </EnhancePopover>
    ),
    [
      handleClose,
      classes.popover,
      classes.enhancePopoverFullHeight,
      classes.header,
      classes.closeIcon,
      classes.searchContent,
      classes.actions,
      shouldFullHeight,
      renderedOptions.length,
      savedPaperWidth,
      other.children,
      searchText,
      fetchData,
      hasMore,
      renderOptions,
      wordLibrary,
      containerEl?.scrollTop,
      numberRangeList,
      tempValue,
      onSubmit,
      onSave,
      scrollIndex,
      handleClearOptionValues,
    ]
  );

  return (
    <>
      <StyledButton
        ref={btnRef}
        onClick={(e) => {
          if (!hasRun) {
            setHasRun(true);
            if (optionsProp) {
              for (let j = 0; j < optionsProp.length; j += 1) {
                const el = optionsProp[j];
                if (el?.targetType && el.type === "CHOICEMULTI_TEXT") {
                  getOrgEventsTargetRelations({
                    organizationId: organizationId as string,
                    targetType: el.targetType,
                  }).then((res) => {
                    if (el.items) {
                      el.items = el.items.concat(
                        res.data.map((dd) => ({
                          label: dd.name,
                          value: dd.value,
                        }))
                      );
                    }
                  });
                }
              }
            }
          }
          if (onClick) {
            onClick(e);
          }
          setIsLoading(true);
        }}
        endIcon={
          isLoading ? (
            <CircularProgress
              ref={() => {
                setTimeout(() => {
                  setIsOpen(true);
                }, 300);
              }}
              size={20}
            />
          ) : (
            endIcon
          )
        }
        {...other}
      />
      {isOpen && renderPopover()}
    </>
  );
};

export default React.memo(NewFilterDropDown);
