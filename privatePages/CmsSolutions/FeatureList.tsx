import React, { FC } from "react";

import { Item } from "components/CarouselManagement";
import EditSectionLoader from "components/EditSectionLoader";
import FeatureSection from "@eGroupAI/material-module/infocenter/solution/FeatureSection";

export interface FeatureListProps {
  items?: Item[];
}

const FeatureList: FC<FeatureListProps> = function (props) {
  const { items } = props;

  if (!items) {
    return <EditSectionLoader />;
  }

  return (
    <div>
      {items.map((el, index) => (
        <FeatureSection
          key={el.ids.organizationSolutionId}
          backgroundUrl={el.imgSrc?.desktop || ""}
          side={(index + 1) % 2 === 1 ? "left" : "right"}
          primary={el.title || ""}
          description={el.description}
          moreLink={el.linkURL}
          icons={el.items?.map((item) => ({
            key: item.ids.organizationMediaId as string,
            src: item.imgSrc?.normal,
            content: item.title,
          }))}
          sx={{
            mb: 2,
          }}
        />
      ))}
    </div>
  );
};

export default FeatureList;
