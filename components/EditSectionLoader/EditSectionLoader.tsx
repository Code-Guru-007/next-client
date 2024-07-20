import React from "react";

import Box from "@eGroupAI/material/Box";
import CircularProgress from "@eGroupAI/material/CircularProgress";

const EditSectionLoader = function () {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      height={300}
    >
      <CircularProgress />
    </Box>
  );
};

export default EditSectionLoader;
