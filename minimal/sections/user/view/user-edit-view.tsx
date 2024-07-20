"use client";

// @mui
import Container from "@mui/material/Container";
// routes
import { paths } from "minimal/routes/paths";
// _mock
import { _userList } from "minimal/_mock";
// components
import { useSettingsContext } from "minimal/components/settings";
import CustomBreadcrumbs from "minimal/components/custom-breadcrumbs";
//
import UserNewEditForm from "../user-new-edit-form";

// ----------------------------------------------------------------------

export default function UserEditView() {
  const settings = useSettingsContext();

  const id = "params";

  const currentUser = _userList.find((user) => user.id === id);

  return (
    <Container maxWidth={settings.themeStretch ? false : "lg"}>
      <CustomBreadcrumbs
        headingText="Edit"
        links={[
          {
            name: "Dashboard",
            href: paths.dashboard.root,
          },
          {
            name: "User",
            href: paths.dashboard.user.root,
          },
          { name: currentUser?.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <UserNewEditForm currentUser={currentUser} />
    </Container>
  );
}
