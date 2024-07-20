import React from "react";
import { Route } from "@eGroupAI/typings/apis";

// import DashboardIcon from "@mui/icons-material/Dashboard";
import HomeIcon from "@mui/icons-material/Home";
import IndexIcon from "@mui/icons-material/List";
import ProductIcon from "@mui/icons-material/Inventory";
import BlogIcon from "@mui/icons-material/Article";
import SolutionIcon from "@mui/icons-material/Extension";
import SmsIcon from "@mui/icons-material/Sms";
import PersonIcon from "@mui/icons-material/PersonAdd";
import ManageIcon from "@mui/icons-material/ManageAccounts";
import RoleIcon from "@mui/icons-material/SupervisedUserCircle";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import InfoIcon from "@mui/icons-material/Info";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import EventIcon from "@mui/icons-material/Event";
import FeedbackIcon from "@mui/icons-material/Feedback";
import PushPinRoundedIcon from "@mui/icons-material/PushPinRounded";
import FileIcon from "@mui/icons-material/FolderCopy";
import HandshakeRoundedIcon from "@mui/icons-material/HandshakeRounded";
import ViewModuleRoundedIcon from "@mui/icons-material/ViewModuleRounded";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import DraftsIcon from "@mui/icons-material/Drafts";
import WidgetsIcon from "@mui/icons-material/WidgetsRounded";
import SettingsIcon from "@mui/icons-material/SettingsRounded";
import LockIcon from "@mui/icons-material/LockRounded";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulletedRounded";
import LanguageIcon from "@mui/icons-material/LanguageRounded";
// import ContactSupportIcon from "@mui/icons-material/ContactSupportRounded";
import MessageIcon from "@mui/icons-material/Message";

