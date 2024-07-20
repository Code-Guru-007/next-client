import { useMemo } from "react";
// routes
// import { paths } from "minimal/routes/paths";
// locales
import { useLocales } from "minimal/locales";
// components
// import Label from "minimal/components/label";
// import Iconify from "minimal/components/iconify";
// import SvgColor from "minimal/components/svg-color";

import HomeIcon from "@mui/icons-material/HomeOutlined";
// import IndexIcon from "@mui/icons-material/List";
// import ProductIcon from "@mui/icons-material/Inventory";
import BlogIcon from "@mui/icons-material/ArticleOutlined";
// import SolutionIcon from "@mui/icons-material/Extension";
// import SmsIcon from "@mui/icons-material/Sms";
// import PersonIcon from "@mui/icons-material/PersonAdd";
// import ManageIcon from "@mui/icons-material/ManageAccounts";
// import RoleIcon from "@mui/icons-material/SupervisedUserCircle";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccountOutlined";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonthOutlined";
import AssignmentIndIcon from "@mui/icons-material/AssignmentIndOutlined";
import EventIcon from "@mui/icons-material/EventOutlined";
// import FeedbackIcon from "@mui/icons-material/Feedback";
import PushPinRoundedIcon from "@mui/icons-material/PushPinOutlined";
import FileIcon from "@mui/icons-material/FolderCopyOutlined";
// import HandshakeRoundedIcon from "@mui/icons-material/HandshakeRounded";
import ViewModuleRoundedIcon from "@mui/icons-material/ViewModuleOutlined";
import SmsRoundedIcon from "@mui/icons-material/SmsOutlined";
import EmailRoundedIcon from "@mui/icons-material/EmailOutlined";
// import DraftsIcon from "@mui/icons-material/Drafts";
// import WidgetsIcon from "@mui/icons-material/WidgetsRounded";
// import SettingsIcon from "@mui/icons-material/SettingsRounded";
// import LockIcon from "@mui/icons-material/LockRounded";
// import FormatListBulletedIcon from "@mui/icons-material/FormatListBulletedRounded";
// import LanguageIcon from "@mui/icons-material/LanguageRounded";
import ContactSupportIcon from "@mui/icons-material/ContactSupportOutlined";
import MessageIcon from "@mui/icons-material/MessageOutlined";

// ----------------------------------------------------------------------

// const icon = (name: string) => (
//   <SvgColor
//     src={`/assets/icons/navbar/${name}.svg`}
//     sx={{ width: 1, height: 1 }}
//   />
//   // OR
//   // <Iconify icon="fluent:mail-24-filled" />
//   // https://icon-sets.iconify.design/solar/
//   // https://www.streamlinehq.com/icons
// );

// const ICONS = {
//   job: icon("ic_job"),
//   blog: icon("ic_blog"),
//   chat: icon("ic_chat"),
//   mail: icon("ic_mail"),
//   user: icon("ic_user"),
//   file: icon("ic_file"),
//   lock: icon("ic_lock"),
//   tour: icon("ic_tour"),
//   order: icon("ic_order"),
//   label: icon("ic_label"),
//   blank: icon("ic_blank"),
//   kanban: icon("ic_kanban"),
//   folder: icon("ic_folder"),
//   banking: icon("ic_banking"),
//   booking: icon("ic_booking"),
//   invoice: icon("ic_invoice"),
//   product: icon("ic_product"),
//   calendar: icon("ic_calendar"),
//   disabled: icon("ic_disabled"),
//   external: icon("ic_external"),
//   menuItem: icon("ic_menu_item"),
//   ecommerce: icon("ic_ecommerce"),
//   analytics: icon("ic_analytics"),
//   dashboard: icon("ic_dashboard"),
// };

// ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useLocales();

  const data = useMemo(
    () => [
      // OVERVIEW
      // ----------------------------------------------------------------------
      // {
      //   subheader: t("overview"),
      //   items: [
      //     {
      //       title: t("app"),
      //       path: paths.dashboard.root,
      //       icon: ICONS.dashboard,
      //     },
      //     {
      //       title: t("ecommerce"),
      //       path: paths.dashboard.general.ecommerce,
      //       icon: ICONS.ecommerce,
      //     },
      //     {
      //       title: t("analytics"),
      //       path: paths.dashboard.general.analytics,
      //       icon: ICONS.analytics,
      //     },
      //     {
      //       title: t("banking"),
      //       path: paths.dashboard.general.banking,
      //       icon: ICONS.banking,
      //     },
      //     {
      //       title: t("booking"),
      //       path: paths.dashboard.general.booking,
      //       icon: ICONS.booking,
      //     },
      //     {
      //       title: t("file"),
      //       path: paths.dashboard.general.file,
      //       icon: ICONS.file,
      //     },
      //   ],
      // },

      // MANAGEMENT
      // ----------------------------------------------------------------------
      // {
      //   subheader: t("management"),
      //   items: [
      //     // USER
      //     {
      //       title: t("user"),
      //       path: paths.dashboard.user.root,
      //       icon: ICONS.user,
      //       children: [
      //         { title: t("profile"), path: paths.dashboard.user.root },
      //         { title: t("cards"), path: paths.dashboard.user.cards },
      //         { title: t("list"), path: paths.dashboard.user.list },
      //         { title: t("create"), path: paths.dashboard.user.new },
      //         { title: t("edit"), path: paths.dashboard.user.demo.edit },
      //         { title: t("account"), path: paths.dashboard.user.account },
      //       ],
      //     },

      //     // PRODUCT
      //     {
      //       title: t("product"),
      //       path: paths.dashboard.product.root,
      //       icon: ICONS.product,
      //       children: [
      //         { title: t("list"), path: paths.dashboard.product.root },
      //         {
      //           title: t("details"),
      //           path: paths.dashboard.product.demo.details,
      //         },
      //         { title: t("create"), path: paths.dashboard.product.new },
      //         { title: t("edit"), path: paths.dashboard.product.demo.edit },
      //       ],
      //     },

      //     // ORDER
      //     {
      //       title: t("order"),
      //       path: paths.dashboard.order.root,
      //       icon: ICONS.order,
      //       children: [
      //         { title: t("list"), path: paths.dashboard.order.root },
      //         { title: t("details"), path: paths.dashboard.order.demo.details },
      //       ],
      //     },

      //     // INVOICE
      //     {
      //       title: t("invoice"),
      //       path: paths.dashboard.invoice.root,
      //       icon: ICONS.invoice,
      //       children: [
      //         { title: t("list"), path: paths.dashboard.invoice.root },
      //         {
      //           title: t("details"),
      //           path: paths.dashboard.invoice.demo.details,
      //         },
      //         { title: t("create"), path: paths.dashboard.invoice.new },
      //         { title: t("edit"), path: paths.dashboard.invoice.demo.edit },
      //       ],
      //     },

      //     // BLOG
      //     {
      //       title: t("blog"),
      //       path: paths.dashboard.post.root,
      //       icon: ICONS.blog,
      //       children: [
      //         { title: t("list"), path: paths.dashboard.post.root },
      //         { title: t("details"), path: paths.dashboard.post.demo.details },
      //         { title: t("create"), path: paths.dashboard.post.new },
      //         { title: t("edit"), path: paths.dashboard.post.demo.edit },
      //       ],
      //     },

      //     // JOB
      //     {
      //       title: t("job"),
      //       path: paths.dashboard.job.root,
      //       icon: ICONS.job,
      //       children: [
      //         { title: t("list"), path: paths.dashboard.job.root },
      //         { title: t("details"), path: paths.dashboard.job.demo.details },
      //         { title: t("create"), path: paths.dashboard.job.new },
      //         { title: t("edit"), path: paths.dashboard.job.demo.edit },
      //       ],
      //     },

      //     // TOUR
      //     {
      //       title: t("tour"),
      //       path: paths.dashboard.tour.root,
      //       icon: ICONS.tour,
      //       children: [
      //         { title: t("list"), path: paths.dashboard.tour.root },
      //         { title: t("details"), path: paths.dashboard.tour.demo.details },
      //         { title: t("create"), path: paths.dashboard.tour.new },
      //         { title: t("edit"), path: paths.dashboard.tour.demo.edit },
      //       ],
      //     },

      //     // FILE MANAGER
      //     {
      //       title: t("file_manager"),
      //       path: paths.dashboard.fileManager,
      //       icon: ICONS.folder,
      //     },

      //     // MAIL
      //     {
      //       title: t("mail"),
      //       path: paths.dashboard.mail,
      //       icon: ICONS.mail,
      //       info: <Label color="error">+32</Label>,
      //     },

      //     // CHAT
      //     {
      //       title: t("chat"),
      //       path: paths.dashboard.chat,
      //       icon: ICONS.chat,
      //     },

      //     // CALENDAR
      //     {
      //       title: t("calendar"),
      //       path: paths.dashboard.calendar,
      //       icon: ICONS.calendar,
      //     },

      //     // KANBAN
      //     {
      //       title: t("kanban"),
      //       path: paths.dashboard.kanban,
      //       icon: ICONS.kanban,
      //     },
      //   ],
      // },

      // DEMO MENU STATES
      {
        items: [
          {
            title: t("單位管理"),
            path: "/me/org-info",
            icon: <InfoIcon />,
            children: [
              {
                title: t("單位資料維護"),
                path: "/me/org-info",
              },
              {
                title: t("單位群組"),
                path: "/me/org-group/[groupId]",
              },
            ],
          },
          {
            title: t("Calendar"),
            icon: <CalendarMonthIcon />,
            path: "/me/calendar",
          },
          {
            title: t("網站管理"),
            path: "/me/cms/home",
            icon: <HomeIcon />,
            children: [
              {
                title: t("首頁管理"),
                path: "/me/cms/home",
              },
              {
                title: t("關於我們"),
                path: "/me/cms/about",
              },
              {
                title: t("產品管理"),
                path: "/me/cms/products",
              },
              {
                title: t("解決方案"),
                path: "/me/cms/solutions",
              },
              {
                title: t("文章管理"),
                path: "/me/cms/blogs",
              },
              {
                title: t("選單管理"),
                path: "/me/cms/menu",
              },
              {
                title: "回饋管理",
                path: "/me/cms/feedbacks",
              },
            ],
          },
          {
            title: t("事件管理"),
            icon: <EventIcon />,
            path: "/me/event/events",
          },
          {
            title: t("客戶管理"),
            path: "/me/crm/users",
            icon: <AssignmentIndIcon />,
            children: [
              {
                title: t("個人列表"),
                path: "/me/crm/users",
              },
              {
                title: t("單位列表"),
                path: "/me/crm/partners",
              },
            ],
          },
          {
            title: t("佈告欄"),
            icon: <PushPinRoundedIcon />,
            path: "/me/bulletins",
          },
          {
            title: t("人員管理"),
            path: "/me/members",
            icon: <SupervisorAccountIcon />,
            children: [
              {
                title: t("成員管理"),
                path: "/me/members",
              },
              {
                title: t("角色管理"),
                path: "/me/members/roles",
              },
            ],
          },
          {
            title: t("文章討論"),
            icon: <BlogIcon />,
            path: "/me/articles",
          },
          {
            title: t("檔案管理"),
            icon: <FileIcon />,
            path: "/me/upload-files",
          },
          {
            title: t("訂閱管理"),
            icon: <ViewModuleRoundedIcon />,
            path: "/me/order-module",
          },
          {
            title: t("SMS"),
            path: "/me/sms",
            icon: <SmsRoundedIcon />,
            children: [
              {
                title: t("簡訊管理"),
                path: "/me/sms",
              },
              {
                title: t("簡訊模板"),
                path: "/me/sms-template",
              },
            ],
          },
          {
            title: t("SES"),
            path: "/me/ses",
            icon: <EmailRoundedIcon />,
            children: [
              {
                title: t("電子郵件管理"),
                path: "/me/ses",
              },
              {
                title: t("電子郵件範本"),
                path: "/me/ses-template",
              },
            ],
          },
          {
            title: t("幫助(敬請期待)"),
            icon: <ContactSupportIcon />,
            path: "/me/support",
          },
          {
            title: t("訊息管理"),
            icon: <MessageIcon />,
            path: "/me/messages",
          },
        ],
      },
    ],
    [t]
  );

  return data;
}
