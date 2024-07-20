import React, { useState } from "react";
import { useRouter } from "next/router";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import { useSelector } from "react-redux";
import { useAppDispatch } from "redux/configureAppStore";
import { Stack, useMediaQuery } from "@mui/material";
import { useTheme, makeStyles } from "@mui/styles";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Grid from "@eGroupAI/material/Grid";
import Typography from "@eGroupAI/material/Typography";
import DialogConfirmButton from "components/DialogConfirmButton";
import DialogCloseButton from "components/DialogCloseButton";
import TextField from "@mui/material/TextField";
import useStepper from "@eGroupAI/hooks/useStepper";
import { setSelectedOrg } from "@eGroupAI/redux-modules/memberOrgs";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import { CreateOrgApiPayload } from "interfaces/payloads";
import { Locale } from "interfaces/utils";

import Logo from "components/Logo";
import { AccountPopover } from "minimal/layouts/_common";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: "flex",
    height: "100vh",
  },
  imgWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  img: {
    width: "70%",
    maxWidth: 650,
  },
  formWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    [theme.breakpoints.down("md")]: {
      minHeight: "812px",
    },
  },
  title: {
    marginTop: theme.spacing(22),
    [theme.breakpoints.down("md")]: {
      marginTop: theme.spacing(20),
    },
  },
  titleText: {
    fontFamily: "Avenir",
    fontStyle: "normal",
    fontWeight: 900,
    fontSize: "40px",
    lineHeight: "55px",
    [theme.breakpoints.down("md")]: {
      fontSize: "24px",
      lineHeight: "32px",
    },
  },
  form: {
    display: "flex",
    width: "58%",
    marginBottom: "45px",
    justifyContent: "center",
    [theme.breakpoints.down("md")]: {
      width: "300px",
      marginBottom: "35px",
    },
  },
  action: {
    display: "flex",
    width: "58%",
    flexDirection: "column",
    justifyContent: "flex-end",
    paddingBottom: theme.spacing(16),
    [theme.breakpoints.down("md")]: {
      width: "300px",
      paddingBottom: theme.spacing(23),
    },
  },
  inputLabel: {
    fontStyle: "normal",
    fontWeight: 500,
    fontSize: "20px",
    lineHeight: "20px",
    marginBottom: "10px",
    paddingLeft: "40px",
    [theme.breakpoints.down("md")]: {
      fontSize: "8px",
      lineHeight: "12px",
      marginBottom: "4px",
      paddingLeft: "16px",
    },
  },
  formControl: {
    paddingTop: "25px",
    [theme.breakpoints.down("md")]: {
      paddingTop: "16px",
    },
  },
  uploadDropzone: {},
}));

interface CreateOrgErrorProps {
  organizationAddress?: string;
  organizationArea?: string;
  organizationCity?: string;
  organizationCountry?: string;
  organizationInvoiceTaxIdNumber?: string;
  organizationName?: string;
  organizationZIPCode?: string;
}

