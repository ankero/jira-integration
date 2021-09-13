import React, { useState, useEffect } from "react";

import {
  ListStripedContainer,
  ListHeader,
} from "@happeouikit/list";

import { searchIssues } from "../actions";
import LoadingIssues from "./LoadingIssues";
import Issue from "./Issue"
import { AVAILABLE_COLUMNS, DEFAULT_COLUMNS, ORDER_BY_REGEX, SETTINGS_KEYS } from "../constants";
import ColumnsFilter from "./ColumnsFilter";


const IssueList = ({ widgetApi, settings, rootUrl, editMode }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [issues, setIssues] = useState([]);
  const [sortDir, setSortDir] = useState("asc");
  const [sortField, setSortField] = useState("");
  const [selectedColumns, setSelectedColumns] = useState(settings.selectedColumns && settings.selectedColumns !== "" ? JSON.parse(settings.selectedColumns) : DEFAULT_COLUMNS)

  useEffect(() => {
    let mounted = true;
    const get = async () => {
      setError(false);
      setLoading(true);
      try {
        const match = ORDER_BY_REGEX.exec(settings.jql.toLowerCase())
        if (match?.length === 3) {
          setSortField(match[1])
          setSortDir(match[2])
        }

        const token = await widgetApi.getJWT();
        const result = await searchIssues(token, { jql: settings.jql || "", resourceId: settings.resourceId, maxResults: settings.maxResults || 10 });
        if (mounted) setIssues(result);
      } catch (error) {
        if (mounted) setError(true);
      }
      setLoading(false);
    };

    if (widgetApi) get();
    return () => {
      mounted = false;
    };
  }, [widgetApi, settings]);

  useEffect(() => {
    if (issues.length <= 1) {
      return;
    }

    let mounted = true;

    const applySort = async () => {
      let jql = settings.jql || "";

      const match = ORDER_BY_REGEX.exec(jql.toLowerCase());
      if (match?.length === 3) {
        jql = jql.replace(ORDER_BY_REGEX, "")
      }
      jql = `${jql} order by ${sortField}${" " + sortDir.toUpperCase()}`

      const token = await widgetApi.getJWT();
      const result = await searchIssues(token, { jql: jql.trim(), resourceId: settings.resourceId });
      if (result.errorMessage) {
        return;
      }
      if (mounted) setIssues(result);
    }

    applySort();

    return () => {
      mounted = false;
    };

  }, [sortDir, sortField])

  const setSort = (fieldKey) => {
    setSortDir(prevValue => prevValue === "asc" ? "desc" : "asc");
    setSortField(fieldKey);
  }

  const onChangeFilter = data => {
    setSelectedColumns(data);
    const newSettings = { ...settings, [SETTINGS_KEYS.selectedColumns]: JSON.stringify(data) };
    widgetApi.setSettings(newSettings);
  }

  if (error) {
    return <div>Something went wrong</div>;
  }

  if (loading) {
    return <LoadingIssues />
  }

  return (
    <StyledListStripedContainer style={{ flex: 1 }} selectedColumns={selectedColumns}>
      {editMode && (<Header>
        <ColumnsFilter onChangeFilter={onChangeFilter} selectedColumns={selectedColumns} />
      </Header>)}
      <ListHeader headers={AVAILABLE_COLUMNS.filter(({ field }) => selectedColumns.includes(field))} sortDir={sortDir} sortField={sortField} sortFn={setSort} />
      {issues.map((issue) => <Issue key={issue.id} issue={issue} rootUrl={rootUrl} selectedColumns={selectedColumns} />)}
    </StyledListStripedContainer>
  );
};

const Header = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const StyledListStripedContainer = styled(ListStripedContainer)`
  > li {
    display: grid;
    grid-template-columns: ${({ selectedColumns }) => AVAILABLE_COLUMNS.filter(({ field }) => selectedColumns.includes(field)).map(({ gridWidth }) => gridWidth).join(" ")};
    > div {
      width: auto;
    }
  }
`


export default IssueList;
