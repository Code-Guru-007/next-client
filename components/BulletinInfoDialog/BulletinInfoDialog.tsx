/* eslint-disable no-underscore-dangle */
import React, { FC, useEffect, useState } from "react";

import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useOrgDynamicColumns from "utils/useOrgDynamicColumns";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import useStaticColumns from "utils/useStaticColumns";
import { Table } from "interfaces/utils";
import { UpdateBulletinApiPayload } from "interfaces/payloads";
import { Bulletin } from "interfaces/entities";
import useUpdateBulletinApiPayload from "utils/Bulletin/useUpdateBulletinApiPayload";
import PermissionValid from "components/PermissionValid";

import Grid from "@eGroupAI/material/Grid";
import Dialog from "@eGroupAI/material/Dialog";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogActions from "@eGroupAI/material/DialogActions";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import DynamicField, { Values } from "components/DynamicField";
import { DynamicValueType } from "interfaces/form";

export const DIALOG = "BulletinInfoDialog";
export interface BulletinInfoDialogProps {
  onConfirm?: (
    payload: Omit<UpdateBulletinApiPayload, "organizationId" | "bulletinId">
  ) => void;
  defaultValues?: Values;
  loading?: boolean;
  bulletin?: Bulletin;
}

const BulletinInfoDialog: FC<BulletinInfoDialogProps> = function (props) {
  const { onConfirm, defaultValues, loading, bulletin } = props;
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const organizationId = useSelector(getSelectedOrgId);
  const [values, setValues] = useState<Values>({});
  const wordLibrary = useSelector(getWordLibrary);
  const staticColumns = useStaticColumns(Table.USERS, "isEdit");
  const { data: orgColumns } = useOrgDynamicColumns({
    organizationId,
  });
  const getUpdatePayload = useUpdateBulletinApiPayload(
    bulletin?.dynamicColumnTargetList,
    orgColumns?.source
  );

  useEffect(() => {
    if (defaultValues) {
      setValues(defaultValues);
    }
  }, [defaultValues]);

  const handleChange = (name: string, value?: DynamicValueType) => {
    setValues((val) => ({
      ...val,
      [name]: value?.value,
    }));
  };

  return (
    <Dialog open={isOpen} onClose={closeDialog} fullWidth maxWidth="md">
      <DialogTitle onClickClose={closeDialog}>
        {bulletin
          ? `${wordLibrary?.edit ?? "編輯"}`
          : `${wordLibrary?.add ?? "新增"}`}
        佈告欄
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={1} sx={{ mt: 1 }}>
          {staticColumns?.map((el) => {
            if (el.sortKey && el.columnType) {
              return (
                <Grid item xs={12} key={el.id}>
                  <DynamicField
                    value={values[el.sortKey]}
                    handleChange={handleChange}
                    name={el.sortKey}
                    type={el.columnType}
                    verifyType={el.verifyType_}
                    dateRangeLimit={el.dateRangeLimit_}
                    label={wordLibrary?.[el.columnName] ?? el.columnName}
                    required={el.isEditFix === 1}
                    options={
                      el.keyValueMap
                        ? Object.keys(el.keyValueMap).map((key) => ({
                            optionId: key,
                            label: key,
                            value: el.keyValueMap
                              ? el.keyValueMap[key] || ""
                              : "",
                          }))
                        : undefined
                    }
                    fullWidth
                  />
                </Grid>
              );
            }
            return undefined;
          })}
          {orgColumns?.source.map((el) => (
            <Grid item xs={12} key={el.columnId}>
              <DynamicField
                value={values[el.columnId]}
                handleChange={handleChange}
                name={el.columnId}
                type={el.columnType}
                label={wordLibrary?.[el.columnName] ?? el.columnName}
                fullWidth
                options={el.organizationOptionList?.map((o) => ({
                  optionId: o.organizationOptionId,
                  label: o.organizationOptionName,
                  value: o.organizationOptionName,
                }))}
              />
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <DialogCloseButton onClick={closeDialog} />
        <PermissionValid shouldBeOrgOwner modulePermissions={["UPDATE_ALL"]}>
          <DialogConfirmButton
            onClick={() => {
              let payload: Omit<
                UpdateBulletinApiPayload,
                "organizationId" | "bulletinId"
              >;
              if (bulletin) {
                payload = getUpdatePayload(
                  values,
                  defaultValues,
                  bulletin.bulletinId
                );
              } else {
                payload = getUpdatePayload(values, defaultValues);
              }
              if (onConfirm) {
                onConfirm(payload);
              }
              if (!bulletin) {
                setValues({});
              }
            }}
            loading={loading}
          >
            {wordLibrary?.save ?? "儲存"}
          </DialogConfirmButton>
        </PermissionValid>
      </DialogActions>
    </Dialog>
  );
};

export default BulletinInfoDialog;
