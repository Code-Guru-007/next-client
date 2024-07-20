import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useReduxDialog } from "@eGroupAI/redux-modules";

import apis from "utils/apis";
import { Locale } from "interfaces/utils";
import { useShareReurl } from "utils/useShareReurl";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";

import { Main } from "@eGroupAI/material-layout";
import { Container } from "@eGroupAI/material";
import { Box, Grid, Typography } from "@mui/material";
import { AccessOrganizationModuleShare } from "interfaces/entities";
import FroalaEditorView from "components/FroalaEditorView";
import EditorNavigation from "components/EditorNavigation";

import PasswordRequiredToViewShareDialog, {
  DIALOG,
} from "./PasswordRequiredToViewShareDialog";

export default function OrganizationShareModule() {
  const { query, replace } = useRouter();

  const { openDialog } = useReduxDialog(DIALOG);

  const [shareContent, setShareContent] =
    useState<AccessOrganizationModuleShare>();
  const contentRef = useRef<HTMLDivElement>(null);

  const { excute: accessOrgModuleShare } = useAxiosApiWrapper(
    apis.org.accessOrgModuleShare,
    "None"
  );

  const { data } = useShareReurl(
    {
      organizationShareShortUrl: query.shortURL as string,
    },
    {
      locale: Locale.ZH_TW,
    },
    {
      onError: (err) => {
        if (err.response?.status === 403) {
          replace(`/url-invalid`);
        }
      },
    }
  );

  const [passwordVerified, setPasswordVerified] = useState<boolean>(false);

  useEffect(() => {
    if (
      data?.organizationShareTargetType &&
      ((data.organizationShareTargetType as string) || "").toLowerCase() !==
        "bulletin" &&
      ((data.organizationShareTargetType as string) || "").toLowerCase() !==
        "article"
    ) {
      replace(`/url-invalid`);
    }
  }, [data?.organizationShareTargetType, replace]);

  useEffect(() => {
    if (data?.isSharePasswordRequired === "NO") {
      accessOrgModuleShare({
        organizationId: data.organization?.organizationId as string,
        shareId: data.organizationShareId as string,
        organizationSharePassword: "",
      })
        .then((res) => {
          setPasswordVerified(true);
          setShareContent({ ...res.data });
        })
        .catch(() => {});
    }
  }, [
    accessOrgModuleShare,
    data?.isSharePasswordRequired,
    data?.organization?.organizationId,
    data?.organizationShareId,
  ]);

  if (data?.isSharePasswordRequired === "YES" && !passwordVerified) {
    openDialog();
    return (
      <>
        <Box>
          <PasswordRequiredToViewShareDialog
            organizationId={data?.organization?.organizationId as string}
            shareId={data?.organizationShareId as string}
            setShareContent={setShareContent}
            setPasswordVerified={setPasswordVerified}
          />
        </Box>
      </>
    );
  }
  if (
    data?.isSharePasswordRequired === "NO" ||
    (data?.isSharePasswordRequired === "YES" && passwordVerified)
  ) {
    return (
      <>
        <Main sx={{ display: "flex" }}>
          <Grid>
            <EditorNavigation
              editorRef={contentRef}
              title={
                ((data?.organizationShareTargetType as string).toLowerCase() ===
                "article"
                  ? shareContent?.articleTitle
                  : shareContent?.bulletinTitle) || ""
              }
              content={
                ((data?.organizationShareTargetType as string).toLowerCase() ===
                "article"
                  ? shareContent?.articleContent
                  : shareContent?.bulletinContent) || ""
              }
            />
          </Grid>
          <Container
            noWrapper
            sx={{
              maxWidth: "745px !important",
              padding: "92px 40px 180px !important",
            }}
          >
            <Grid>
              <Box>
                <Typography
                  variant="h3"
                  className="fr-element fr-view"
                  sx={{ fontSize: "40px !important", mb: "32px" }}
                >
                  {(
                    data?.organizationShareTargetType as string
                  ).toLowerCase() === "article"
                    ? shareContent?.articleTitle
                    : shareContent?.bulletinTitle}
                </Typography>
                <Grid ref={contentRef}>
                  <FroalaEditorView
                    model={
                      (
                        data?.organizationShareTargetType as string
                      ).toLowerCase() === "article"
                        ? shareContent?.articleContent
                        : shareContent?.bulletinContent
                    }
                  />
                </Grid>
              </Box>
            </Grid>
          </Container>
        </Main>
      </>
    );
  }
}
