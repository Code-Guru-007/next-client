import React, {
  useEffect,
  FC,
  Dispatch,
  SetStateAction,
  useContext,
} from "react";

import { KeyedMutator } from "swr";
import { AxiosResponse } from "axios";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import {
  CmsContentsFormInput,
  OrganizationCmsContentField,
} from "interfaces/form";
import useSetFormIsDirty from "utils/useSetFormIsDirty";

import {
  OrganizationCmsContent,
  OrganizationSolution,
} from "interfaces/entities";
import Form from "components/Form";
import OrgCmsContentFieldArray from "components/OrgCmsContentFieldArray";
import { IconButton, Stack, Tooltip } from "@mui/material";
import Iconify from "minimal/components/iconify";

import SolutionCmsContentsManagementContext from "./SolutionCmsContentsManagementContext";

export const FORM = "SolutionCmsContentsManageForm";

export interface SolutionCmsContentsManageFormProps {
  onSubmit: ({
    newContents,
    modifiedContents,
    deletedContents,
    allList,
  }: {
    newContents: OrganizationCmsContentField[];
    modifiedContents: OrganizationCmsContentField[];
    deletedContents: OrganizationCmsContent[];
    allList: OrganizationCmsContentField[];
  }) => void;
  onStartSortClick?: (
    values: CmsContentsFormInput,
    mutate: KeyedMutator<AxiosResponse<OrganizationSolution>>
  ) => void;
  setFormIsDirty?: Dispatch<SetStateAction<boolean>>;
  setFormIsBusy?: Dispatch<SetStateAction<boolean>>;
  infoMutate?: KeyedMutator<AxiosResponse<OrganizationSolution, any>>;
  solutionInfo?: OrganizationSolution;
  selectedDesktop?: boolean;
}

const SolutionCmsContentsManageForm: FC<SolutionCmsContentsManageFormProps> =
  function (props) {
    const { onSubmit, setFormIsDirty, solutionInfo } = props;

    const { cmsContentList } = useContext(SolutionCmsContentsManagementContext);

    const methods = useForm<CmsContentsFormInput>({
      defaultValues: {
        organizationCmsContentList: [],
      },
    });
    const { handleSubmit, reset, formState, control, watch } = methods;

    const cmsContentFormList = watch("organizationCmsContentList");

    const { append } = useFieldArray({
      control,
      name: "organizationCmsContentList",
    });

    useSetFormIsDirty({
      isDirty: formState.isDirty,
      setFormIsDirty,
    });

    useEffect(() => {
      reset({
        organizationCmsContentList: cmsContentList?.map((cms) => ({
          organizationCmsContentId: cms.organizationCmsContentId,
          organizationCmsContentSort: cms.organizationCmsContentSort,
          organizationCmsContentTitle: cms.organizationCmsContentTitle,
          organizationCmsContentDescription:
            cms.organizationCmsContentDescription,
          organizationMediaList: [],
        })),
      });
    }, [cmsContentList, reset]);

    return (
      <FormProvider {...methods}>
        <Form
          id={FORM}
          onSubmit={handleSubmit(async () => {
            const values = methods.getValues();
            const allList = values.organizationCmsContentList || [];
            const updatedContents = values.organizationCmsContentList?.filter(
              (list) => list.isUpdated
            );
            const deletedContents =
              cmsContentList?.filter(
                (o_c) =>
                  !values.organizationCmsContentList
                    ?.map((u_c) => u_c.organizationCmsContentId)
                    .includes(o_c.organizationCmsContentId)
              ) || [];

            const newContents =
              updatedContents?.filter((list) => list.isNew) || [];
            const modifiedContents =
              updatedContents?.filter((list) => !list.isNew) || [];

            onSubmit({
              newContents,
              modifiedContents,
              deletedContents,
              allList,
            });
          })}
        >
          <Stack
            direction="row"
            sx={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 1,
              padding: 1,
            }}
          >
            <Tooltip title="add cms content" placement="top">
              <IconButton
                onClick={() => {
                  const currentLength = cmsContentFormList?.length || 0;
                  append({
                    organizationCmsContentId: `newId-${currentLength}`,
                    organizationCmsContentTitle: "",
                    organizationCmsContentSort: currentLength,
                    organizationCmsContentDescription: "",
                    organizationMediaList: [],
                    isEditing: true,
                    isNew: true,
                  });
                }}
              >
                <Iconify icon="mingcute:add-line" width={30} />
              </IconButton>
            </Tooltip>
          </Stack>
          <OrgCmsContentFieldArray
            targetId={solutionInfo?.organizationSolutionId}
            isItemsSortable={false}
          />
        </Form>
      </FormProvider>
    );
  };

export default SolutionCmsContentsManageForm;
