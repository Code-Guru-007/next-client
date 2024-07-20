import React, { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import IconButton from "components/IconButton/StyledIconButton";

import Grid from "@eGroupAI/material/Grid";
import Tooltip from "@eGroupAI/material/Tooltip";
import Tag from "@eGroupAI/material/Tag";
import { CircularProgress } from "@eGroupAI/material";

import AddIcon from "@mui/icons-material/AddRounded";

import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import { useSettingsContext } from "minimal/components/settings";
import { OrganizationTag } from "../../interfaces/entities";

const useStyles = makeStyles((theme) => ({
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  showLoader: {
    display: "flex",
  },
  lightOpacity: {
    background: "rgba(255,255,255,0.6)",
  },
  darkOpacity: {
    background: "rgba(33, 43, 54, 0.6)",
  },
  tagContainer: {
    [theme.breakpoints.down("sm")]: {
      width: "100px",
    },
  },
}));
export interface CreateOrgTargetTags {
  organizationId: string;
  targetId: string;
  organizationTagList: {
    tagId: string;
  }[];
}

export interface DeleteOrgTargetTags {
  organizationId: string;
  targetId: string;
  tagId: string;
}

export interface TagAutocompleteWithActionProps {
  /**
   * default selected tag list
   */
  selectedTags: OrganizationTag[];
  /**
   * selectable total tas list
   */
  options: OrganizationTag[];
  onDelete?: (tagId: string) => void;
  targetId: string;
  disableTyping?: boolean;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
  isLoading?: boolean;
  isToolbar?: boolean;
  isDrawer?: boolean;
  sharedOrgId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAddTag?: (v: CreateOrgTargetTags) => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRemoveTag?: (v: DeleteOrgTargetTags) => Promise<any>;
  isTagCreating?: boolean;
  isTagDeleting?: boolean;
}

const TagAutocompleteWithAction: FC<TagAutocompleteWithActionProps> = function (
  props
) {
  const wordLibrary = useSelector(getWordLibrary);
  const {
    onDelete,
    selectedTags: defaultTags,
    targetId,
    options,
    disableTyping,
    writable = false,
    deletable = false,
    onAddTag,
    onRemoveTag,
    isLoading,
    isToolbar,
    isDrawer = false,
    sharedOrgId,
    isTagCreating = false,
    isTagDeleting = false,
    ...other
  } = props;

  const classes = useStyles();
  const settings = useSettingsContext();

  const [selectedTags, setSelectedTagList] = useState(defaultTags);
  const [filteredOptions, setFilteredOptions] = useState(
    options.filter((o) => !defaultTags.map((d) => d.tagId).includes(o.tagId))
  );

  useEffect(() => {
    setSelectedTagList(defaultTags);
  }, [defaultTags]);

  useEffect(() => {
    const truncatedOptions = options.map((o) => ({
      ...o,
      tagName:
        o.tagName.length > 18 ? `${o.tagName.slice(0, 15)}...` : o.tagName,
    }));

    setFilteredOptions(
      truncatedOptions.filter(
        (o) => !selectedTags.map((d) => d.tagId).includes(o.tagId)
      )
    );
  }, [options, selectedTags]);

  const [loading, setLoading] = useState(false);
  const [showNewTag, setShowNewTag] = useState(false);
  const [newTagId, setNewTagId] = useState<string | string[]>("");

  const tempOrgId = useSelector(getSelectedOrgId);
  const organizationId = sharedOrgId ?? tempOrgId;

  const handleAddTag = () => {
    setShowNewTag(true);
  };

  const handleRemoveTag = (tagId) => {
    if (onRemoveTag)
      onRemoveTag({
        organizationId,
        targetId,
        tagId,
      });
    if (onDelete) onDelete(tagId);
  };

  const handleCancelAddTag = () => {
    setNewTagId("");
    setShowNewTag(false);
  };

  const handleConfirmAddTag = () => {
    if (newTagId === "") {
      return;
    }
    let newTags: OrganizationTag[] | undefined;
    if (typeof newTagId === "object")
      newTags = options.filter((o) => newTagId.includes(o.tagId));
    else newTags = options.filter((o) => o.tagId === newTagId);
    if (newTags?.length > 0) {
      setLoading(true);
      if (onAddTag)
        onAddTag({
          organizationId,
          targetId,
          organizationTagList: newTags.map((tag) => ({ tagId: tag.tagId })),
        })
          .then(() => {
            setNewTagId("");
            setShowNewTag(false);
          })
          .finally(() => setLoading(false));
    }
  };

  const handleInputChange = (v) => {
    setNewTagId(v);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disableTyping && e.key !== "Enter") e.preventDefault();
  };

  return (
    <Grid
      container
      spacing={isToolbar ? 0 : 2}
      gap={isToolbar ? 1 : 0}
      mt={0}
      position="relative"
      width={isToolbar ? "auto" : "calc(100% + 16px)"}
    >
      <div
        className={clsx(classes.loader, isLoading && classes.showLoader, {
          [classes.lightOpacity]: settings.themeMode === "light",
          [classes.darkOpacity]: settings.themeMode !== "light",
        })}
      />
      {selectedTags?.map((tag, index) => (
        <Grid item key={tag.tagId}>
          <Tag
            variant="Text"
            options={filteredOptions}
            color={tag.tagColor}
            onDelete={() => handleRemoveTag(tag.tagId)}
            deletable={deletable}
            isTagDeleting={isTagDeleting}
            {...other}
            onCancel={handleCancelAddTag}
            id={`tag-${tag.tagName}`}
            data-tid={`tag-${index}`}
          >
            {tag.tagName}
          </Tag>
        </Grid>
      ))}

      {showNewTag && filteredOptions.length > 0 && (
        <>
          <Grid item>
            <Tag
              variant="Autocomplete"
              edit
              multiple
              options={filteredOptions}
              color="primary"
              isDrawer={isDrawer}
              loading={loading}
              inputProps={{
                onChange: handleInputChange,
                onSubmit: handleConfirmAddTag,
                onKeyDown: handleKeyDown,
                value: newTagId,
              }}
              onCancel={handleCancelAddTag}
              {...other}
            />
          </Grid>
        </>
      )}
      {!showNewTag && writable && filteredOptions.length > 0 && (
        <Grid item>
          <Grid
            container
            sx={{
              height: "100%",
            }}
          >
            <Grid
              container
              spacing={0}
              sx={{
                justifyAlign: "center",
                justifyContent: "center",
              }}
              direction="column"
            >
              <Grid>
                <Tooltip title={wordLibrary?.["add tag"] ?? "新增標籤"}>
                  {isTagCreating ? (
                    <CircularProgress size={20} />
                  ) : (
                    <IconButton onClick={handleAddTag} id="tag-add-btn">
                      <AddIcon fontSize="small" />
                    </IconButton>
                  )}
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

export default TagAutocompleteWithAction;
