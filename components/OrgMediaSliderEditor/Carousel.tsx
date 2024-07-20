import React, { FC } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/styles";
import { useMediaQuery } from "@mui/material";
import dynamic from "next/dynamic";
import { Item } from "components/CarouselManagement";

import { SwiperSlide } from "swiper/react";
import EditSectionLoader from "components/EditSectionLoader";
import SlideContent from "./SlideContent";

const Swiper = dynamic(
  async () => {
    const values = await Promise.all([import("@eGroupAI/material-lab/Swiper")]);
    return values[0];
  },
  {
    loading: () => <div />,
    ssr: false,
  }
);

const useStyles = makeStyles((theme) => ({
  root: {
    "--swiper-navigation-color": theme.palette.common.white,
  },
}));

export interface CarouselProps {
  items?: Item[];
}

const Carousel: FC<CarouselProps> = function (props) {
  const { items } = props;
  const classes = useStyles();
  const theme = useTheme();
  const isDownSm = useMediaQuery(theme.breakpoints.down("sm"));

  if (!items) {
    return <EditSectionLoader />;
  }

  return (
    <Swiper
      className={classes.root}
      spaceBetween={0}
      navigation={!isDownSm}
      loop={items.length > 1}
      centeredSlides
      speed={800}
      autoplay={{
        delay: 15000,
        disableOnInteraction: false,
      }}
    >
      {items.map((el) => (
        <SwiperSlide key={el.ids.primaryId}>
          <SlideContent
            src={isDownSm ? el.imgSrc?.mobile || "" : el.imgSrc?.desktop || ""}
            title={el.title}
            subTitle={el.description}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default Carousel;