const CreateOrg = function CreateOrg() {
  const [organization, setOrganization] = useState<CreateOrgApiPayload>({
    locale: Locale.ZH_TW,
    organizationName: "",
    organizationInvoiceTaxIdNumber: "",
    organizationAddress: "",
    organizationArea: "",
    organizationCity: "",
    organizationCountry: "",
    organizationZIPCode: "",
    organizationFanPage: "",
    organizationWebsite: "",
  });
  const [errors, setErrors] = useState<CreateOrgErrorProps>({});
  const wordLibrary = useSelector(getWordLibrary);
  const { value: step, handlePrev, handleNext } = useStepper("stepper", 2);
  const { excute: createOrg } = useAxiosApiWrapper(apis.org.createOrg, "None");
  const dispatch = useAppDispatch();
  const router = useRouter();
  const classes = useStyles();
  const theme = useTheme();
  const isDownMd = useMediaQuery(theme.breakpoints.down("md"));

  const handleInputChange = (e) => {
    setOrganization({
      ...organization,
      [e.target.name]: e.target.value,
    });

    if (e.target.value === "")
      setErrors({
        ...errors,
        [e.target.name]:
          wordLibrary?.["this field is required"] ?? "此為必填欄位。",
      });
    else {
      setErrors({
        ...errors,
        [e.target.name]: undefined,
      });
    }
  };

  const handlePrevStep = () => {
    if (step === 0) {
      router.push("/me");
      return;
    }
    handlePrev();
  };

  const handleNextStep = async () => {
    try {
      if (step === 2) {
        const response = await createOrg(organization);
        dispatch(setSelectedOrg(response.data));
        router.replace("/me/org-info");
      }
    } catch (error) {
      apis.tools.createLog({
        function: "DatePicker: handleNextStep",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: error,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
    }

    const getRequiredFieldErrorMessage = (wordLibrary) =>
      wordLibrary?.["this field is required"] ?? "此為必填欄位。";

    setErrors({
      organizationName:
        organization.organizationName === "" && step === 0
          ? getRequiredFieldErrorMessage(wordLibrary)
          : undefined,
      organizationInvoiceTaxIdNumber:
        organization.organizationInvoiceTaxIdNumber === "" && step === 0
          ? getRequiredFieldErrorMessage(wordLibrary)
          : undefined,
      organizationAddress:
        organization.organizationAddress === "" && step === 1
          ? getRequiredFieldErrorMessage(wordLibrary)
          : undefined,
      organizationArea:
        organization.organizationArea === "" && step === 1
          ? getRequiredFieldErrorMessage(wordLibrary)
          : undefined,
      organizationCity:
        organization.organizationCity === "" && step === 1
          ? getRequiredFieldErrorMessage(wordLibrary)
          : undefined,
      organizationCountry:
        organization.organizationCountry === "" && step === 1
          ? getRequiredFieldErrorMessage(wordLibrary)
          : undefined,
      organizationZIPCode:
        organization.organizationZIPCode === "" && step === 1
          ? getRequiredFieldErrorMessage(wordLibrary)
          : undefined,
    });

    if (
      step === 0 &&
      (organization.organizationName === "" ||
        organization.organizationInvoiceTaxIdNumber === "")
    ) {
      return;
    }
    if (
      step === 1 &&
      (organization.organizationAddress === "" ||
        organization.organizationArea === "" ||
        organization.organizationCity === "" ||
        organization.organizationCountry === "" ||
        organization.organizationZIPCode === "")
    ) {
      return;
    }
    handleNext();
  };

  if (isDownMd) {
    return (
      <div className={classes.wrapper}>
        <Stack
          position={"relative"}
          direction="column"
          width="100%"
          height="100%"
          alignItems="center"
          justifyContent="center"
        >
          <Stack position={"absolute"} sx={{ top: 20, right: 20 }}>
            <AccountPopover />
          </Stack>
          <Grid container>
            <Grid item xs={12} className={classes.formWrapper}>
              <div className={classes.title}>
                <Typography
                  className={classes.titleText}
                  variant="h2"
                  align="center"
                >
                  {wordLibrary?.["create organization"] ?? "建立單位"}
                </Typography>
              </div>
              <div className={classes.form}>
                {step === 0 && (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl
                        fullWidth
                        variant="standard"
                        className={classes.formControl}
                      >
                        <InputLabel
                          shrink
                          htmlFor="org_name"
                          className={classes.inputLabel}
                          required
                        >
                          {wordLibrary?.["organization name"] ?? "單位名稱"}
                        </InputLabel>
                        <TextField
                          autoFocus
                          type="text"
                          name="organizationName"
                          fullWidth
                          defaultValue={organization.organizationName}
                          value={organization.organizationName}
                          onChange={handleInputChange}
                          size="small"
                          id="org_name"
                          helperText={errors.organizationName}
                          error={!!errors.organizationName}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl
                        fullWidth
                        variant="standard"
                        className={classes.formControl}
                      >
                        <InputLabel
                          shrink
                          htmlFor="org_taxidnumber"
                          className={classes.inputLabel}
                          required
                        >
                          {wordLibrary?.["unified business number"] ??
                            "統一編號"}
                        </InputLabel>
                        <TextField
                          type="text"
                          name="organizationInvoiceTaxIdNumber"
                          fullWidth
                          defaultValue={
                            organization.organizationInvoiceTaxIdNumber
                          }
                          value={organization.organizationInvoiceTaxIdNumber}
                          onChange={handleInputChange}
                          size="small"
                          id="org_taxidnumber"
                          helperText={errors.organizationInvoiceTaxIdNumber}
                          error={!!errors.organizationInvoiceTaxIdNumber}
                        />
                      </FormControl>
                    </Grid>
                  </Grid>
                )}
                {step === 1 && (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl
                        fullWidth
                        variant="standard"
                        className={classes.formControl}
                      >
                        <InputLabel
                          shrink
                          htmlFor="org_country"
                          className={classes.inputLabel}
                          required
                        >
                          {wordLibrary?.country ?? "國家"}
                        </InputLabel>
                        <TextField
                          autoFocus
                          type="text"
                          name="organizationCountry"
                          fullWidth
                          defaultValue={organization.organizationCountry}
                          value={organization.organizationCountry}
                          onChange={handleInputChange}
                          size="small"
                          id="org_country"
                          helperText={errors.organizationCountry}
                          error={!!errors.organizationCountry}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl
                        fullWidth
                        variant="standard"
                        className={classes.formControl}
                      >
                        <InputLabel
                          shrink
                          htmlFor="org_city"
                          className={classes.inputLabel}
                          required
                        >
                          {wordLibrary?.city ?? "城市"}
                        </InputLabel>
                        <TextField
                          type="text"
                          name="organizationCity"
                          fullWidth
                          defaultValue={organization.organizationCity}
                          value={organization.organizationCity}
                          onChange={handleInputChange}
                          size="small"
                          id="org_city"
                          helperText={errors.organizationCity}
                          error={!!errors.organizationCity}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl
                        fullWidth
                        variant="standard"
                        className={classes.formControl}
                      >
                        <InputLabel
                          shrink
                          htmlFor="org_area"
                          className={classes.inputLabel}
                          required
                        >
                          {wordLibrary?.region ?? "地區"}
                        </InputLabel>
                        <TextField
                          type="text"
                          name="organizationArea"
                          fullWidth
                          defaultValue={organization.organizationArea}
                          value={organization.organizationArea}
                          onChange={handleInputChange}
                          size="small"
                          id="org_area"
                          helperText={errors.organizationArea}
                          error={!!errors.organizationArea}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl
                        fullWidth
                        variant="standard"
                        className={classes.formControl}
                      >
                        <InputLabel
                          shrink
                          htmlFor="org_address"
                          className={classes.inputLabel}
                          required
                        >
                          {wordLibrary?.address ?? "地址"}
                        </InputLabel>
                        <TextField
                          type="text"
                          name="organizationAddress"
                          fullWidth
                          defaultValue={organization.organizationAddress}
                          value={organization.organizationAddress}
                          onChange={handleInputChange}
                          size="small"
                          id="org_address"
                          helperText={errors.organizationAddress}
                          error={!!errors.organizationAddress}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl
                        fullWidth
                        variant="standard"
                        className={classes.formControl}
                      >
                        <InputLabel
                          shrink
                          htmlFor="org_zipcode"
                          className={classes.inputLabel}
                          required
                        >
                          {wordLibrary?.["postal code"] ?? "郵遞區號"}
                        </InputLabel>
                        <TextField
                          type="text"
                          name="organizationZIPCode"
                          fullWidth
                          defaultValue={organization.organizationZIPCode}
                          value={organization.organizationZIPCode}
                          onChange={handleInputChange}
                          size="small"
                          id="org_zipcode"
                          helperText={errors.organizationZIPCode}
                          error={!!errors.organizationZIPCode}
                        />
                      </FormControl>
                    </Grid>
                  </Grid>
                )}
                {step === 2 && (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl
                        fullWidth
                        variant="standard"
                        className={classes.formControl}
                      >
                        <TextField
                          autoFocus
                          type="text"
                          name="organizationWebsite"
                          placeholder={wordLibrary?.website ?? "網站"}
                          fullWidth
                          value={organization.organizationWebsite}
                          onChange={handleInputChange}
                          size="small"
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl
                        fullWidth
                        variant="standard"
                        className={classes.formControl}
                      >
                        <TextField
                          type="text"
                          name="organizationFanPage"
                          placeholder={wordLibrary?.["fan page"] ?? "粉絲專頁"}
                          fullWidth
                          value={organization.organizationFanPage}
                          onChange={handleInputChange}
                          size="small"
                        />
                      </FormControl>
                    </Grid>
                  </Grid>
                )}
              </div>
              <Grid container spacing={2} className={classes.action}>
                <Grid item container justifyContent="space-between">
                  <DialogCloseButton onClick={handlePrevStep}>
                    {wordLibrary?.["previous step"] ?? "上一步"}
                  </DialogCloseButton>
                  <DialogConfirmButton onClick={handleNextStep}>
                    {(() => {
                      let output = "";
                      if (step === 2) {
                        output = wordLibrary?.complete ?? "完成";
                      } else {
                        output = wordLibrary?.["next step"] ?? "下一步";
                      }
                      return output;
                    })()}
                  </DialogConfirmButton>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Stack>
      </div>
    );
  }

  return (
    <div className={classes.wrapper}>
      <Stack
        position={"relative"}
        direction="column"
        width="100%"
        height="100%"
        alignItems="center"
        justifyContent="center"
      >
        <Stack position={"absolute"} sx={{ top: 20, right: 20 }}>
          <AccountPopover />
        </Stack>
        <Grid container columns={17}>
          <Grid item md={6} className={classes.imgWrapper}>
            <div className={classes.img}>
              <Logo />
            </div>
          </Grid>
          <Grid item md={11} className={classes.formWrapper}>
            <div className={classes.title}>
              <Typography
                className={classes.titleText}
                variant="h2"
                align="center"
              >
                {wordLibrary?.["create organization"] ?? "建立單位"}
              </Typography>
            </div>
            <div className={classes.form}>
              {step === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={17}>
                    <FormControl
                      fullWidth
                      variant="standard"
                      className={classes.formControl}
                    >
                      <InputLabel
                        shrink
                        htmlFor="org_name"
                        className={classes.inputLabel}
                        required
                      >
                        {wordLibrary?.["organization name"] ?? "單位名稱"}
                      </InputLabel>
                      <TextField
                        autoFocus
                        type="text"
                        name="organizationName"
                        fullWidth
                        defaultValue={organization.organizationName}
                        value={organization.organizationName}
                        onChange={handleInputChange}
                        id="org_name"
                        helperText={errors.organizationName}
                        error={!!errors.organizationName}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={17}>
                    <FormControl
                      fullWidth
                      variant="standard"
                      className={classes.formControl}
                    >
                      <InputLabel
                        shrink
                        htmlFor="org_taxidnumber"
                        className={classes.inputLabel}
                        required
                      >
                        {wordLibrary?.["unified business number"] ?? "統一編號"}
                      </InputLabel>
                      <TextField
                        type="text"
                        name="organizationInvoiceTaxIdNumber"
                        fullWidth
                        defaultValue={
                          organization.organizationInvoiceTaxIdNumber
                        }
                        value={organization.organizationInvoiceTaxIdNumber}
                        onChange={handleInputChange}
                        id="org_taxidnumber"
                        helperText={errors.organizationInvoiceTaxIdNumber}
                        error={!!errors.organizationInvoiceTaxIdNumber}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              )}
              {step === 1 && (
                <Grid container spacing={2}>
                  <Grid item xs={17}>
                    <FormControl
                      fullWidth
                      variant="standard"
                      className={classes.formControl}
                    >
                      <InputLabel
                        shrink
                        htmlFor="org_country"
                        className={classes.inputLabel}
                        required
                      >
                        {wordLibrary?.country ?? "國家"}
                      </InputLabel>
                      <TextField
                        autoFocus
                        type="text"
                        name="organizationCountry"
                        fullWidth
                        defaultValue={organization.organizationCountry}
                        value={organization.organizationCountry}
                        onChange={handleInputChange}
                        id="org_country"
                        helperText={errors.organizationCountry}
                        error={!!errors.organizationCountry}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={17}>
                    <FormControl
                      fullWidth
                      variant="standard"
                      className={classes.formControl}
                    >
                      <InputLabel
                        shrink
                        htmlFor="org_city"
                        className={classes.inputLabel}
                        required
                      >
                        {wordLibrary?.city ?? "城市"}
                      </InputLabel>
                      <TextField
                        type="text"
                        name="organizationCity"
                        fullWidth
                        defaultValue={organization.organizationCity}
                        value={organization.organizationCity}
                        onChange={handleInputChange}
                        id="org_city"
                        helperText={errors.organizationCity}
                        error={!!errors.organizationCity}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={17}>
                    <FormControl
                      fullWidth
                      variant="standard"
                      className={classes.formControl}
                    >
                      <InputLabel
                        shrink
                        htmlFor="org_area"
                        className={classes.inputLabel}
                        required
                      >
                        {"地區"}
                      </InputLabel>
                      <TextField
                        type="text"
                        name="organizationArea"
                        fullWidth
                        defaultValue={organization.organizationArea}
                        value={organization.organizationArea}
                        onChange={handleInputChange}
                        id="org_area"
                        helperText={errors.organizationArea}
                        error={!!errors.organizationArea}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={17}>
                    <FormControl
                      fullWidth
                      variant="standard"
                      className={classes.formControl}
                    >
                      <InputLabel
                        shrink
                        htmlFor="org_address"
                        className={classes.inputLabel}
                        required
                      >
                        {wordLibrary?.address ?? "地址"}
                      </InputLabel>
                      <TextField
                        type="text"
                        name="organizationAddress"
                        fullWidth
                        defaultValue={organization.organizationAddress}
                        value={organization.organizationAddress}
                        onChange={handleInputChange}
                        id="org_address"
                        helperText={errors.organizationAddress}
                        error={!!errors.organizationAddress}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={17}>
                    <FormControl
                      fullWidth
                      variant="standard"
                      className={classes.formControl}
                    >
                      <InputLabel
                        shrink
                        htmlFor="org_zipcode"
                        className={classes.inputLabel}
                        required
                      >
                        {wordLibrary?.["postal code"] ?? "郵遞區號"}
                      </InputLabel>
                      <TextField
                        type="text"
                        name="organizationZIPCode"
                        fullWidth
                        defaultValue={organization.organizationZIPCode}
                        value={organization.organizationZIPCode}
                        onChange={handleInputChange}
                        id="org_zipcode"
                        helperText={errors.organizationZIPCode}
                        error={!!errors.organizationZIPCode}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              )}
              {step === 2 && (
                <Grid container spacing={2}>
                  <Grid item xs={17}>
                    <FormControl
                      fullWidth
                      variant="standard"
                      className={classes.formControl}
                    >
                      <TextField
                        autoFocus
                        type="text"
                        name="organizationWebsite"
                        placeholder="網站"
                        fullWidth
                        value={organization.organizationWebsite}
                        onChange={handleInputChange}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={17}>
                    <FormControl
                      fullWidth
                      variant="standard"
                      className={classes.formControl}
                    >
                      <TextField
                        type="text"
                        name="organizationFanPage"
                        placeholder={wordLibrary?.["fan page"] ?? "粉絲專頁"}
                        fullWidth
                        value={organization.organizationFanPage}
                        onChange={handleInputChange}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              )}
            </div>
            <Grid container spacing={2} className={classes.action}>
              <Grid item container justifyContent="space-between">
                <DialogCloseButton onClick={handlePrevStep}>
                  {wordLibrary?.["previous step"] ?? "上一步"}
                </DialogCloseButton>
                <DialogConfirmButton onClick={handleNextStep}>
                  {(() => {
                    let output = "";
                    if (step === 2) {
                      output = wordLibrary?.complete ?? "完成";
                    } else {
                      output = wordLibrary?.["next step"] ?? "下一步";
                    }
                    return output;
                  })()}
                </DialogConfirmButton>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Stack>
    </div>
  );
};

export default CreateOrg;
