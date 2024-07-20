import React, { FC, useEffect, useMemo, useState } from "react";

import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import { useSelector } from "react-redux";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import useOrgMediaSliders from "utils/useOrgMediaSliders";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import parseOrgMediaListToImgSrc from "utils/parseOrgMediaListToImgSrc";
import apis from "utils/apis";
import { Locale, PageType } from "interfaces/utils";
import {
  OrganizationMedia,
  OrganizationMediaSlider,
} from "interfaces/entities";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import Tooltip from "@eGroupAI/material/Tooltip";
import IconButton from "components/IconButton/StyledIconButton";
import { Item } from "components/CarouselManagement";
import useIsOpen from "@eGroupAI/hooks/useIsOpen";
import CarouselEditDialog from "components/CarouselManagement/CarouselEditDialog";

import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import DeleteIcon from "@mui/icons-material/Delete";
import { CmsAvatar as Avatar } from "components/Avatar";
import { visuallyHidden } from "@mui/utils";
import moment from "moment-timezone";
import CarouselManagementContext from "components/CarouselManagement/CarouselManagementContext";
import CarouselSortDialog from "components/CarouselManagement/CarouselSortDialog";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import EditSectionLoader from "components/EditSectionLoader";

import { EachRowState, RowState } from "@eGroupAI/material-module/DataTable";
import { CustomPaginationActions } from "@eGroupAI/material-module/DataTable/CustomPaginationTool";

import CarouselEditForm, { FORM as CAROUSE_FORM } from "./CarouselEditForm";

export interface OrgMediaSliderEditorProps {
  pageType: PageType;
  title: string;
  targetId?: string;
  openAddDialog?: boolean;
  setOpenAddDialog?: (val: boolean) => void;
  tableSelectedLocale?: Locale;
  openSortModel?: boolean;
  setOpenSortModel?: (val: boolean) => void;
}

interface Data {
  organizationMediaSliderCreateDate: number;
  organizationMediaSliderTitle: string | undefined;
  organizationMediaList: OrganizationMedia[] | undefined;
  organizationMediaSliderId: string;
  organizationMediaSliderDescription: string;
  organizationMediaSliderLinkURL: string;
}

type Order = "asc" | "desc";

