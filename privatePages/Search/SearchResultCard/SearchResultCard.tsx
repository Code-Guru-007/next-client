import React, { ReactNode, useMemo } from "react";
import { useRouter } from "next/router";
import { zhCN } from "date-fns/locale";
import { zonedTimeToUtc } from "date-fns-tz";
import FileSaver from "file-saver";

import { makeStyles } from "@mui/styles";
import { Avatar, Divider, Stack, Typography } from "@mui/material";
import PushPinRoundedIcon from "@mui/icons-material/PushPinRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import WbIncandescentRoundedIcon from "@mui/icons-material/WbIncandescentRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import RemoveRedEyeRoundedIcon from "@mui/icons-material/RemoveRedEyeRounded";

import { format } from "@eGroupAI/utils/dateUtils";
import Tooltip from "@eGroupAI/material/Tooltip";
import IconButton from "components/IconButton/StyledIconButton";
import getFileNameFromContentDisposition from "utils/getFileNameFromContentDisposition";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";
import { OrganizationTagTarget } from "interfaces/entities";
import OrgTagsInDataTableRow from "components/OrgTagsInDataTableRow";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    margin: theme.spacing(3, 0),
    boxShadow: theme.shadows[4],
    borderRadius: (theme.shape.borderRadius as number) * 2,
  },
  headerTitle: {
    fontSize: "14px",
    fontWeight: 400,
    lineHeight: "28px",
    color: theme.palette.grey[500],
  },
  tags: {
    display: "flex",
    alignItems: "center",
  },
  title: {
    color: "#2065D1",
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  content: {
    fontWeight: 400,
    fontSize: 16,
    lineHeight: "24px",
    color: theme.palette.grey[800],
    marginTop: theme.spacing(2),
    "& em": {
      color: theme.palette.error.main,
      fontStyle: "normal",
    },
  },
  contentText: {
    wordBreak: "break-all",
  },
  avatarButton: {
    padding: 0,
  },
  date: {
    color: theme.palette.grey[800],
    fontWeight: 400,
    fontSize: 14,
    lineHeight: "22px",
    marginLeft: "16px",
    textAlign: "end",
  },
  icon: {
    cursor: "pointer",
    float: "right",
  },
}));

const SearchServiceModuleMapping = {
  BULLETIN: {
    text: "佈告欄",
    icon: <PushPinRoundedIcon style={{ transform: "rotate(45deg)" }} />,
    link: "bulletins",
  },
  ARTICLE: {
    text: "文章",
    icon: <WbIncandescentRoundedIcon style={{ transform: "rotate(180deg)" }} />,
    link: "articles",
  },
  EVENT: {
    text: "事件",
    icon: <ArticleRoundedIcon />,
    link: "events",
  },
  FILES: {
    text: "檔案",
    icon: <FolderRoundedIcon />,
    link: "upload-files",
  },
};

export interface SearchResultCardProps {
  organizationId: string;
  title?: ReactNode;
  content?: string;
  updateDate?: string;
  searchServiceModule: string;
  searchId: string;
  creatorName: string;
  organizationTagTargetList: OrganizationTagTarget[];
}

const SearchResultCard = (props: SearchResultCardProps) => {
  const wordLibrary = useSelector(getWordLibrary);
  const {
    organizationId,
    title,
    content,
    updateDate,
    searchServiceModule,
    searchId,
    creatorName,
    organizationTagTargetList,
  } = props;
  const classes = useStyles();
  const router = useRouter();

  const { excute: previewOrgFile } = useAxiosApiWrapper(
    apis.org.previewOrgFile,
    "None"
  );

  const { excute: downloadOrgFile } = useAxiosApiWrapper(
    apis.org.downloadOrgFile,
    "None"
  );

  const handleClickLink = async (e) => {
    e.preventDefault();
    if (searchServiceModule === "FILES") {
      const resp = await previewOrgFile({
        organizationId,
        uploadFileId: searchId,
      });
      return window.open(resp.data, "_blank");
    }
    return router.push(e.target.href);
  };

  const handleDownloadFile = async () => {
    const resp = await downloadOrgFile({
      organizationId,
      uploadFileId: searchId,
    });
    const filename = getFileNameFromContentDisposition(
      resp.headers["content-disposition"] as string
    );
    FileSaver.saveAs(resp.data, filename);
  };

  const handlePreviewFile = async () => {
    const resp = await previewOrgFile({
      organizationId,
      uploadFileId: searchId,
    });
    return window.open(resp.data, "_blank");
  };

  const avatarLetters = useMemo(() => {
    const firstName = creatorName?.split(" ")[0];
    const secondName = creatorName?.split(" ")[1];
    let fLetter: string | undefined;
    let sLetter: string | undefined;
    if (firstName) fLetter = firstName[0] as string;
    if (secondName) sLetter = secondName[0] as string;
    return fLetter?.concat(sLetter || "");
  }, [creatorName]);

  return (
    <div className={classes.root}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <div className={classes.headerTitle}>
          {SearchServiceModuleMapping[searchServiceModule]?.text}
        </div>
        <Typography variant="body1" className={classes.tags}>
          <OrgTagsInDataTableRow
            organizationTagTargetList={organizationTagTargetList}
          />
        </Typography>
      </Stack>
      <Typography
        variant="h6"
        component="a"
        href={`/me/${SearchServiceModuleMapping[searchServiceModule]?.link}/${searchId}`}
        onClick={handleClickLink}
        className={classes.title}
      >
        {title}
      </Typography>
      {searchServiceModule === "FILES" && (
        <>
          <Tooltip
            title={wordLibrary?.["preview file"] ?? "預覽檔案"}
            className={classes.icon}
          >
            <IconButton onClick={handlePreviewFile}>
              <RemoveRedEyeRoundedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={wordLibrary?.["download file"] ?? "下載檔案"}
            className={classes.icon}
          >
            <IconButton onClick={handleDownloadFile}>
              <DownloadRoundedIcon />
            </IconButton>
          </Tooltip>
        </>
      )}

      <Typography className={classes.content}>
        {content && (
          <div
            dangerouslySetInnerHTML={{
              __html: content,
            }}
            className={classes.contentText}
          />
        )}
      </Typography>
      <Divider sx={{ my: 3 }} />
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton className={classes.avatarButton}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: (theme) => theme.palette.primary.main,
                border: (theme) =>
                  `solid 2px ${theme.palette.background.default}`,
              }}
            >
              {avatarLetters?.toUpperCase()}
            </Avatar>
          </IconButton>
          <Typography variant="subtitle2">{creatorName}</Typography>
        </Stack>

        <Typography className={classes.date}>
          {updateDate &&
            format(
              zonedTimeToUtc(new Date(updateDate), "Asia/Taipei"),
              "PP pp",
              {
                locale: zhCN,
              }
            )}
        </Typography>
      </Stack>
    </div>
  );
};

export default SearchResultCard;
