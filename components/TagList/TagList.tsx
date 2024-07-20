import React, { FC } from "react";

import Tag from "@eGroupAI/material/Tag";
import Grid from "@eGroupAI/material/Grid";

export interface TagListProps {
  tags?: {
    name: string;
    color: string;
  }[];
}

const TagList: FC<TagListProps> = function (props) {
  const { tags, children } = props;

  return (
    <Grid container spacing={2}>
      {tags?.map((el) => (
        <Grid item key={el.name}>
          <Tag color={el.color}>{el.name}</Tag>
        </Grid>
      ))}
      {children}
    </Grid>
  );
};

export default TagList;
