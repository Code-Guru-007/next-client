import React from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@mui/styles";

import useOrgModules from "@eGroupAI/hooks/apis/useOrgModules";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import Main from "@eGroupAI/material-layout/Main";
import Container from "@eGroupAI/material/Container";
import Paper from "@eGroupAI/material/Paper";
import { OrganizationModule } from "@eGroupAI/typings/apis";
import { useDataTable } from "@eGroupAI/material-module/DataTable";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import PrivateLayout from "components/PrivateLayout";
import I18nDataTable from "components/I18nDataTable";
import OrderModuleDataTableRow from "components/OrderModuleDataTableRow";

const useStyles = makeStyles(() => ({
  container: {
    padding: "10px 20px",
    position: "relative",
  },
  paper: {
    padding: "10px",
  },
}));

const OrderModule = () => {
  const classes = useStyles();
  const organizationId = useSelector(getSelectedOrgId);
  const { data: modules, isValidating } = useOrgModules({
    organizationId,
  });

  const wordLibrary = useSelector(getWordLibrary);
  const {
    handleChangePage,
    handleRowsPerPageChange,
    setPayload,

    page,
    rowsPerPage,
  } = useDataTable(
    `OrderModulesDataTable-${organizationId}`,
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );

  const columns = [
    {
      id: "serviceMainModuleNameZh",
      name: wordLibrary?.module ?? "模組",
      dataKey: "serviceMainModuleNameZh",
    },
    {
      id: "serviceModuleLlist",
      name: wordLibrary?.action ?? "操作",
      dataKey: "serviceModuleLlist",
    },
  ];

  const translatedTitle = `${wordLibrary?.["訂閱管理"] ?? "訂閱管理"} | ${
    wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
  }`;
  return (
    <PrivateLayout title={translatedTitle}>
      <Main>
        <Container maxWidth={false} className={classes.container}>
          <Paper className={classes.paper}>
            <I18nDataTable
              columns={columns}
              rowKey="organizationModuleId"
              data={!modules ? [] : modules?.source}
              renderDataRow={(rowData) => {
                const row = rowData as OrganizationModule;
                return (
                  <OrderModuleDataTableRow
                    columns={columns}
                    row={row}
                    key={row.organizationModuleId}
                  />
                );
              }}
              isEmpty={!modules || modules?.source.length === 0}
              loading={isValidating}
              MuiTablePaginationProps={{
                count: modules?.source.length ?? 0,
                page,
                rowsPerPage,
                onPageChange: handleChangePage,
                onRowsPerPageChange: handleRowsPerPageChange,
              }}
              onSortLabelClick={(sortKey, order) => {
                setPayload((p) => ({
                  ...p,
                  sort: {
                    sortKey,
                    order: order.toUpperCase(),
                  },
                }));
              }}
            />
          </Paper>
        </Container>
      </Main>
    </PrivateLayout>
  );
};

export default OrderModule;
