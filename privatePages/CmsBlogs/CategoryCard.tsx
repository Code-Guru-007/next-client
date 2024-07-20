import React, { FC, useEffect, useCallback, useState } from "react";
import NextLink from "next/link";
import { CmsAvatar as Avatar } from "components/Avatar";
import {
  Box,
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
import DeleteIcon from "@mui/icons-material/Delete";
import EditSectionLoader from "components/EditSectionLoader";
import moment from "moment-timezone";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import apis from "utils/apis";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import Typography from "@eGroupAI/material/Typography";
import { CustomPaginationActions } from "@eGroupAI/material-module/DataTable/CustomPaginationTool";

interface CategoryCardProps {
  data: any;
  dataUpdate: any;
  isLoading?: boolean;
}

type Order = "asc" | "desc";

interface Data {
  organizationBlogCreateDate: number;
  organizationBlogTitle: string | undefined;
  organizationMediaList: any;
  organizationMediaSliderId: string;
  organizationMediaSliderDescription: string;
  organizationMediaSliderLinkURL: string;
}

const headCells = [
  {
    id: "organizationBlogTitle",
    numeric: false,
    disablePadding: true,
    label: "圖片",
  },
  {
    id: "organizationBlogCreateDate",
    numeric: true,
    disablePadding: false,
    label: "建立日期",
  },
  {
    id: "organizationBlogVisitsCount",
    numeric: true,
    disablePadding: true,
    label: "觀看次數",
  },
];

const CategoryCard: FC<CategoryCardProps> = function (props) {
  const { data, dataUpdate, isLoading = false } = props;
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<keyof Data>("organizationBlogTitle");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [visibleRows, setVisibleRows] = useState<any[]>([]);
  const organizationId = useSelector(getSelectedOrgId);
  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
  } = useReduxDialog(DELETE_DIALOG);

  const { excute: deleteOrgBlog } = useAxiosApiWrapper(
    apis.org.deleteOrgBlog,
    "Delete"
  );

  function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (orderBy === "organizationBlogCreateDate") {
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
      if (order !== 0) {
        return order;
      }
      return a[1] - b[1];
    });
    return stabilizedThis?.map((el) => el[0]);
  }

  useCallback(() => {
    const sort = stableSort(data?.source, getComparator(order, orderBy))?.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
    setVisibleRows(sort);
    dataUpdate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.source, order, orderBy, page, rowsPerPage]);

  useEffect(() => {
    setVisibleRows(
      data?.source.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ) || []
    );
  }, [data?.source, page, rowsPerPage]);

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
                active={orderBy === headCell.id && !!visibleRows.length}
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
                openConfirmDeleteDialog({
                  primary: `您確定要刪除嗎？`,
                  onConfirm: async () => {
                    try {
                      for (let i = 0; i < selected.length; i++) {
                        // eslint-disable-next-line no-await-in-loop
                        await deleteOrgBlog({
                          organizationId,
                          organizationBlogId: selected[i] || "",
                        });
                      }
                      closeConfirmDeleteDialog();
                      dataUpdate();
                      setSelected([]);
                    } catch (error) {
                      apis.tools.createLog({
                        function: "DatePicker: handleDelete",
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
              }}
            >
              <DeleteIcon />
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
    const selectedIndex = selected.indexOf(data.organizationBlogId);
    let newSelected: string[] = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, data.organizationBlogId);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
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

  const isSelected = (data) => selected.includes(data.organizationBlogId);

  if (isLoading) return <EditSectionLoader />;

  return (
    <>
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
                rowCount={data?.source?.length}
              />
              {visibleRows.length ? (
                <TableBody>
                  {visibleRows?.map((row: any, index) => {
                    const isItemSelected = isSelected(row);
                    const labelId = `enhanced-table-checkbox-${index}`;
                    return (
                      <NextLink
                        prefetch
                        href={`/me/cms/blogs/${row?.organizationBlogId}`}
                        key={row?.organizationBlogId}
                        passHref
                        legacyBehavior
                      >
                        <TableRow hover sx={{ cursor: "pointer" }}>
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
                          <TableCell
                            component="th"
                            id={labelId}
                            padding="normal"
                          >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Avatar
                                sx={{ marginRight: 2, height: 64, width: 64 }}
                                variant="rounded"
                                alt="Remy Sharp"
                                src={
                                  row?.organizationMediaList[0] &&
                                  row?.organizationMediaList[0]?.uploadFile
                                    ?.uploadFilePath
                                }
                              />
                              {row?.organizationBlogTitle}
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            {moment(row?.organizationBlogCreateDate).format(
                              "ll"
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {row?.organizationBlogVisitsCount}
                          </TableCell>
                        </TableRow>
                      </NextLink>
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
          {visibleRows.length ? (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={data?.source.length || 0}
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

export default CategoryCard;
