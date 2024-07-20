import React, { useEffect } from "react";

import { useRouter } from "next/router";

const TargetShare = () => {
  const router = useRouter();

  useEffect(() => {
    if (router.query.organizationVerifyTokenId) {
      router.replace(
        `/me/crm/users?tab=share&organizationVerifyTokenId=${router.query.organizationVerifyTokenId}`
      );
    }
  }, [router]);

  return <div />;
};

export default TargetShare;
