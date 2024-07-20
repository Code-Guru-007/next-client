import React, { FC, useMemo } from "react";

import clsx from "clsx";
import { makeStyles, styled } from "@mui/styles";
import { StaticColumn } from "utils/useStaticColumns";
import {
  OrganizationColumn,
  DynamicColumnTarget,
  OrganizationUser,
} from "interfaces/entities";

import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import type { CheckboxProps } from "@eGroupAI/material/Checkbox";
import parseDynamicColumnValue from "utils/parseDynamicColumnValue";

import Checkbox from "@eGroupAI/material/Checkbox";
import Typography from "@eGroupAI/material/Typography";
import Avatar from "@mui/material/Avatar";
import {
  Box,
  Card,
  CardContent,
  Collapse,
  IconButton,
  IconButtonProps,
  Stack,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Iconify from "minimal/components/iconify";

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

const useStyles = makeStyles((theme) => ({
  content: {},
  contentHover: {
    "& $cardBody": {
      cursor: "pointer",
    },
    "&:hover": {
      "& $cardBody": {
        borderColor: theme.palette.info.main,
      },
    },
  },
  card: {
    flex: 1,
  },
  cardBody: {
    padding: "16px",
    borderRadius: "0 0px 20px 20px",
    border: "transparent 1px solid",
  },
  avatar: {
    display: "flex",
    alignItems: "center",
  },
  info: {
    display: "flex",
    marginTop: "16px",
    flexWrap: "wrap",
    "& div": {
      display: "flex",
      marginBottom: "1rem",
      borderRight: "0",
      width: "100%",
      "& .MuiTypography-root": {
        width: "50%",
        "&:last-child": {
          width: "50%",
        },
      },
    },
    "& div:last-child": {
      marginBottom: "0",
    },
  },
  checkbox: {
    marginRight: theme.spacing(1),
    width: "36px",
  },
}));

export interface CompareCardProps {
  title: string;
  data: OrganizationUser;
  staticColumns?: StaticColumn[];
  dynamicColumns?: OrganizationColumn[];
  CheckboxProps?: CheckboxProps;
  comparedFields?: {
    [x: string]: {
      similarUserIds: string[];
    };
  };
  selectedSimilarUser?: OrganizationUser;
  showOnlyRelevantCompares?: boolean;
}

const CompareCard: FC<CompareCardProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const {
    title,
    data,
    staticColumns,
    dynamicColumns,
    CheckboxProps,
    comparedFields: comparedFieldsProp = {},
    selectedSimilarUser,
    showOnlyRelevantCompares = false,
  } = props;
  const theme = useTheme();
  const classes = useStyles();

  const [expanded, setExpanded] = React.useState(true);
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const dynamicTargetMap: Record<string, DynamicColumnTarget> | undefined =
    useMemo(
      () =>
        data.dynamicColumnTargetList?.reduce(
          (a, b) => ({
            ...a,
            [b.organizationColumn.columnId]: b,
          }),
          {}
        ),
      [data]
    );

  const override_color = !CheckboxProps
    ? alpha(theme.palette.info.main, 0.16)
    : alpha(theme.palette.error.main, 0.16);

  // eslint-disable-next-line no-nested-ternary
  const filteredCompareFieldKeys = !CheckboxProps
    ? showOnlyRelevantCompares && selectedSimilarUser
      ? Object.keys(comparedFieldsProp).filter((key) =>
          comparedFieldsProp[key]?.similarUserIds.includes(
            selectedSimilarUser.organizationUserId
          )
        )
      : Object.keys(comparedFieldsProp)
    : showOnlyRelevantCompares && selectedSimilarUser
    ? Object.keys(comparedFieldsProp).filter(
        (key) =>
          comparedFieldsProp[key]?.similarUserIds.includes(
            data.organizationUserId
          ) &&
          data.organizationUserId === selectedSimilarUser?.organizationUserId
      )
    : Object.keys(comparedFieldsProp).filter((key) =>
        comparedFieldsProp[key]?.similarUserIds.includes(
          data.organizationUserId
        )
      );

  return (
    <Card>
      <CardContent
        sx={{
          padding: { lg: "0 24px 0 12px", xs: "0 12px 0 6px" },
          "&.MuiCardContent-root:last-child": {
            paddingBottom: 0,
          },
          borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
        }}
      >
        <Stack
          direction={"row"}
          alignItems={"center"}
          sx={{
            height: "60px",
          }}
        >
          <div className={classes.checkbox}>
            {CheckboxProps && (
              <Checkbox
                id={`checkbox-${data.organizationUserId}`}
                {...CheckboxProps}
              />
            )}
          </div>
          <Typography
            variant="subtitle2"
            fontSize={14}
            fontWeight={600}
            sx={{
              "&.MuiTypography-root": { color: "text.secondary" },
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </Typography>
          <Box flexGrow={1} />
          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </ExpandMore>
        </Stack>
      </CardContent>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent
          className={clsx(classes.content, {
            [classes.contentHover]: !!CheckboxProps,
          })}
          sx={{
            padding: { lg: "0 24px 0 12px", xs: "0 12px 0 6px" },
          }}
        >
          <label
            className={classes.card}
            htmlFor={`checkbox-${data.organizationUserId}`}
          >
            <Box className={classes.cardBody} sx={{ p: { lg: 2, xs: 1 } }}>
              <Box className={classes.avatar}>
                <Avatar
                  sx={{
                    mr: 2,
                    backgroundColor: "transparent",
                    color: (theme) => `${alpha(theme.palette.grey[600], 1)}`,
                  }}
                >
                  <Iconify icon="solar:user-rounded-bold" width={20} />
                </Avatar>
                <Typography
                  variant="h4"
                  sx={{
                    color: "text.primary",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {data.organizationUserNameZh}
                </Typography>
              </Box>
              <Box className={classes.info}>
                {staticColumns?.map((el) => {
                  const val = data && el.sortKey ? data[el.sortKey] : undefined;
                  let isOverrideField = false;
                  if (el.sortKey)
                    isOverrideField = filteredCompareFieldKeys.includes(
                      el.sortKey
                    );

                  return (
                    <Box
                      key={el.id}
                      sx={{
                        backgroundColor: isOverrideField
                          ? override_color
                          : "none",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontSize={16}
                        sx={{
                          color: "text.primary",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {wordLibrary && wordLibrary[el.columnName]
                          ? wordLibrary[el.columnName]
                          : el.columnName}
                      </Typography>
                      <Typography
                        variant="body1"
                        fontSize={16}
                        sx={{
                          color: "text.primary",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {el.format ? el.format(val) : val}
                      </Typography>
                    </Box>
                  );
                })}
                {dynamicColumns?.map((el) => {
                  const val = dynamicTargetMap
                    ? dynamicTargetMap[el.columnId]?.columnTargetValue
                    : undefined;
                  let isOverrideField = false;
                  if (el.columnId)
                    isOverrideField = filteredCompareFieldKeys.includes(
                      el.columnId
                    );

                  return (
                    <Box
                      key={el.columnId}
                      sx={{
                        backgroundColor: isOverrideField
                          ? override_color
                          : "none",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontSize={16}
                        sx={{
                          color: "text.primary",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {wordLibrary && wordLibrary[el.columnName]
                          ? wordLibrary[el.columnName]
                          : el.columnName}
                      </Typography>
                      <Typography
                        variant="body1"
                        fontSize={16}
                        sx={{
                          color: "text.primary",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {parseDynamicColumnValue(el.columnType, val)}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </label>
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default CompareCard;
