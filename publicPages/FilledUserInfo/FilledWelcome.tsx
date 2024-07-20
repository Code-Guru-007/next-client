import React, { FC, useState, useEffect } from "react";

import { ShareReurl } from "interfaces/entities";
import { useRouter } from "next/router";
import {
  setStart,
  setDefaultValues,
  setUserValues,
} from "redux/filledUserInfo";
import { useAppDispatch } from "redux/configureAppStore";

import FroalaEditorView from "components/FroalaEditorView";

import Image from "next/legacy/image";
import Main from "@eGroupAI/material-layout/Main";
import Container from "@eGroupAI/material/Container";
import Paper from "@eGroupAI/material/Paper";
import Box from "@eGroupAI/material/Box";
import Typography from "@eGroupAI/material/Typography";
import Button from "@eGroupAI/material/Button";

import { CircularProgress } from "@mui/material";
import useDefaultUserValues from "./useDefaultUserValues";

export interface FilledWelcomeProps {
  data?: ShareReurl;
  message?: string;
  src?: string;
  preview?: boolean;
  changeStep?: (value: number) => void;
}

const FilledWelcome: FC<FilledWelcomeProps> = function (props) {
  const dispatch = useAppDispatch();
  const { data, src, message, preview, changeStep } = props;
  const { query, push, pathname } = useRouter();
  const defaultUserValues = useDefaultUserValues(data);
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (src) {
      setImageSrc(src);
    } else {
      const timeoutId = setTimeout(() => {
        setImageSrc("/images/done.jpg");
        setIsLoaded(true);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [src]);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  return (
    <Main>
      <Container maxWidth="sm">
        <Paper>
          {!isLoaded && (
            <Box sx={{ position: "relative", width: "100%", height: "500px" }}>
              <CircularProgress
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
                color="primary"
              />
            </Box>
          )}
          {imageSrc && (
            <Image
              height={200}
              width={300}
              priority
              src={imageSrc}
              layout="responsive"
              alt="Photo by Vasily Koloda on Unsplash"
              unoptimized
              onLoad={handleImageLoad}
            />
          )}
          <Box p={3}>
            <Typography variant="h4" align="center" sx={{ mb: 3 }}>
              <FroalaEditorView model={message || "請開始填寫個人資訊。"} />
            </Typography>
            <Button
              onClick={() => {
                dispatch(setStart(true));
                dispatch(setDefaultValues());
                dispatch(setUserValues(defaultUserValues));
                if (preview && changeStep) {
                  changeStep(0);
                } else {
                  push({
                    pathname,
                    query: {
                      ...query,
                      step: 0,
                    },
                  });
                }
              }}
              fullWidth
              color="primary"
              variant="contained"
            >
              開始填寫
            </Button>
          </Box>
        </Paper>
      </Container>
    </Main>
  );
};

export default FilledWelcome;
