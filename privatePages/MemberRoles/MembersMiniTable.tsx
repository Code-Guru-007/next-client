import React, { FC } from "react";
import { useSelector } from "react-redux";
import { useDataTable } from "@eGroupAI/material-module/DataTable";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useOrgMembers from "utils/useOrgMembers";
import { OrganizationRole, OrganizationMember } from "@eGroupAI/typings/apis";
import Paper from "@eGroupAI/material/Paper";
import I18nDataTable from "components/I18nDataTable";
import { getWordLibrary } from "redux/wordLibrary/selectors";

export interface MembersMiniTableProps {
  organizationRole?: OrganizationRole;
}

const MembersMiniTable: FC<MembersMiniTableProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const { organizationRole } = props;
  const organizationId = useSelector(getSelectedOrgId);
  const {
    handleChangePage,
    handleRowsPerPageChange,
    payload,

    page,
    rowsPerPage,
  } = useDataTable(
    "MembersMiniTable",
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );
  const { data, isValidating } = useOrgMembers(
    {
      organizationId,
    },
    payload
  );

  const memberData: OrganizationMember[] = [];
  data?.source.forEach((member) => {
    const target = member.organizationRoleList?.find(
      (role) => role.organizationRoleId === organizationRole?.organizationRoleId
    );
    if (target) {
      memberData.push(member);
    }
  });
  const total = memberData?.length;

  return (
    <>
      <Paper>
        <I18nDataTable
          rowKey="member.loginId"
          columns={[
            {
              id: "member.memberName",
              name: wordLibrary?.["full name"] ?? "姓名",
              dataKey: "member.memberName",
            },
            {
              id: "member.memberEmail",
              name: "Email",
              dataKey: "member.memberEmail",
            },
          ]}
          data={memberData || []}
          isEmpty={total === 0}
          serverSide
          loading={isValidating}
          MuiTablePaginationProps={{
            count: total ?? 0,
            page,
            rowsPerPage,
            onPageChange: handleChangePage,
            onRowsPerPageChange: handleRowsPerPageChange,
          }}
        />
      </Paper>
    </>
  );
};

export default MembersMiniTable;
