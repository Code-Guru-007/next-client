import React, { FC } from "react";
import { makeStyles, useTheme } from "@mui/styles";
import dynamic from "next/dynamic";
import { SwiperSlide } from "swiper/react";
import Slide from "./Slide";

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

const useStyles = makeStyles({
  root: {
    "--swiper-navigation-color": "#fff",
  },
});

export type Item = {
  id: string;
  placeholder?: string;
  src: string;
  title?: string;
};

export interface VideoSwiperProps {
  items?: Item[];
}

const VideoSwiper: FC<VideoSwiperProps> = function (props) {
  const { items } = props;
  const classes = useStyles();
  const theme = useTheme();
  return (
    <Swiper
      className={classes.root}
      slidesPerView={1}
      spaceBetween={20}
      navigation
      loop={items ? items.length > 1 : false}
      breakpoints={{
        [theme.breakpoints.values.sm]: {
          slidesPerView: 2,
        },
        [theme.breakpoints.values.lg]: {
          slidesPerView: 3,
        },
      }}
    >
      {items?.map((el) => (
        <SwiperSlide key={el.id}>
          <Slide
            placeholder={el.placeholder}
            iframeSrc={el.src}
            iframeTitle={el.title}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default VideoSwiper;
