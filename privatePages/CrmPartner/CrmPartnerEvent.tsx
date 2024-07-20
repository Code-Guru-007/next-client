import React, { FC, useMemo } from "react";

import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";
import useTab from "@eGroupAI/hooks/useTab";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { OrganizationPartner } from "interfaces/entities";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";

import { OrganizationMember } from "@eGroupAI/typings/apis";
import useMemberInfo from "@eGroupAI/hooks/apis/useMemberInfo";

import { initialState, InitialState } from "redux/eventDialog";
import EventDialog, { DIALOG } from "components/EventDialog";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import PartnerEventsTable from "./PartnerEventsTable";
import PartnerEventsWaterfalls from "./PartnerEventsWaterfalls";

export interface UserEventsProps {
  partner?: OrganizationPartner;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
}

const CrmPartnerEvent: FC<UserEventsProps> = function (props) {
  const { partner } = props;

  const organizationId = useSelector(getSelectedOrgId);
  const { openDialog, closeDialog } = useReduxDialog(DIALOG);
  const { value: viewMode, handleChange } = useTab("userEvents", "table");

  const matchMutate = useSwrMatchMutate();

  const { data: member } = useMemberInfo();
  const { excute: createOrgEvent, isLoading } = useAxiosApiWrapper(
    apis.org.createOrgEvent,
    "Create"
  );

  const defaultValues: InitialState["values"] | undefined = useMemo(() => {
    if (partner && member) {
      return {
        ...initialState.values,
        organizationPartnerList: [partner],
        organizationMemberList: [
          {
            member,
          },
        ] as OrganizationMember[],
      };
    }
    return undefined;
  }, [member, partner]);

  return (
    <>
      <EventDialog
        organizationId={organizationId}
        defaultValues={defaultValues}
        onSubmit={async (values) => {
          if (values && partner) {
            try {
              await createOrgEvent({
                organizationId,
                organizationEventTitle: values.organizationEventTitle || "",
                organizationEventAddress: values.organizationEventAddress || "",
                organizationEventDescription:
                  values.organizationEventDescription || "",
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
                  ? values.organizationPartnerList?.map((el) => ({
                      organizationPartnerId: el.organizationPartnerId,
                    }))
                  : undefined,
              });
              closeDialog();
              matchMutate(
                new RegExp(
                  `^/organizations/${organizationId}/search/events\\?`,
                  "g"
                )
              );
            } catch (error) {
              apis.tools.createLog({
                function: "EventDialog: createOrgEvent",
                browserDescription: window.navigator.userAgent,
                jsonData: {
                  data: error,
                  deviceInfo: getDeviceInfo(),
                },
                level: "ERROR",
              });
            }
          }
        }}
        loading={isLoading}
      />
      {partner && viewMode === "table" && (
        <PartnerEventsTable
          organizationId={organizationId}
          openCreateEventDialog={openDialog}
          changeBrowserMode={() => handleChange("waterfalls")}
          partner={partner}
        />
      )}
      {partner && viewMode === "waterfalls" && (
        <PartnerEventsWaterfalls
          partner={partner}
          changeBrowserMode={() => handleChange("table")}
        />
      )}
    </>
  );
};

export default CrmPartnerEvent;