const headCells = [
  {
    id: "organizationMediaSliderTitle",
    numeric: false,
    disablePadding: true,
    label: "圖片",
  },
  {
    id: "organizationMediaSliderDescription",
    numeric: false,
    disablePadding: true,
    label: "描述",
  },
  {
    id: "organizationMediaSliderCreateDate",
    numeric: true,
    disablePadding: true,
    label: "建立日期",
  },
];
const OrgMediaSliderEditor: FC<OrgMediaSliderEditorProps> = function (props) {
  const {
    pageType,
    targetId,
    openAddDialog,
    setOpenAddDialog,
    tableSelectedLocale,
    openSortModel,
    setOpenSortModel,
    title,
  } = props;
  const locale = useSelector(getGlobalLocale);
  const organizationId = useSelector(getSelectedOrgId);
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<keyof Data>(
    "organizationMediaSliderTitle"
  );

  const [totalCount, setTotalCount] = useState<number>(0);
  const [isClickedAllCheckbox, setIsClickedAllCheckbox] =
    useState<boolean>(false);
  const [allChecked, setAllChecked] = useState<boolean>(false);
  const [indeterminate, setIndeterminate] = useState<boolean>(false);
  const [lastLoadedRowState, setLastLoadedRowState] = useState<
    EachRowState<OrganizationMediaSlider>
  >({});
  const [eachRowState, setEachRowState] = useState<
    EachRowState<OrganizationMediaSlider>
  >({});

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [visibleRows, setVisibleRows] = useState<OrganizationMediaSlider[]>([]);
  const [selectedLocale, setSelectedLocale] = useState<Locale>(Locale.ZH_TW);
  const [selectedItem, setSelectedItem] = useState<Item>();
  const {
    isOpen: isEditDialogOpen,
    handleClose: closeEditDialog,
    handleOpen: openEditDialog,
  } = useIsOpen(false);
  const { data, isValidating, mutate } = useOrgMediaSliders(
    {
      organizationId,
    },
    {
      locale: tableSelectedLocale || locale,
      PAGE_TYPE_: pageType,
      targetId,
      startIndex: page * rowsPerPage,
      size: rowsPerPage,
    }
  );

  const { excute: updateOrgMediaSlider, isLoading: isUpdatingMediaSlider } =
    useAxiosApiWrapper(apis.org.updateOrgMediaSlider, "Update");
  const { excute: deleteOrgMediaSlider } = useAxiosApiWrapper(
    apis.org.deleteOrgMediaSlider,
    "Delete"
  );

  const { excute: updateOrgMediaSlidersSort } = useAxiosApiWrapper(
    apis.org.updateOrgMediaSlidersSort,
    "Update"
  );

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
      if (setOpenAddDialog) setOpenAddDialog(false);
      mutate();
    }
    if (openSortModel && !isSortDialogOpen) {
      if (setOpenSortModel) setOpenSortModel(false);
      mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditDialogOpen, isSortDialogOpen]);

  function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (orderBy === "organizationMediaSliderCreateDate") {
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

  function stableSort(array: OrganizationMediaSlider[], comparator) {
    const stabilizedThis = array?.map(
      (el, index) => [el, index] as unknown as OrganizationMediaSlider
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
    if (totalCount === 0) {
      setTotalCount(data?.total || 0);
    }
    if (totalCount !== 0) {
      if (totalCount !== data?.total) setTotalCount(data?.total || 0);
      setEachRowState((prev) => {
        const newRowStates = data?.source.reduce<
          EachRowState<OrganizationMediaSlider>
        >((rowState, rowData) => {
          const dataId = rowData.organizationMediaSliderId;
          const isExisted = Object.keys(prev).includes(dataId);
          return {
            ...rowState,
            [dataId]: {
              checked: isExisted
                ? Boolean(prev[dataId]?.checked)
                : isClickedAllCheckbox,
              display: true,
              data: rowData,
            },
          };
        }, {});
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        setLastLoadedRowState(newRowStates || {});
        return { ...prev, ...newRowStates };
      });
    }
  }, [data?.source, data?.total, isClickedAllCheckbox, totalCount]);

  const checkedIds = useMemo(
    () => Object.keys(eachRowState).filter((key) => eachRowState[key]?.checked),
    [eachRowState]
  );

  useEffect(() => {
    if (data?.source.length) {
      setVisibleRows(data?.source);
    }
  }, [data?.source, page, rowsPerPage]);

  useEffect(() => {
    const sort = stableSort(data?.source || [], getComparator(order, orderBy));
    setVisibleRows(sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, orderBy, page, rowsPerPage, data?.source]);

  // handle state of allchecked and indeterminate status
  useEffect(() => {
    if (isClickedAllCheckbox) {
      if (
        Object.keys(eachRowState).length === checkedIds.length &&
        checkedIds.length > 0
      ) {
        setAllChecked(true);
        setIndeterminate(false);
      } else if (checkedIds.length > 0) {
        setAllChecked(false);
        setIndeterminate(true);
      } else {
        setAllChecked(false);
        setIndeterminate(false);
        setIsClickedAllCheckbox(false);
      }
    } else if (!isClickedAllCheckbox && data?.source.length) {
      if (
        Object.keys(lastLoadedRowState).filter(
          (key) => lastLoadedRowState[key]?.checked
        ).length === rowsPerPage
      ) {
        setAllChecked(true);
        setIndeterminate(false);
      } else if (
        Object.keys(lastLoadedRowState).filter(
          (key) => lastLoadedRowState[key]?.checked
        ).length > 0
      ) {
        setAllChecked(false);
        setIndeterminate(true);
      } else {
        setAllChecked(false);
        setIndeterminate(false);
        setIsClickedAllCheckbox(false);
      }
    }
  }, [
    eachRowState,
    totalCount,
    checkedIds.length,
    isClickedAllCheckbox,
    lastLoadedRowState,
    rowsPerPage,
    data?.source.length,
  ]);

  function EnhancedTableHead(props) {
    const { order, orderBy, onSelectAllClick, onRequestSort } = props;
    const createSortHandler =
      (property) => (event: React.MouseEvent<unknown>) => {
        onRequestSort(event, property);
      };
    const handleClickAllCheckbox = (checked: boolean) => {
      if (visibleRows.length) onSelectAllClick(checked);
    };

    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              color="primary"
              indeterminate={indeterminate}
              checked={allChecked}
              onChange={(_, checked) => handleClickAllCheckbox(checked)}
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

  function EnhancedTableToolbar({ numSelected }): JSX.Element {
    return (
      <div>
        {numSelected > 0 && (
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
                      if (checkedIds?.length) {
                        for (let i = 0; i < checkedIds.length; i++) {
                          // eslint-disable-next-line no-await-in-loop
                          await deleteOrgMediaSlider({
                            organizationId,
                            organizationMediaSliderId: checkedIds[i] as string,
                          });
                        }
                      }
                      mutate();
                      setEachRowState({});
                      closeConfirmDeleteDialog();
                      closeEditDialog();
                    },
                  });
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
        )}
      </div>
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

  const handleSelectAllClick = (checked: boolean) => {
    if (checked) {
      setIsClickedAllCheckbox(true);
      setEachRowState(() => {
        const next = Object.keys(eachRowState).reduce<
          EachRowState<OrganizationMediaSlider>
        >((a, key) => {
          const data = eachRowState[key] as RowState<OrganizationMediaSlider>;
          return {
            ...a,
            [key]: { ...data, checked: true },
          };
        }, {});
        return { ...next };
      });
      setLastLoadedRowState(() => {
        const next = Object.keys(lastLoadedRowState).reduce<
          EachRowState<OrganizationMediaSlider>
        >((a, key) => {
          const data = eachRowState[key] as RowState<OrganizationMediaSlider>;
          return {
            ...a,
            [key]: { ...data, checked: true },
          };
        }, {});
        return { ...next };
      });
    } else {
      setIsClickedAllCheckbox(false);
      setEachRowState(() => {
        const next = Object.keys(eachRowState).reduce<
          EachRowState<OrganizationMediaSlider>
        >((a, key) => {
          const data = eachRowState[key] as RowState<OrganizationMediaSlider>;
          return {
            ...a,
            [key]: { ...data, checked: false },
          };
        }, {});
        return { ...next };
      });
      setLastLoadedRowState(() => {
        const next = Object.keys(lastLoadedRowState).reduce<
          EachRowState<OrganizationMediaSlider>
        >((a, key) => {
          const data = eachRowState[key] as RowState<OrganizationMediaSlider>;
          return {
            ...a,
            [key]: { ...data, checked: false },
          };
        }, {});
        return { ...next };
      });
    }
  };

  const handleClick = (
    priorChecked: boolean,
    data: OrganizationMediaSlider
  ) => {
    setEachRowState((prev) => {
      const clickedId = data.organizationMediaSliderId;
      const before = prev[clickedId] as RowState<OrganizationMediaSlider>;
      return {
        ...prev,
        [clickedId]: { ...before, checked: !priorChecked },
      };
    });
    setLastLoadedRowState((prev) => {
      const clickedId = data.organizationMediaSliderId;
      const before = prev[clickedId] as RowState<OrganizationMediaSlider>;
      return {
        ...prev,
        [clickedId]: { ...before, checked: !priorChecked },
      };
    });
  };

  const handleChangePage = (event: unknown, newPage: number) =>
    setPage(newPage);

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (data: OrganizationMediaSlider) =>
    checkedIds?.indexOf(data.organizationMediaSliderId) !== -1;

  if (isValidating) return <EditSectionLoader />;

  return (
    <>
      <CarouselManagementContext.Provider value={value}>
        <CarouselEditDialog
          {...{
            title: `${title}管理`,
            updating: isUpdatingMediaSlider,
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
          renderForm={(
            dialogState,
            setSelectedItem,
            selectedItem,
            handleUploadFiles
          ) => (
            <CarouselEditForm
              onSubmit={async (values, mutateSlider, closeEditDialog) => {
                let createdUploadId: string | undefined;
                if (handleUploadFiles)
                  createdUploadId = await handleUploadFiles();
                const { selectedLocale } = dialogState;
                if (selectedItem && createdUploadId) {
                  try {
                    const res = await updateOrgMediaSlider({
                      organizationId,
                      organizationMediaSliderId: createdUploadId,
                      organizationMediaSliderTitle:
                        values.organizationMediaSliderTitle,
                      organizationMediaSliderDescription:
                        values.organizationMediaSliderDescription,
                      organizationMediaSliderLinkURL:
                        values.organizationMediaSliderLinkURL,
                      locale: selectedLocale,
                    });
                    setSelectedItem((val) => ({
                      ...val,
                      title: res.data.organizationMediaSliderTitle,
                      description: res.data.organizationMediaSliderDescription,
                      linkURL: res.data.organizationMediaSliderLinkURL,
                      ids: {
                        ...val?.ids,
                        primaryId: targetId || (createdUploadId as string),
                        organizationMediaSliderId: createdUploadId,
                      },
                    }));
                    if (closeEditDialog) closeEditDialog();
                  } catch (error) {
                    // eslint-disable-next-line no-console
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
                } else if (selectedItem?.ids.organizationMediaSliderId) {
                  try {
                    const res = await updateOrgMediaSlider({
                      organizationId,
                      organizationMediaSliderId:
                        selectedItem.ids.organizationMediaSliderId,
                      organizationMediaSliderTitle:
                        values.organizationMediaSliderTitle,
                      organizationMediaSliderDescription:
                        values.organizationMediaSliderDescription,
                      organizationMediaSliderLinkURL:
                        values.organizationMediaSliderLinkURL,
                      locale: selectedLocale,
                    });
                    setSelectedItem({
                      ...selectedItem,
                      title: res.data.organizationMediaSliderTitle,
                      description: res.data.organizationMediaSliderDescription,
                      linkURL: res.data.organizationMediaSliderLinkURL,
                    });
                    if (closeEditDialog) closeEditDialog();
                  } catch (error) {
                    // eslint-disable-next-line no-console
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
                } else {
                  mutateSlider();
                  if (closeEditDialog) closeEditDialog();
                }
                mutate();
              }}
            />
          )}
          form={CAROUSE_FORM}
          onDeleteClick={(selectedItem) => {
            if (selectedItem) {
              openConfirmDeleteDialog({
                primary: `您確定要刪除${selectedItem.title}嗎？`,
                onConfirm: async () => {
                  await deleteOrgMediaSlider({
                    organizationId,
                    organizationMediaSliderId: selectedItem.ids
                      .organizationMediaSliderId as string,
                  });
                  mutate();
                  closeConfirmDeleteDialog();
                  closeEditDialog();
                },
              });
            }
          }}
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
          items={data?.source.map((el, index) => ({
            ids: {
              primaryId: el.organizationMediaSliderId,
              organizationMediaSliderId: el.organizationMediaSliderId,
            },
            order: index,
            title: el.organizationMediaSliderTitle,
            description: el.organizationMediaSliderDescription,
            linkURL: el.organizationMediaSliderLinkURL,
            imgSrc: parseOrgMediaListToImgSrc(el.organizationMediaList),
          }))}
          onItemOrderChange={async (next) => {
            await updateOrgMediaSlidersSort({
              organizationId,
              pageType,
              organizationMediaSliderList: next.map((el) => ({
                organizationMediaSliderId: el.ids
                  .organizationMediaSliderId as string,
              })),
            });
            mutate();
          }}
        />
      </CarouselManagementContext.Provider>
      <Box sx={{ width: "100%" }}>
        <Paper sx={{ width: "100%", mb: 2 }}>
          <EnhancedTableToolbar numSelected={checkedIds.length} />
          <TableContainer>
            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
              <EnhancedTableHead
                numSelected={checkedIds.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={data?.source?.length}
              />
              {visibleRows.length ? (
                <TableBody>
                  {visibleRows?.map((row, index) => {
                    const isItemSelected = isSelected(row);
                    const labelId = `enhanced-table-checkbox-${index}`;
                    return (
                      <TableRow
                        hover
                        onClick={() => {
                          setSelectedItem({
                            ids: {
                              primaryId: row.organizationMediaSliderId,
                              organizationMediaSliderId:
                                row.organizationMediaSliderId,
                            },
                            title: row.organizationMediaSliderTitle,
                            description: row.organizationMediaSliderDescription,
                            linkURL: row.organizationMediaSliderLinkURL,
                            imgSrc: parseOrgMediaListToImgSrc(
                              row.organizationMediaList
                            ),
                          });
                          openEditDialog();
                        }}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row?.organizationMediaSliderTitle}
                        selected={isItemSelected}
                        sx={{ cursor: "pointer" }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            onClick={(event) => {
                              handleClick(isItemSelected, row);
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
                              src={
                                row?.organizationMediaList &&
                                row?.organizationMediaList[0]?.uploadFile
                                  .uploadFilePath
                              }
                            />
                            {row?.organizationMediaSliderTitle}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {row?.organizationMediaSliderDescription}
                        </TableCell>
                        <TableCell align="right">
                          {moment(
                            row?.organizationMediaSliderCreateDate
                          ).format("ll")}
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
              count={data?.total || 0}
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

export default OrgMediaSliderEditor;
