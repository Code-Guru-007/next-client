import React, { forwardRef, useMemo } from "react";

import { useRouter } from "next/router";
import { useTheme, makeStyles } from "@mui/styles";
import { Theme, useMediaQuery, Tooltip } from "@mui/material";

import Tab, { TabProps } from "@eGroupAI/material/Tab";
import MenuItem from "@eGroupAI/material/MenuItem";
import Box from "@eGroupAI/material/Box";
import InputLabel from "@eGroupAI/material/InputLabel";
import FormControl from "@eGroupAI/material/FormControl";
import Select, { SelectChangeEvent } from "@eGroupAI/material/Select";

import Tabs from "components/Tabs";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import moduleRouteMapping from "utils/moduleRouteMapping";
import { ServiceModuleValue } from "interfaces/utils";

const useStyles = makeStyles((theme: Theme) => ({
  menuItem: {
    width: "100%",
    margin: 0,
    padding: 0,
    textAlign: "center",
    fontSize: "14px",
    lineHeight: "18px",
    fontWeight: 500,
    color: theme.palette.primary.main,
    justifyContent: "center",
  },
  dropdownItem: {},
  customBadge: {
    borderRadius: "6px",
    fontSize: "12px",
    padding: "2px 6px 2px 6px",
    height: "24px",
    backgroundColor: "rgba(32, 101, 209, 0.16)",
    color: "rgba(29, 94, 198, 1)",
    display: "flex",
    alignItems: "center",
    textAlign: "center",
  },
  truncate: {
    maxWidth: "120px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "inline-block",
    verticalAlign: "middle",
  },
}));

export interface TabDataItem {
  label: string;
  value: string;
  id?: string;
  testId?: string;
}

export interface ItemCount {
  id: string;
  count: number;
}

export interface ResponsiveTabsProps extends Omit<TabProps, "onChange"> {
  tabName?: string;
  value?: string;
  tabData?: TabDataItem[];
  onChange?: (value: string) => void;
  isDrawer?: boolean;
  itemCounts?: ItemCount[];
}

const ResponsiveTabs = forwardRef<HTMLDivElement, ResponsiveTabsProps>(
  (props, ref) => {
    const wordLibrary = useSelector(getWordLibrary);
    const {
      tabName = `${wordLibrary?.menu ?? "清單"}`,
      value: valueData,
      tabData,
      onChange,
      isDrawer = false,
      itemCounts,
      ...other
    } = props;
    const theme = useTheme();
    const classes = useStyles();
    const isDownSm = useMediaQuery(theme.breakpoints.down("sm"));
    const { pathname } = useRouter();

    const handleChange = (event: SelectChangeEvent) => {
      if (onChange) onChange(event.target.value);
    };

    /**
     * Find module by path.
     */
    const moduleNameByPath = useMemo(() => {
      const modules = Object.keys(moduleRouteMapping);
      let result = "";
      for (let i = 0; i < modules.length; i += 1) {
        const moduleName = modules[i];
        if (moduleName) {
          const modulePaths = moduleRouteMapping[moduleName];
          if (modulePaths?.includes(pathname)) {
            result = moduleName as ServiceModuleValue;
            break;
          }
        }
      }
      return result;
    }, [pathname]);

    return (
      <>
        {!isDownSm && !isDrawer && (
          <Box ref={ref} className={other.className} sx={other.sx}>
            <Tabs
              value={valueData}
              onChange={(_, v) => {
                if (onChange) onChange(v);
              }}
              sx={{ mb: 1 }}
            >
              {tabData?.map((el) => (
                <Tab
                  label={
                    itemCounts ? (
                      <Tooltip title={wordLibrary?.[el.label] ?? el.label}>
                        <span className={classes.truncate}>
                          {wordLibrary?.[el.label] ?? el.label}
                        </span>
                      </Tooltip>
                    ) : (
                      wordLibrary?.[el.label] ?? el.label
                    )
                  }
                  value={el.value}
                  key={el.value}
                  className={`tour_target-${moduleNameByPath}-tab_${el.value}`}
                  id={el.id}
                  data-tid={el.testId}
                  icon={
                    itemCounts ? (
                      <Box className={classes.customBadge}>
                        {itemCounts.filter(
                          (itemCount) => itemCount.id === el.id
                        )[0]?.count ?? 0}
                      </Box>
                    ) : (
                      <></>
                    )
                  }
                  iconPosition="end"
                />
              ))}
            </Tabs>
          </Box>
        )}
        {isDownSm && (
          <Box
            sx={{ minWidth: 120, padding: 1, ...other.sx }}
            ref={ref}
            className={other.className}
          >
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">{tabName}</InputLabel>
              <Select
                className={classes.menuItem}
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={valueData}
                label="分頁"
                onChange={handleChange}
              >
                {tabData?.map((el) => (
                  <MenuItem
                    value={el.value}
                    key={el.value}
                    className={classes.dropdownItem}
                    id={el.id}
                    data-tid={el.testId}
                  >
                    {el.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
        {isDrawer && !isDownSm && (
          <Box
            sx={{ minWidth: 120, padding: 1, ...other.sx }}
            ref={ref}
            className={other.className}
          >
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">{tabName}</InputLabel>
              <Select
                className={classes.menuItem}
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={valueData}
                label="分頁"
                onChange={handleChange}
              >
                {tabData?.map((el) => (
                  <MenuItem
                    value={el.value}
                    key={el.value}
                    className={classes.dropdownItem}
                    id={el.id}
                    data-tid={el.testId}
                  >
                    {el.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </>
    );
  }
);

export default ResponsiveTabs;
