import React, { useEffect } from "react";

import { useRouter } from "next/router";
import useCountDown from "@eGroupAI/hooks/useCountDown";

import Center from "@eGroupAI/material-layout/Center";
import Box from "@eGroupAI/material/Box";
import Typography from "@eGroupAI/material/Typography";
import Button from "@eGroupAI/material/Button";

import useFiltedRoutes from "utils/useFiltedRoutes";

const UnModuleAuthorized = function () {
  const router = useRouter();
  const [number, setStartCountDown] = useCountDown(5, {
    min: 0,
  });
  const filtedRoutes = useFiltedRoutes();

  useEffect(() => {
    setStartCountDown(true);
  }, [setStartCountDown]);

  useEffect(() => {
    if (number === 0 && filtedRoutes) {
      router.push(`${filtedRoutes[0]?.path}`);
    }
  }, [filtedRoutes, number, router]);

  return (
    <Center offsetTop={117}>
      <Box textAlign="center" width={300}>
        <Typography variant="h6" gutterBottom color="error">
          無此頁面權限
        </Typography>
        <Button
          color="primary"
          onClick={() => {
            router.push("/me");
          }}
        >
          {number}秒後返回首頁
        </Button>
      </Box>
    </Center>
  );
};

export default UnModuleAuthorized;
