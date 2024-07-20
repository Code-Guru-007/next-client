import React, { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { initialState, InitialState, setStates } from "redux/eventDialog";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import { OrganizationMember } from "@eGroupAI/typings/apis";
import useTab from "@eGroupAI/hooks/useTab";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import useMemberInfo from "@eGroupAI/hooks/apis/useMemberInfo";
import Main from "@eGroupAI/material-layout/Main";
import Container from "@eGroupAI/material/Container";

import PrivateLayout from "components/PrivateLayout";
import EventDialog, { DIALOG } from "components/EventDialog";
import TagGroupsDataTable from "components/TagGroups/TagGroupsDataTable";
import ResponsiveTabs from "components/ResponsiveTabs";
import DynamicColumn from "components/DynamicColumn";
import DynamicColumnGroup from "components/DynamicColumnGroup";
import DynamicColumnTemplate from "components/DynamicColumnTemplate";

import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useGetLoginId from "utils/useGetLoginId";
import { ColumnTable, ServiceModuleValue } from "interfaces/utils";
import { useAppDispatch } from "redux/configureAppStore";

import useOrgOwnerValid from "components/PermissionValid/useOrgOwnerValid";
import useModulePermissionValid from "components/PermissionValid/useModulePermissionValid";
import { FilesSectionRef } from "components/EventDialog/FilesSection";
import { UploadFile } from "interfaces/entities";

import { getWordLibrary } from "redux/wordLibrary/selectors";
import EventsDataTable from "./EventsDataTable";
import EventsWaterfalls from "./EventsWaterfalls";

const Events = function () {
  const dispatch = useAppDispatch();
  const wordLibrary = useSelector(getWordLibrary);
  const tabData = [
    {
      value: "info",
      label: wordLibrary?.information ?? "資訊",
      id: "events-tab-info",
      testId: "events-tab-0",
    },
    {
      value: "tagGroup",
      label: wordLibrary?.["label management"] ?? "標籤管理",
      id: "events-tab-tagGroup",
      testId: "events-tab-1",
    },
    {
      value: "dynamicColumn",
      label: wordLibrary?.["dynamic field management"] ?? "動態欄位管理",
      id: "events-tab-dynamicColumn",
      testId: "events-tab-2",
    },
    {
      value: "dynamicColumnGroup",
      label:
        wordLibrary?.["dynamic field group management"] ?? "動態欄位群組管理",
      id: "events-tab-dynamicColumnGroup",
      testId: "events-tab-3",
    },
    {
      value: "dynamicColumnTemplate",
      label: wordLibrary?.["event template"] ?? "事件範本",
      id: "events-tab-dynamicColumnTemplate",
      testId: "events-tab-4",
    },
  ];
  const { query, push, pathname } = useRouter();
  const organizationId = useSelector(getSelectedOrgId);
  const [browserMode, setBrowserMode] = useState<"table" | "waterfalls">(
    "table"
  );

  const uploadComponentRef = useRef<FilesSectionRef>(null);
  const urlParams = new URLSearchParams(window.location.search);
  const tabValue = urlParams.get("tab");

  const { value, handleChange } = useTab<string>(
    "Events",
    (tabValue as string) || "none",
    true
  );
  const lid = useGetLoginId();
  const { data: member } = useMemberInfo();

  const [isCreated, setIsCreated] = useState(false);

  const { openDialog, closeDialog } = useReduxDialog(DIALOG);
  const { excute: createOrgEvent, isLoading } = useAxiosApiWrapper(
    apis.org.createOrgEvent,
    "Create"
  );
  const { excute: createOrgFileTarget, isLoading: isUploadFileTargeting } =
    useAxiosApiWrapper(apis.org.createOrgFileTarget, "Create");

  const [formValidated, setFormValidated] = useState<boolean>(false);
  const [columnFormValidated, setColumnFormValidated] =
    useState<boolean>(false);

  const defaultValues: InitialState["values"] | undefined = useMemo(() => {
    if (member) {
      return {
        ...initialState.values,
        organizationMemberList: [
          {
            member: { ...member, loginId: lid },
          } as OrganizationMember,
        ],
      };
    }
    return undefined;
  }, [lid, member]);

  const isOrgOwner = useOrgOwnerValid(true);
  const { hasModulePermission: isDynamicColumnPerms } =
    useModulePermissionValid({
      modulePermissions: ["LIST", "READ", "CREATE", "UPDATE_ALL", "DELETE_ALL"],
      targetPath: "/me/dynamic-columns",
    });
  const { hasModulePermission: tagGroup } = useModulePermissionValid({
    targetPath: "/me/tag-groups",
    modulePermissions: ["LIST", "READ"],
  });
  let filteredTabs;
  filteredTabs =
    isOrgOwner || isDynamicColumnPerms
      ? tabData
      : tabData.filter(
          (tab) =>
            tab.value !== "dynamicColumn" &&
            tab.value !== "dynamicColumnGroup" &&
            tab.value !== "dynamicColumnTemplate"
        );
  filteredTabs =
    isOrgOwner || tagGroup
      ? filteredTabs
      : filteredTabs.filter(({ value }) => value !== "tagGroup");

  useEffect(() => {
    if (query.tab) {
      handleChange(query.tab as string);
    }
  }, [handleChange, query.tab]);

  useEffect(() => {
    if (value === "none") {
      push({
        pathname,
        query: {
          ...query,
          tab: query.tab || "info",
        },
      });
    }
  }, [pathname, push, query, value]);

  const translatedTitle = `${wordLibrary?.["事件管理"] ?? "事件管理"} | ${
    wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
  }`;
  return (
    <>
      <EventDialog
        organizationId={organizationId}
        defaultValues={defaultValues}
        formValidated={formValidated}
        columnFormValidated={columnFormValidated}
        setFormValidated={setFormValidated}
        setColumnFormValidated={setColumnFormValidated}
        onSubmit={async (values) => {
          if (values)
            try {
              // eslint-disable-next-line react-hooks/exhaustive-deps
              createOrgEvent({
                organizationId,
                organizationEventTitle: values.organizationEventTitle || "",
                organizationEventDescription:
                  values.organizationEventDescription || "",
                organizationEventAddress: values.organizationEventAddress || "",
                organizationEventStartDate:
                  values.organizationEventStartDate || "",
                organizationEventEndDate: values.organizationEventEndDate || "",
                dynamicColumnTargetList: values.dynamicColumnTargetList || [],
                uploadFileList: values.uploadFileList?.length
                  ? values.uploadFileList.map((el) => ({
                      uploadFileId: el.uploadFileId,
                    }))
                  : undefined,
                organizationMemberList: values.organizationMemberList?.length
                  ? values.organizationMemberList.map((el) => ({
                      member: {
                        loginId: el.member.loginId,
                      },
                    }))
                  : undefined,
                organizationTagList: values.organizationTagList?.length
                  ? values.organizationTagList.map((el) => ({
                      tagId: el.tagId,
                    }))
                  : undefined,
                organizationUserList: values.organizationUserList?.length
                  ? values.organizationUserList.map((el) => ({
                      organizationUserId: el.organizationUserId,
                    }))
                  : undefined,
                organizationPartnerList: values.organizationPartnerList?.length
                  ? values.organizationPartnerList.map((el) => ({
                      organizationPartnerId: el.organizationPartnerId,
                    }))
                  : undefined,
              })
                .then((resp) => {
                  if (
                    uploadComponentRef.current?.isFileUploadOnSubmitForm &&
                    uploadComponentRef.current?.selectedFile &&
                    uploadComponentRef.current?.selectedFile.length !== 0
                  ) {
                    // 輸入完資料之後自動跳轉的部分
                    uploadComponentRef.current
                      ?.handleUploadFileOnSubmit(resp.data.organizationEventId)
                      .then(() => {
                        dispatch(
                          setStates({
                            isDirty: false,
                          })
                        );
                        setIsCreated(true);
                        closeDialog();
                        window.open(
                          `/me/event/events/${resp.data.organizationEventId}`,
                          "_blank"
                        );
                      })
                      .catch(() => {});
                  } else if (
                    !uploadComponentRef.current?.isFileUploadOnSubmitForm &&
                    resp.data.uploadFileList &&
                    resp.data.uploadFileList.length &&
                    resp.data.uploadFileList.length > 0
                  ) {
                    const promises = resp.data.uploadFileList.map(
                      (uploadedFile: UploadFile) =>
                        createOrgFileTarget({
                          organizationId,
                          uploadFileId: uploadedFile.uploadFileId,
                          uploadFileTargetList: [
                            {
                              targetId: resp.data.organizationEventId,
                              uploadFile: {
                                uploadFilePathType: ServiceModuleValue.EVENT,
                              },
                            },
                          ],
                        })
                    );
                    Promise.all(promises).catch(() => {});
                    // createOrgFileTarget({
                    //   organizationId,
                    //   uploadFileId:
                    //     resp.data.uploadFileList[0].uploadFileId || "",
                    //   uploadFileTargetList: [
                    //     {
                    //       targetId: resp.data.organizationEventId,
                    //       uploadFile: {
                    //         uploadFilePathType: ServiceModuleValue.EVENT,
                    //       },
                    //     },
                    //   ],
                    // });
                    dispatch(
                      setStates({
                        isDirty: false,
                      })
                    );
                    setIsCreated(true);
                    closeDialog();
                    window.open(
                      `/me/event/events/${resp.data.organizationEventId}`,
                      "_blank"
                    );
                  } else {
                    dispatch(
                      setStates({
                        isDirty: false,
                      })
                    );
                    setIsCreated(true);
                    closeDialog();
                    window.open(
                      `/me/event/events/${resp.data.organizationEventId}`,
                      "_blank"
                    );
                  }
                })
                .catch(() => {});
            } catch (error) {
              apis.tools.createLog({
                function: "createOrgEvent: error",
                browserDescription: window.navigator.userAgent,
                jsonData: {
                  data: error,
                  deviceInfo: getDeviceInfo(),
                },
                level: "ERROR",
              });
            }
        }}
        loading={isLoading || isUploadFileTargeting}
        uploadComponentRef={uploadComponentRef}
      />

      <PrivateLayout title={translatedTitle}>
        <Main sx={{ minHeight: "100vh" }}>
          <Container maxWidth={false}>
            <ResponsiveTabs
              value={value}
              tabData={filteredTabs}
              onChange={(value) => {
                push({
                  pathname,
                  query: {
                    ...query,
                    tab: value,
                  },
                });
              }}
            />
            {value === "info" && browserMode === "table" && (
              <EventsDataTable
                organizationId={organizationId}
                openCreateEventDialog={() => {
                  setIsCreated(false);
                  openDialog();
                }}
                changeBrowserMode={(mode: "table" | "waterfalls") => {
                  setBrowserMode(mode);
                }}
                isCreated={isCreated}
              />
            )}
            {value === "info" && browserMode === "waterfalls" && (
              <EventsWaterfalls
                openCreateEventDialog={() => {
                  setIsCreated(false);
                  openDialog();
                }}
                changeBrowserMode={(mode: "table" | "waterfalls") => {
                  setBrowserMode(mode);
                }}
                isCreated={isCreated}
              />
            )}
            {value === "tagGroup" && (
              <TagGroupsDataTable
                organizationId={organizationId}
                serviceModuleValue={ServiceModuleValue.EVENT}
              />
            )}
            {value === "dynamicColumn" && (
              <DynamicColumn
                columnTable={ColumnTable.OrganizationEvent}
                serviceModuleValue={ServiceModuleValue.EVENT}
                columnTableString="ORGANIZATION_EVENT"
              />
            )}
            {value === "dynamicColumnGroup" && (
              <DynamicColumnGroup
                serviceModuleValue={ServiceModuleValue.EVENT}
                columnTable="ORGANIZATION_EVENT"
                tagStatus
              />
            )}
            {value === "dynamicColumnTemplate" && (
              <DynamicColumnTemplate
                serviceModuleValue={ServiceModuleValue.EVENT}
                columnTable="ORGANIZATION_EVENT"
              />
            )}
          </Container>
        </Main>
      </PrivateLayout>
    </>
  );
};

export default Events;
