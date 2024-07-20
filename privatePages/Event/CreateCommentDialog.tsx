import React, { FC, useState, useEffect } from "react";

import { useRouter } from "next/router";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";
import useOrgRoles from "@eGroupAI/hooks/apis/useOrgRoles";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import apis from "utils/apis";
import { useSelector } from "react-redux";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import {
  ServiceModuleValue,
  OrganizationReviewStatusType,
} from "interfaces/utils";
import { useForm, Controller } from "react-hook-form";
import { CreateCommentFormInput } from "interfaces/form";
import { OrganizationEvent } from "interfaces/entities";

import Dialog from "@eGroupAI/material/Dialog";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@eGroupAI/material/TextField";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import FormFieldLabel from "components/FormFieldLabel";
import FormField from "components/FormField";
import FroalaEditor from "components/FroalaEditor";
import MenuItem from "components/MenuItem";

import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import LZString from "lz-string";

const schema = yup
  .object()
  .shape({
    organizationCommentTitle: yup.string().required("Title is required"),
    organizationCommentContent: yup.string().required("Content is required"),
  })
  .required();

export const DIALOG = "CreateCommentDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

export interface CreateCommentDialogProps {
  event?: OrganizationEvent;
  writable?: boolean;
}

const CreateCommentDialog: FC<CreateCommentDialogProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const classes = useStyles();
  const theme = useTheme();
  const { event, writable = false } = props;

  const [checked, setChecked] = useState<boolean>(false);
  const [selectedOrgRoleId, setSelectedOrgRoleId] = useState("");
  const [error, setError] = useState(false);

  const router = useRouter();
  const organizationId = useSelector(getSelectedOrgId);

  const { data } = useOrgRoles(
    {
      organizationId,
    },
    {
      serviceModuleValue: ServiceModuleValue.EVENT,
      apiOperation: "AUDIT",
    }
  );

  const { excute: createOrgReview } = useAxiosApiWrapper(
    apis.org.createOrgReview,
    "Create"
  );

  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
  } = useForm<CreateCommentFormInput>({
    defaultValues: {
      organizationCommentTitle: "",
      organizationCommentContent: "",
    },
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (isOpen) {
      const localStorageKey = `event_${event?.organizationEventId}_comment`;
      const savedData = localStorage.getItem(localStorageKey);
      if (savedData) {
        const data = JSON.parse(LZString.decompressFromUTF16(savedData));
        const now = new Date().getTime();
        if (now - data.timestamp < 1800000) {
          setValue(
            "organizationCommentTitle",
            data.values.organizationCommentTitle
          );
          setValue(
            "organizationCommentContent",
            data.values.organizationCommentContent
          );
        } else {
          localStorage.removeItem(localStorageKey);
        }
      }
    }
  }, [event, setValue, isOpen]);

  useEffect(() => {
    const localStorageKey = `event_${event?.organizationEventId}_comment`;
    const intervalId = setInterval(() => {
      const valuesToSave = {
        values: {
          organizationCommentTitle: getValues("organizationCommentTitle"),
          organizationCommentContent: getValues("organizationCommentContent"),
        },
        timestamp: new Date().getTime(),
      };
      localStorage.setItem(
        localStorageKey,
        LZString.compressToUTF16(JSON.stringify(valuesToSave))
      );
    }, 10000);

    return () => {
      clearInterval(intervalId);
      const rawData = localStorage.getItem(localStorageKey);
      if (rawData) {
        const lastData = JSON.parse(LZString.decompressFromUTF16(rawData));
        if (new Date().getTime() - lastData.timestamp >= 1800000) {
          localStorage.removeItem(localStorageKey);
        }
      }
    };
  }, [getValues, event]);

  const handleChange = (e) => {
    setChecked(e.target.checked);
    setError(false);
  };

  const handleSelectChange = (e) => {
    setSelectedOrgRoleId(e.target.value);
    setError(false);
  };

  useEffect(() => {
    if (checked) {
      setSelectedOrgRoleId("");
    }
  }, [checked]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const froalaElement = document.querySelector(".fr-element.fr-view");
      if (froalaElement) {
        froalaElement.setAttribute("id", "comment-content-editor");
      }
    });
    observer.observe(document, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const { excute: createOrgComment, isLoading } = useAxiosApiWrapper(
    apis.org.createOrgComment,
    "Create"
  );

  const matchMutate = useSwrMatchMutate();

  return (
    <Dialog
      open={isOpen}
      onClose={closeDialog}
      maxWidth="md"
      fullWidth
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
      disableEnforceFocus
    >
      <DialogTitle onClickClose={closeDialog}>
        {wordLibrary?.["add comment"] ?? "新增評論"}
      </DialogTitle>
      <form
        onSubmit={handleSubmit(async (values) => {
          if (selectedOrgRoleId === "" && checked) {
            setError(true);
          } else if (event) {
            try {
              const localStorageKey = `event_${event?.organizationEventId}_comment`;
              localStorage.removeItem(localStorageKey);
              await createOrgComment({
                organizationId,
                targetId: event.organizationEventId,
                targetRelationType: ServiceModuleValue.EVENT,
                ...values,
              });
              closeDialog();
              reset({
                organizationCommentTitle: "",
                organizationCommentContent: "",
              });
              matchMutate(
                new RegExp(
                  `^/organizations/${organizationId}/events/${event.organizationEventId}\\?`,
                  "g"
                )
              );
              if (checked) {
                await createOrgReview({
                  organizationId,
                  targetId: event.organizationEventId,
                  organizationReviewStatusType:
                    OrganizationReviewStatusType.PROCESSING,
                  organizationRole: {
                    organizationRoleId: selectedOrgRoleId,
                  },
                  serviceModuleValue: ServiceModuleValue.EVENT,
                });
                matchMutate(
                  new RegExp(
                    `^/organizations/${organizationId}/events/${event.organizationEventId}\\?`,
                    "g"
                  )
                );
                matchMutate(
                  new RegExp(
                    `^/organizations/${organizationId}/reviews\\?`,
                    "g"
                  )
                );
                router.replace(
                  `/me/event/events/${event.organizationEventId}?tab=EVENT_REVIEW`
                );
              }
            } catch (error) {
              apis.tools.createLog({
                function: "createOrgReview: error",
                browserDescription: window.navigator.userAgent,
                jsonData: {
                  data: error,
                  deviceInfo: getDeviceInfo(),
                },
                level: "ERROR",
              });
            }
          }
        })}
      >
        <DialogContent>
          <Controller
            control={control}
            name="organizationCommentTitle"
            render={({ field: { value, onChange } }) => (
              <FormField
                primary={wordLibrary?.["comment title"] ?? "評論標題"}
                testId="event-comment-title-input"
                TextFieldProps={{
                  id: "event-comment-title-input",
                  onChange,
                  value,
                  placeholder:
                    wordLibrary?.["enter comment title"] ?? "輸入評論標題",
                  sx: {
                    marginBottom: 3,
                  },
                  error: Boolean(errors.organizationCommentTitle?.message),
                  helperText: errors.organizationCommentTitle?.message,
                }}
              />
            )}
          />
          <Controller
            control={control}
            name="organizationCommentContent"
            render={({ field: { value, onChange } }) => (
              <FormFieldLabel
                primary={wordLibrary?.["comment content"] ?? "評論內容"}
              >
                <FroalaEditor
                  filePathType={ServiceModuleValue.CMS_BLOG}
                  model={value}
                  onModelChange={(model) => {
                    onChange(model);
                  }}
                  config={{
                    toolbarSticky: true,
                    heightMin: 300,
                    placeholderText:
                      wordLibrary?.["edit comment content"] ?? "編輯評論內容",
                  }}
                />
              </FormFieldLabel>
            )}
          />
          <FormControlLabel
            control={
              <Switch
                edge="start"
                color="success"
                size="medium"
                checked={checked}
                onChange={handleChange}
                id="event-comment-sync-switch"
                data-tid="event-comment-sync-switch"
              />
            }
            label={
              wordLibrary?.["sync submission for review?"] ??
              "是否需同步提交審核？"
            }
            labelPlacement="start"
          />
          {checked && (
            <TextField
              label={wordLibrary?.["submission target"] ?? "提交審核對象"}
              value={selectedOrgRoleId}
              onChange={(e) => handleSelectChange(e)}
              select
              fullWidth
              error={error}
              helperText={error ? "This field is required" : null}
              sx={{ mt: 1 }}
              id="event-comment-target-select"
              data-tid="event-comment-target-select"
            >
              {data?.source.map((el) => (
                <MenuItem
                  key={el.organizationRoleId}
                  value={el.organizationRoleId}
                >
                  {el.organizationRoleNameZh}
                </MenuItem>
              ))}
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <DialogCloseButton
            onClick={() => {
              const localStorageKey = `event_${event?.organizationEventId}_comment`;
              localStorage.removeItem(localStorageKey);
              closeDialog();
            }}
          />
          {writable && (
            <DialogConfirmButton
              loading={isLoading}
              type="submit"
              disabled={
                !writable ||
                !!errors.organizationCommentTitle?.message ||
                !!errors.organizationCommentContent?.message
              }
            />
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateCommentDialog;
