import React, { FC, HTMLAttributes } from "react";

import Typography from "@eGroupAI/material/Typography";
import { useSelector } from "react-redux";
import Grid from "@eGroupAI/material/Grid";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import useFileEvents from "utils/useFileEvents";
import FileCard from "components/FileCard";

export type Item = {
  id: string;
  name: string;
  size: number;
  date: string;
  icon: string;
  path: string;
};

export interface FilesSectionProps extends HTMLAttributes<HTMLDivElement> {
  items?: Item[];
}

const FilesSection: FC<FilesSectionProps> = function (props) {
  const { items, ...other } = props;
  const wordLibrary = useSelector(getWordLibrary);
  const { handleDownloadFile, handlePreviewFile } = useFileEvents();
  const isEmpty = items?.length === 0;

  const renderContent = () => {
    if (isEmpty) {
      return (
        <Typography variant="body1">
          {wordLibrary?.["no data available"] ?? "無資料"}
        </Typography>
      );
    }
    return (
      <Grid
        container
        rowSpacing={{ xs: 1, sm: 2, lg: 4 }}
        columnSpacing={{ xs: 2, sm: 3, md: 4, lg: 6 }}
        alignItems="flex-start"
      >
        {items?.map((el) => (
          <Grid item xs={6} sm={6} md={6} lg={4} key={el.id}>
            <FileCard
              iconName={el.icon}
              fileName={el.name}
              fileSize={el.size}
              fileCreateDate={el.date}
              onDownload={() => {
                handleDownloadFile(el.id);
              }}
              onPreview={() => {
                handlePreviewFile(el.id);
              }}
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <div {...other}>
      <Typography variant="h4" gutterBottom>
        {wordLibrary?.file ?? "檔案"}
      </Typography>

      {renderContent()}
    </div>
  );
};

export default FilesSection;
