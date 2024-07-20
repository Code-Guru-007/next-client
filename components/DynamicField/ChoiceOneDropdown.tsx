import React, { FC, useState, useEffect } from "react";

import Box from "@mui/material/Box";
import TextField from "@eGroupAI/material/TextField";
import Autocomplete from "@eGroupAI/material/Autocomplete";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";

import { DynamicColumnTarget, OrgColumnRelatedData } from "interfaces/entities";
import { DynamicValueType } from "interfaces/form";
import { makeStyles } from "@mui/styles";
import { RemarkValues } from "./types";

type OptionType = {
  optionId: string;
  label: string;
  value: string;
  nextColumnId?: string;
};

export type RemarkValue = {
  organizationOptionId: string;
  organizationOptionName: string;
  columnTargetValueRemark?: string;
};

interface ChoiceOneDropdownProps {
  name: string;
  value: string | number | null | undefined;
  label?: string;
  error?: string;
  options?: OptionType[];
  variant?: "standard" | "outlined";
  hasRemark?: boolean;
  requiredRemark?: boolean;
  handleVerify?: (value: string) => void;
  handleRequired?: (value: string | undefined) => void;
  handleChange: (
    name: string,
    value: DynamicValueType | undefined,
    relatedTargetOption?: OrgColumnRelatedData
  ) => void;
  handleTargetValue?: (value: string) => void;
  setError?: (value: string) => void;
  setColumnTargetValues?: React.Dispatch<React.SetStateAction<RemarkValues>>;
  handleRemarkChange?: (
    name: string,
    optionId: string,
    optionName: string,
    value: string
  ) => void;
  remarkError?: string;
  required?: boolean;
  remarkList?: RemarkValue[];
  isRelatedServiceModule?: boolean;
  columnRelatedServiceModuleValue?: string;
  disabled?: boolean;
  focused?: boolean;
  hasNextColumn?: boolean;
  setSelectedNextColumnIds?: React.Dispatch<
    React.SetStateAction<{
      [parentKey: string]: string | undefined;
    }>
  >;
  nextColumnTargets?: DynamicColumnTarget[] | undefined;
  setNextColumnTarget?: React.Dispatch<
    React.SetStateAction<DynamicColumnTarget | undefined>
  >;
  preview?: boolean;
  columnTargetRelatedTargetId?: string;
  selectedDropdownOption?: OrgColumnRelatedData | null;
}

const useStyles = makeStyles(() => ({
  btnResetOptions: {
    padding: "16px 0 0 16px",
  },
  autocomplete: {
    "& .MuiOutlinedInput-root": {
      padding: 0,
    },
  },
}));

