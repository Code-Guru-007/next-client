"use client";

// @mui
import { useTheme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import Badge from "@mui/material/Badge";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Drawer, { drawerClasses } from "@mui/material/Drawer";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
// theme
import { paper } from "minimal/theme/css";
//
import Iconify from "../../iconify";
import Scrollbar from "../../scrollbar";
//
import { useSettingsContext } from "../context";
import BaseOptions from "./base-option";
import LayoutOptions from "./layout-options";
import PresetsOptions from "./presets-options";
import StretchOptions from "./stretch-options";
import FullScreenOption from "./fullscreen-option";

// ----------------------------------------------------------------------

export default function SettingsDrawer() {
  const wordLibrary = useSelector(getWordLibrary);

  const theme = useTheme();

  const settings = useSettingsContext();

  const labelStyles = {
    mb: 1.5,
    color: "text.disabled",
    fontWeight: "fontWeightSemiBold",
  };

  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 2, pr: 1, pl: 2.5 }}
    >
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        {wordLibrary?.settings ?? "設定"}
      </Typography>

      <Tooltip title={wordLibrary?.reset ?? "重置"}>
        <IconButton onClick={settings.onReset}>
          <Badge color="error" variant="dot" invisible={!settings.canReset}>
            <Iconify icon="solar:restart-bold" />
          </Badge>
        </IconButton>
      </Tooltip>
      <Tooltip title={wordLibrary?.close ?? "關閉"}>
        <IconButton onClick={settings.onClose}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Tooltip>
    </Stack>
  );

  const renderMode = (
    <div>
      <Typography variant="caption" component="div" sx={{ ...labelStyles }}>
        {wordLibrary?.mode ?? "模式"}
      </Typography>

      <BaseOptions
        value={settings.themeMode}
        onChange={(newValue: string) =>
          settings.onUpdate("themeMode", newValue)
        }
        options={["light", "dark"]}
        icons={["sun", "moon"]}
      />
    </div>
  );

  const renderContrast = (
    <div>
      <Typography variant="caption" component="div" sx={{ ...labelStyles }}>
        {wordLibrary?.contrast ?? "對比"}
      </Typography>

      <BaseOptions
        value={settings.themeContrast}
        onChange={(newValue: string) =>
          settings.onUpdate("themeContrast", newValue)
        }
        options={["default", "bold"]}
        icons={["contrast", "contrast_bold"]}
      />
    </div>
  );

  const renderDirection = (
    <div>
      <Typography variant="caption" component="div" sx={{ ...labelStyles }}>
        {wordLibrary?.direction ?? "方向"}
      </Typography>

      <BaseOptions
        value={settings.themeDirection}
        onChange={(newValue: string) =>
          settings.onUpdate("themeDirection", newValue)
        }
        options={["ltr", "rtl"]}
        icons={["align_left", "align_right"]}
      />
    </div>
  );

  const renderLayout = (
    <div>
      <Typography variant="caption" component="div" sx={{ ...labelStyles }}>
        {wordLibrary?.layout ?? "佈局"}
      </Typography>

      <LayoutOptions
        value={settings.themeLayout}
        onChange={(newValue: string) =>
          settings.onUpdate("themeLayout", newValue)
        }
        options={["vertical", "horizontal", "mini"]}
      />
    </div>
  );

  const renderStretch = (
    <div>
      <Typography
        variant="caption"
        component="div"
        sx={{
          ...labelStyles,
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        {wordLibrary?.stretch ?? "延伸"}
        <Tooltip
          title={
            wordLibrary?.[
              "Only available at large resolutions > 1600px (xl)"
            ] ?? "僅在大於1600px (xl) 的高解析度下可用"
          }
        >
          <Iconify icon="eva:info-outline" width={16} sx={{ ml: 0.5 }} />
        </Tooltip>
      </Typography>

      <StretchOptions
        value={settings.themeStretch}
        onChange={() =>
          settings.onUpdate("themeStretch", !settings.themeStretch)
        }
      />
    </div>
  );

  const renderPresets = (
    <div>
      <Typography variant="caption" component="div" sx={{ ...labelStyles }}>
        {wordLibrary?.presets ?? "預設"}
      </Typography>

      <PresetsOptions
        value={settings.themeColorPresets}
        onChange={(newValue: string) =>
          settings.onUpdate("themeColorPresets", newValue)
        }
      />
    </div>
  );

  return (
    <Drawer
      anchor="right"
      open={settings.open}
      onClose={settings.onClose}
      BackdropProps={{
        sx: {
          backgroundColor: "transparent",
        },
      }}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          ...paper({ theme, bgcolor: theme.palette.background.default }),
          width: 280,
        },
      }}
    >
      {renderHead}

      <Divider sx={{ borderStyle: "dashed" }} />

      <Scrollbar>
        <Stack spacing={3} sx={{ p: 3 }}>
          {renderMode}

          {renderContrast}

          {renderDirection}

          {renderLayout}

          {renderStretch}

          {renderPresets}
        </Stack>
      </Scrollbar>

      <FullScreenOption />
    </Drawer>
  );
}
