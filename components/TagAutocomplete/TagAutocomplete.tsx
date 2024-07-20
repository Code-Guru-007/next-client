import React, { FC, useState, useEffect } from "react";

import { useTheme } from "@mui/styles";
import { useSelector } from "react-redux";
import useOrgTagGroups from "utils/useOrgTagGroups";
import useOrgTagsByGroups from "utils/useOrgTagsByGroups";
import { OrganizationTag } from "interfaces/entities";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import { ServiceModuleValue } from "interfaces/utils";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import Tag from "@eGroupAI/material/Tag";
import Box from "@eGroupAI/material/Box";
import Autocomplete, {
  AutocompleteProps,
} from "@eGroupAI/material/Autocomplete";
import TextField from "@mui/material/TextField";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";

export interface TagAutocompleteProps
  extends Omit<
    AutocompleteProps<OrganizationTag, true, undefined, undefined>,
    "renderInput" | "options" | "onBlur"
  > {
  serviceModuleValue: ServiceModuleValue;
  onBlur?: (tags: OrganizationTag[]) => void;
  selectedTagIdList?: (string | undefined)[];
}

const TagAutocomplete: FC<TagAutocompleteProps> = function (props) {
  const {
    serviceModuleValue,
    disabled,
    value,
    onBlur,
    selectedTagIdList,
    ...other
  } = props;
  const [tagValue, setTagValue] = useState(value || []);
  const theme = useTheme();
  const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);
  const { data } = useOrgTagGroups(
    {
      organizationId,
    },
    {
      locale,
      serviceModuleValue,
    },
    undefined,
    disabled
  );
  const tags = useOrgTagsByGroups(data?.source);

  const handleBlur = () => {
    if (onBlur) onBlur(tagValue);
  };

  useEffect(() => {
    setTagValue(value || []);
  }, [value]);

  const wordLibrary = useSelector(getWordLibrary);

  return (
    <Autocomplete
      {...other}
      value={tagValue}
      disabled={disabled}
      multiple
      disableCloseOnSelect
      options={
        selectedTagIdList?.length && tags !== undefined
          ? tags.filter((tag) => selectedTagIdList.includes(tag.tagId))
          : tags || []
      }
      groupBy={(option) => option.organizationTagGroup.tagGroupName}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((el, index) => {
          const { onDelete } = getTagProps({ index });
          return (
            <Tag
              key={el.tagId}
              color={el.tagColor}
              onDelete={(e) => {
                if (!disabled) {
                  onDelete(e);
                  if (onBlur)
                    onBlur(tagValue.filter((tag) => tag.tagId !== el.tagId));
                }
              }}
              style={{ margin: 3 }}
            >
              {el.tagName}
            </Tag>
          );
        })
      }
      renderInput={(params) => (
        <TextField
          variant="outlined"
          placeholder={wordLibrary?.["select tags"] ?? "選擇標籤"}
          {...params}
        />
      )}
      renderOption={(optionProps, option, { selected }) => (
        <li {...optionProps}>
          <Box
            component={DoneIcon}
            sx={{ width: 17, height: 17, mr: "5px", ml: "-2px" }}
            style={{
              visibility: selected ? "visible" : "hidden",
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
          <Box
            sx={{
              flexGrow: 1,
              "& span": {
                color: theme.palette.mode === "light" ? "#586069" : "#8b949e",
              },
            }}
          >
            {option.tagName}
          </Box>
          <Box
            component={CloseIcon}
            sx={{ opacity: 0.6, width: 18, height: 18 }}
            style={{
              visibility: selected ? "visible" : "hidden",
            }}
          />
        </li>
      )}
      isOptionEqualToValue={(option, tagValue) =>
        option.tagId === tagValue.tagId
      }
      getOptionLabel={(option) => `${option.tagName} (${option.tagId})`}
      filterOptions={(options, { inputValue }) =>
        options.filter((option) =>
          option.tagName.toLowerCase().includes(inputValue.toLowerCase())
        )
      }
      noOptionsText={wordLibrary?.["no information found"] ?? "查無資料"}
      onBlur={handleBlur}
    />
  );
};

export default TagAutocomplete;
