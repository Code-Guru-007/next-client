import { useEffect } from "react";
import useOrgMemberModules from "@eGroupAI/hooks/apis/useOrgMemberModules";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import useFiltedRoutes from "utils/useFiltedRoutes";

export default function useDetectModuleAuth() {
  const router = useRouter();
  const organizationId = useSelector(getSelectedOrgId);
  const { data } = useOrgMemberModules({
    organizationId,
  });
  const filtedRoutes = useFiltedRoutes();

  useEffect(() => {
    if (data && data.length > 0 && filtedRoutes) {
      switch (router.asPath) {
        case "/me": {
          // To find first route with path and redirect to it.
          let targetPath = filtedRoutes.find(
            (el) => el.path !== undefined
          )?.path;
          // if first route in not found will continue to sub routes.
          if (!targetPath) {
            for (let i = 0; i < filtedRoutes.length; i += 1) {
              targetPath = filtedRoutes[i]?.routes?.find(
                (el) => el.path !== undefined
              )?.path;
              if (targetPath) {
                break;
              }
            }
          }
          router.replace(targetPath || "/me/org-info");
          break;
        }
        default:
          break;
      }
    }
  }, [filtedRoutes, router, data]);
}
