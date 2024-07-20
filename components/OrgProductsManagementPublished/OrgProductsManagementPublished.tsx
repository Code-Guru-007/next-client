import React, { FC, useEffect, useMemo, useState } from "react";
import NextLink from "next/link";

import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import DeleteIcon from "@mui/icons-material/Delete";
import { visuallyHidden } from "@mui/utils";
import { TableHead, TableSortLabel } from "@mui/material";

import { CmsAvatar as Avatar } from "components/Avatar";
import IconButton from "components/IconButton/StyledIconButton";
import EditSectionLoader from "components/EditSectionLoader";
import { Item } from "components/CarouselManagement";
import { SNACKBAR } from "components/App";
import CarouselManagementContext from "components/CarouselManagement/CarouselManagementContext";
import CarouselEditDialog from "components/OrgProductsManagementEditor/CarouselEditDialog";
import CarouselEditForm, {
  FORM as CAROUSE_FORM,
} from "components/OrgProductsManagementEditor/CarouselEditForm";
import CarouselSortDialog from "components/OrgProductsManagementEditor/CarouselSortDialog";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";

import moment from "moment-timezone";

import Tooltip from "@eGroupAI/material/Tooltip";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useIsOpen from "@eGroupAI/hooks/useIsOpen";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { SnackbarProps } from "@eGroupAI/material";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo";

import { OrganizationMedia, OrganizationProduct } from "interfaces/entities";
import { ContentType, Locale, PageType } from "interfaces/utils";

import useOrgProducts from "utils/useOrgProducts";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import parseCreateMediaListApiPayload from "utils/parseCreateMediaListApiPayload";
import parseOrgMediaListToImgSrc from "utils/parseOrgMediaListToImgSrc";
import { CustomPaginationActions } from "@eGroupAI/material-module/DataTable/CustomPaginationTool";

export interface OrgProductsPublishProps {
  pageType: PageType;
  title: string;
  targetId?: string;
  openAddDialog?: boolean;
  setOpenAddDialog?: any;
  tableSelectedLocale?: Locale;
  openSortModel?: boolean;
  setOpenSortModel?: any;
}

interface Data {
  organizationMediaList: OrganizationMedia[] | undefined;
  organizationProductCreateDate: number;
  organizationProductId: string;
  organizationProductIsVisible: number;
  organizationProductName: string | undefined;
  organizationProductSort: number;
  organizationService: {
    organizationServiceId: string;
  };
}

type Order = "asc" | "desc";

const headCells = [
  {
    id: "organizationProductName",
    numeric: false,
    disablePadding: true,
    label: "圖片",
  },
  {
    id: "organizationProductCreateDate",
    numeric: true,
    disablePadding: true,
    label: "建立日期",
  },
];

