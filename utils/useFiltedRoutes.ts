import useFilterRoutes from "@eGroupAI/hooks/apis/useFilterRoutes";
import { RoutesServiceModuleValue } from "interfaces/utils";
import moduleRouteMapping from "./moduleRouteMapping";
import routes from "./routes";

const defaultCommonModuleValues = [
  "COMMON",
  "SETTINGS_PRIVACY",
  "SUPPORT",
  "MESSAGES",
];

export default function useFiltedRoutes(
  /**
   * Additional common available modules
   * @default undefined - All default common values
   */
  commonModuleValues?: string[]
) {
  const filtedRoutes = useFilterRoutes<RoutesServiceModuleValue>(
    moduleRouteMapping,
    routes,
    commonModuleValues || defaultCommonModuleValues
  );

  return filtedRoutes;
}
