import { forwardRef } from "react";
import Link, { LinkProps } from "next/link";
import { useSelector } from "react-redux";
import { getOpenStatus, getChangeStatus } from "redux/froalaEditor/selectors";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { SnackbarProps } from "@eGroupAI/material";
import { Button, alpha } from "@mui/material";
import { useRouter } from "next/router";
import { SNACKBAR } from "components/App";
import { getWordLibrary } from "redux/wordLibrary/selectors";

// ----------------------------------------------------------------------

const RouterLink = forwardRef<
  HTMLAnchorElement,
  LinkProps & { id?: string; "data-tid"?: string }
>(({ id, "data-tid": dataTid, ...other }, ref) => {
  const editorIsOpen = useSelector(getOpenStatus);
  const changeStatus = useSelector(getChangeStatus);
  const { openSnackbar, closeSnackbar } =
    useReduxSnackbar<SnackbarProps>(SNACKBAR);
  const { push } = useRouter();
  const wordLibrary = useSelector(getWordLibrary);

  return (
    <Link
      id={id}
      data-tid={dataTid}
      ref={ref}
      {...other}
      onClick={(e) => {
        if (editorIsOpen && changeStatus) {
          e.preventDefault();
          openSnackbar({
            message:
              wordLibrary?.[
                "Your data has not been saved yet. Please ensure to save it to prevent the loss of important information"
              ] ?? "您的資料還未保存，請確認並進行儲存，以免重要資訊的遺失。",
            severity: "warning",
            autoHideDuration: 99999,
            action: (
              <>
                <Button
                  color="inherit"
                  size="small"
                  variant="outlined"
                  sx={{
                    mr: 1,
                    color: "white",
                    bgcolor: "#FFAB00",
                    border: (theme) =>
                      `1px solid ${alpha(theme.palette.common.white, 0.48)}`,
                  }}
                  onClick={() => {
                    closeSnackbar({ action: null });
                    push({
                      pathname: other.href as string,
                    });
                  }}
                >
                  {wordLibrary?.leave ?? "離開"}
                </Button>

                <Button
                  color="warning"
                  size="small"
                  variant="contained"
                  sx={{
                    color: "white",
                    bgcolor: "warning.dark",
                    hover: "none",
                  }}
                  onClick={async () => {
                    closeSnackbar({ action: null });
                    const saveBtn = document.getElementById(
                      "btn-froala-editor-save"
                    );
                    if (saveBtn) {
                      saveBtn.click();
                      window.localStorage.setItem(
                        "userRedirectUrl",
                        other.href as string
                      );
                    }
                  }}
                >
                  {wordLibrary?.save ?? "儲存"}
                </Button>
              </>
            ),
          });
        }
        if (other.onClick) other.onClick(e);
      }}
    />
  );
});

export default RouterLink;
