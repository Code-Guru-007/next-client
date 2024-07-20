import React, { FC, useEffect, useMemo, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import DynamicField, {
  RemarkValues,
} from "components/DynamicField/DynamicField";
import ColumnDescription from "components/ColumnDescription";
import Popover from "@eGroupAI/material/Popover";
import { DynamicColumnData, OrganizationColumn } from "interfaces/entities";
import getOrgColumnGroupByGroup from "utils/getOrgColumnsGroupByGroup";

interface DynamicFieldsFormProps extends DynamicColumnData {
  /**
   * all columns - used to find out next column for the options has nextColumnIds
   */
  orgColumns?: OrganizationColumn[];
  /**
   * limited all columns - used when limited columns must be rendered.
   */
  limitedColumns?: OrganizationColumn[];
  isOpen?: boolean;
  /**
   * trigger point of rendering all fields that not rendered yet by unscrolled to the end
   * @default false
   */
  shouldRenderAll?: boolean;
  /**
   * indicates that component is not using infinitive scroll rendering by render all fields at the very first time
   * @default false
   */
  isNotInifinitive?: boolean;
  setIsMoreRendering?: React.Dispatch<React.SetStateAction<boolean>>;
  setShouldSubmitAgainNow?: React.Dispatch<React.SetStateAction<boolean>>;
  remarkValues: RemarkValues;
  /**
   * used to determine nextColumns to be rendered with no option selection
   * @default false if dynamic field is set as next column, does not render.
   * if true all fields are rendered - in this case the next columns are duplicated.
   */
  renderNextColumns?: boolean;
}

const DynamicFieldsForm: FC<DynamicFieldsFormProps> = function (props) {
  const {
    orgColumns,
    limitedColumns,
    orgColumnsGroupByGroup,
    isOpen,
    isNotInifinitive = false,
    shouldRenderAll = false,
    setIsMoreRendering,
    setShouldSubmitAgainNow,
    values,
    errors,
    handleChange,
    handleErrors,
    dynamicOptions,
    handleChangeRemark,
    setColumnTargetValues,
    remarkValues,
    renderNextColumns = false,
  } = props;

  // --- get all next column id list --- //
  const allNextColumns = Object.values(dynamicOptions).reduce((a, options) => {
    const optNextColumnIds = options?.reduce((a, opt) => {
      if (opt.nextColumnId) return { ...a, [opt.nextColumnId]: true };
      return { ...a };
    }, {});
    return { ...a, ...optNextColumnIds };
  }, {});
  const nextColumnIds = Object.keys(allNextColumns);
  // --- get all next column id list --- //

  const [descr, setDescr] = useState<string>("");
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>, dsc) => {
    setDescr(dsc);
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const columns = limitedColumns || orgColumns;

  const [selectedNextColumnIds, setSelectedNextColumnIds] = useState<{
    [parentKey: string]: string | undefined;
  }>({});

  const maxScrollNumber = useMemo(
    () => (columns?.length ? Math.ceil(columns?.length / 5) + 1 : 2),
    [columns?.length]
  );

  useEffect(() => {
    const handleMouseClick = (event) => {
      const popover = document.getElementById("mouse-over-popover");
      const clickedElement = event.target as HTMLElement;
      const descButtons = document.querySelectorAll('[id^="description-btn-"]');
      let isDescButton = false;
      descButtons.forEach((descButton) => {
        if (descButton.contains(clickedElement)) isDescButton = true;
      });

      if (
        popover &&
        open &&
        !popover.contains(clickedElement) &&
        !isDescButton
      ) {
        handlePopoverClose();
      }
    };

    document.addEventListener("click", handleMouseClick);

    return () => {
      document.removeEventListener("click", handleMouseClick);
    };
  }, [open]);

  const [scrollNumber, setScrollNumber] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const reducedColumnGroup = useMemo(() => {
    if (isOpen) {
      const order = Object.keys(orgColumnsGroupByGroup);
      const renderColumn = columns
        ?.sort(
          (a, b) =>
            order.indexOf(a.organizationColumnGroup?.columnGroupId || "none") -
            order.indexOf(b.organizationColumnGroup?.columnGroupId || "none")
        )
        ?.slice(0, scrollNumber * 5);
      return getOrgColumnGroupByGroup(renderColumn);
    }
    setScrollNumber(1);
    setHasMore(true);
    return [];
  }, [columns, orgColumnsGroupByGroup, scrollNumber, isOpen]);

  const fetchData = () => {
    setScrollNumber(scrollNumber + 1);
    if (scrollNumber * 5 >= Number(columns?.length)) {
      setHasMore(false);
    }
  };

  useEffect(() => {
    if (shouldRenderAll) {
      setScrollNumber(maxScrollNumber);
      setHasMore(false);
      if (setIsMoreRendering) setIsMoreRendering(false);
      if (setShouldSubmitAgainNow) setShouldSubmitAgainNow(true);
    } else {
      setScrollNumber(1);
      setHasMore(true);
    }
  }, [
    maxScrollNumber,
    setIsMoreRendering,
    setShouldSubmitAgainNow,
    shouldRenderAll,
  ]);

  useEffect(() => {
    if (isNotInifinitive) setScrollNumber(maxScrollNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <InfiniteScroll
      dataLength={5 * scrollNumber}
      next={fetchData}
      hasMore={hasMore}
      loader={<></>}
      scrollableTarget="column-dialog"
      style={{
        overflow: "unset",
      }}
    >
      {Object.keys(reducedColumnGroup).map((groupKey) => (
        <Card sx={{ width: "100%", my: 2 }} key={groupKey}>
          {groupKey !== "none" && (
            <CardHeader
              title={
                reducedColumnGroup[groupKey][0].organizationColumnGroup
                  ?.columnGroupName
              }
            />
          )}
          {groupKey === "none" && reducedColumnGroup[groupKey].length > 0 && (
            <CardHeader title="" />
          )}
          <Stack spacing={3} sx={{ p: 3 }}>
            {reducedColumnGroup[groupKey]?.map((el: OrganizationColumn) => {
              const options = dynamicOptions[el.columnId];
              const optionsHasNextColumn = options?.filter(
                (opt) => opt.nextColumnId
              );

              const optionsNextColumns = optionsHasNextColumn?.reduce<
                OrganizationColumn[]
              >((a, o) => {
                const find = orgColumns?.find(
                  (col) => col.columnId === o.nextColumnId
                );
                if (find) return [...a, find];
                return [...a];
              }, []);

              const selectedNextColumn = optionsNextColumns?.find(
                (nextCol) =>
                  nextCol.columnId === selectedNextColumnIds[el.columnId]
              );

              const isThisNextColumn = nextColumnIds.includes(el.columnId);

              return (
                <>
                  {(!isThisNextColumn || renderNextColumns) && (
                    <Stack spacing={1.5}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {el.columnName} {el.isRequired === 1 && "*"}
                        {el?.columnDescription ? (
                          <>
                            <IconButton
                              aria-label="help"
                              sx={{ color: "#637381" }}
                              onClick={(e) => {
                                handlePopoverOpen(e, el?.columnDescription);
                              }}
                              id={`description-btn-${el?.columnId}`}
                            >
                              <HelpOutlineIcon sx={{ fontSize: "18px" }} />
                            </IconButton>
                          </>
                        ) : (
                          ""
                        )}
                      </Typography>
                      <DynamicField
                        errorState={errors[el.columnId]}
                        handleChange={handleChange}
                        handleErrors={handleErrors}
                        name={el.columnId}
                        type={el.columnType}
                        fullWidth
                        options={options}
                        isEditor={el.isEditor === 1}
                        editorTemplateContent={el.columnEditorTemplateContent}
                        min={el.columnNumberMin}
                        max={el.columnNumberMax}
                        hasValidator={el.hasValidator === 1}
                        validator={el.columnValidatorRegex}
                        hasRemark={el.hasValueRemark === 1}
                        requiredRemark={el.isRequiredValueRemark === 1}
                        required={el.isRequired === 1}
                        numberUnit={el.columnNumberUnit}
                        numberDecimal={el.columnNumberOfDecimal}
                        isRelatedServiceModule={Boolean(
                          el.isRelatedServiceModule
                        )}
                        remarkList={remarkValues[el.columnId]}
                        columnRelatedServiceModuleValue={
                          el.columnRelatedServiceModuleValue
                        }
                        hasNextColumn={el.hasNextColumn === 1}
                        setSelectedNextColumnIds={setSelectedNextColumnIds}
                        handleChangeRemark={handleChangeRemark}
                        maxOptionBeSelected={el.maxOptionBeSelected}
                        minOptionBeSelected={el.minOptionBeSelected}
                        setColumnTargetValues={setColumnTargetValues}
                      />
                    </Stack>
                  )}
                  {selectedNextColumn && selectedNextColumnIds[el.columnId] && (
                    <Stack spacing={1.5}>
                      <Typography variant="subtitle2">
                        {selectedNextColumn.columnName}
                      </Typography>
                      <DynamicField
                        value={values[selectedNextColumn.columnId]}
                        errorState={errors[selectedNextColumn.columnId]}
                        handleChange={handleChange}
                        handleErrors={handleErrors}
                        name={selectedNextColumn.columnId}
                        type={selectedNextColumn.columnType}
                        fullWidth
                        options={dynamicOptions[selectedNextColumn.columnId]}
                        isEditor={selectedNextColumn.isEditor === 1}
                        editorTemplateContent={
                          selectedNextColumn.columnEditorTemplateContent
                        }
                        min={selectedNextColumn.columnNumberMin}
                        max={selectedNextColumn.columnNumberMax}
                        hasValidator={selectedNextColumn.hasValidator === 1}
                        validator={selectedNextColumn.columnValidatorRegex}
                        hasRemark={selectedNextColumn.hasValueRemark === 1}
                        requiredRemark={
                          selectedNextColumn.isRequiredValueRemark === 1
                        }
                        remarkList={remarkValues[selectedNextColumn.columnId]}
                        required={selectedNextColumn.isRequired === 1}
                        numberUnit={selectedNextColumn.columnNumberUnit}
                        numberDecimal={selectedNextColumn.columnNumberOfDecimal}
                        isRelatedServiceModule={Boolean(
                          selectedNextColumn.isRelatedServiceModule
                        )}
                        columnRelatedServiceModuleValue={
                          selectedNextColumn.columnRelatedServiceModuleValue
                        }
                        hasNextColumn={selectedNextColumn.hasNextColumn === 1}
                        handleChangeRemark={handleChangeRemark}
                        maxOptionBeSelected={el.maxOptionBeSelected}
                        minOptionBeSelected={el.minOptionBeSelected}
                        setColumnTargetValues={setColumnTargetValues}
                      />
                    </Stack>
                  )}
                </>
              );
            })}
          </Stack>
          <Popover
            id="mouse-over-popover"
            sx={{
              pointerEvents: "none",
            }}
            open={open}
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            onClose={handlePopoverClose}
            PaperProps={{
              style: { pointerEvents: "auto" },
            }}
          >
            <ColumnDescription descr={descr} handleClose={handlePopoverClose} />
          </Popover>
        </Card>
      ))}
    </InfiniteScroll>
  );
};

export default React.memo(DynamicFieldsForm);
