import React from "react";
import { makeStyles } from "@mui/styles";

import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import { useSelector } from "react-redux";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import parseOrgMediaListToImgSrc from "utils/parseOrgMediaListToImgSrc";
import useOrgSolutions from "utils/useOrgSolutions";
import parseCreateMediaListApiPayload from "utils/parseCreateMediaListApiPayload";
import { PageType } from "interfaces/utils";
import CmsSeoPageEditSection from "components/CmsSeoPageEditSection";

import EditSection from "components/EditSection";
import OrgMediaSliderEditor from "components/OrgMediaSliderEditor";
import CarouselManagement from "components/CarouselManagement";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import parseUpdateMediaPromises from "utils/parseUpdateMediaPromises";
import FeatureEditForm, {
  FeatureEditFormProps,
  FORM as FEATURE_FORM,
} from "./FeatureEditForm";
import FeatureList from "./FeatureList";

const useStyles = makeStyles({
  editSectionContainer: {
    borderRadius: 0,
    boxShadow: "none",
    marginBottom: 0,
    borderBottom: "1px solid #EEEEEE",
  },
});

const CmsSolutionsInfo = function () {
  const classes = useStyles();
  const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);
  const { data, mutate } = useOrgSolutions(
    {
      organizationId,
    },
    {
      locale,
    }
  );

  const { excute: createOrgSolution, isLoading: isCreatingSolution } =
    useAxiosApiWrapper(apis.org.createOrgSolution, "Create");
  const { excute: updateOrgSolution, isLoading: isUpdatingSolution } =
    useAxiosApiWrapper(apis.org.updateOrgSolution, "Update");
  const { excute: deleteOrgSolution } = useAxiosApiWrapper(
    apis.org.deleteOrgSolution,
    "Delete"
  );
  const { excute: updateOrgSolutionsSort } = useAxiosApiWrapper(
    apis.org.updateOrgSolutionsSort,
    "Update"
  );
  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
  } = useReduxDialog(DELETE_DIALOG);

  return (
    <>
      <CmsSeoPageEditSection
        primary="解決方案 SEO"
        pageType={PageType.SOLUTIONLIST}
        className={classes.editSectionContainer}
      />
      <EditSection className={classes.editSectionContainer}>
        <OrgMediaSliderEditor
          pageType={PageType.SOLUTIONLIST}
          title="解決方案輪播圖"
        />
      </EditSection>
      <EditSection className={classes.editSectionContainer}>
        <CarouselManagement
          pageType={PageType.SOLUTIONDETAIL}
          title="解決方案內容"
          SortDialogProps={{
            title: "解決方案內容管理",
            onClose: () => {
              mutate();
            },
          }}
          EditDialogProps={{
            updating: isUpdatingSolution || isCreatingSolution,
            onClose: () => {
              mutate();
            },
          }}
          items={data?.source.map((el, index) => ({
            ids: {
              primaryId: el.organizationSolutionId,
              organizationSolutionId: el.organizationSolutionId,
              organizationMediaSliderId: el.organizationMediaSliderList
                ? el.organizationMediaSliderList[0]?.organizationMediaSliderId
                : undefined,
            },
            order: index,
            title: el.organizationSolutionName,
            description: el.organizationSolutionDescription,
            linkURL: el.organizationSolutionURL,
            imgSrc: parseOrgMediaListToImgSrc(
              el.organizationMediaSliderList
                ? el.organizationMediaSliderList[0]?.organizationMediaList
                : undefined
            ),
            items: el.organizationMediaList?.map((om, omIndex) => ({
              ids: {
                primaryId: om.organizationMediaId,
                organizationMediaId: om.organizationMediaId,
              },
              title: om.organizationMediaTitle,
              order: omIndex,
              imgSrc: {
                normal: om.uploadFile.uploadFilePath,
              },
            })),
          }))}
          onItemOrderChange={(next) => {
            updateOrgSolutionsSort({
              organizationId,
              organizationSolutionList: next.map((el) => ({
                organizationSolutionId: el.ids.organizationSolutionId as string,
              })),
            });
          }}
          onDeleteItemClick={(selectedItem, closeEditDialog) => {
            if (selectedItem) {
              openConfirmDeleteDialog({
                primary: `您確定要刪除${selectedItem.title}嗎？`,
                onConfirm: async () => {
                  try {
                    await deleteOrgSolution({
                      organizationId,
                      organizationSolutionId: selectedItem.ids
                        .organizationSolutionId as string,
                    });
                    mutate();
                    closeConfirmDeleteDialog();
                    closeEditDialog();
                  } catch (error) {
                    apis.tools.createLog({
                      function: "deleteOrgSolution: error",
                      browserDescription: window.navigator.userAgent,
                      jsonData: {
                        data: error,
                        deviceInfo: getDeviceInfo(),
                      },
                      level: "ERROR",
                    });
                  }
                },
              });
            }
          }}
          renderForm={(dialogState, setSelectedItem, selectedItem) => {
            const handleSubmit: FeatureEditFormProps["onSubmit"] = async (
              values,
              mutateSlider
            ) => {
              try {
                const { selectedLocale } = dialogState;
                if (selectedItem?.ids.organizationSolutionId) {
                  const promises: Promise<unknown>[] = parseUpdateMediaPromises(
                    organizationId,
                    selectedLocale,
                    values.organizationMediaList
                  );
                  promises.push(
                    updateOrgSolution({
                      organizationId,
                      organizationSolutionId: selectedItem.ids
                        .organizationSolutionId as string,
                      organizationSolutionName: values.organizationSolutionName,
                      organizationSolutionDescription:
                        values.organizationSolutionDescription,
                      organizationSolutionURL: values.organizationSolutionURL,
                      locale: selectedLocale,
                    })
                  );
                  Promise.all(promises)
                    .then(() => {
                      mutateSlider();
                    })
                    .catch(() => {});
                } else {
                  const res = await createOrgSolution({
                    organizationId,
                    organizationSolutionName: values.organizationSolutionName,
                    organizationSolutionDescription:
                      values.organizationSolutionDescription,
                    organizationSolutionURL: values.organizationSolutionURL,
                    organizationMediaList: parseCreateMediaListApiPayload(
                      values.organizationMediaList
                    ),
                    organizationMediaSliderList: [
                      {
                        organizationMediaSliderId: selectedItem?.ids
                          .organizationMediaSliderId as string,
                      },
                    ],
                    locale: selectedLocale,
                  });
                  setSelectedItem({
                    ids: {
                      primaryId: res.data.organizationSolutionId,
                      organizationSolutionId: res.data.organizationSolutionId,
                      organizationMediaSliderId: res.data
                        .organizationMediaSliderList
                        ? res.data.organizationMediaSliderList[0]
                            ?.organizationMediaSliderId
                        : undefined,
                    },
                    title: res.data.organizationSolutionName,
                    imgSrc: parseOrgMediaListToImgSrc(
                      res.data.organizationMediaSliderList
                        ? res.data.organizationMediaSliderList[0]
                            ?.organizationMediaList
                        : undefined
                    ),
                    items: res.data.organizationMediaList?.map(
                      (om, omIndex) => ({
                        ids: {
                          organizationMediaId: om.organizationMediaId,
                        },
                        title: om.organizationMediaTitle,
                        order: omIndex,
                        imgSrc: {
                          normal: om.uploadFile.uploadFilePath,
                        },
                      })
                    ),
                  });
                }
              } catch (error) {
                apis.tools.createLog({
                  function: "createOrgSolution: error",
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
              <FeatureEditForm
                onSubmit={handleSubmit}
                onStartSortClick={handleSubmit}
              />
            );
          }}
          form={FEATURE_FORM}
        >
          {(items) => <FeatureList items={items} />}
        </CarouselManagement>
      </EditSection>
    </>
  );
};

export default CmsSolutionsInfo;
