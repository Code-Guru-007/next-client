import React, {
  FC,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import { useSelector } from "react-redux";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import useOrgSolutions from "utils/useOrgSolutions";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import parseOrgMediaListToImgSrc from "utils/parseOrgMediaListToImgSrc";
import apis from "utils/apis";
import { Locale, PageType } from "interfaces/utils";
import { OrganizationMedia, OrganizationSolution } from "interfaces/entities";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import Tooltip from "@eGroupAI/material/Tooltip";
import IconButton from "components/IconButton/StyledIconButton";
import { Item } from "components/CarouselManagement";
import useIsOpen from "@eGroupAI/hooks/useIsOpen";

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
import parseCreateMediaListApiPayload from "utils/parseCreateMediaListApiPayload";
import parseUpdateMediaPromises from "utils/parseUpdateMediaPromises";
import moment from "moment-timezone";
import EditSectionLoader from "components/EditSectionLoader";
import { CustomPaginationActions } from "@eGroupAI/material-module/DataTable/CustomPaginationTool";

import CarouselManagementContext from "./CarouselManagementContext";
import CarouselEditDialog from "./CarouselEditDialog";
import CarouselSortDialog from "./CarouselSortDialog";

import FeatureEditForm, {
  FeatureEditFormProps,
  FORM as FEATURE_FORM,
} from "./FeatureEditForm";

export interface OrgSolutionContentEditorProps {
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
  organizationSolutionCreateDate: number;
  organizationSolutionName: string | undefined;
  organizationMediaList: OrganizationMedia[] | undefined;
  organizationSolutionId: string;
  organizationSolutionDescription: string;
}

type Order = "asc" | "desc";

const headCells = [
  {
    id: "organizationSolutionName",
    numeric: false,
    disablePadding: true,
    label: "圖片",
  },
  {
    id: "organizationSolutionDescription",
    numeric: false,
    disablePadding: true,
    label: "描述",
  },
  {
    id: "organizationSolutionCreateDate",
    numeric: true,
    disablePadding: true,
    label: "建立日期",
  },
];
const OrgSolutionContentEditor: FC<OrgSolutionContentEditorProps> = function (
  props
) {
  const {
    pageType,
    // targetId,
    openAddDialog,
    setOpenAddDialog,
    tableSelectedLocale,
    openSortModel,
    setOpenSortModel,
    title,
  } = props;

  const organizationId = useSelector(getSelectedOrgId);
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<keyof Data>(
    "organizationSolutionName"
  );
  const [selected, setSelected] = useState<OrganizationSolution[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [visibleRows, setVisibleRows] = useState<OrganizationSolution[]>([]);
  const [selectedLocale, setSelectedLocale] = useState<Locale>(Locale.ZH_TW);
  const [selectedItem, setSelectedItem] = useState<Item>();
  const {
    isOpen: isEditDialogOpen,
    handleClose: closeEditDialog,
    handleOpen: openEditDialog,
  } = useIsOpen(false);
  const { data, mutate } = useOrgSolutions(
    {
      organizationId,
    },
    {
      locale: tableSelectedLocale,
    }
  );
  const { excute: createOrgSolution, isLoading: isCreatingSolution } =
    useAxiosApiWrapper(apis.org.createOrgSolution, "Create");
  const { excute: updateOrgSolution, isLoading: isUpdatingSolution } =
    useAxiosApiWrapper(apis.org.updateOrgSolution, "Update");
  const { excute: deleteOrgSolution } = useAxiosApiWrapper(
    apis.org.deleteOrgSolution,
    "Delete"
  );
  const { excute: updateOrgSolutionsSort } = useAxiosApiWrapper(
    apis.org.updateOrgSolutionsSort,
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
    if (orderBy === "organizationSolutionCreateDate") {
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

  function stableSort(array: OrganizationSolution[], comparator) {
    const stabilizedThis = array?.map(
      (el, index) => [el, index] as unknown as OrganizationSolution
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

  useLayoutEffect(() => {
    setVisibleRows(
      data?.source.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ) || []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.source]);

  useMemo(() => {
    const sort = stableSort(
      data?.source || [],
      getComparator(order, orderBy)
    )?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    setVisibleRows(sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, orderBy, page, rowsPerPage, data]);
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
                    for (let i = 0; i < selected.length; i++) {
                      // eslint-disable-next-line no-await-in-loop
                      await deleteOrgSolution({
                        organizationId,
                        organizationSolutionId: selected[i]
                          ?.organizationSolutionId as string,
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
      setSelected(data?.source || []);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, data) => {
    const selectedIndex = selected.indexOf(data);
    let newSelected: OrganizationSolution[] = [];
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

  const handleChangePage = (event: unknown, newPage: number) =>
    setPage(newPage);

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (data) => selected?.indexOf(data) !== -1;

  if (!data?.source.length) return <EditSectionLoader />;

  return (
    <>
      <CarouselManagementContext.Provider value={value}>
        <CarouselEditDialog
          {...{
            title: `${title}管理`,
            updating: isUpdatingSolution || isCreatingSolution,
            onClose: () => {
              mutate();
            },
          }}
          pageType={pageType}
          targetId={selectedItem?.ids.organizationSolutionId as string}
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
          ) => {
            const handleSubmit: FeatureEditFormProps["onSubmit"] = async (
              values,
              mutateSlider
            ) => {
              try {
                let mediaSliderList;
                if (handleUploadFiles) {
                  mediaSliderList = await handleUploadFiles();
                }
                const { selectedLocale } = dialogState;
                if (selectedItem?.ids.organizationSolutionId) {
                  const promises: Promise<unknown>[] = parseUpdateMediaPromises(
                    organizationId,
                    selectedLocale,
                    values.organizationMediaList
                  );
                  promises.push(
                    updateOrgSolution({
                      organizationId,
                      organizationSolutionId: selectedItem.ids
                        .organizationSolutionId as string,
                      organizationSolutionName: values.organizationSolutionName,
                      organizationSolutionDescription:
                        values.organizationSolutionDescription,
                      organizationSolutionURL: values.organizationSolutionURL,
                      organizationMediaSliderList: [mediaSliderList],
                      locale: selectedLocale,
                    })
                  );
                  Promise.all(promises).then(() => {
                    mutateSlider();
                    closeEditDialog();
                    mutate();
                  });
                } else {
                  const res = await createOrgSolution({
                    organizationId,
                    organizationSolutionName: values.organizationSolutionName,
                    organizationSolutionDescription:
                      values.organizationSolutionDescription,
                    organizationSolutionURL: values.organizationSolutionURL,
                    organizationMediaList: parseCreateMediaListApiPayload(
                      values.organizationMediaList
                    ),
                    organizationMediaSliderList: [mediaSliderList],
                    locale: selectedLocale,
                  });
                  setSelectedItem({
                    ids: {
                      primaryId: res.data.organizationSolutionId,
                      organizationSolutionId: res.data.organizationSolutionId,
                      organizationMediaSliderId: res.data
                        .organizationMediaSliderList
                        ? res.data.organizationMediaSliderList[0]
                            ?.organizationMediaSliderId
                        : undefined,
                    },
                    title: res.data.organizationSolutionName,
                    imgSrc: parseOrgMediaListToImgSrc(
                      res.data.organizationMediaSliderList
                        ? res.data.organizationMediaSliderList[0]
                            ?.organizationMediaList
                        : undefined
                    ),
                    items: res.data.organizationMediaList?.map(
                      (om, omIndex) => ({
                        ids: {
                          organizationMediaId: om.organizationMediaId,
                        },
                        title: om.organizationMediaTitle,
                        order: omIndex,
                        imgSrc: {
                          normal: om.uploadFile.uploadFilePath,
                        },
                      })
                    ),
                  });
                  mutate();
                  closeEditDialog();
                }
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
            };
            return (
              <FeatureEditForm
                onSubmit={handleSubmit}
                onStartSortClick={handleSubmit}
              />
            );
          }}
          form={FEATURE_FORM}
          onDeleteClick={(selectedItem) => {
            if (selectedItem) {
              openConfirmDeleteDialog({
                primary: `您確定要刪除${selectedItem.title}嗎？`,
                onConfirm: async () => {
                  await deleteOrgSolution({
                    organizationId,
                    organizationSolutionId: selectedItem.ids
                      .organizationSolutionId as string,
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
              primaryId: el.organizationSolutionId,
              organizationSolutionId: el.organizationSolutionId,
            },
            order: index,
            title: el.organizationSolutionName,
            description: el.organizationSolutionDescription,
            linkURL: el.organizationSolutionURL,
            imgSrc: parseOrgMediaListToImgSrc(
              el.organizationMediaSliderList
                ? el.organizationMediaSliderList[0]?.organizationMediaList
                : undefined
            ),
          }))}
          onItemOrderChange={async (next) => {
            await updateOrgSolutionsSort({
              organizationId,
              organizationSolutionList: next.map((el) => ({
                organizationSolutionId: el.ids.organizationSolutionId as string,
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
                      <TableRow
                        hover
                        onClick={() => {
                          window.open(
                            `/me/cms/solutions/${row.organizationSolutionId}`,
                            "_blank"
                          );
                          // setSelectedItem({
                          //   ids: {
                          //     primaryId: row.organizationSolutionId,
                          //     organizationSolutionId:
                          //       row.organizationSolutionId,
                          //     organizationMediaSliderId:
                          //       row.organizationMediaSliderList
                          //         ? row.organizationMediaSliderList[0]
                          //             ?.organizationMediaSliderId
                          //         : undefined,
                          //   },
                          //   title: row.organizationSolutionName,
                          //   imgSrc: parseOrgMediaListToImgSrc(
                          //     row.organizationMediaSliderList
                          //       ? row.organizationMediaSliderList[0]
                          //           ?.organizationMediaList
                          //       : undefined
                          //   ),
                          //   items: row.organizationMediaList?.map(
                          //     (om, omIndex) => ({
                          //       ids: {
                          //         organizationMediaId: om.organizationMediaId,
                          //       },
                          //       title: om.organizationMediaTitle,
                          //       order: omIndex,
                          //       imgSrc: {
                          //         normal: om.uploadFile.uploadFilePath,
                          //       },
                          //     })
                          //   ),
                          // });
                          // openEditDialog();
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
                              src={
                                parseOrgMediaListToImgSrc(
                                  row?.organizationMediaSliderList
                                    ? row?.organizationMediaSliderList[0]
                                        ?.organizationMediaList
                                    : undefined
                                ).desktop
                              }
                            />
                            {row?.organizationSolutionName}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {row?.organizationSolutionDescription}
                        </TableCell>
                        <TableCell align="right">
                          {moment(row?.organizationSolutionCreateDate).format(
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

export default OrgSolutionContentEditor;
