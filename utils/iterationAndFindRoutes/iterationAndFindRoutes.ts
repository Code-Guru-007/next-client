import { Route } from "@eGroupAI/typings/apis";

function findRoutes(
  routes: Route[],
  targetPath: string,
  parentRoutes?: Route[]
): [Route | null, Route[]] {
  let result: Route | null = null;
  let parents: Route[] = parentRoutes || [];

  routes.forEach((el) => {
    if (result === null) {
      if (targetPath === el.path) {
        result = el;
      } else if (el.routes) {
        const [r, p] = findRoutes(el.routes, targetPath, [...parents, el]);
        if (r) {
          parents = p;
          result = r;
        }
      }
    }
  });

  return [result, parents];
}

/**
 * iteration routes and find targetPath and it's parents route.
 */
export default function iterationAndFindRoutes(
  routes: Route[],
  targetPath: string
): Route[] {
  let results: Route[] = [];

  routes.forEach((el) => {
    if (el.path === targetPath) {
      results = [el];
    } else if (el.routes) {
      const [result, parents] = findRoutes(el.routes, targetPath, [el]);
      if (result) {
        results = [...parents, result];
      }
    }
  });

  return results;
}
