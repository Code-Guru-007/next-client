import React, {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAppDispatch } from "redux/configureAppStore";
import { ShareReurl, UploadFile } from "interfaces/entities";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import useReduxSteps from "utils/useReduxSteps";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";

import apis from "utils/apis";
import { RemarkValues, Values } from "components/DynamicField";
import { getStart, getValues } from "redux/filledUserInfo/selectors";
import { setStart, setSuccess, setUserValues } from "redux/filledUserInfo";

import Stepper from "@eGroupAI/material/Stepper";
import Step from "@eGroupAI/material/Step";
import StepButton from "@eGroupAI/material/StepButton";
import Paper from "@eGroupAI/material/Paper";
import { ServiceModuleValue } from "interfaces/utils";
import useUpdateUserApiPayload from "utils/useUpdateUserApiPayload";
import getLocalStorageItemsWithPrefix from "utils/getLocalStorageItemsWithPrefix";

import Statements, { UserAgreement } from "./Statements";
import UserInfo from "./UserInfo";
import Finances from "./Finances";
import useDefaultUserValues from "./useDefaultUserValues";

export interface FilledStepsProps {
  data?: ShareReurl;
  step?: number;
  preview?: boolean;
  changeStep?: (value: number) => void;
  organizationShareShortUrl: string;
}

