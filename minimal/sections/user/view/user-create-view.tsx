"use client";

// @mui
import Container from "@mui/material/Container";
// routes
import { paths } from "minimal/routes/paths";
// components
import { useSettingsContext } from "minimal/components/settings";
import CustomBreadcrumbs from "minimal/components/custom-breadcrumbs";
//
import UserNewEditForm from "../user-new-edit-form";

// ----------------------------------------------------------------------

export default function UserCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : "lg"}>
      <CustomBreadcrumbs
        headingText="Create a new user"
        links={[
          {
            name: "Dashboard",
            href: paths.dashboard.root,
          },
          {
            name: "User",
            href: paths.dashboard.user.root,
          },
          { name: "New user" },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <UserNewEditForm />
    </Container>
  );
}
