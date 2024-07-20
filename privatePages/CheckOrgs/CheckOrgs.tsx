import React, { useEffect, useState } from "react";
import useMemberOrgs from "@eGroupAI/hooks/apis/useMemberOrgs";
import Center from "@eGroupAI/material-layout/Center";
import CircularProgress from "@eGroupAI/material/CircularProgress";
import CheckOrgLayout from "components/CheckOrgLayout";
import Home from "privatePages/Home";
import Redierct from "components/Redierct";
import { useSelector } from "react-redux";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import { OrganizationInfoByDomain } from "interfaces/entities";
import OrgList from "./OrgList";

const CheckOrgs = function CheckOrgs() {
  const locale = useSelector(getGlobalLocale);

  const [isFetched, setIsFetched] = useState(false);
  const [organizationData, setOrganizationData] = useState<
    OrganizationInfoByDomain | undefined
  >();

  const { data: orgs } = useMemberOrgs(undefined, { locale });

  const { excute: getOrganizationByDomainName, isLoading } = useAxiosApiWrapper(
    apis.org.getOrganizationByDomainName,
    "None"
  );

  const organizationDomainName = Buffer.from(
    new URL(window.location.href).host
  ).toString("base64");

  useEffect(() => {
    const fetchOrgData = async () => {
      const org = await getOrganizationByDomainName({ organizationDomainName });
      setOrganizationData(org.data);
    };
    if (!isFetched) {
      setIsFetched(true);
      fetchOrgData();
    }
  }, [getOrganizationByDomainName, isFetched, organizationDomainName]);

  const fetchComponent = () => {
    if (orgs?.source.length === 0) {
      return <Redierct to="/me/create-org?orgLength=0" />;
    }
    if (orgs?.source.length === 1) {
      return <Home />;
    }
    return (
      <CheckOrgLayout
        alignValue={organizationData?.organizationLoginRegisterSectionAlignment}
      >
        <OrgList orgs={orgs?.source} />
      </CheckOrgLayout>
    );
  };

  // Check whether the organizationData is fetched here to prevent layout shifting
  if (!orgs || isLoading) {
    return (
      <Center offsetTop={117}>
        <CircularProgress />
      </Center>
    );
  }
  return fetchComponent();
};

export default CheckOrgs;
