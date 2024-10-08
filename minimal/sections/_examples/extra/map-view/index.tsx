"use client";

import dynamic from "next/dynamic";
// @mui
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
// routes
import { paths } from "minimal/routes/paths";
// config
import { MAPBOX_API } from "minimal/config-global";
// _mock
import { cities as CITIES } from "minimal/_mock/map/cities";
import { countries as COUNTRIES } from "minimal/_mock/map/countries";
// components
import CustomBreadcrumbs from "minimal/components/custom-breadcrumbs";
//
const MapHeatmap = dynamic(() => import("./heatmap"));
const MapClusters = dynamic(() => import("./clusters"));
const MapInteraction = dynamic(() => import("./interaction"));
const MapSideBySide = dynamic(() => import("./side-by-side"));
const MapChangeTheme = dynamic(() => import("./change-theme"));
const MapMarkersPopups = dynamic(() => import("./map-markers-popups"));
const MapDraggableMarkers = dynamic(() => import("./draggable-markers"));
const MapViewportAnimation = dynamic(() => import("./viewport-animation"));
const MapGeoJSONAnimation = dynamic(() => import("./map-geo-json-animation"));
const MapHighlightByFilter = dynamic(() => import("./map-highlight-by-filter"));

// ----------------------------------------------------------------------

const THEMES = {
  streets: "mapbox://styles/mapbox/streets-v11",
  outdoors: "mapbox://styles/mapbox/outdoors-v11",
  light: "mapbox://styles/mapbox/light-v10",
  dark: "mapbox://styles/mapbox/dark-v10",
  satellite: "mapbox://styles/mapbox/satellite-v9",
  satelliteStreets: "mapbox://styles/mapbox/satellite-streets-v11",
};

const baseSettings = {
  mapboxAccessToken: MAPBOX_API,
  minZoom: 1,
};

const StyledMapContainer = styled("div")(({ theme }) => ({
  zIndex: 0,
  height: 560,
  overflow: "hidden",
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  "& .mapboxgl-ctrl-logo, .mapboxgl-ctrl-bottom-right": {
    display: "none",
  },
}));

// ----------------------------------------------------------------------

export default function MapView() {
  return (
    <>
      <Box
        sx={{
          py: 5,
          bgcolor: (theme) =>
            theme.palette.mode === "light" ? "grey.200" : "grey.800",
        }}
      >
        <Container>
          <CustomBreadcrumbs
            headingText="Map"
            links={[
              {
                name: "Components",
                href: paths.components,
              },
              { name: "Map" },
            ]}
            moreLink={[
              "http://visgl.github.io/react-map-gl",
              "http://visgl.github.io/react-map-gl/examples",
            ]}
          />
        </Container>
      </Box>

      <Container sx={{ my: 10 }}>
        <Stack spacing={5}>
          <Card>
            <CardHeader title="Change Theme" />
            <CardContent>
              <StyledMapContainer>
                <MapChangeTheme {...baseSettings} themes={THEMES} />
              </StyledMapContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Markers & Popups" />
            <CardContent>
              <StyledMapContainer>
                <MapMarkersPopups
                  {...baseSettings}
                  data={COUNTRIES}
                  mapStyle={THEMES.light}
                />
              </StyledMapContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Draggable Markers" />
            <CardContent>
              <StyledMapContainer>
                <MapDraggableMarkers
                  {...baseSettings}
                  mapStyle={THEMES.light}
                />
              </StyledMapContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Geojson Animation" />
            <CardContent>
              <StyledMapContainer>
                <MapGeoJSONAnimation
                  {...baseSettings}
                  mapStyle={THEMES.satelliteStreets}
                />
              </StyledMapContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Clusters" />
            <CardContent>
              <StyledMapContainer>
                <MapClusters {...baseSettings} mapStyle={THEMES.light} />
              </StyledMapContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Interaction" />
            <CardContent>
              <StyledMapContainer>
                <MapInteraction {...baseSettings} mapStyle={THEMES.light} />
              </StyledMapContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Viewport Animation" />
            <CardContent>
              <StyledMapContainer>
                <MapViewportAnimation
                  {...baseSettings}
                  data={CITIES.filter((city) => city.state === "Texas")}
                  mapStyle={THEMES.light}
                />
              </StyledMapContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Highlight By Filter" />
            <CardContent>
              <StyledMapContainer>
                <MapHighlightByFilter
                  {...baseSettings}
                  mapStyle={THEMES.light}
                />
              </StyledMapContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Heatmap" />
            <CardContent>
              <StyledMapContainer>
                <MapHeatmap {...baseSettings} mapStyle={THEMES.light} />
              </StyledMapContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Side By Side" />
            <CardContent>
              <StyledMapContainer>
                <MapSideBySide {...baseSettings} />
              </StyledMapContainer>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </>
  );
}
