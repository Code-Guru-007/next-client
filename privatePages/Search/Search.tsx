import React, { useEffect, useState } from "react";

import { makeStyles } from "@mui/styles";
import useTab from "@eGroupAI/hooks/useTab";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { useRouter } from "next/router";

import PrivateLayout from "components/PrivateLayout";
import ResponsiveTabs from "components/ResponsiveTabs";
import Main from "@eGroupAI/material-layout/Main";
import Container from "@eGroupAI/material/Container";
import Typography from "@eGroupAI/material/Typography";
import Box from "@eGroupAI/material/Box";
import CircularProgress from "@eGroupAI/material/CircularProgress";
import PaginationBar from "@eGroupAI/material-module/DataTable/PaginationBar";
import SearchResultCard from "./SearchResultCard";

const useStyles = makeStyles({
  firstTab: {
    marginLeft: 30,
  },
  actions: {},
  headerTitle: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
});

const Search = () => {
  const wordLibrary = useSelector(getWordLibrary);
  const tabData = [
    {
      value: "ALL",
      label: wordLibrary?.all ?? "全部",
    },
    {
      value: "ARTICLE",
      label: wordLibrary?.article ?? "文章",
    },
    {
      value: "BULLETIN",
      label: wordLibrary?.bulletin ?? "佈告欄",
    },
    // {
    //   value: "EVENT",
    //   label: wordLibrary?.event ?? "事件",
    // },
    // {
    //   value: "FILES",
    //   label: wordLibrary?.files ?? "檔案",
    // },
  ];

  const classes = useStyles();
  const { value, handleChange } = useTab("tab", "ALL");
  const organizationId = useSelector(getSelectedOrgId);
  const {
    query: { query },
  } = useRouter();
  const [startIndex, setStartIndex] = useState(0);
  const [size, setSize] = useState(10);
  const {
    data: result,
    excute: fullTextSearch,
    isLoading: isSearching,
  } = useAxiosApiWrapper(apis.org.fullTextSearch, "None");

  useEffect(() => {
    if (organizationId && query) {
      fullTextSearch({
        organizationId,
        query: query as string,
        startIndex,
        size,
        searchServiceModule: value !== "ALL" ? value : undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, startIndex, size, query, value]);

  const translatedTitle = `${wordLibrary?.["全文檢索"] ?? "全文檢索"} | ${
    wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
  }`;

  return (
    <PrivateLayout
      title={translatedTitle}
      hideBreadcrumbs
      subNavbarText={`"${query}"的搜尋結果`}
    >
      <Main>
        <Container maxWidth={false} noWrapper>
          <Typography variant="h4" className={classes.headerTitle}>
            {`搜尋 `}
            <Typography variant="h4" color="error">
              {query}
            </Typography>
            {` 結果如下`}
          </Typography>
          <ResponsiveTabs
            value={value}
            tabData={tabData}
            onChange={(value) => handleChange(value)}
          />
          {isSearching && (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height={300}
            >
              <CircularProgress />
            </Box>
          )}
          {result?.total === 0 ? (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height={300}
            >
              <Typography>查無資料</Typography>
            </Box>
          ) : (
            result?.source.map((el) => (
              <SearchResultCard
                organizationId={organizationId}
                key={el.searchId}
                searchId={el.searchId}
                searchServiceModule={el.searchServiceModule}
                title={el.searchTitle}
                content={el.searchHighlightContent || el.searchContent}
                updateDate={el.searchCreateDate}
                creatorName={el.creatorName}
                organizationTagTargetList={el.organizationTagTargetList}
              />
            ))
          )}

          <div className={classes.actions}>
            <PaginationBar
              page={startIndex}
              rowsPerPage={size}
              count={result?.total || 0}
              onPageChange={(e, page) => {
                setStartIndex(page);
              }}
              onRowsPerPageChange={(e) => {
                setSize(e.target.value);
              }}
            />
          </div>
        </Container>
      </Main>
    </PrivateLayout>
  );
};

export default Search;
