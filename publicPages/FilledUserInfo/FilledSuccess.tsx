import React, { FC } from "react";

import Image from "next/legacy/image";
import FroalaEditorView from "components/FroalaEditorView";
import Main from "@eGroupAI/material-layout/Main";
import Container from "@eGroupAI/material/Container";
import Paper from "@eGroupAI/material/Paper";
import Box from "@eGroupAI/material/Box";
import Typography from "@eGroupAI/material/Typography";

export interface FilledSuccessProps {
  message?: string;
  src?: string;
}

const FilledSuccess: FC<FilledSuccessProps> = function (props) {
  const { src, message } = props;

  return (
    <Main>
      <Container maxWidth="sm">
        <Paper>
          <Image
            src={src || "/images/done.jpg"}
            height={200}
            width={300}
            layout="responsive"
            alt="Photo by Vasily Koloda on Unsplash"
            unoptimized
          />
          <Box p={3}>
            <Typography variant="h4" align="center">
              <FroalaEditorView model={message || "恭喜完成！"} />
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Main>
  );
};

export default FilledSuccess;