const OrgProductsManagementPublished: FC<OrgProductsPublishProps> = function (
  props
) {
  const {
    targetId,
    openAddDialog,
    setOpenAddDialog,
    tableSelectedLocale,
    openSortModel,
    setOpenSortModel,
    pageType,
    title,
  } = props;
  const organizationId = useSelector(getSelectedOrgId);
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<keyof Data>();
  const [selected, setSelected] = useState<OrganizationProduct[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [visibleRows, setVisibleRows] = useState<OrganizationProduct[]>([]);
  const [selectedLocale, setSelectedLocale] = useState<Locale>(Locale.ZH_TW);
  const [selectedItem, setSelectedItem] = useState<Item>();
  const wordLibrary = useSelector(getWordLibrary);
  const {
    isOpen: isEditDialogOpen,
    handleClose: closeEditDialog,
    handleOpen: openEditDialog,
  } = useIsOpen(false);
  const { data, isValidating, mutate } = useOrgProducts(
    {
      organizationId,
    },
    {
      organizationProductIsVisible: 1,
      locale: tableSelectedLocale,
    }
  );
  const { excute: createOrgProduct, isLoading: isCreating } =
    useAxiosApiWrapper(apis.org.createOrgProduct, "Create");

  const { excute: updateOrgProductSort } = useAxiosApiWrapper(
    apis.org.updateOrgProductSort,
    "Update"
  );
  const { excute: deleteOrgProduct } = useAxiosApiWrapper(
    apis.org.deleteOrgProduct,
    "Delete"
  );
  const { openSnackbar } = useReduxSnackbar<SnackbarProps>(SNACKBAR);

  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
  } = useReduxDialog(DELETE_DIALOG);

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
      selectedItem,
      setSelectedItem,
      isEditDialogOpen,
      closeEditDialog,
      openEditDialog,
    }),
    [
      closeSortDialog,
      isSortDialogOpen,
      openSortDialog,
      closeEditDialog,
      isEditDialogOpen,
      openEditDialog,
      selectedItem,
      selectedLocale,
      setSelectedLocale,
    ]
  );
  useEffect(() => {
    if (openAddDialog) openEditDialog();
    if (openSortModel) openSortDialog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openAddDialog, openSortModel]);

  useEffect(() => {
    if (openAddDialog && !isEditDialogOpen) {
      setOpenAddDialog(false);
      mutate();
    }
    if (openSortModel && !isSortDialogOpen) {
      setOpenSortModel(false);
      mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditDialogOpen, isSortDialogOpen]);

  function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (orderBy === "organizationProductCreateDate") {
      if (new Date(`${b[orderBy]}`) < new Date(`${a[orderBy]}`)) return -1;

      if (new Date(`${b[orderBy]}`) > new Date(`${a[orderBy]}`)) return 1;
    } else {
      if (b[orderBy] < a[orderBy]) return -1;

      if (b[orderBy] > a[orderBy]) return 1;
    }

    return 0;
  }

  function getComparator(
    order: Order,
    orderBy: string | number
  ): (
    a: { [key in string | number]: number | string },
    b: { [key in string | number]: number | string }
  ) => number {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  const handleClick = (event: React.MouseEvent<unknown>, data) => {
    const selectedIndex = selected.indexOf(data);
    let newSelected: OrganizationProduct[] = [];
    if (selectedIndex === -1) {
      newSelected = selected && newSelected.concat(selected, data);
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

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  function stableSort(array: OrganizationProduct[], comparator) {
    const stabilizedThis = array?.map(
      (el, index) => [el, index] as unknown as OrganizationProduct
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

  useEffect(() => {
    setVisibleRows(
      data?.source?.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ) || []
    );
  }, [data, page, rowsPerPage]);

  useEffect(() => {
    if (orderBy) {
      const sort = stableSort(
        data?.source || [],
        getComparator(order, orderBy)
      )?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
      setVisibleRows(sort);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, orderBy, page, rowsPerPage, data]);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(data?.source || []);
      return;
    }
    setSelected([]);
  };

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

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

  const isSelected = (data) => selected?.indexOf(data) !== -1;

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
                    for (let i = 0; i < selected.length; i++) {
                      // eslint-disable-next-line no-await-in-loop
                      await deleteOrgProduct({
                        organizationId,
                        organizationProductId: selected[i]
                          ?.organizationProductId as string,
                      });
                    }
                    mutate();
                    closeConfirmDeleteDialog();
                    closeEditDialog();
                    setSelected([]);
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

  const items = useMemo(
    () =>
      data
        ? data?.source?.map((el, index) => ({
            ids: {
              primaryId: el.organizationProductId,
              organizationProductId: el.organizationProductId,
            },
            order: index,
            name: el.organizationProductName,
            description: el.organizationProductDescription,
            imgSrc: parseOrgMediaListToImgSrc(el.organizationMediaList),
          }))
        : [],
    [data]
  );
  if (isValidating) return <EditSectionLoader />;

  return (
    <>
      <CarouselManagementContext.Provider value={value}>
        <CarouselEditDialog
          {...{
            title: `${title}管理`,
            updating: isCreating,
            onClose: () => {
              mutate();
            },
          }}
          pageType={pageType}
          targetId={targetId}
          open={isEditDialogOpen}
          onClose={() => {
            closeEditDialog();
            setSelectedItem(undefined);
          }}
          renderForm={(selectedLocale) => (
            <CarouselEditForm
              onSubmit={async (values) => {
                const isImagesUploading =
                  values.organizationMediaList.filter((el) => el.isUploading)
                    .length > 0;
                if (isImagesUploading) {
                  openSnackbar({
                    message: wordLibrary?.["please wait"] ?? "請稍後",
                    severity: "error",
                    autoHideDuration: 4000,
                  });
                } else {
                  try {
                    await createOrgProduct({
                      organizationId,
                      organizationProductIsVisible: 1,
                      organizationProductName: values.organizationProductName,
                      organizationProductDescription:
                        values.organizationProductDescription,
                      organizationMediaList: parseCreateMediaListApiPayload(
                        values.organizationMediaList
                      ),
                      organizationCmsContentList: [
                        {
                          organizationCmsContentSort: 1,
                          organizationCmsContentType:
                            ContentType.PRODUCT_DESCRIPTION,
                        },
                        {
                          organizationCmsContentSort: 2,
                          organizationCmsContentType:
                            ContentType.PRODUCT_FEATURES_MEDIA,
                        },
                        {
                          organizationCmsContentSort: 3,
                          organizationCmsContentType:
                            ContentType.PRODUCT_FEATURES_LIST,
                        },
                        {
                          organizationCmsContentSort: 4,
                          organizationCmsContentType:
                            ContentType.PRODUCT_CONFIGURATION,
                        },
                        {
                          organizationCmsContentSort: 5,
                          organizationCmsContentType:
                            ContentType.PRODUCT_SPECIFICATION,
                        },
                        {
                          organizationCmsContentSort: 6,
                          organizationCmsContentType:
                            ContentType.PRODUCT_PERIPHERAL_DEVICE,
                        },
                        {
                          organizationCmsContentSort: 7,
                          organizationCmsContentType: ContentType.DOWNLOAD_FILE,
                        },
                        {
                          organizationCmsContentSort: 8,
                          organizationCmsContentType: ContentType.PRODUCT_VIDEO,
                        },
                      ],
                      locale: selectedLocale,
                    });
                    mutate();
                    closeEditDialog();
                  } catch (error) {
                    apis.tools.createLog({
                      function: "DatePicker: error",
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
            />
          )}
          form={CAROUSE_FORM}
        />
        <CarouselSortDialog
          {...{
            title: `${title}管理`,
            onClose: () => {
              mutate();
            },
          }}
          open={isSortDialogOpen}
          openSortModel={openSortModel}
          onClose={closeSortDialog}
          items={items}
          onItemOrderChange={async (next) => {
            await updateOrgProductSort({
              organizationId,
              organizationProductList: next.map((el) => ({
                organizationProductId: el.ids.organizationProductId as string,
              })),
            });
            mutate();
          }}
        />
      </CarouselManagementContext.Provider>
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
                        key={row?.organizationProductId}
                        prefetch
                        href={`/me/cms/products/${encodeURIComponent(
                          row?.organizationProductId
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        passHref
                        legacyBehavior
                      >
                        <TableRow
                          hover
                          role="checkbox"
                          aria-checked={isItemSelected}
                          tabIndex={-1}
                          key={row?.organizationProductId}
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
                                  row?.organizationMediaList.length > 0
                                    ? row?.organizationMediaList[0].uploadFile
                                        .uploadFilePath
                                    : ""
                                }
                              />
                              {row?.organizationProductName}
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            {moment(row?.organizationProductCreateDate).format(
                              "ll"
                            )}
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

export default OrgProductsManagementPublished;
