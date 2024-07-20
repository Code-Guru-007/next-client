import React, { FC, useState, useEffect, useMemo } from "react";

import { setFinanceColumnList } from "redux/filledUserInfo";
import { useSelector } from "react-redux";
import { getValues } from "redux/filledUserInfo/selectors";
import { ShareReurl } from "interfaces/entities";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import useFinanceTemplate from "utils/useFinanceTemplate";
import { useAppDispatch } from "redux/configureAppStore";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import Typography from "@eGroupAI/material/Typography";
import Paper from "@eGroupAI/material/Paper";
import Box from "@eGroupAI/material/Box";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Button, { ButtonProps } from "@eGroupAI/material/Button";
import FinanceDialog, {
  DIALOG,
  FinanceDialogProps,
} from "components/FilledUserFinanceDialog";
import { Values } from "components/DynamicField";

export interface FinancesProps {
  data?: ShareReurl;
  onPrevClick?: ButtonProps["onClick"];
  onNextClick?: (formValues?: Values) => Promise<void>;
  setStepperDisable?: (stepperDisable: boolean) => void;
  loading?: boolean;
  isFirstStep?: boolean;
  isFinalStep?: boolean;
  /**
   * If setp active.
   */
  active?: boolean;
}

const Finances: FC<FinancesProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const dispatch = useAppDispatch();
  const {
    data,
    onPrevClick,
    onNextClick,
    setStepperDisable,
    loading,
    isFirstStep,
    isFinalStep,
    active = false,
  } = props;
  const { openDialog, closeDialog } = useReduxDialog(DIALOG);
  const [selectedFinanceId, setSelectedFinanceId] = useState<string>();
  const values = useSelector(getValues);
  const { data: template } = useFinanceTemplate({
    organizationFinanceTemplateId: selectedFinanceId,
  });
  if (setStepperDisable)
    setStepperDisable(active && Object.keys(values.finances).length === 0);

  useEffect(() => {
    if (!data || !data.organizationFinanceTemplateList) return;
    data.organizationFinanceTemplateList.forEach((el) => {
      if (active && !values.finances[el.organizationFinanceTemplateId]) {
        setSelectedFinanceId(el.organizationFinanceTemplateId);
        openDialog();
      }
    });
  }, [active, data, openDialog, values]);

  const currentValues = useMemo(
    () => (selectedFinanceId ? values.finances[selectedFinanceId] : undefined),
    [selectedFinanceId, values.finances]
  );

  const defaultValues: FinanceDialogProps["defaultValues"] = useMemo(
    () => ({
      organizationFinanceColumnList:
        template?.organizationFinanceColumnList?.map((el) => ({
          organizationFinanceColumnId: el.organizationFinanceColumnId,
          organizationFinanceColumnName: el.organizationFinanceColumnName,
          organizationFinanceType: el.organizationFinanceType,
          organizationFinanceTemplate: {
            organizationFinanceTemplateId:
              el.organizationFinanceTemplate?.organizationFinanceTemplateId,
          },
          organizationFinanceTarget: {
            organizationFinanceTargetAmount: 0,
            organizationFinanceTargetInsertDate: new Date().toISOString(),
            organizationTagList: [
              {
                tagId: "",
              },
            ],
          },
        })) || [],
    }),
    [template?.organizationFinanceColumnList]
  );

  return (
    <>
      <FinanceDialog
        primary={template?.organizationFinanceTemplateName}
        description={template?.organizationFinanceTemplateDescription}
        defaultValues={currentValues || defaultValues}
        onSubmit={(v) => {
          if (selectedFinanceId) {
            dispatch(
              setFinanceColumnList({
                organizationFinanceTemplateId: selectedFinanceId,
                columns: v.organizationFinanceColumnList,
              })
            );
          }
          closeDialog();
        }}
      />
      <Paper sx={{ px: 3, py: 2, mt: 2 }}>
        <Typography variant="h4" gutterBottom>
          填寫財務資訊
        </Typography>
        {data?.organizationFinanceTemplateList?.map((el) => (
          <Button
            key={el.organizationFinanceTemplateId}
            onClick={() => {
              setSelectedFinanceId(el.organizationFinanceTemplateId);
              openDialog();
            }}
            startIcon={<OpenInNewIcon />}
            fullWidth
            variant="outlined"
            color="primary"
            sx={{ mb: 2 }}
          >
            {el.organizationFinanceTemplateName}-
            {values.finances[el.organizationFinanceTemplateId]
              ? "已填寫"
              : "未填寫"}
          </Button>
        ))}
      </Paper>
      <Box mt={2} display="flex" justifyContent="flex-end">
        {!isFirstStep && (
          <Button
            color="primary"
            variant="contained"
            onClick={onPrevClick}
            sx={{ mr: 1 }}
          >
            {wordLibrary?.["go back to the previous step"] ?? "回上一步"}
          </Button>
        )}
        <Button
          loading={loading}
          color="primary"
          variant="contained"
          onClick={() => {
            if (onNextClick) onNextClick();
          }}
          disabled={Object.keys(values.finances).length === 0}
        >
          {(() => {
            let output = "";
            if (isFinalStep) {
              output = wordLibrary?.complete ?? "完成";
            } else {
              output = wordLibrary?.["next step"] ?? "下一步";
            }
            return output;
          })()}
        </Button>
      </Box>
    </>
  );
};

export default Finances;
