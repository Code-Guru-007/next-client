/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { CmsAvatar as Avatar } from "components/Avatar";
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
import EditSectionLoader from "components/EditSectionLoader";
import useIsOpen from "@eGroupAI/hooks/useIsOpen";
import EditSectionDialog from "components/EditSectionDialog";

import { OrganizationMedia } from "interfaces/entities";
import { Locale } from "interfaces/utils";
import { CustomPaginationActions } from "@eGroupAI/material-module/DataTable/CustomPaginationTool";

import PartnerImageSliderForm, { FORM } from "./PartnerImageSliderForm";
import { CmsContentEditorProps } from "../typings";
import useCmsContentEditor from "./useCmsContentEditor";
import useCmsContentForm from "./useCmsContentForm";

interface Data {
  organizationMediaCreateDate: number;
  organizationMediaTitle: string | undefined;
  organizationMediaList: OrganizationMedia[] | undefined;
  organizationMediaSliderId: string;
  organizationMediaSliderDescription: string;
  organizationMediaSliderLinkURL: string;
}

type Order = "asc" | "desc";

const headCells = [
  {
    id: "organizationMediaTitle",
    numeric: false,
    disablePadding: true,
    label: "圖片",
  },
  {
    id: "organizationMediaCreateDate",
    numeric: true,
    disablePadding: true,
    label: "建立日期",
  },
];
const PartnerImageSliderEditor: FC<CmsContentEditorProps> = function (props) {
  const {
    data,
    onEditClose,
    primary,
    openAddDialog,
    setOpenAddDialog,
    tableSelectedLocale,
    setSortOpenDialog,
    sortOpenDialog,
    loading = false,
    useOneItemAtOnce = true,
  } = props;
  const { handleSubmit, isUpdating } = useCmsContentEditor(props);
  const [sortItems, setSortItems] = useState<any[]>([]);

  const [selectedEditItem, setSelectedEditItem] = useState<OrganizationMedia>();
  const { handleDeleteItem } = useCmsContentForm({
    cmsContentId: data?.organizationCmsContentId || "",
    selectedLocale: tableSelectedLocale || Locale.ZH_TW,
    useOneItemAtOnce: sortOpenDialog ? false : useOneItemAtOnce,
  });

  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<keyof Data>("organizationMediaTitle");
  const { isOpen, handleClose, handleOpen } = useIsOpen(false);
  const [dialogElementShow, setDialogElementShow] = useState<boolean>(false);
  const [selected, setSelected] = useState<readonly string[] | any>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    if (openAddDialog || sortOpenDialog) handleOpen();
  }, [openAddDialog, sortOpenDialog]);

  useEffect(() => {
    if (openAddDialog && !isOpen) setOpenAddDialog(false);
    if (sortOpenDialog && !isOpen) setSortOpenDialog(false);
    if (dialogElementShow && !isOpen) setDialogElementShow(false);
    if (!isOpen) setSelectedEditItem(undefined);
  }, [isOpen]);

  function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (orderBy === "organizationMediaCreateDate") {
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
                active={orderBy === headCell.id && visibleRows.length}
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
                handleDeleteItem(
                  selected[0],
                  () => null,
                  selected,
                  onEditClose
                );
                setSelected([]);
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
      setSelected(data?.organizationMediaList);
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
  const visibleRows = React.useMemo(
    () =>
      stableSort(
        data?.organizationMediaList,
        getComparator(order, orderBy)
      )?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage, data]
  );
  if (loading) return <EditSectionLoader />;

  return (
    <>
      <EditSectionDialog
        tableSelectedLocale={tableSelectedLocale}
        renderForm={(selectedLocale) => (
          <PartnerImageSliderForm
            setSortItems={setSortItems}
            dialogElementShow={dialogElementShow}
            sortOpenDialog={sortOpenDialog}
            onSubmit={handleSubmit(selectedLocale)}
            selectedLocale={selectedLocale}
            cmsContentId={data?.organizationCmsContentId}
            selectedEditItem={selectedEditItem}
            setSelectedEditItem={setSelectedEditItem}
            useOneItemAtOnce={sortOpenDialog ? false : useOneItemAtOnce}
            handleClose={() => {
              handleClose();
              if (onEditClose) {
                onEditClose();
              }
            }}
          />
        )}
        cmsContentId={data?.organizationCmsContentId}
        sortItems={sortItems}
        sortOpenDialog={sortOpenDialog}
        form={FORM}
        updating={isUpdating}
        primary={primary}
        open={isOpen}
        onClose={() => {
          handleClose();
          if (onEditClose) {
            onEditClose();
          }
        }}
      />
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
                rowCount={data?.organizationMediaList?.length || 0}
              />
              {visibleRows?.length ? (
                <TableBody>
                  {visibleRows?.map((row: any, index) => {
                    const isItemSelected = isSelected(row);
                    const labelId = `enhanced-table-checkbox-${index}`;
                    return (
                      <TableRow
                        hover
                        onClick={() => {
                          setSelectedEditItem(row);
                          setOpenAddDialog(true);
                        }}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row?.organizationMediaTitle}
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
                            <Avatar
                              sx={{ marginRight: 2, height: 64, width: 64 }}
                              variant="rounded"
                              alt="Remy Sharp"
                              src={row?.uploadFile?.uploadFilePath}
                            />
                            {row?.organizationMediaTitle}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {moment(row?.organizationMediaCreateDate).format(
                            "ll"
                          )}
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
              count={data?.organizationMediaList?.length || 0}
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

export default PartnerImageSliderEditor;
