import React from "react";
import { useRouter } from "next/router";

const Redirect = function Redirect(props) {
  const router = useRouter();
  const { to } = props;
  router.push(to);

  return <div />;
};

export default Redirect;
