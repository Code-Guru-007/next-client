/* eslint-disable @typescript-eslint/no-explicit-any */
import { Route } from "@eGroupAI/typings/apis";
import iterationAndFindRoutes from "./iterationAndFindRoutes";

const routes: Route[] = [
  {
    breadcrumbName: "網站管理",
    path: "/me/cms",
    collapse: true,
    routes: [
      {
        path: "/me/cms/home",
        breadcrumbName: "首頁管理",
      },
      {
        path: "/me/cms/about",
        breadcrumbName: "關於我們",
        routes: [
          {
            path: "/me/cms/about/home",
            breadcrumbName: "關於我們首頁",
          },
        ],
      },
      {
        path: "/me/cms/products",
        breadcrumbName: "產品管理",
      },
      {
        path: "/me/cms/solutions",
        breadcrumbName: "解決方案",
      },
      {
        path: "/me/cms/blogs",
        breadcrumbName: "文章",
      },
      {
        path: "/me/cms/settings",
        breadcrumbName: "設定",
        routes: [
          {
            path: "/me/cms/settings/home",
            breadcrumbName: "設定首頁",
          },
        ],
      },
    ],
  },
  {
    breadcrumbName: "網站管理",
    collapse: true,
    routes: [
      {
        path: "/me/kms/home",
        breadcrumbName: "首頁管理",
      },
      {
        path: "/me/kms/about",
        breadcrumbName: "關於我們",
      },
      {
        path: "/me/kms/products",
        breadcrumbName: "產品管理",
      },
      {
        path: "/me/kms/solutions",
        breadcrumbName: "解決方案",
      },
      {
        path: "/me/kms/blogs",
        breadcrumbName: "文章",
      },
      {
        path: "/me/kms/settings",
        breadcrumbName: "設定",
      },
    ],
  },
  {
    path: "/me/tag-groups",
    breadcrumbName: "標籤管理",
  },
  {
    path: "/me/event/events",
    breadcrumbName: "事件管理",
    routes: [
      {
        path: "/me/event/events/[eventId]",
      },
    ],
  },
];

describe("iterationAndFindRoutes", () => {
  it("should iteration And Find Routes.", () => {
    const result = [routes[0], (routes[0] as any).routes[0]];
    expect(iterationAndFindRoutes(routes, "/me/cms/home")).toEqual(result);
  });

  it("should iteration And Find Routes 2.", () => {
    const result = [routes[1], (routes[1] as any).routes[0]];
    expect(iterationAndFindRoutes(routes, "/me/kms/home")).toEqual(result);
  });

  it("should iteration And Find Routes 3.", () => {
    const result = [
      routes[0],
      (routes[0] as any).routes[5],
      (routes[0] as any).routes[5].routes[0],
    ];
    expect(iterationAndFindRoutes(routes, "/me/cms/settings/home")).toEqual(
      result
    );
  });

  it("should iteration And Find Routes 4.", () => {
    const result = [
      routes[0],
      (routes[0] as any).routes[5],
      (routes[0] as any).routes[5].routes[0],
    ];
    expect(iterationAndFindRoutes(routes, "/me/cms/settings/home")).toEqual(
      result
    );
  });

  it("should iteration And Find Routes 5.", () => {
    const result = [routes[2]];
    expect(iterationAndFindRoutes(routes, "/me/tag-groups")).toEqual(result);
  });

  it("should iteration And Find Routes 6.", () => {
    const result = [routes[3]];
    expect(iterationAndFindRoutes(routes, "/me/event/events")).toEqual(result);
  });
});
