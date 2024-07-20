import { Stack } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { TablePaginationProps } from "@mui/material/TablePagination";
import {
  FirstPage,
  LastPage,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from "@mui/icons-material";

export type CustomPaginationActionsProps = TablePaginationProps;

// Custom pagination actions component
const CustomPaginationActions = (props: CustomPaginationActionsProps) => {
  const {
    count,
    page,
    rowsPerPage,
    onPageChange,
    showFirstButton,
    showLastButton,
  } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Stack direction="row" sx={{ mx: 1 }}>
      {showFirstButton && (
        <IconButton
          size="small"
          onClick={handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="first page"
          data-tid="table-pagination-first-button"
          id="table-pagination-first-button"
        >
          <FirstPage />
        </IconButton>
      )}
      <IconButton
        size="small"
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
        data-tid="table-pagination-previous-button"
        id="table-pagination-previous-button"
      >
        <KeyboardArrowLeft />
      </IconButton>
      <IconButton
        size="small"
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
        data-tid="table-pagination-next-button"
        id="table-pagination-next-button"
      >
        <KeyboardArrowRight />
      </IconButton>
      {showLastButton && (
        <IconButton
          size="small"
          onClick={handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="last page"
          data-tid="table-pagination-last-button"
          id="table-pagination-last-button"
        >
          <LastPage />
        </IconButton>
      )}
    </Stack>
  );
};

export default CustomPaginationActions;
