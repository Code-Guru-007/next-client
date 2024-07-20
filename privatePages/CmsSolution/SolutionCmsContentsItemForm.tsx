import React, {
  useEffect,
  useContext,
  FC,
  Dispatch,
  SetStateAction,
} from "react";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import { useSelector } from "react-redux";
import apis from "utils/apis";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import { KeyedMutator } from "swr";
import { AxiosResponse } from "axios";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { SolutionEditFormInput, OrganizationMediaField } from "interfaces/form";
import useOrgSolution from "utils/useOrgSolution";
import parseOrgMediaListFormValues from "utils/parseOrgMediaListFormValues";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import useSetFormIsDirty from "utils/useSetFormIsDirty";
import { ServiceModuleValue } from "interfaces/utils";

import Grid from "@eGroupAI/material/Grid";
import FormField from "components/FormField";
import { OrganizationSolution } from "interfaces/entities";
import OrgMediaField from "components/OrgMediaField";
import Form from "components/Form";
import FormFieldLabel from "components/FormFieldLabel";
import SolutionCmsContentsManagementContext from "./SolutionCmsContentsManagementContext";

export const FORM = "SolutionCmsContentsItemForm";

export interface SolutionCmsContentsItemFormProps {
  onSubmit: (
    values: SolutionEditFormInput,
    mutate: KeyedMutator<AxiosResponse<OrganizationSolution>>
  ) => void;
  onStartSortClick: (
    values: SolutionEditFormInput,
    mutate: KeyedMutator<AxiosResponse<OrganizationSolution>>
  ) => void;
  setFormIsDirty?: Dispatch<SetStateAction<boolean>>;
}

const SolutionCmsContentsItemForm: FC<SolutionCmsContentsItemFormProps> =
  function (props) {
    const organizationId = useSelector(getSelectedOrgId);
    const { onSubmit, setFormIsDirty, onStartSortClick } = props;
    const { selectedItem, selectedLocale } = useContext(
      SolutionCmsContentsManagementContext
    );
    const methods = useForm<SolutionEditFormInput>({
      defaultValues: {
        organizationSolutionName: "",
        organizationSolutionDescription: "",
        organizationSolutionURL: "",
        organizationMediaList: [],
      },
    });
    const { control, handleSubmit, reset, formState, getValues } = methods;
    const { excute: sortOrgMedia } = useAxiosApiWrapper(
      apis.org.sortOrgMedia,
      "Update"
    );
    const { excute: deleteOrgMedia } = useAxiosApiWrapper(
      apis.org.deleteOrgMedia,
      "Delete"
    );
    const {
      openDialog: openConfirmDeleteDialog,
      closeDialog: closeConfirmDeleteDialog,
    } = useReduxDialog(DELETE_DIALOG);

    useSetFormIsDirty({
      isDirty: formState.isDirty,
      setFormIsDirty,
    });

    const { data, mutate, isValidating } = useOrgSolution(
      {
        organizationId,
        organizationSolutionId: selectedItem?.ids.organizationSolutionId,
      },
      {
        locale: selectedLocale,
      }
    );

    useEffect(() => {
      reset({
        organizationSolutionName: data?.organizationSolutionName,
        organizationSolutionDescription: data?.organizationSolutionDescription,
        organizationSolutionURL: data?.organizationSolutionURL,
        organizationMediaList: parseOrgMediaListFormValues(
          data?.organizationMediaList
        ),
      });
    }, [data, reset]);

    const handleDeleteItem = (
      item: OrganizationMediaField,
      remove: () => void
    ) => {
      openConfirmDeleteDialog({
        primary: `您確定要刪除嗎？`,
        onConfirm: async () => {
          if (item.organizationMediaId) {
            try {
              await deleteOrgMedia({
                organizationId,
                organizationMediaId: item.organizationMediaId,
              });
              closeConfirmDeleteDialog();
              remove();
            } catch (error) {
              apis.tools.createLog({
                function: "DatePicker: handleDeleteItem",
                browserDescription: window.navigator.userAgent,
                jsonData: {
                  data: error,
                  deviceInfo: getDeviceInfo(),
                },
                level: "ERROR",
              });
            }
          } else {
            remove();
            closeConfirmDeleteDialog();
          }
        },
      });
    };

    const handleSortItem = async (item: OrganizationMediaField[]) => {
      try {
        if (data?.organizationSolutionId) {
          await sortOrgMedia({
            organizationId,
            targetId: data.organizationSolutionId,
            organizationMediaList: item
              .filter((el) => el.organizationMediaId)
              .map((el) => ({
                organizationMediaId: el.organizationMediaId as string,
              })),
          });
          mutate();
        }
      } catch (error) {
        apis.tools.createLog({
          function: "DatePicker: handleSortItem",
          browserDescription: window.navigator.userAgent,
          jsonData: {
            data: error,
            deviceInfo: getDeviceInfo(),
          },
          level: "ERROR",
        });
      }
    };

    return (
      <FormProvider {...methods}>
        <Form
          id={FORM}
          onSubmit={handleSubmit((values) => {
            onSubmit(values, mutate);
          })}
          loading={isValidating}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                control={control}
                name="organizationSolutionName"
                render={({ field: { value, onChange } }) => (
                  <FormField
                    primary="解決方案名稱"
                    TextFieldProps={{
                      onChange,
                      value,
                      placeholder: "輸入解決方案名稱",
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                control={control}
                name="organizationSolutionURL"
                render={({ field: { value, onChange } }) => (
                  <FormField
                    primary="解決方案連結"
                    TextFieldProps={{
                      onChange,
                      value,
                      placeholder: "輸入解決方案連結",
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                control={control}
                name="organizationSolutionDescription"
                render={({ field: { value, onChange } }) => (
                  <FormField
                    primary="解決方案描述"
                    TextFieldProps={{
                      onChange,
                      value,
                      placeholder: "輸入解決方案描述",
                      multiline: true,
                      minRows: 5,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <FormFieldLabel primary="Icon 編輯(建議比例1:1)">
                <OrgMediaField
                  filePathType={ServiceModuleValue.CMS_SOLUTION}
                  targetId={selectedItem?.ids.organizationSolutionId}
                  maxFields={4}
                  enableTitle
                  onDeleteItemClick={handleDeleteItem}
                  onItemOrderChange={handleSortItem}
                  onStartSortClick={() => {
                    const values = getValues();
                    onStartSortClick(values, mutate);
                  }}
                />
              </FormFieldLabel>
            </Grid>
          </Grid>
        </Form>
      </FormProvider>
    );
  };

export default SolutionCmsContentsItemForm;
