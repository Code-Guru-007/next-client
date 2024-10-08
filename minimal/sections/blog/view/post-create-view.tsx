"use client";

// @mui
import Container from "@mui/material/Container";
// routes
import { paths } from "minimal/routes/paths";
// components
import { useSettingsContext } from "minimal/components/settings";
import CustomBreadcrumbs from "minimal/components/custom-breadcrumbs";
//
import PostNewEditForm from "../post-new-edit-form";

// ----------------------------------------------------------------------

export default function PostCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : "lg"}>
      <CustomBreadcrumbs
        headingText="Create a new post"
        links={[
          {
            name: "Dashboard",
            href: paths.dashboard.root,
          },
          {
            name: "Blog",
            href: paths.dashboard.post.root,
          },
          {
            name: "Create",
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <PostNewEditForm />
    </Container>
  );
}
