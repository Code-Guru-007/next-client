import React, { FC, useEffect } from "react";
import { useSelector } from "react-redux";
import { SubmitHandler, useForm, Controller } from "react-hook-form";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import { MenuItem, Select } from "@mui/material";

import { OrgCmsMenuFormInput } from "interfaces/form";
import { LocaleMap, Locale } from "interfaces/utils";

import Dialog, { DialogProps } from "@eGroupAI/material/Dialog";
import Typography from "@eGroupAI/material/Typography";
import Box from "@eGroupAI/material/Box";
import Grid from "@eGroupAI/material/Grid";
import TextField from "@eGroupAI/material/TextField";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import DialogFullPageContainer from "components/DialogFullPageContainer";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import useOrgCmsMenu from "utils/useOrgCmsMenu";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

interface CmsMenuDialogProps {
  onSubmit: SubmitHandler<OrgCmsMenuFormInput>;
  loading?: boolean;
  open: DialogProps["open"];
  onClose?: () => void;
  title?: string;
  tableSelectedLocale: Locale;
  handleSelectedLocale: (val: Locale) => void;
  organizationId: string;
  selectedOrgCmsMenuId: string | undefined;
}

const CmsMenuDialog: FC<CmsMenuDialogProps> = function (props) {
  const {
    onSubmit,
    loading,
    open,
    onClose,
    title,
    tableSelectedLocale,
    handleSelectedLocale,
    organizationId,
    selectedOrgCmsMenuId,
  } = props;

  const classes = useStyles();
  const theme = useTheme();
  const wordLibrary = useSelector(getWordLibrary);
  const { control, handleSubmit, reset } = useForm<OrgCmsMenuFormInput>({
    defaultValues: {
      title: "",
    },
  });

  const { data } = useOrgCmsMenu(
    {
      organizationId,
      organizationCmsMenuId: selectedOrgCmsMenuId,
    },
    {
      locale: tableSelectedLocale,
    }
  );

  useEffect(() => {
    if (data && !loading) {
      reset({
        title: data.organizationCmsMenuTitle,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={onClose}>
        <Typography variant="h3" gutterBottom>
          {title}
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
        <DialogFullPageContainer sx={{ pt: 0 }}>
          <DialogActions sx={{ justifyContent: "flex-end", padding: 0, mb: 2 }}>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              size="small"
              value={tableSelectedLocale}
              onChange={(e: any) => handleSelectedLocale(e.target.value)}
            >
              <MenuItem value="zh_TW">繁體中文</MenuItem>
              <MenuItem value="en_US">English</MenuItem>
            </Select>
          </DialogActions>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label="標題"
                    fullWidth
                    onChange={onChange}
                    value={value}
                    sx={{ margin: "6px 0" }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogFullPageContainer>
        <DialogActions>
          <Box flexGrow={1} />
          <DialogCloseButton onClick={onClose} disabled={loading} />
          <DialogConfirmButton type="submit" loading={loading}>
            {data
              ? `${wordLibrary?.save ?? "儲存"}${
                  LocaleMap[tableSelectedLocale]
                }`
              : `${wordLibrary?.add ?? "新增"}${
                  LocaleMap[tableSelectedLocale]
                }`}
          </DialogConfirmButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CmsMenuDialog;
