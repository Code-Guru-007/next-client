// @mui
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import ButtonBase from "@mui/material/ButtonBase";

import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";

//
import Tooltip from "@mui/material/Tooltip";
import Iconify from "../../iconify";

// ----------------------------------------------------------------------

type Props = {
  value: boolean;
  onChange: VoidFunction;
};

export default function StretchOptions({ value, onChange }: Props) {
  const wordLibrary = useSelector(getWordLibrary);

  let result;
  if (value === true) {
    result = wordLibrary?.Collapse ?? "收縮";
  } else {
    result = wordLibrary?.Stretch ?? "延伸";
  }

  return (
    <Tooltip title={result}>
      <ButtonBase
        onClick={onChange}
        sx={{
          width: 1,
          height: 80,
          borderRadius: 1,
          color: "text.disabled",
          border: (theme) =>
            `solid 1px ${alpha(theme.palette.grey[500], 0.08)}`,
          ...(value && {
            bgcolor: "background.paper",
            color: (theme) => theme.palette.primary.main,
            boxShadow: (theme) =>
              `-24px 8px 24px -4px ${alpha(
                theme.palette.mode === "light"
                  ? theme.palette.grey[500]
                  : theme.palette.common.black,
                0.08
              )}`,
          }),
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            width: 0.24,
            transition: (theme) => theme.transitions.create(["width"]),
            ...(value && {
              width: 0.5,
            }),
          }}
        >
          <Iconify
            icon={
              value ? "eva:arrow-ios-back-fill" : "eva:arrow-ios-forward-fill"
            }
            sx={{
              color: (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
            }}
          />

          <Box
            sx={{ flexGrow: 1, borderBottom: `dashed 1.5px currentcolor` }}
          />

          <Iconify
            icon={
              value ? "eva:arrow-ios-forward-fill" : "eva:arrow-ios-back-fill"
            }
            sx={{
              color: (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
            }}
          />
        </Stack>
      </ButtonBase>
    </Tooltip>
  );
}
