import useIsOpen from "@eGroupAI/hooks/useIsOpen";
// import { useReduxDialog } from "@eGroupAI/redux-modules";
import { OrganizationCmsContent, OrganizationMedia } from "interfaces/entities";
import { ContentType, Locale, PageType } from "interfaces/utils";
import { ReactNode, useEffect, useMemo, useState } from "react";
// import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";

import { FormProvider } from "react-hook-form";
import EditSectionDialog from "components/EditSectionDialog";
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

import useCmsContentEditor from "components/OrgCmsContentEditor/editors/useCmsContentEditor";
import useCmsContentForm from "components/OrgCmsContentEditor/editors/useCmsContentForm";
import { GridDeleteIcon } from "@mui/x-data-grid";
import EditSectionLoader from "components/EditSectionLoader";
import moment from "moment-timezone";
import { CustomPaginationActions } from "@eGroupAI/material-module/DataTable/CustomPaginationTool";

import SolutionCmsContentEditorContext from "./SolutionCmsContentEditorContext";
import SolutionCmsContentEditorForm, {
  FORM as SOLUTION_CMS_CONTENT_EDITOR_FORM,
} from "./SolutionCmsContentEditorForm";

export interface SolutionCmsContentEditorProps {
  title?: string;
  pageType?: PageType;
  tableSelectedLocale?: Locale;
  openAddDialog?: boolean;
  setOpenAddDialog?: any;
  sortOpenDialog?: boolean;
  setSortOpenDialog?: any;
  organizationProductId?: string;
  data: OrganizationCmsContent | undefined;
  contentType?: ContentType;
  primary?: ReactNode;
  onEditClose?: () => void;
  setSearchTableData?: any;
  searchTableData?: string;
  loading?: boolean;
  setAddable?: React.Dispatch<React.SetStateAction<boolean>>;
  useOneItemAtOnce?: boolean;
}

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

const SolutionCmsContentEditor = (props: SolutionCmsContentEditorProps) => {
  const {
    data,
    onEditClose,
    primary,
    openAddDialog,
    setOpenAddDialog,
    tableSelectedLocale,
    sortOpenDialog,
    setSortOpenDialog,
    loading = false,
    useOneItemAtOnce = true,
  } = props;

  const [selectedLocale, setSelectedLocale] = useState<Locale>(Locale.ZH_TW);

  const {
    isOpen: isEditDialogOpen,
    handleClose: closeEditDialog,
    handleOpen: openEditDialog,
  } = useIsOpen(false);

  const {
    isOpen: isSortDialogOpen,
    handleClose: closeSortDialog,
    handleOpen: openSortDialog,
  } = useIsOpen(false);

  const value = useMemo(
    () => ({
      closeSortDialog,
      isSortDialogOpen,
      openSortDialog,
      selectedLocale,
      setSelectedLocale,
      isEditDialogOpen,
      closeEditDialog,
      openEditDialog,
    }),
    [
      closeEditDialog,
      closeSortDialog,
      isEditDialogOpen,
      isSortDialogOpen,
      openEditDialog,
      openSortDialog,
      selectedLocale,
    ]
  );

  const { handleSubmit, isUpdating } = useCmsContentEditor(props);
  const [sortItems, setSortItems] = useState<any[]>([]);
  const [selectedEditItem, setSelectedEditItem] = useState<OrganizationMedia>();
  const { handleDeleteItem, methods } = useCmsContentForm({
    cmsContentId: data?.organizationCmsContentId || "",
    selectedLocale: tableSelectedLocale || Locale.ZH_TW,
    useOneItemAtOnce: sortOpenDialog ? false : useOneItemAtOnce,
  });

  const [order, setOrder] = useState<Order>("desc");
  const [dialogElementShow, setDialogElementShow] = useState<boolean>(false);
  const [visibleRows, setVisibleRows] = useState<OrganizationMedia[]>([]);
  const [orderBy, setOrderBy] = useState<keyof Data>("organizationMediaTitle");
  const { isOpen, handleClose, handleOpen } = useIsOpen(false);

  const [selected, setSelected] = useState<readonly string[] | any>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    if (openAddDialog || sortOpenDialog) handleOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openAddDialog, sortOpenDialog]);

  useEffect(() => {
    if (openAddDialog && !isOpen) setOpenAddDialog(false);
    if (sortOpenDialog && !isOpen) setSortOpenDialog(false);
    if (dialogElementShow && !isOpen) setDialogElementShow(false);
    if (!isOpen) setSelectedEditItem(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              onChange={visibleRows?.length && onSelectAllClick}
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
  useMemo(() => {
    const sort = stableSort(
      data?.organizationMediaList,
      getComparator(order, orderBy)
    )?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    setVisibleRows(sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, orderBy, page, rowsPerPage, data]);

  useEffect(() => {
    setVisibleRows(
      data?.organizationMediaList?.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ) || []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.organizationMediaList]);

  if (loading) return <EditSectionLoader />;

  return (
    <SolutionCmsContentEditorContext.Provider value={value}>
      <FormProvider {...methods}>
        <EditSectionDialog
          tableSelectedLocale={tableSelectedLocale}
          renderForm={(selectedLocale) => (
            <SolutionCmsContentEditorForm
              setSortItems={setSortItems}
              dialogElementShow={dialogElementShow}
              sortOpenDialog={sortOpenDialog}
              onSubmit={handleSubmit(selectedLocale)}
              selectedLocale={selectedLocale}
              cmsContentId={data?.organizationCmsContentId}
              handleClose={() => {
                handleClose();
                if (onEditClose) {
                  onEditClose();
                }
              }}
              selectedEditItem={selectedEditItem}
              setSelectedEditItem={setSelectedEditItem}
              useOneItemAtOnce={sortOpenDialog ? false : useOneItemAtOnce}
            />
          )}
          cmsContentId={data?.organizationCmsContentId}
          sortItems={sortItems}
          sortOpenDialog={sortOpenDialog}
          form={SOLUTION_CMS_CONTENT_EDITOR_FORM}
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
      </FormProvider>
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
    </SolutionCmsContentEditorContext.Provider>
  );
};

export default SolutionCmsContentEditor;
