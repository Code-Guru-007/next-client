import { useEffect } from "react";

import {
  resetBreadcrumbProps,
  setBreadcrumbProps,
} from "components/PrivateLayout/actions";
import { useAppDispatch } from "redux/configureAppStore";

export default function useBreadcrumb(breadcrumbName: string) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(
      setBreadcrumbProps({
        dynamicRoutes: [
          {
            breadcrumbName,
          },
        ],
      })
    );
    return () => {
      dispatch(resetBreadcrumbProps());
    };
  }, [breadcrumbName, dispatch]);
}
