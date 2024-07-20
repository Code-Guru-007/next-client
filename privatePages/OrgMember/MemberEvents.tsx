import React, { useMemo } from "react";
import { OrganizationMember } from "@eGroupAI/typings/apis";
import EditSectionHeader from "components/EditSectionHeader";
import EditSection from "components/EditSection";
import makeStyles from "@mui/styles/makeStyles";

import apis from "utils/apis";
import { useSelector } from "react-redux";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";
import useMemberInfo from "@eGroupAI/hooks/apis/useMemberInfo";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import EventDialog, { DIALOG } from "components/EventDialog";
import { initialState, InitialState } from "redux/eventDialog";

import useTab from "@eGroupAI/hooks/useTab";
import MemberEventsTable from "./MemberEventsTable";
import MemberEventsWaterfalls from "./MemberEventsWaterfalls";

const useStyles = makeStyles(() => ({
  textField: {
    display: "flex",
    marginRight: 2,
    wordBreak: "break-word",
    "& .MuiTypography-root": {
      fontSize: "15px",
      zIndex: 1,
    },
  },
  textTitle: {
    padding: "8px 0 8px 0",
  },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: "none",
    alignItems: "flex-start",
    justifyContent: "center",
    zIndex: 999,
  },
  showLoader: {
    display: "flex",
  },
  lightOpacity: {
    background: "rgba(255,255,255,0.6)",
  },
  darkOpacity: {
    background: "rgba(33, 43, 54, 0.6)",
  },
  editSectionContainer: {
    borderRadius: 0,
    boxShadow: "none",
    marginBottom: 2,
    borderBottom: "1px solid #EEEEEE",
  },
  editSectionHeader: {
    marginBottom: "30px",
  },
}));

export interface MemberEventsProps {
  orgMember?: OrganizationMember;
  isLoading?: boolean;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
}

const MemberEvents = function (props: MemberEventsProps) {
  const classes = useStyles(props);
  const { orgMember } = props;
  const { value: viewMode, handleChange } = useTab("memberEvents", "table");

  const organizationId = useSelector(getSelectedOrgId);
  const { data: member } = useMemberInfo();
  const matchMutate = useSwrMatchMutate();

  const { openDialog, closeDialog } = useReduxDialog(DIALOG);

  const { excute: createOrgEvent, isLoading } = useAxiosApiWrapper(
    apis.org.createOrgEvent,
    "Create"
  );

  const defaultValues: InitialState["values"] | undefined = useMemo(() => {
    if (member) {
      return {
        ...initialState.values,
        organizationUserList: [],
        organizationMemberList: [orgMember] as OrganizationMember[],
      };
    }
    return undefined;
  }, [orgMember]);

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
            });
          closeDialog();
          matchMutate(
            new RegExp(
              `^/organizations/${organizationId}/search/events\\?`,
              "g"
            )
          );
        }}
        loading={isLoading}
      />
      <EditSection className={classes.editSectionContainer}>
        <EditSectionHeader
          primary={orgMember?.member.memberName}
          className={classes.editSectionHeader}
        />
        {viewMode === "table" ? (
          <MemberEventsTable
            organizationId={organizationId}
            openCreateEventDialog={openDialog}
            changeBrowserMode={() => handleChange("waterfalls")}
            orgMember={orgMember}
          />
        ) : (
          <MemberEventsWaterfalls
            orgMember={orgMember}
            changeBrowserMode={() => handleChange("table")}
          />
        )}
      </EditSection>
    </>
  );
};

export default MemberEvents;
