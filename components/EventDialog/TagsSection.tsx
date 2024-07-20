import React, { FC, memo, useEffect } from "react";

import { useSelector } from "react-redux";
import { useAppDispatch } from "redux/configureAppStore";

import Typography from "@eGroupAI/material/Typography";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import FormFieldLabel from "components/FormFieldLabel";
import TagAutocomplete from "components/TagAutocomplete";
import { getValues } from "redux/eventDialog/selectors";
import { setTags } from "redux/eventDialog";
import { ServiceModuleValue } from "interfaces/utils";
import { OrganizationTag } from "interfaces/entities";

export interface TagsSectionProps {
  isDialogOpen?: boolean;
  targetId?: string;
  tagValues?: OrganizationTag[];
}

const TagsSection: FC<TagsSectionProps> = function (props) {
  const { isDialogOpen = false, targetId, tagValues } = props;
  const wordLibrary = useSelector(getWordLibrary);
  const dispatch = useAppDispatch();
  const { organizationTagList } = useSelector(getValues);

  useEffect(() => {
    if (tagValues && isDialogOpen)
      dispatch(
        setTags({
          orgTagList: tagValues || [],
          states: {
            isDirty: true,
          },
        })
      );
  }, [dispatch, isDialogOpen, tagValues]);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        {wordLibrary?.["event tags"] ?? "事件標籤"}
      </Typography>
      <FormFieldLabel>
        <TagAutocomplete
          serviceModuleValue={ServiceModuleValue.EVENT}
          value={organizationTagList}
          onChange={(e, value, reason, details) => {
            if (targetId && details) {
              if (reason === "selectOption") {
                if (isDialogOpen)
                  dispatch(
                    setTags({
                      orgTagList: value,
                      states: {
                        isDirty: true,
                      },
                    })
                  );
              } else if (reason === "removeOption") {
                if (isDialogOpen)
                  dispatch(
                    setTags({
                      orgTagList: value,
                    })
                  );
              }
            } else {
              dispatch(
                setTags({
                  orgTagList: value,
                  states: {
                    isDirty: false,
                  },
                })
              );
            }
          }}
          id="event-tag-input"
          data-tid="event-tag-input"
        />
      </FormFieldLabel>
    </div>
  );
};

export default memo(TagsSection);
