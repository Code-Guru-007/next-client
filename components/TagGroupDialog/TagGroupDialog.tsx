import React, { FC, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";

import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import Stack from "@mui/material/Stack";
import LoadingButton from "@mui/lab/LoadingButton";

import { useReduxDialog } from "@eGroupAI/redux-modules";
import Grid from "@eGroupAI/material/Grid";
import Typography from "@eGroupAI/material/Typography";
import TextField from "@eGroupAI/material/TextField";
import Dialog from "@eGroupAI/material/Dialog";
import DialogActions from "@eGroupAI/material/DialogActions";

import { getGlobalLocale } from "components/PrivateLayout/selectors";
import DialogCloseButton from "components/DialogCloseButton";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import Form from "components/Form";
import LocaleDropDown from "components/LocaleDropDown";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { Locale } from "interfaces/utils";
import { OrganizationTagGroup } from "interfaces/entities";
import useOrgTagGroup from "utils/useOrgTagGroup";
import { getWordLibrary } from "redux/wordLibrary/selectors";

export const DIALOG = "TagGroupDialog";
export const FORM = "TagGroupForm";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

export interface TagGroupDialogProps {
  organizationId: string;
  onSuccess?: (tagGroupId?: string | undefined) => void;
  tagGroupId?: string;
  tagServiceModuleValue: string;
  editable?: boolean;
}

const TagGroupDialog: FC<TagGroupDialogProps> = function (props) {
  const {
    organizationId,
    onSuccess,
    tagGroupId,
    tagServiceModuleValue,
    editable = false,
  } = props;
  const classes = useStyles();
  const theme = useTheme();
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const globalLocale = useSelector(getGlobalLocale);

  const [groupName, setGroupName] = useState<string>("");
  const [locale, setLocale] = useState<string>(globalLocale);
  const wordLibrary = useSelector(getWordLibrary);
  const [selectedTagGroup, setSelectedTagGroup] = useState<
    OrganizationTagGroup | undefined
  >();
  const [createdLocale, setCreatedLocale] = useState<string | null>(null);
  const [selectedTagGroupId, setSelectedtagGroupId] = useState<
    string | undefined
  >(tagGroupId);

  const { excute: createTagGroup, isLoading: isCreating } = useAxiosApiWrapper(
    apis.org.createTagGroup,
    "Create"
  );

  const { excute: updateTagGroup, isLoading: isUpdating } = useAxiosApiWrapper(
    apis.org.updateTagGroup,
    "Update"
  );

  const { data: tagGroup } = useOrgTagGroup(
    {
      organizationId,
      tagGroupId: selectedTagGroupId,
    },
    {
      locale,
    }
  );

  useEffect(() => {
    setSelectedtagGroupId(tagGroupId);
  }, [tagGroupId]);

  useEffect(() => {
    setGroupName(tagGroup?.tagGroupName || "");
    setSelectedTagGroup(tagGroup);
  }, [tagGroup]);

  const handleClose = () => {
    setSelectedTagGroup(undefined);
    setCreatedLocale(null);
    setLocale(globalLocale);
    if (!tagGroupId) {
      setGroupName("");
    }
    closeDialog();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedTagGroup) {
        await updateTagGroup({
          organizationId,
          tagGroupId: selectedTagGroup.tagGroupId,
          locale: Locale[locale.toUpperCase()],
          tagGroupName: groupName,
          serviceModuleValue: tagServiceModuleValue,
        });
        if (onSuccess) onSuccess();
      } else {
        const res = await createTagGroup({
          organizationId,
          locale: Locale[locale.toUpperCase()],
          tagGroupName: groupName,
          serviceModuleValue: tagServiceModuleValue,
        });
        if (res.data.tagGroupId) {
          setSelectedTagGroup(undefined);
          setCreatedLocale(null);
          setLocale(globalLocale);
          if (!tagGroupId) {
            setGroupName("");
          }
        }
        if (onSuccess) onSuccess(res.data.tagGroupId);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      apis.tools.createLog({
        function: "updateTagGroup",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: error,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
    }
  };

  const handleChangeLocale = (loca) => {
    setLocale(loca);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={handleClose}>
        {tagGroupId
          ? `${wordLibrary?.edit ?? "編輯"}`
          : `${wordLibrary?.add ?? "新增"}`}
      </DialogTitle>
      <Form
        id={FORM}
        onSubmit={handleSubmit}
        loading={isCreating || isUpdating}
      >
        <Stack spacing={3} sx={{ px: 3 }}>
          <Grid item xs={12} display="flex" justifyContent="flex-end">
            <LocaleDropDown
              defaultLocale={locale}
              onChange={handleChangeLocale}
              editable={editable}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h5" color="textSecondary">
              {locale === "zh_TW" ? "* 繁體中文" : "* English"}
            </Typography>
            <TextField
              name="groupName"
              placeholder={wordLibrary?.["tag group name"] ?? "標籤群組名稱"}
              fullWidth
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
              }}
              id="tag-group-name-input"
            />
          </Grid>
        </Stack>
        <DialogActions>
          <DialogCloseButton onClick={handleClose} />
          <LoadingButton
            variant="contained"
            loading={isCreating || isUpdating}
            type="submit"
            disabled={
              groupName === "" ||
              isCreating ||
              isUpdating ||
              (!tagGroupId && createdLocale === locale)
            }
            id="dialog-confirm-button"
          >
            {wordLibrary?.submit ?? "送出"}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
};

export default TagGroupDialog;