const FilledSteps: FC<FilledStepsProps> = function (props) {
  const { data, step, preview, changeStep, organizationShareShortUrl } = props;
  const { query, push, pathname } = useRouter();
  const dispatch = useAppDispatch();
  const defaultUserValues = useDefaultUserValues(data);
  const [stepper0Disable, setStepper0Disable] = useState<boolean>(false);
  const [stepper1Disable, setStepper1Disable] = useState<boolean>(false);
  const [stepper2Disable, setStepper2Disable] = useState<boolean>(false);

  useEffect(() => {
    dispatch(setUserValues(defaultUserValues));
  }, [defaultUserValues, dispatch]);

  const {
    setActiveStep,
    setFinalStep,
    activeStep = 0,
    finalStep = 0,
  } = useReduxSteps("FilledUserInfo");

  const { excute: updateUser, isLoading: isUpdating } = useAxiosApiWrapper(
    apis.publicapi.updateUser,
    "None"
  );
  const { excute: createFinanceTargets, isLoading: isCreating } =
    useAxiosApiWrapper(apis.publicapi.createFinanceTargets, "None");

  const getUpdatePayload = useUpdateUserApiPayload(
    data?.organizationUser.dynamicColumnTargetList,
    data?.organizationUser.dynamicColumnListAll
  );

  const start = useSelector(getStart);
  const values = useSelector(getValues);

  const agreementFiles = useMemo(
    () =>
      data?.uploadFileList?.filter(
        (el) => el.uploadFilePathType === ServiceModuleValue.USER_AGREEMENT
      ),
    [data?.uploadFileList]
  );

  const removeStoredAgreementFiles = useCallback(() => {
    const itemsWithPrefix = getLocalStorageItemsWithPrefix(
      `userAgreementFiles-${organizationShareShortUrl}`
    );
    itemsWithPrefix.forEach(({ key }) => {
      window.localStorage.removeItem(key);
    });
  }, [organizationShareShortUrl]);

  useEffect(() => {
    if (query.step) {
      setActiveStep(Number(query.step) as number);
    } else if (step === undefined) {
      setActiveStep(0);
    } else {
      setActiveStep(step);
    }
  }, [step, query.step, setActiveStep]);

  const steps = useMemo(() => {
    const result: {
      label: string;
      render: (active: boolean) => ReactNode;
    }[] = [];

    const handlePrev = () => {
      const step = activeStep - 1;
      setActiveStep(step);
      if (preview && changeStep) {
        changeStep(step);
      } else {
        push({
          pathname,
          query: {
            ...query,
            step,
          },
        });
      }
    };

    const handleNext = async (
      formValues?: Values,
      formRemarkValues?: RemarkValues,
      userFileList?: UploadFile[],
      formColumnTargetValues?: RemarkValues
    ) => {
      if (activeStep < finalStep) {
        const step = activeStep + 1;
        setActiveStep(step);
        if (preview && changeStep) {
          changeStep(step);
        } else {
          push({
            pathname,
            query: {
              ...query,
              step,
            },
          });
        }
        window.scrollTo({
          top: 0,
        });
      } else if (activeStep === finalStep && data) {
        let userValues: Values;
        let userRemarkValues: RemarkValues;
        let userColumnTargetValues: RemarkValues;
        const {
          finances,
          userValues: userValuesFromStore,
          remarkValues: userRemarkValuesFromStore,
          columnTargetValues: userColumnTargetValuesFromStore,
        } = values;
        userValues = userValuesFromStore;
        userRemarkValues = userRemarkValuesFromStore;
        userColumnTargetValues = userColumnTargetValuesFromStore;

        if (formValues) userValues = formValues;
        if (formRemarkValues) userRemarkValues = formRemarkValues;
        if (formColumnTargetValues)
          userColumnTargetValues = formColumnTargetValues;

        const payload = getUpdatePayload(
          userValues,
          defaultUserValues,
          undefined,
          userRemarkValues,
          undefined,
          undefined,
          data?.organizationShareEditList,
          true,
          userColumnTargetValues
        );

        if (preview) {
          dispatch(setStart(false));
          dispatch(setSuccess(true));
          removeStoredAgreementFiles();
        } else {
          const user_agreement: UserAgreement = JSON.parse(
            window.localStorage.getItem(
              `userAgreementFiles-${organizationShareShortUrl}`
            ) || "{}"
          ) || { url: "", files: [] };
          const user_files = user_agreement.files || [];

          await updateUser({
            organizationShareShortUrl: query.url as string,
            ...payload,
            agreementFileList: user_files.map((fileId) => ({
              uploadFileId: fileId,
            })),
            userFileList:
              userFileList?.map((el) => ({
                uploadFileId: el.uploadFileId,
              })) || [],
          });
          if (Object.keys(finances).length !== 0) {
            // 過濾 organizationFinanceColumnList 以移除空的 organizationTagList
            const filteredFinanceColumnList = Object.values(finances).flatMap(
              (finance) =>
                finance.organizationFinanceColumnList.map((column) => {
                  const filteredTagList =
                    column.organizationFinanceTarget.organizationTagList.filter(
                      (tag) => tag.tagId
                    );
                  return {
                    ...column,
                    organizationFinanceTarget: {
                      ...column.organizationFinanceTarget,
                      organizationTagList:
                        filteredTagList.length > 0
                          ? filteredTagList
                          : undefined,
                    },
                  };
                })
            );

            await createFinanceTargets({
              organizationShareShortUrl: query.url as string,
              organizationFinanceColumnList: filteredFinanceColumnList,
            });
          }

          dispatch(setStart(false));
          dispatch(setSuccess(true));
          removeStoredAgreementFiles();
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { step, ...other } = query;
          push({
            pathname,
            query: other,
          });
        }
      }
    };

    if (agreementFiles && agreementFiles.length > 0) {
      result.push({
        label: "閱讀同意書",
        render: (active) =>
          active && (
            <Statements
              agreementFiles={agreementFiles}
              organizationShareShortUrl={
                preview ? undefined : (query.url as string)
              }
              onPrevClick={handlePrev}
              onNextClick={handleNext}
              setStepperDisable={setStepper0Disable}
              isFirstStep={activeStep === 0}
              isFinalStep={activeStep === finalStep}
              active={active}
            />
          ),
      });
    }

    if (
      (data?.organizationShareEditList &&
        data.organizationShareEditList.length > 0) ||
      data?.organizationShareEditNeedUpload === 1
    ) {
      result.push({
        label: "填寫個人資料",
        render: (active) =>
          active && (
            <UserInfo
              data={data}
              organizationShareShortUrl={
                preview ? organizationShareShortUrl : (query.url as string)
              }
              loading={isUpdating || isCreating}
              onPrevClick={handlePrev}
              onSubmit={handleNext}
              setStepperDisable={setStepper1Disable}
              isFirstStep={activeStep === 0}
              isFinalStep={activeStep === finalStep}
              active={active}
            />
          ),
      });
    }

    if (
      data?.organizationFinanceTemplateList &&
      data.organizationFinanceTemplateList.length > 0
    ) {
      result.push({
        label: "填寫財務資訊",
        render: (active) =>
          active && (
            <Finances
              data={data}
              loading={isUpdating || isCreating}
              onPrevClick={handlePrev}
              onNextClick={handleNext}
              setStepperDisable={setStepper2Disable}
              isFirstStep={activeStep === 0}
              isFinalStep={activeStep === finalStep}
              active={active}
            />
          ),
      });
    }
    return result;
  }, [
    activeStep,
    changeStep,
    createFinanceTargets,
    data,
    defaultUserValues,
    dispatch,
    finalStep,
    getUpdatePayload,
    isCreating,
    isUpdating,
    organizationShareShortUrl,
    pathname,
    preview,
    push,
    query,
    setActiveStep,
    updateUser,
    agreementFiles,
    values,
    removeStoredAgreementFiles,
  ]);

  useEffect(() => {
    if (steps.length > 0) {
      setFinalStep(steps.length - 1);
    }
  }, [setFinalStep, steps]);

  return (
    <>
      <Paper sx={{ px: 3, py: 2 }}>
        <Stepper nonLinear activeStep={activeStep} sx={{ mx: -1 }}>
          {steps.map((el, index) => (
            <Step key={el.label}>
              <StepButton
                disabled={
                  (index > activeStep &&
                    (stepper0Disable || stepper1Disable || stepper2Disable)) ||
                  index > activeStep + 1
                }
                color="inherit"
                onClick={() => {
                  setActiveStep(index);
                  if (preview && changeStep) {
                    changeStep(index);
                  } else {
                    push({
                      pathname,
                      query: {
                        ...query,
                        step: index,
                      },
                    });
                  }
                }}
              >
                {el.label}
              </StepButton>
            </Step>
          ))}
        </Stepper>
      </Paper>
      {steps.map((el, index) => (
        // Use display none to preload pdf. See more detail in below.
        // https://github.com/eGroupAI/infocenter-client/issues/550
        <div
          key={el.label}
          style={{ display: activeStep === index ? "block" : "none" }}
        >
          {el.render(start && activeStep === index)}
        </div>
      ))}
    </>
  );
};

export default FilledSteps;
