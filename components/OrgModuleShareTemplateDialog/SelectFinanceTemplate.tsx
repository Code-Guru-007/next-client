import React, { useEffect } from "react";

import { useSelector } from "react-redux";
import { useAppDispatch } from "redux/configureAppStore";
import useOrgFinanceTemplates from "utils/useOrgFinanceTemplates";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";

import List from "@eGroupAI/material/List";
import ListItem from "@eGroupAI/material/ListItem";
import ListItemButton from "@eGroupAI/material/ListItemButton";
import ListItemIcon from "@eGroupAI/material/ListItemIcon";
import ListItemText from "@eGroupAI/material/ListItemText";
import Checkbox from "@eGroupAI/material/Checkbox";

import { OrganizationFinanceTemplate } from "interfaces/entities";
import { getOrgFinanceTemplateList } from "redux/createUserInfoFilledUrlDialog/selectors";
import { setOrgFinanceTemplates } from "redux/createUserInfoFilledUrlDialog";
import { getWordLibrary } from "redux/wordLibrary/selectors";

const SelectFinanceTemplate = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const { setPreviewData } = props;
  const organizationId = useSelector(getSelectedOrgId);
  const dispatch = useAppDispatch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const financeTemplates = useSelector(getOrgFinanceTemplateList) || [];
  const { data } = useOrgFinanceTemplates({
    organizationId,
  });

  const checkedAll = data?.source.length === financeTemplates.length;
  const indeterminate =
    financeTemplates.length > 0 &&
    data?.source.length !== financeTemplates.length;

  useEffect(() => {
    setPreviewData((prev) => ({
      ...prev,
      organizationFinanceTemplateList: financeTemplates,
    }));
  }, [financeTemplates, setPreviewData]);

  const handleToggleAll = () => {
    if (checkedAll) {
      dispatch(setOrgFinanceTemplates([]));
    } else {
      dispatch(
        setOrgFinanceTemplates(data?.source as OrganizationFinanceTemplate[])
      );
    }
  };

  const handleToggle = (value: OrganizationFinanceTemplate) => () => {
    const currentIndex = financeTemplates?.findIndex(
      (o) =>
        o.organizationFinanceTemplateId === value.organizationFinanceTemplateId
    );
    const newList = [...financeTemplates];

    if (currentIndex === -1) {
      newList.push(value);
    } else {
      newList.splice(currentIndex, 1);
    }
    dispatch(setOrgFinanceTemplates(newList));
  };

  return (
    <List>
      <ListItem disablePadding>
        <ListItemButton onClick={handleToggleAll}>
          <ListItemIcon>
            <Checkbox
              edge="start"
              disableRipple
              checked={checkedAll}
              indeterminate={indeterminate}
            />
          </ListItemIcon>
          <ListItemText primary={wordLibrary?.all ?? "全部"} />
        </ListItemButton>
      </ListItem>
      {data?.source?.map((el) => (
        <ListItem disablePadding key={el.organizationFinanceTemplateId}>
          <ListItemButton onClick={handleToggle(el)}>
            <ListItemIcon>
              <Checkbox
                edge="start"
                disableRipple
                checked={
                  !!financeTemplates?.find(
                    (o) =>
                      o.organizationFinanceTemplateId ===
                      el.organizationFinanceTemplateId
                  )
                }
              />
            </ListItemIcon>
            <ListItemText primary={el.organizationFinanceTemplateName} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default SelectFinanceTemplate;
