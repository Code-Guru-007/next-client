/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useMemo, useState } from "react";
import { FormProvider } from "react-hook-form";

// import getYtVideoId from "@eGroupAI/utils/getYtVideoId";
// import VideoSwiper from "components/VideoSwiper";

import useIsOpen from "@eGroupAI/hooks/useIsOpen";
import EditSectionDialog from "components/EditSectionDialog";
import { OrganizationMedia } from "interfaces/entities";
import { Locale } from "interfaces/utils";
import {
  Avatar,
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
  Typography,
  alpha,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { GridDeleteIcon } from "@mui/x-data-grid";
import EditSectionLoader from "components/EditSectionLoader";
import moment from "moment-timezone";
import { CustomPaginationActions } from "@eGroupAI/material-module/DataTable/CustomPaginationTool";

import ProductFeatureForm, { FORM } from "./ProductFeatureForm";
import { CmsContentEditorProps } from "../typings";
import useCmsContentEditor from "./useCmsContentEditor";
import useCmsContentForm from "./useCmsContentForm";

interface Data {
  organizationmediaTitle?: string;
  organizationMediaYoutubeURL?: string;
  organizationMediaLinkURL?: string;
  organizationMediaCreateDate?: string;
  organizationMediaList?: OrganizationMedia[];
  organizationMediaSliderId: string;
  organizationMediaSliderDescription: string;
  organizationMediaSliderLinkURL: string;
}

type Order = "asc" | "desc";

const headCells = [
  {
    id: "",
    numeric: false,
    disablePadding: true,
    label: "Image",
  },
  {
    id: "organizationMediaTitle",
    numeric: false,
    disablePadding: true,
    label: "標題",
  },
  {
    id: "organizationMediaYoutubeURL",
    numeric: false,
    disablePadding: true,
    label: "Youtube 連結",
  },
  {
    id: "organizationMediaCreateDate",
    numeric: true,
    disablePadding: true,
    label: "建立日期",
  },
];

const ProductFeatureEditor: FC<CmsContentEditorProps> = function (props) {
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<keyof Data>(
    "organizationMediaCreateDate"
  );
  const { isOpen, handleClose, handleOpen } = useIsOpen(false);
  const [visibleRows, setVisibleRows] = useState<OrganizationMedia[]>([]);
  const [dialogElementShow, setDialogElementShow] = useState<boolean>(false);
  const [selected, setSelected] = useState<readonly string[] | any>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const {
    data,
    onEditClose,
    primary,
    tableSelectedLocale,
    openAddDialog,
    setOpenAddDialog,
    setSortOpenDialog,
    sortOpenDialog,
    searchTableData,
    loading = false,
    useOneItemAtOnce = true,
  } = props;

  const { handleSubmit, isUpdating } = useCmsContentEditor(props);
  const [sortItems, setSortItems] = useState<any[]>([]);

  const [selectedEditItem, setSelectedEditItem] = useState<OrganizationMedia>();
  const { handleDeleteItem, methods } = useCmsContentForm({
    cmsContentId: data?.organizationCmsContentId || "",
    selectedLocale: tableSelectedLocale || Locale.ZH_TW,
    useOneItemAtOnce: sortOpenDialog ? false : useOneItemAtOnce,
  });

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

  useMemo(() => {
    if (searchTableData) {
      const searchData = data?.organizationMediaList?.filter(
        (v) =>
          v.organizationMediaTitle?.includes(searchTableData) ||
          v.organizationMediaLinkURL?.includes(searchTableData)
      );
      const sort = stableSort(searchData, getComparator(order, orderBy))?.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      );
      setVisibleRows(sort || []);
    } else {
      const sort = stableSort(
        data?.organizationMediaList,
        getComparator(order, orderBy)
      )?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
      setVisibleRows(sort || []);
    }
  }, [order, orderBy, page, rowsPerPage, data, searchTableData]);

  useEffect(() => {
    setVisibleRows(
      data?.organizationMediaList?.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ) || []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.organizationMediaList]);

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

  if (loading) return <EditSectionLoader />;

  return (
    <>
      <FormProvider {...methods}>
        <EditSectionDialog
          tableSelectedLocale={tableSelectedLocale}
          updating={isUpdating}
          renderForm={(selectedLocale) => (
            <ProductFeatureForm
              setSortItems={setSortItems}
              dialogElementShow={dialogElementShow}
              sortOpenDialog={sortOpenDialog}
              onSubmit={handleSubmit(selectedLocale)}
              selectedLocale={selectedLocale}
              cmsContentId={data?.organizationCmsContentId}
              handleClose={() => {
                if (onEditClose) {
                  onEditClose();
                }
                handleClose();
              }}
              selectedEditItem={selectedEditItem}
              setSelectedEditItem={setSelectedEditItem}
              useOneItemAtOnce={sortOpenDialog ? false : useOneItemAtOnce}
            />
          )}
          cmsContentId={data?.organizationCmsContentId}
          sortItems={sortItems}
          sortOpenDialog={sortOpenDialog}
          form={FORM}
          primary={primary}
          open={isOpen}
          onClose={() => {
            handleClose();
            if (onEditClose) onEditClose();
          }}
        />
      </FormProvider>

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
              rowCount={data?.organizationMediaList?.length}
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
                        handleOpen();
                        setSelectedEditItem(row);
                        setDialogElementShow(true);
                      }}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row?.organizationMediaId}
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
                            src={row?.uploadFile.uploadFilePath}
                          />
                        </Box>
                      </TableCell>
                      <TableCell component="th" id={labelId} padding="normal">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {row?.organizationMediaTitle}
                        </Box>
                      </TableCell>
                      <TableCell component="th" id={labelId} padding="normal">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {row?.organizationMediaYoutubeURL}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {moment(row?.organizationMediaCreateDate).format("ll")}
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
        {visibleRows.length ? (
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
      {/* <VideoSwiper
        items={data?.organizationMediaList?.map((el) => ({
          id: el.organizationMediaId,
          placeholder: el.uploadFile.uploadFilePath,
          src: `https://www.youtube.com/embed/${getYtVideoId(
            el.organizationMediaYoutubeURL || ""
          )}`,
          title: el.organizationMediaTitle,
        }))}
      /> */}
    </>
  );
};

export default ProductFeatureEditor;
