import React, { FC } from "react";

import getDispositionFileName from "@eGroupAI/utils/getDispositionFileName";
import FileSaver from "file-saver";
import { OrganizationUser } from "interfaces/entities";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useSelector } from "react-redux";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";

import Box from "@eGroupAI/material/Box";
import Button from "@eGroupAI/material/Button";
import EditSectionHeader from "components/EditSectionHeader";

export interface UserExportFilesProps {
  orgUser?: OrganizationUser;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
}

const UserExportFiles: FC<UserExportFilesProps> = function (props) {
  const {
    orgUser,
    // readable = false,
    // writable = false,
    // deletable = false,
  } = props;
  const organizationId = useSelector(getSelectedOrgId);
  const { excute: exportOrgUserPdf, isLoading: isPdfCreating } =
    useAxiosApiWrapper(apis.org.exportOrgUserPdf, "Create");

  return (
    <>
      <EditSectionHeader primary="表單匯出" />
      <Box display="flex" gap={1}>
        <Button
          variant="contained"
          color="primary"
          loading={isPdfCreating}
          onClick={async () => {
            if (orgUser) {
              try {
                const res = await exportOrgUserPdf({
                  organizationId,
                  organizationUserId: orgUser.organizationUserId,
                });

                const filename = getDispositionFileName(
                  res.headers["content-disposition"] as string
                );
                FileSaver.saveAs(res.data, filename);
              } catch (error) {
                apis.tools.createLog({
                  function: "exportOrgUserPdf: error",
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
        >
          PDF匯出
        </Button>
      </Box>
    </>
  );
};

export default UserExportFiles;
