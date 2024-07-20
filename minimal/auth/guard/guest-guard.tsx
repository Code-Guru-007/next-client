import { useCallback, useEffect } from "react";
// routes
// import { paths } from "minimal/routes/paths";
//
import { useAuthContext } from "../hooks";

// ----------------------------------------------------------------------

type GuestGuardProps = {
  children: React.ReactNode;
};

export default function GuestGuard({ children }: GuestGuardProps) {
  const { authenticated } = useAuthContext();

  const check = useCallback(() => {
    if (authenticated) {
      // router.replace(paths.dashboard.root);
    }
  }, [authenticated]);

  useEffect(() => {
    check();
  }, [check]);

  return <>{children}</>;
}
