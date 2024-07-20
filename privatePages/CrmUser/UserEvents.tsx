import React, { FC, useMemo, useRef } from "react";

import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";
import useTab from "@eGroupAI/hooks/useTab";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import apis from "utils/apis";
import { ServiceModuleValue } from "interfaces/utils";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { OrganizationUser } from "interfaces/entities";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";

import { FilesSectionRef } from "components/EventDialog/FilesSection";
import EventDialog, { DIALOG } from "components/EventDialog";
import { InitialState, setValues } from "redux/eventDialog";
import { getValues } from "redux/eventDialog/selectors";
import { OrganizationMember } from "@eGroupAI/typings/apis";
import useMemberInfo from "@eGroupAI/hooks/apis/useMemberInfo";

import UserEventsTable from "./UserEventsTable";
import UserEventsWaterfalls from "./UserEventsWaterfalls";

export interface UserEventsProps {
  orgUser: OrganizationUser;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
}

const UserEvents: FC<UserEventsProps> = function (props) {
  const {
    orgUser,
    // readable = false,
    // writable = false,
    // deletable = false,
  } = props;

  const organizationId = useSelector(getSelectedOrgId);
  const values = useSelector(getValues);
  const { openDialog, closeDialog } = useReduxDialog(DIALOG);
  const { value: viewMode, handleChange } = useTab("userEvents", "table");

  const { data: member } = useMemberInfo();
  const matchMutate = useSwrMatchMutate();

  const uploadComponentRef = useRef<FilesSectionRef>(null);
  const { excute: createOrgFileTarget, isLoading: isUploadFileTargeting } =
    useAxiosApiWrapper(apis.org.createOrgFileTarget, "Create");
  const { excute: createOrgEvent, isLoading } = useAxiosApiWrapper(
    apis.org.createOrgEvent,
    "Create"
  );

  const defaultValues: InitialState["values"] | undefined = useMemo(() => {
    if (member) {
      return {
        ...values,
        organizationUserList: [orgUser],
        organizationMemberList: [
          {
            member,
          },
        ] as OrganizationMember[],
      };
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgUser, member, setValues]);

  return (
    <>
      <EventDialog
        organizationId={organizationId}
        defaultValues={defaultValues}
        onSubmit={async (values) => {
          if (values)
            await createOrgEvent({
              organizationId,
              organizationEventTitle: values.organizationEventTitle || "",
              organizationEventDescription:
                values.organizationEventDescription || "",
              organizationEventAddress: values.organizationEventAddress || "",
              organizationEventStartDate:
                values.organizationEventStartDate || "",
              organizationEventEndDate: values.organizationEventEndDate || "",
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
                  uploadComponentRef.current
                    ?.handleUploadFileOnSubmit(resp.data.organizationEventId)
                    .then(() => {
                      closeDialog();
                      matchMutate(
                        new RegExp(
                          `^/organizations/${organizationId}/search/events\\?`,
                          "g"
                        )
                      );
                    })
                    .catch(() => {});
                } else if (
                  !uploadComponentRef.current?.isFileUploadOnSubmitForm &&
                  resp.data.uploadFileList &&
                  resp.data.uploadFileList.length &&
                  resp.data.uploadFileList.length > 0
                ) {
                  createOrgFileTarget({
                    organizationId,
                    uploadFileId:
                      resp.data.uploadFileList[0].uploadFileId || "",
                    uploadFileTargetList: [
                      {
                        targetId: resp.data.organizationEventId,
                        uploadFile: {
                          uploadFilePathType: ServiceModuleValue.EVENT,
                        },
                      },
                    ],
                  });
                  closeDialog();
                  matchMutate(
                    new RegExp(
                      `^/organizations/${organizationId}/search/events\\?`,
                      "g"
                    )
                  );
                } else {
                  closeDialog();
                  matchMutate(
                    new RegExp(
                      `^/organizations/${organizationId}/search/events\\?`,
                      "g"
                    )
                  );
                }
              })
              .catch(() => {});
        }}
        loading={isLoading || isUploadFileTargeting}
        uploadComponentRef={uploadComponentRef}
      />
      {viewMode === "table" ? (
        <UserEventsTable
          organizationId={organizationId}
          openCreateEventDialog={openDialog}
          changeBrowserMode={() => handleChange("waterfalls")}
          orgUser={orgUser}
        />
      ) : (
        <UserEventsWaterfalls
          orgUser={orgUser}
          changeBrowserMode={() => handleChange("table")}
        />
      )}
    </>
  );
};

export default UserEvents;
