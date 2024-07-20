import React, { FC, ReactNode } from "react";

import { ImgSrc } from "interfaces/components";

import Grid from "@eGroupAI/material/Grid";
import ProductListItem, { ProductListItemProps } from "./ProductListItem";

export interface Item extends Omit<ProductListItemProps, "href" | "src"> {
  id: string;
  imgSrc?: ImgSrc;
}

export interface ProductListProps {
  items?: Item[];
  loader?: ReactNode;
}

const ProductList: FC<ProductListProps> = function (props) {
  const { items, loader } = props;

  if (!items) {
    return <div>{loader}</div>;
  }

  return (
    <Grid container spacing={2}>
      {items?.map((el) => {
        const { id, imgSrc, ...other } = el;
        return (
          <Grid item xs={12} sm={6} lg={3} key={id}>
            <ProductListItem
              href={`/me/cms/products/${id}`}
              src={imgSrc?.normal}
              {...other}
            />
          </Grid>
        );
      })}
    </Grid>
  );
};

export default ProductList;