let timeout;
let listBoxTarget;
const ChoiceOneDropdown: FC<ChoiceOneDropdownProps> = (props) => {
  const {
    name,
    value,
    label,
    options,
    hasRemark = false,
    requiredRemark = false,
    handleVerify,
    handleRequired,
    handleChange,
    setColumnTargetValues,
    handleTargetValue,
    setError,
    handleRemarkChange,
    remarkError,
    remarkList,
    isRelatedServiceModule = false,
    columnRelatedServiceModuleValue,
    disabled = false,
    focused = false,
    hasNextColumn,
    setSelectedNextColumnIds,
    nextColumnTargets,
    setNextColumnTarget,
    preview = false,
    selectedDropdownOption,
  } = props;
  const wordLibrary = useSelector(getWordLibrary);
  const classes = useStyles();
  const [remarkValue, setRemarkValue] = useState("");
  const [query, setQuery] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<
    OptionType | undefined
  >();
  const [autocompleteSelected, setAutocompleteSelected] =
    useState<OrgColumnRelatedData | null>({
      targetId: selectedDropdownOption?.targetId || "",
      targetInformationList: selectedDropdownOption?.targetInformationList,
    });
  const [relatedData, setRelatedData] = useState<
    OrgColumnRelatedData[] | undefined
  >();

  const [displayOptions, setDisplayOptions] = useState<OrgColumnRelatedData[]>(
    relatedData?.slice(0, 20) || []
  );
  const [filterOptions, setFilterOptions] = useState<OrgColumnRelatedData[]>(
    []
  );

  const handleScroll = (event) => {
    const { target } = event;
    listBoxTarget = target;
    // Check if scrolled to the bottom
    if (
      target.scrollHeight - target.scrollTop <= target.clientHeight &&
      ((displayOptions.length !== relatedData?.length &&
        !filterOptions.length) ||
        (displayOptions.length !== filterOptions?.length &&
          filterOptions.length))
    ) {
      const start = displayOptions.length;
      if (filterOptions.length) {
        const end = Math.min(start + 20, filterOptions?.length || 0);
        setDisplayOptions([
          ...displayOptions,
          ...(filterOptions || []).slice(start, end),
        ]);
      } else {
        const end = Math.min(start + 20, relatedData?.length || 0);
        setDisplayOptions([
          ...displayOptions,
          ...(relatedData || []).slice(start, end),
        ]);
      }
    }
  };

  const searchOptions = async () => {
    const newFilter = relatedData?.filter((option) =>
      option.targetInformationList
        ?.join(", ")
        .toLowerCase()
        .includes(query.toLowerCase())
    );
    setFilterOptions([...(newFilter || [])]);
  };

  useEffect(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(searchOptions, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    if (listBoxTarget && displayOptions.length - 20 >= 0) {
      listBoxTarget.scrollTo(0, (displayOptions.length - 20) * 31);
    }
  }, [displayOptions]);

  useEffect(() => {
    if (filterOptions) {
      const tempOptions = [...filterOptions];
      setDisplayOptions([...tempOptions.slice(0, 20)]);
    }
  }, [filterOptions]);

  useEffect(() => {
    if (relatedData) {
      const tempOptions = [...relatedData];
      setDisplayOptions([...tempOptions.slice(0, 20)]);
    }
  }, [relatedData]);

  const organizationId = useSelector(getSelectedOrgId);

  const { excute: getAssociatedData, isLoading: isValidating } =
    useAxiosApiWrapper(apis.org.getAssociatedData, "None");

  const { excute: getAssociatedDataPreview, isLoading: isPreview } =
    useAxiosApiWrapper(apis.org.getAssociatedDataPreview, "None");

  useEffect(() => {
    const opt = options?.find((o) => o.value === value);
    setSelectedOption(opt);
  }, [value, options]);

  useEffect(() => {
    const remark = remarkList?.find(
      (re) =>
        re.organizationOptionId ===
        (isRelatedServiceModule
          ? autocompleteSelected?.targetId
          : selectedOption?.optionId)
    );
    setRemarkValue(remark?.columnTargetValueRemark || "");
  }, [
    autocompleteSelected?.targetId,
    isRelatedServiceModule,
    remarkList,
    selectedOption,
  ]);

  return (
    <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
      {!isRelatedServiceModule && (
        <Box gridColumn={`span ${hasRemark ? 6 : 12}`}>
          <Autocomplete
            id={`choice-one-dropdown-${name}`}
            data-tid={`choice-one-dropdown-${name}`}
            size="small"
            value={value}
            placeholder="Select Item"
            onInvalid={() => {
              if (setError) {
                const errorMessage =
                  wordLibrary?.["this field is required"] ?? "此為必填欄位。";
                setError(errorMessage || "");
              }
            }}
            disabled={disabled}
            options={options?.map((v) => v.value) || []}
            onChange={(_, value) => {
              if (value) {
                if (handleTargetValue) handleTargetValue(value.toString());
                if (handleVerify) handleVerify(value.toString());
                if (handleRequired) handleRequired(value.toString());
                if (handleChange) {
                  handleChange(name, { value: value.toString() });
                }
                if (setColumnTargetValues)
                  setColumnTargetValues((prev) => ({
                    ...prev,
                    [name]: [
                      {
                        organizationOptionId:
                          options?.find((o) => o.value === value.toString())
                            ?.optionId || "",
                        organizationOptionName:
                          options?.find((o) => o.value === value.toString())
                            ?.label || "",
                      },
                    ],
                  }));
                if (hasNextColumn) {
                  if (setSelectedNextColumnIds) {
                    if (value)
                      setSelectedNextColumnIds((prev) => ({
                        ...prev,
                        [name]: options?.find(
                          (o) => o.value === value.toString()
                        )?.nextColumnId,
                      }));
                  } else if (setNextColumnTarget) {
                    if (value)
                      setNextColumnTarget(
                        nextColumnTargets?.find(
                          (next) =>
                            next.organizationColumn.columnId ===
                            options?.find((o) => o.value === value.toString())
                              ?.nextColumnId
                        )
                      );
                  }
                }
              } else {
                handleChange(name, { value: "" });
                if (setColumnTargetValues)
                  setColumnTargetValues((prev) => ({
                    ...prev,
                    [name]: [],
                  }));
              }
            }}
            renderInput={(params) => (
              <TextField {...params} label={label} name={name} />
            )}
          />
        </Box>
      )}
      {Boolean(isRelatedServiceModule) && (
        <Box gridColumn={`span ${hasRemark ? 6 : 12}`}>
          <Autocomplete
            options={displayOptions || []}
            value={{
              targetId: autocompleteSelected?.targetId || "",
              targetInformationList:
                autocompleteSelected?.targetInformationList || [],
            }}
            loading={isValidating || isPreview}
            className={classes.autocomplete}
            onFocus={async () => {
              try {
                if (!relatedData) {
                  const res = preview
                    ? await getAssociatedData({
                        query: "",
                        organizationId,
                        columnId: name,
                        serviceModuleValue: columnRelatedServiceModuleValue,
                      })
                    : await getAssociatedDataPreview({
                        query: "",
                        organizationId,
                        serviceModuleValue: columnRelatedServiceModuleValue,
                      });
                  setRelatedData([
                    ...res.data.filter(
                      (option) => option.targetInformationList.length > 0
                    ),
                  ]);
                }
              } catch (error) {
                // eslint-disable-next-line no-console
                apis.tools.createLog({
                  function: "DatePicker: handleDelete",
                  browserDescription: window.navigator.userAgent,
                  jsonData: {
                    data: error,
                    deviceInfo: getDeviceInfo(),
                  },
                  level: "ERROR",
                });
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                name={name}
                placeholder={label}
                onChange={(e) => {
                  if (selectedDropdownOption) {
                    setAutocompleteSelected({
                      targetId: selectedDropdownOption.targetId,
                      targetInformationList: [e.target.value],
                    });
                  }
                  setQuery(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (displayOptions.length === 1) {
                      setAutocompleteSelected(displayOptions[0] || null);
                      const newValue = {
                        targetId: displayOptions[0]?.targetId,
                        value:
                          (displayOptions[0]?.targetInformationList &&
                            displayOptions[0]?.targetInformationList.join(
                              ", "
                            )) ||
                          "",
                      };
                      handleChange(name, newValue, displayOptions[0]);
                    } else {
                      e.preventDefault();
                    }
                  }
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.targetId}>
                {option.targetInformationList?.join(", ") || ""}
              </li>
            )}
            ListboxProps={{
              onScroll: handleScroll,
            }}
            isOptionEqualToValue={(option, value) =>
              option.targetId === value.targetId
            }
            getOptionLabel={(option) =>
              option.targetInformationList?.join(", ") || ""
            }
            onChange={(e, option) => {
              setAutocompleteSelected(option || null);
              e.preventDefault();
              let newValue;
              if (option) {
                newValue = {
                  value:
                    (option.targetInformationList &&
                      option.targetInformationList.join(", ")) ||
                    "",
                  targetId: option.targetId,
                };
                if (setColumnTargetValues)
                  setColumnTargetValues((prev) => ({
                    ...prev,
                    [name]: [
                      {
                        organizationOptionId: option.targetId,
                        organizationOptionName:
                          option.targetInformationList?.join(", ") || "",
                      },
                    ],
                  }));
                if (handleChange) {
                  handleChange(name, newValue, option);
                }
              } else {
                newValue = {
                  value: "",
                  targetId: "",
                };
                if (setColumnTargetValues)
                  setColumnTargetValues((prev) => ({
                    ...prev,
                    [name]: [],
                  }));
                if (handleChange) {
                  handleChange(name, newValue);
                }
              }
            }}
            noOptionsText={wordLibrary?.["no information found"] ?? "查無資料"}
            disabled={disabled}
          />
        </Box>
      )}
      {hasRemark && (
        <Box gridColumn="span 6">
          <TextField
            label={[`${wordLibrary?.remark ?? "備註"}`, remarkError]
              .filter(Boolean)
              .join("-")}
            placeholder={wordLibrary?.["enter remarks"] ?? "輸入備註"}
            error={!!remarkError}
            value={remarkValue}
            onChange={(e) => {
              setRemarkValue(e.target.value);
            }}
            onBlur={(e) => {
              if (handleRemarkChange) {
                handleRemarkChange(
                  name,
                  isRelatedServiceModule
                    ? (autocompleteSelected?.targetId as string) || ""
                    : (selectedOption?.optionId as string) || "",
                  isRelatedServiceModule
                    ? autocompleteSelected?.targetInformationList?.join(", ") ||
                        ""
                    : (selectedOption?.label as string) || "",
                  e.target.value
                );
              }
            }}
            required={requiredRemark}
            disabled={
              (!isRelatedServiceModule && !value) ||
              (isRelatedServiceModule && !autocompleteSelected?.targetId) ||
              disabled
            }
            focused={focused}
          />
        </Box>
      )}
    </Box>
  );
};

export default ChoiceOneDropdown;
