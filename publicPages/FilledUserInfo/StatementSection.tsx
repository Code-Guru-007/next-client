import React, { FC, useState, useEffect, useRef, useCallback } from "react";
import { CircularProgress, Stack, useTheme } from "@mui/material";
import Paper, { PaperProps } from "@eGroupAI/material/Paper";
import Typography from "@eGroupAI/material/Typography";
import Button from "@eGroupAI/material/Button";
import Box from "@eGroupAI/material/Box";
import Checkbox, { CheckboxProps } from "@eGroupAI/material/Checkbox";
import FormControlLabel from "@eGroupAI/material/FormControlLabel";
import Link from "@mui/material/Link";
import clsx from "clsx";
import { makeStyles } from "@mui/styles";

export interface StatementSectionProps extends Omit<PaperProps, "onChange"> {
  index: number;
  src: string;
  title: string;
  value: string;
  checked?: boolean;
  onChange?: CheckboxProps["onChange"];
  uploadFileExtensionName: string;
}

const useStyles = makeStyles(() => ({
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  showLoader: {
    display: "flex",
  },
}));

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_INTERVAL = 4000;

const StatementSection: FC<StatementSectionProps> = function (props) {
  const theme = useTheme();
  const {
    index,
    src: srcProp,
    title,
    value,
    checked,
    onChange,
    uploadFileExtensionName,
    ...other
  } = props;

  const classes = useStyles();

  const googleDriveViewer =
    "https://drive.google.com/viewerng/viewer?embedded=true&url=";
  const viewerUrl = googleDriveViewer + srcProp;

  const [src, setSrc] = useState("");
  const [isPDFLoaded, setIsPDFLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const ALLOWED_FORMATS = ["doc", "docx", "pdf", "jpg", "jpeg", "png"];
  const fileUrl = src.replace(googleDriveViewer, "");

  const handleReload = useCallback(() => {
    setSrc("");
    setTimeout(() => {
      setSrc(viewerUrl);
      setIsPDFLoaded(false);
      setRetryCount(0);
    }, 500);
  }, [viewerUrl]);

  // Initialize src to iframe after interval with PDF list indexs
  useEffect(() => {
    if (iframeRef.current && viewerUrl && !isPDFLoaded) {
      setTimeout(() => {
        setSrc(viewerUrl);
        setIsPDFLoaded(false);
      }, index * 1000);
    }
  }, [index, viewerUrl, isPDFLoaded]);

  // Retry one-cycle
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (
      iframeRef.current &&
      viewerUrl &&
      !isPDFLoaded &&
      retryCount > 0 &&
      retryCount <= MAX_RETRY_ATTEMPTS
    ) {
      const timer = setTimeout(() => {
        setSrc("");
        setTimeout(() => {
          setSrc(viewerUrl);
          setIsPDFLoaded(false);
        }, 500);
      }, RETRY_INTERVAL);
      return () => clearTimeout(timer);
    }
  }, [retryCount, viewerUrl, isPDFLoaded]);

  // Start reloading mechanism if PDF not loaded with checking later than RETRY_INTERVAL
  useEffect(() => {
    const checkIframeLoaded = () => {
      if (
        iframeRef.current &&
        src !== "" &&
        !isPDFLoaded &&
        retryCount <= MAX_RETRY_ATTEMPTS
      ) {
        setRetryCount((prevCount) => prevCount + 1);
      }
    };

    if (iframeRef.current && src !== "" && isPDFLoaded) {
      setRetryCount(0);
    }

    const timer = setTimeout(checkIframeLoaded, RETRY_INTERVAL);
    return () => clearTimeout(timer);
  }, [src, retryCount, isPDFLoaded]);

  // PDF viewer network resource monitoring
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const decodedViewerUrl = decodeURIComponent(viewerUrl);

      entries.forEach((entry) => {
        const decodedEntryName = decodeURIComponent(entry.name);
        if (
          entry.entryType === "resource" &&
          decodedEntryName.includes(decodedViewerUrl)
        ) {
          setIsPDFLoaded(true);
        }
      });
    });

    observer.observe({ entryTypes: ["resource"] });

    return () => {
      observer.disconnect();
    };
  }, [viewerUrl]);

  return (
    <Paper {...other}>
      <Typography variant="h4" gutterBottom>
        閱讀同意書
        {retryCount > 0 && retryCount <= MAX_RETRY_ATTEMPTS && ` ... 載入中 `}
        {retryCount > MAX_RETRY_ATTEMPTS && ` ... 若看不到內容請點擊重新載入`}
      </Typography>
      <Box position="relative" sx={{ width: "auto", height: "auto" }}>
        <Box
          id={`iframe-pdf-viewer-loader-${index}`}
          className={clsx(classes.loader, !isPDFLoaded && classes.showLoader)}
        >
          {!isPDFLoaded && retryCount <= MAX_RETRY_ATTEMPTS && (
            <CircularProgress />
          )}
          {!isPDFLoaded && retryCount > MAX_RETRY_ATTEMPTS && (
            <Stack
              direction={"column"}
              alignItems={"center"}
              textAlign={"center"}
              spacing={1}
            >
              <Typography variant="h4" gutterBottom>{` 載入中 `}</Typography>
            </Stack>
          )}
        </Box>
        <iframe
          id={`iframe-pdf-viewer-${index}-title`}
          ref={iframeRef}
          src={src}
          title={title}
          width="100%"
          height="768px"
          style={{ position: "relative" }}
        />
      </Box>

      <Button
        fullWidth
        variant="outlined"
        color="primary"
        onClick={handleReload}
      >
        重新載入
      </Button>
      <Box display="flex" justifyContent="center" alignItems="center">
        <FormControlLabel
          label="我同意"
          control={
            <Checkbox value={value} checked={checked} onChange={onChange} />
          }
          sx={{
            "&.MuiFormControlLabel-root span.MuiTypography-root": {
              color: theme.palette.text.primary,
            },
          }}
        />
        {!ALLOWED_FORMATS.includes(uploadFileExtensionName) && (
          <Link
            href={fileUrl}
            color="primary"
            underline="always"
            target="_blank"
            rel="noopener noreferrer"
            download={title}
          >
            {title}
          </Link>
        )}
      </Box>
    </Paper>
  );
};

export default StatementSection;
