// @mui
import LoadingButton from "@mui/lab/LoadingButton";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import Divider from "@mui/material/Divider";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import DialogActions from "@mui/material/DialogActions";
// components
import Markdown from "minimal/components/markdown";
import Scrollbar from "minimal/components/scrollbar";
import EmptyContent from "minimal/components/empty-content";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";

// ----------------------------------------------------------------------

type Props = {
  title: string;
  content: string;
  //
  open: boolean;
  isSubmitting: boolean;
  onClose: VoidFunction;
  onSubmit: VoidFunction;
};

export default function ArticleDetailsPreview({
  title,
  content,
  //
  open,
  onClose,
  onSubmit,
  isSubmitting,
}: Props) {
  const hasContent = title || content;

  const wordLibrary = useSelector(getWordLibrary);

  return (
    <Dialog fullScreen open={open} onClose={onClose} maxWidth="sm">
      <DialogActions sx={{ py: 2, px: 3 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {wordLibrary?.preview ?? "預覽"}
        </Typography>

        <Button variant="outlined" color="inherit" onClick={onClose}>
          {wordLibrary?.cancel ?? "取消"}
        </Button>

        <LoadingButton
          variant="contained"
          loading={isSubmitting}
          onClick={() => {
            onSubmit();
            onClose();
          }}
          id="btn-froala-editor-save"
        >
          {wordLibrary?.save ?? "儲存"}
        </LoadingButton>
      </DialogActions>

      <Divider />

      {hasContent ? (
        <Scrollbar>
          <Container sx={{ mt: 5, mb: 10 }}>
            <Stack
              sx={{
                maxWidth: 720,
                mx: "auto",
              }}
            >
              <Typography variant="h3" sx={{ mb: 5 }}>
                {title}
              </Typography>

              <Markdown children={content} />
            </Stack>
          </Container>
        </Scrollbar>
      ) : (
        <EmptyContent filled title="Empty Content!" />
      )}
    </Dialog>
  );
}
