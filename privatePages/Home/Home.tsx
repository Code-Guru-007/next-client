import React from "react";
import PrivateLayout from "components/PrivateLayout";
import useDetectModuleAuth from "utils/useDetectModuleAuth";

const Home = function Home() {
  useDetectModuleAuth();

  return <PrivateLayout>test</PrivateLayout>;
};

export default Home;
