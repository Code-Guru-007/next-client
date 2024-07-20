import React, { FC, useMemo } from "react";

import useOrgTagGroups from "utils/useOrgTagGroups";
import useOrgTagsByGroups from "utils/useOrgTagsByGroups";
import { useTheme } from "@mui/styles";
import { useSelector } from "react-redux";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { ServiceModuleValue } from "interfaces/utils";
import { getGlobalLocale } from "components/PrivateLayout/selectors";

import Box from "@eGroupAI/material/Box";
import Grid from "@eGroupAI/material/Grid";
import Autocomplete from "@eGroupAI/material/Autocomplete";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import TextField from "@mui/material/TextField";

import Form from "components/Form";
import FormFieldLabel from "components/FormFieldLabel";
import { OrganizationTag } from "interfaces/entities";
import Tag from "@eGroupAI/material/Tag";

const getOptions = (tags?: OrganizationTag[]) =>
  tags?.map((el) => ({
    color: el.tagColor,
    name: el.tagName,
    tagId: el.tagId,
  })) || [];

export interface TagsFormProps {
  targetId: string;
  serviceModuleValue: ServiceModuleValue;
  selectedTags?: OrganizationTag[];
}

const TagsForm: FC<TagsFormProps> = function (props) {
  const { targetId, serviceModuleValue, selectedTags } = props;
  const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);
  const theme = useTheme();
  const wordLibrary = useSelector(getWordLibrary);
  const { excute: createOrgTargetTags } = useAxiosApiWrapper(
    apis.org.createOrgTargetTags,
    "Create"
  );
  const { excute: deleteOrgTargetTag } = useAxiosApiWrapper(
    apis.org.deleteOrgTargetTag,
    "Delete"
  );

  const { data } = useOrgTagGroups(
    {
      organizationId,
    },
    {
      locale,
      serviceModuleValue,
    }
  );
  const tags = useOrgTagsByGroups(data?.source);

  const options = useMemo(() => getOptions(tags), [tags]);
  const selectedOptions = useMemo(
    () => getOptions(selectedTags),
    [selectedTags]
  );

  const handleDeleteTargetTags = () => {
    if (tags) {
      tags.map((tag) =>
        deleteOrgTargetTag({
          organizationId,
          targetId,
          tagId: tag.tagId,
        })
      );
    }
  };

  return (
    <Form>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormFieldLabel primary={wordLibrary?.edit ?? "編輯"}>
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={options}
              defaultValue={selectedOptions}
              renderInput={(params) => (
                <TextField
                  variant="outlined"
                  placeholder={wordLibrary?.select ?? "選擇"}
                  {...params}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Tag
                    variant="Text"
                    color={option.color}
                    {...getTagProps({ index })}
                  >
                    {option.name}
                  </Tag>
                ))
              }
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
                    style={{ backgroundColor: option.color }}
                  />
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
                    {option.name}
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
              isOptionEqualToValue={(option, value) =>
                option.name === value.name
              }
              getOptionLabel={(option) => option.name}
              onChange={(e, value, reason, details) => {
                if (reason === "selectOption") {
                  createOrgTargetTags({
                    organizationId,
                    targetId,
                    organizationTagList: value.map((el) => ({
                      tagId: el.tagId,
                    })),
                  });
                } else if (reason === "removeOption") {
                  if (details?.option.tagId) {
                    deleteOrgTargetTag({
                      organizationId,
                      targetId,
                      tagId: details?.option.tagId,
                    });
                  }
                } else if (reason === "clear") {
                  handleDeleteTargetTags();
                }
              }}
              noOptionsText={
                wordLibrary?.["no information found"] ?? "查無資料"
              }
            />
          </FormFieldLabel>
        </Grid>
      </Grid>
    </Form>
  );
};

export default TagsForm;
