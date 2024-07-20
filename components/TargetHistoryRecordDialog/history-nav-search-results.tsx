// @mui
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import ListItemButton from "@mui/material/ListItemButton";
// types
//
import SearchNotFound from "minimal/components/search-not-found";
import { OrganizationTargetHistoryRecord } from "interfaces/entities";

// ----------------------------------------------------------------------

type Props = {
  searchQuery: string;
  searchResults: OrganizationTargetHistoryRecord[];
  onClickResult: (contact: OrganizationTargetHistoryRecord) => void;
};

export default function HistoryNavSearchResults({
  searchQuery,
  searchResults,
  onClickResult,
}: Props) {
  const totalResults = searchResults.length;

  const notFound = !totalResults && !!searchQuery;

  return (
    <>
      <Typography
        paragraph
        variant="h6"
        sx={{
          px: 2.5,
        }}
      >
        Contacts ({totalResults})
      </Typography>

      {notFound ? (
        <SearchNotFound
          query={searchQuery}
          sx={{
            p: 3,
            mx: "auto",
            width: `calc(100% - 40px)`,
            bgcolor: "background.neutral",
          }}
        />
      ) : (
        <>
          {searchResults.map((result) => (
            <ListItemButton
              key={result.targetHistoryRecordId}
              onClick={() => onClickResult(result)}
              sx={{
                px: 2.5,
                py: 1.5,
                typography: "subtitle2",
              }}
            >
              <Avatar
                alt={result.updater?.memberName}
                src={result.updater?.memberName}
                sx={{ mr: 2 }}
              />
              {result.updater?.memberName}
            </ListItemButton>
          ))}
        </>
      )}
    </>
  );
}
