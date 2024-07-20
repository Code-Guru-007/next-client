/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  FC,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

import { useSelector } from "react-redux";

import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";

import Iconify from "minimal/components/iconify";
import CustomPopover, { usePopover } from "minimal/components/custom-popover";

import {
  Checkbox,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Tooltip,
  alpha,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { GridDeleteIcon } from "@mui/x-data-grid";
import moment from "moment-timezone";
import useIsOpen from "@eGroupAI/hooks/useIsOpen";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import EditSectionLoader from "components/EditSectionLoader";
import useOrgCmsMenus from "utils/useOrgCmsMenus";
import { Locale, OrganizationCmsMenuType } from "interfaces/utils";
import {
  OrganizationCmsMenu,
  OrganizationCmsSubMenu,
} from "interfaces/entities";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { CustomPaginationActions } from "@eGroupAI/material-module/DataTable/CustomPaginationTool";

import CmsMenuDialog from "./CmsMenuDialog";
import CmsSubMenuDialog from "./CmsSubMenuDialog";

interface Data {
  organizationCmsMenuCreateDate: number;
  organizationCmsMenuTitle: string | undefined;
}

type Order = "asc" | "desc";

const headCells = [
  {
    id: "organizationCmsMenuTitle",
    numeric: false,
    disablePadding: true,
    label: "標題",
  },
  {
    id: "organizationCmsMenuCreateDate",
    numeric: true,
    disablePadding: true,
    label: "建立日期",
  },
  {
    id: "action",
    numeric: false,
    disablePadding: true,
    label: "",
  },
];

export interface CmsMenuNavbarProps {
  tableSelectedLocale?: Locale;
  openEditDialog: boolean;
  setOpenEditDialog: (val: boolean) => void;
  openSubEditDialog: boolean;
  setOpenSubEditDialog: (val: boolean) => void;
}

const CmsMenuNavbar: FC<CmsMenuNavbarProps> = function (props) {
  const {
    openEditDialog,
    setOpenEditDialog,
    openSubEditDialog,
    setOpenSubEditDialog,
    tableSelectedLocale,
  } = props;

  const organizationId = useSelector(getSelectedOrgId);
  const [order, setOrder] = useState<Order>("desc");
  const [visibleRows, setVisibleRows] = useState<OrganizationCmsMenu[]>([]);

  const popover = usePopover();

  const [orderBy, setOrderBy] = useState<keyof Data>(
    "organizationCmsMenuTitle"
  );

  const {
    isOpen: isEditDialogOpen,
    handleClose: closeEditDialog,
    handleOpen: handleOpenEditDialog,
  } = useIsOpen(false);

  const {
    isOpen: isSubEditDialogOpen,
    handleClose: closeSubEditDialog,
    handleOpen: handleOpenSubEditDialog,
  } = useIsOpen(false);

  const [selectedLocale, setSelectedLocale] = useState<Locale>(
    tableSelectedLocale || Locale.ZH_TW
  );
  const [selected, setSelected] = useState<readonly string[] | any>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [selectedOrgCmsMenuId, setSelectedOrgCmsMenuId] = useState<
    string | undefined
  >();

  const [selectedOrgCmsSubMenus, setSelectedOrgCmsSubMenus] =
    useState<OrganizationCmsSubMenu[]>();

  const { excute: updateOrgCmsMenu, isLoading: isUpdating } =
    useAxiosApiWrapper(apis.org.updateOrgCmsMenu, "Update");

  const { excute: updateOrgCmsSubMenu, isLoading: isSubMenuUpdating } =
    useAxiosApiWrapper(apis.org.updateOrgCmsSubMenu, "Update");

  const { data, mutate } = useOrgCmsMenus(
    {
      organizationId,
    },
    {
      locale: tableSelectedLocale,
    }
  );

  useEffect(() => {
    if (openEditDialog) handleOpenEditDialog();
    if (openSubEditDialog) handleOpenSubEditDialog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openEditDialog, openSubEditDialog]);

  useEffect(() => {
    if (openEditDialog && !isEditDialogOpen) {
      if (setOpenEditDialog) setOpenEditDialog(false);
      mutate();
    }
    if (openSubEditDialog && !isSubEditDialogOpen) {
      if (setOpenSubEditDialog) setOpenSubEditDialog(false);
      mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditDialogOpen, isSubEditDialogOpen]);

  function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (orderBy === "organizationCmsMenuCreateDate") {
      if (new Date(`${b[orderBy]}`) < new Date(`${a[orderBy]}`)) return -1;

      if (new Date(`${b[orderBy]}`) > new Date(`${a[orderBy]}`)) return 1;
    } else {
      if (b[orderBy] < a[orderBy]) return -1;

      if (b[orderBy] > a[orderBy]) return 1;
    }

    return 0;
  }

  function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key
  ): (
    a: { [key in Key]: number | string },
    b: { [key in Key]: number | string }
  ) => number {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function stableSort<T>(
    array: readonly T[] | any,
    comparator: (a: T, b: T) => number
  ) {
    const stabilizedThis = array?.map(
      (el, index) => [el, index] as [T, number]
    );
    stabilizedThis?.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis?.map((el) => el[0]);
  }

  function EnhancedTableHead(props) {
    const {
      onSelectAllClick,
      order,
      orderBy,
      numSelected,
      rowCount,
      onRequestSort,
    } = props;
    const createSortHandler =
      (property) => (event: React.MouseEvent<unknown>) => {
        onRequestSort(event, property);
      };
    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              color="primary"
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={visibleRows.length && onSelectAllClick}
              inputProps={{
                "aria-label": "select all desserts",
              }}
            />
          </TableCell>
          {headCells.map((headCell) => (
            <TableCell
              key={headCell.id}
              align={headCell.numeric ? "right" : "left"}
              padding={"normal"}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                active={orderBy === headCell.id && !!visibleRows?.length}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  }

  function EnhancedTableToolbar({ numSelected }): JSX.Element | any {
    return (
      numSelected > 0 && (
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            ...(numSelected > 0 && {
              bgcolor: (theme) =>
                alpha(
                  theme.palette.primary.main,
                  theme.palette.action.activatedOpacity
                ),
            }),
          }}
        >
          <Typography
            sx={{ flex: "1 1 100%" }}
            color="inherit"
            variant="subtitle1"
            component="div"
          >
            {numSelected} selected
          </Typography>
          <Tooltip title="Delete">
            <IconButton
              onClick={() => {
                // handleDeleteItem(
                //   selected[0],
                //   () => null,
                //   selected,
                //   onEditClose
                // );
                // setSelected([]);
              }}
            >
              <GridDeleteIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      )
    );
  }

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(data?.source);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, data) => {
    const selectedIndex = selected.indexOf(data);
    let newSelected: readonly string[] = [];
    if (selectedIndex === -1) newSelected = newSelected.concat(selected, data);
    else if (selectedIndex === 0)
      newSelected = newSelected.concat(selected.slice(1));
    else if (selectedIndex === selected.length - 1)
      newSelected = newSelected.concat(selected.slice(0, -1));
    else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) =>
    setPage(newPage);

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (data) => selected?.indexOf(data) !== -1;
  useMemo(() => {
    const sort = stableSort(data?.source, getComparator(order, orderBy))?.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
    setVisibleRows(sort);
  }, [order, orderBy, page, rowsPerPage, data]);

  useLayoutEffect(() => {
    setVisibleRows(
      data?.source.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ) || []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.source]);

  if (!data?.source) return <EditSectionLoader />;

  return (
    <>
      <CmsMenuDialog
        onSubmit={async (values) => {
          try {
            if (selectedOrgCmsMenuId) {
              await updateOrgCmsMenu({
                organizationId,
                organizationCmsMenuId: selectedOrgCmsMenuId,
                organizationCmsMenuTitle: values.title,
                locale: selectedLocale || Locale.ZH_TW,
              });
              closeEditDialog();
              setSelectedOrgCmsMenuId(undefined);
              mutate();
            }
          } catch (error) {
            apis.tools.createLog({
              function: "updateOrgCmsMenu: error",
              browserDescription: window.navigator.userAgent,
              jsonData: {
                data: error,
                deviceInfo: getDeviceInfo(),
              },
              level: "ERROR",
            });
          }
        }}
        loading={isUpdating}
        title="導覽列"
        tableSelectedLocale={selectedLocale || Locale.ZH_TW}
        handleSelectedLocale={setSelectedLocale}
        organizationId={organizationId}
        selectedOrgCmsMenuId={selectedOrgCmsMenuId}
        open={isEditDialogOpen}
        onClose={() => {
          closeEditDialog();
          setSelectedOrgCmsMenuId(undefined);
          mutate();
        }}
      />
      <CmsSubMenuDialog
        onSubmit={async (values) => {
          try {
            if (selectedOrgCmsMenuId) {
              const subMenus = Object.entries(values).filter(
                (val) => val[0] !== "main_title"
              );
              await updateOrgCmsMenu({
                organizationId,
                organizationCmsMenuId: selectedOrgCmsMenuId,
                organizationCmsMenuTitle: values.main_title,
                locale: selectedLocale || Locale.ZH_TW,
              });
              for (let index = 0; index < subMenus.length; index++) {
                // eslint-disable-next-line no-await-in-loop
                await updateOrgCmsSubMenu({
                  organizationId,
                  organizationCmsMenuId: selectedOrgCmsMenuId,
                  organizationCmsSubMenuId: subMenus[index]?.[0] || "",
                  organizationCmsSubMenuTitle: subMenus[index]?.[1] || "",
                  locale: selectedLocale || Locale.ZH_TW,
                });
              }
              closeSubEditDialog();
              setSelectedOrgCmsMenuId(undefined);
              setSelectedOrgCmsSubMenus(undefined);
              mutate();
            }
          } catch (error) {
            apis.tools.createLog({
              function: "updateOrgCmsMenu: error",
              browserDescription: window.navigator.userAgent,
              jsonData: {
                data: error,
                deviceInfo: getDeviceInfo(),
              },
              level: "ERROR",
            });
          }
        }}
        loading={isUpdating || isSubMenuUpdating}
        title="導覽列"
        tableSelectedLocale={selectedLocale || Locale.ZH_TW}
        handleSelectedLocale={setSelectedLocale}
        organizationId={organizationId}
        selectedOrgCmsMenuId={selectedOrgCmsMenuId}
        selectedOrgCmsSubMenus={selectedOrgCmsSubMenus}
        open={isSubEditDialogOpen}
        onClose={() => {
          closeSubEditDialog();
          setSelectedOrgCmsSubMenus(undefined);
          mutate();
        }}
      />
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            if (selectedOrgCmsSubMenus) {
              setOpenSubEditDialog(true);
            } else {
              setOpenEditDialog(true);
            }
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" sx={{ mr: 2 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
          sx={{ color: "error.main" }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </CustomPopover>
      <Box sx={{ width: "100%" }}>
        <Paper sx={{ width: "100%", mb: 2 }}>
          <EnhancedTableToolbar numSelected={selected.length} />
          <TableContainer>
            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
              <EnhancedTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={data?.source.length}
              />
              {visibleRows?.length ? (
                <TableBody>
                  {visibleRows?.map((row: any, index) => {
                    const isItemSelected = isSelected(row);
                    const labelId = `enhanced-table-checkbox-${index}`;
                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row?.organizationCmsMenuTitle}
                        selected={isItemSelected}
                        sx={{ cursor: "pointer" }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            onClick={(event) => {
                              handleClick(event, row);
                              event.stopPropagation();
                            }}
                            checked={isItemSelected}
                            inputProps={{
                              "aria-labelledby": labelId,
                            }}
                          />
                        </TableCell>
                        <TableCell component="th" id={labelId} padding="normal">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {row?.organizationCmsMenuTitle}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {moment(row?.organizationCmsMenuCreateDate).format(
                            "ll"
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            color={popover.open ? "inherit" : "default"}
                            onClick={(e) => {
                              setSelectedOrgCmsMenuId(
                                row.organizationCmsMenuId
                              );
                              if (
                                row.organizationCmsMenuType ===
                                OrganizationCmsMenuType.SUB_MENU
                              ) {
                                setSelectedOrgCmsSubMenus(
                                  row.organizationCmsSubmenuList
                                );
                              }
                              popover.onOpen(e);
                            }}
                          >
                            <Iconify icon="eva:more-vertical-fill" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              ) : (
                <TableBody>
                  <TableRow sx={{ height: 245 }}>
                    <TableCell colSpan={4} sx={{ textAlign: "center" }}>
                      no data found
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}
            </Table>
          </TableContainer>
          {visibleRows?.length ? (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={data?.source?.length || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              showFirstButton
              showLastButton
              SelectProps={{
                inputProps: { id: "table-rowsPerPage-select" },
              }}
              ActionsComponent={CustomPaginationActions}
            />
          ) : (
            <div>{""}</div>
          )}
        </Paper>
      </Box>
    </>
  );
};

export default CmsMenuNavbar;
