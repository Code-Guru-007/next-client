import { m } from "framer-motion";
// @mui
import Masonry from "@mui/lab/Masonry";
import Box from "@mui/material/Box";
import Fab, { fabClasses } from "@mui/material/Fab";
// components
import Iconify from "minimal/components/iconify";
import { varHover } from "minimal/components/animate";
//
import ComponentBlock from "../../component-block";

// ----------------------------------------------------------------------

const COLORS = [
  "default",
  "inherit",
  "primary",
  "secondary",
  "info",
  "success",
  "warning",
  "error",
] as const;

const SIZES = ["small", "medium", "large"] as const;

// ----------------------------------------------------------------------

export default function FloatingActionButton() {
  return (
    <Masonry
      columns={2}
      spacing={3}
      sx={{
        [`& .${fabClasses.root}`]: {
          textTransform: "capitalize",
        },
      }}
    >
      <ComponentBlock title="Default" spacing={2}>
        {COLORS.map((color) => (
          <Fab key={color}>
            <Iconify icon="ic:round-access-alarm" width={24} />
          </Fab>
        ))}

        <Box sx={{ display: "block", width: 1, height: 2 }} />

        {COLORS.map((color) => (
          <Fab key={color} variant="extended">
            <Iconify icon="ic:round-access-alarm" width={24} />
            {color}
          </Fab>
        ))}

        <Box sx={{ display: "block", width: 1, height: 2 }} />

        <Fab disabled>
          <Iconify icon="ic:round-access-alarm" width={24} />
        </Fab>

        <Fab disabled variant="extended">
          <Iconify icon="ic:round-access-alarm" width={24} />
          disabled
        </Fab>
      </ComponentBlock>

      <ComponentBlock title="Outlined" spacing={2}>
        {COLORS.map((color) => (
          <Fab key={color} variant="outlined">
            <Iconify icon="ic:round-access-alarm" width={24} />
          </Fab>
        ))}

        <Box sx={{ display: "block", width: 1, height: 2 }} />

        {COLORS.map((color) => (
          <Fab key={color} variant="outlinedExtended">
            <Iconify icon="ic:round-access-alarm" width={24} />
            {color}
          </Fab>
        ))}

        <Box sx={{ display: "block", width: 1, height: 2 }} />

        <Fab disabled variant="outlined">
          <Iconify icon="ic:round-access-alarm" width={24} />
        </Fab>

        <Fab disabled variant="outlinedExtended">
          <Iconify icon="ic:round-access-alarm" width={24} />
          disabled
        </Fab>
      </ComponentBlock>

      <ComponentBlock title="Soft" spacing={2}>
        {COLORS.map((color) => (
          <Fab key={color} variant="soft">
            <Iconify icon="ic:round-access-alarm" width={24} />
          </Fab>
        ))}

        <Box sx={{ display: "block", width: 1, height: 2 }} />

        {COLORS.map((color) => (
          <Fab key={color} variant="softExtended">
            <Iconify icon="ic:round-access-alarm" width={24} />
            {color}
          </Fab>
        ))}

        <Box sx={{ display: "block", width: 1, height: 2 }} />

        <Fab disabled variant="soft">
          <Iconify icon="ic:round-access-alarm" width={24} />
        </Fab>

        <Fab disabled variant="softExtended">
          <Iconify icon="ic:round-access-alarm" width={24} />
          disabled
        </Fab>
      </ComponentBlock>

      <ComponentBlock title="Sizes" spacing={2}>
        {SIZES.map((size) => (
          <Fab key={size} size={size}>
            <Iconify icon="ic:round-access-alarm" width={24} />
          </Fab>
        ))}

        <Box sx={{ display: "block", width: 1, height: 2 }} />

        {SIZES.map((size) => (
          <Fab key={size} size={size} variant="extended">
            <Iconify icon="ic:round-access-alarm" width={24} />
            {size}
          </Fab>
        ))}

        <Box sx={{ display: "block", width: 1, height: 2 }} />

        {SIZES.map((size) => (
          <Fab key={size} size={size} variant="soft">
            <Iconify icon="ic:round-access-alarm" width={24} />
          </Fab>
        ))}

        <Box sx={{ display: "block", width: 1, height: 2 }} />

        {SIZES.map((size) => (
          <Fab key={size} size={size} variant="softExtended">
            <Iconify icon="ic:round-access-alarm" width={24} />
            {size}
          </Fab>
        ))}

        <Box sx={{ display: "block", width: 1, height: 2 }} />

        {SIZES.map((size) => (
          <Fab key={size} size={size} variant="outlined">
            <Iconify icon="ic:round-access-alarm" width={24} />
          </Fab>
        ))}

        <Box sx={{ display: "block", width: 1, height: 2 }} />

        {SIZES.map((size) => (
          <Fab key={size} size={size} variant="outlinedExtended">
            <Iconify icon="ic:round-access-alarm" width={24} />
            {size}
          </Fab>
        ))}
      </ComponentBlock>

      <ComponentBlock title="With Animate" spacing={2}>
        {SIZES.map((size) => (
          <Fab
            key={size}
            component={m.button}
            whileTap="tap"
            whileHover="hover"
            variants={
              (size === "small" && varHover(1.1, 0.95)) ||
              (size === "large" && varHover(1.08, 0.99)) ||
              varHover()
            }
            variant="extended"
            size={size}
          >
            <Iconify icon="ic:round-access-alarm" width={24} />
            {size}
          </Fab>
        ))}
      </ComponentBlock>
    </Masonry>
  );
}
