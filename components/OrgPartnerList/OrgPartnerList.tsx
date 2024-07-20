import React, { FC, memo } from "react";
import { isEqual } from "lodash";

import { OrganizationPartner } from "interfaces/entities";
import { useSelector } from "react-redux";
import Typography from "@eGroupAI/material/Typography";
import Grid from "@eGroupAI/material/Grid";
import Box, { BoxProps } from "@eGroupAI/material/Box";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import InfoCard from "components/InfoCard";

interface Item extends OrganizationPartner {
  onDelete?: () => void;
}
export interface OrgListProps extends BoxProps {
  data?: Item[];
}

const OrgPartnerList: FC<OrgListProps> = function (props) {
  const { data, ...other } = props;

  const wordLibrary = useSelector(getWordLibrary);
  if (!data) {
    return <Box {...other} />;
  }

  return (
    <Box {...other}>
      {data.length > 0 ? (
        <Grid container spacing={2}>
          {data.map((el) => (
            <Grid
              item
              xs={12}
              sm={12}
              md={12}
              lg={6}
              key={el.organizationPartnerId}
            >
              <InfoCard
                primary={el.organizationPartnerNameZh}
                onDelete={el.onDelete}
                items={[
                  {
                    title: wordLibrary?.address ?? "地址",
                    content: el.organizationPartnerAddress,
                  },
                  {
                    title: wordLibrary?.website ?? "網站",
                    content: el.organizationPartnerWebsite,
                  },
                  {
                    title:
                      wordLibrary?.["unified business number"] ?? "統一編號",
                    content: el.organizationPartnerInvoiceTaxIdNumber,
                  },
                  {
                    title: wordLibrary?.phone ?? "電話",
                    content: el.organizationPartnerTelephone,
                  },
                  {
                    title: wordLibrary?.fax ?? "傳真",
                    content: el.organizationPartnerFax,
                  },
                ]}
                type="partner"
                testId={`${el.organizationPartnerId}`}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1">
          {wordLibrary?.["no data available"] ?? "無資料"}
        </Typography>
      )}
    </Box>
  );
};

export default memo(OrgPartnerList, (prev, next) =>
  isEqual(prev.data, next.data)
);