const routes: Route[] = [
  // {
  //   path: "/me",
  //   breadcrumbName: "儀表板",
  //   menuIcon: <DashboardIcon color="inherit" />,
  // },
  {
    breadcrumbName: "單位管理",
    menuIcon: <InfoIcon color="inherit" />,
    collapse: true,
    pathParent: "/me/org",
    routes: [
      {
        path: "/me/org-info",
        menuIcon: <InfoIcon color="inherit" />,
        breadcrumbName: "單位資料維護",
      },
      {
        path: "/me/org-group",
        menuIcon: <IndexIcon color="inherit" />,
        breadcrumbName: "單位群組",
        routes: [
          {
            path: "/me/org-group/[groupId]",
          },
          {
            breadcrumbName: "標籤管理",
            path: "/me/org-group/tag-groups/[tagGroupId]",
          },
        ],
      },
    ],
  },
  {
    path: "/me/calendar",
    breadcrumbName: "日曆",
    menuIcon: <CalendarMonthIcon color="inherit" />,
  },
  {
    breadcrumbName: "網站管理",
    menuIcon: <HomeIcon color="inherit" />,
    collapse: true,
    pathParent: "/me/cms",
    routes: [
      {
        path: "/me/cms/home",
        breadcrumbName: "首頁管理",
        menuIcon: <IndexIcon color="inherit" />,
      },
      {
        path: "/me/cms/about",
        breadcrumbName: "關於我們",
        menuIcon: <InfoIcon color="inherit" />,
      },
      {
        path: "/me/cms/products",
        breadcrumbName: "產品管理",
        menuIcon: <ProductIcon color="inherit" />,
        routes: [
          {
            path: "/me/cms/products/[productId]",
          },
          {
            breadcrumbName: "標籤管理",
            path: "/me/cms/products/tag-groups/[tagGroupId]",
          },
        ],
      },
      {
        path: "/me/cms/solutions",
        breadcrumbName: "解決方案",
        menuIcon: <SolutionIcon color="inherit" />,
        routes: [
          {
            path: "/me/cms/solutions/[solutionId]",
          },
          {
            breadcrumbName: "標籤管理",
            path: "/me/cms/solutions/tag-groups/[tagGroupId]",
          },
        ],
      },
      {
        path: "/me/cms/blogs",
        breadcrumbName: "文章管理",
        menuIcon: <BlogIcon color="inherit" />,
        routes: [
          {
            path: "/me/cms/blogs/[blogId]",
          },
          {
            breadcrumbName: "標籤管理",
            path: "/me/cms/blogs/tag-groups/[tagGroupId]",
          },
        ],
      },
      {
        path: "/me/cms/menu",
        breadcrumbName: "選單管理",
        menuIcon: <SmsIcon color="inherit" />,
        routes: [
          {
            path: "/me/cms/menu/navbar",
            breadcrumbName: "導覽列選單管理",
          },
          {
            path: "/me/cms/menu/home",
            breadcrumbName: "首頁選單管理",
          },
          {
            path: "/me/cms/menu/product",
            breadcrumbName: "產品頁選單管理",
          },
          {
            path: "/me/cms/menu/blog",
            breadcrumbName: "文章頁選單管理",
          },
        ],
      },
      {
        path: "/me/cms/feedbacks",
        breadcrumbName: "聯絡我們",
        menuIcon: <FeedbackIcon color="inherit" />,
        routes: [
          {
            path: "/me/cms/feedbacks/[feedbackId]",
          },
          {
            breadcrumbName: "標籤管理",
            path: "/me/cms/feedbacks/tag-groups/[tagGroupId]",
          },
        ],
      },
      // {
      //   path: "/me/cms/settings",
      //   breadcrumbName: "設定",
      // },
    ],
  },
  {
    collapse: true,
    pathParent: "/me/event",
    breadcrumbName: "事件管理",
    menuIcon: <EventIcon color="inherit" />,
    routes: [
      {
        breadcrumbName: "儀表板",
        path: "/me/event/dashboard",
      },
      {
        path: "/me/event/events",
        breadcrumbName: "事件列表",
        menuIcon: <EventIcon color="inherit" />,
        routes: [
          {
            path: "/me/event/events/[eventId]",
          },
          {
            breadcrumbName: "標籤管理",
            path: "/me/event/events/tag-groups/[tagGroupId]",
          },
        ],
      },
    ],
  },
  {
    breadcrumbName: "客戶管理",
    menuIcon: <AssignmentIndIcon color="inherit" />,
    collapse: true,
    pathParent: "/me/crm",
    routes: [
      {
        path: "/me/crm/users",
        breadcrumbName: "個人列表",
        menuIcon: <PersonIcon color="inherit" />,
        routes: [
          {
            path: "/me/crm/users/[userId]",
            // breadcrumbName: "個人資料",
            routes: [
              {
                breadcrumbName: "相關事件",
                path: "/me/crm/users/[userId]/events/[eventId]",
              },
              {
                breadcrumbName: "個人資料-Shared",
                path: "/me/crm/users/[userId]/shared/[sharedOrganizationId]",
              },
              {
                breadcrumbName: "標籤管理",
                path: "/me/crm/users/tag-groups/[tagGroupId]",
              },
              {
                breadcrumbName: "財務標籤管理",
                path: "/me/crm/users/finance-tag-management/[tagGroupId]",
              },
            ],
          },
        ],
      },
      {
        path: "/me/crm/partners",
        breadcrumbName: "單位列表",
        menuIcon: <HandshakeRoundedIcon color="inherit" />,
        routes: [
          {
            path: "/me/crm/partners/[partnerId]",
            routes: [
              {
                breadcrumbName: "相關事件",
                path: "/me/crm/partners/[partnerId]/events/[eventId]",
              },
              {
                breadcrumbName: "標籤管理",
                path: "/me/crm/partners/tag-groups/[tagGroupId]",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "/me/bulletins",
    breadcrumbName: "佈告欄",
    menuIcon: <PushPinRoundedIcon color="inherit" />,
    routes: [
      {
        path: "/me/bulletins/[bulletinId]",
        routes: [
          {
            path: "/me/bulletins/[bulletinId]/edit",
          },
          {
            breadcrumbName: "標籤管理",
            path: "/me/bulletins/tag-groups/[tagGroupId]",
          },
        ],
      },
      {
        path: "/me/bulletins/new",
        breadcrumbName: "新公告",
      },
    ],
  },
  {
    breadcrumbName: "人員管理",
    menuIcon: <SupervisorAccountIcon color="inherit" />,
    collapse: true,
    pathParent: "/me/members",
    routes: [
      {
        path: "/me/members/list",
        breadcrumbName: "成員管理",
        menuIcon: <ManageIcon color="inherit" />,
        routes: [
          {
            path: "/me/members/list/[memberId]",
            routes: [
              {
                breadcrumbName: "相關事件",
                path: "/me/members/list/[memberId]/events/[eventId]",
              },
            ],
          },
        ],
      },
      {
        path: "/me/members/roles",
        breadcrumbName: "角色管理",
        menuIcon: <RoleIcon color="inherit" />,
      },
    ],
  },
  // {
  //   path: "/me/tag-groups/[tagGroupId]",
  // },
  {
    path: "/me/articles",
    breadcrumbName: "文章討論",
    menuIcon: <BlogIcon color="inherit" />,
    routes: [
      {
        path: "/me/articles/[articleId]",
        routes: [
          {
            path: "/me/articles/[articleId]/edit",
          },
          {
            breadcrumbName: "標籤管理",
            path: "/me/articles/tag-groups/[tagGroupId]",
          },
        ],
      },
      {
        path: "/me/articles/new",
        breadcrumbName: "新增文章",
      },
    ],
  },
  {
    path: "/me/upload-files",
    breadcrumbName: "檔案管理",
    menuIcon: <FileIcon color="inherit" />,
    routes: [
      {
        path: "/me/upload-files/tag-groups",
        routes: [
          {
            breadcrumbName: "標籤管理",
            path: "/me/upload-files/tag-groups/[tagGroupId]",
          },
        ],
      },
    ],
  },
  {
    path: "/me/search",
    // breadcrumbName: "全文檢索",
    // menuIcon: <SearchIcon color="inherit" />,
  },
  {
    path: "/me/order-module",
    breadcrumbName: "訂閱管理",
    menuIcon: <ViewModuleRoundedIcon color="inherit" />,
  },
  {
    breadcrumbName: "SMS",
    menuIcon: <SmsRoundedIcon color="inherit" />,
    collapse: true,
    pathParent: "/me/sms",
    routes: [
      {
        path: "/me/sms",
        breadcrumbName: "簡訊管理",
        menuIcon: <SmsRoundedIcon color="inherit" />,
      },
      {
        path: "/me/sms-template",
        breadcrumbName: "簡訊範本",
        menuIcon: <DraftsIcon color="inherit" />,
        routes: [
          {
            path: "/me/sms-template/[organizationSmsTemplateId]",
            // breadcrumbName: "簡訊範本細節",
          },
          {
            breadcrumbName: "標籤管理",
            path: "/me/sms-template/tag-groups/[tagGroupId]",
          },
        ],
      },
    ],
  },
  {
    breadcrumbName: "SES",
    menuIcon: <EmailRoundedIcon color="inherit" />,
    collapse: true,
    pathParent: "/me/ses",
    routes: [
      {
        path: "/me/ses",
        breadcrumbName: "電子郵件管理",
        menuIcon: <EmailRoundedIcon color="inherit" />,
      },
      {
        path: "/me/ses-template",
        breadcrumbName: "電子郵件範本",
        menuIcon: <DraftsIcon color="inherit" />,
        routes: [
          {
            path: "/me/ses-template/[organizationSesTemplateId]",
            // breadcrumbName: "範本細節",
          },
          {
            breadcrumbName: "標籤管理",
            path: "/me/ses-template/tag-groups/[tagGroupId]",
          },
        ],
      },
    ],
  },
  {
    breadcrumbName: "設定與隱私",
    menuIcon: <WidgetsIcon color="inherit" />,
    collapse: true,
    pathParent: "/me/settings-privacy",
    routes: [
      {
        path: "/me/settings-privacy/setting",
        breadcrumbName: "設定",
        menuIcon: <SettingsIcon color="inherit" />,
      },
      {
        path: "/me/settings-privacy/privacy",
        breadcrumbName: "隱私設定(敬請期待)",
        menuIcon: <LockIcon color="inherit" />,
      },
      {
        path: "/me/settings-privacy/activity",
        breadcrumbName: "活動紀錄(敬請期待)",
        menuIcon: <FormatListBulletedIcon color="inherit" />,
      },
      {
        path: "/me/settings-privacy/language",
        breadcrumbName: "語言",
        menuIcon: <LanguageIcon color="inherit" />,
      },
      /* {
        path: "/me/settings-privacy",
        breadcrumbName: "Interface Setting",
        menuIcon: <SettingsButton />,
      }, */
    ],
  },
  // {
  //   path: "/me/feedback",
  //   breadcrumbName: "意見回饋",
  //   menuIcon: <ContactSupportIcon color="inherit" />,
  // },
  {
    path: "/me/messages",
    breadcrumbName: "訊息管理",
    menuIcon: <MessageIcon color="inherit" />,
  },
];

export default routes;
