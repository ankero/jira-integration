import React, { useState, useEffect } from "react";

import {
  ListStripedContainer,
  ListHeader,
} from "@happeouikit/list";

import { searchIssues } from "../actions";
import LoadingIssues from "./LoadingIssues";
import Issue from "./Issue"
import { ORDER_BY_REGEX } from "../constants";

const HEADERS = [
  {
    name: "T",
    field: "issuetype",
    width: "10%",
    sortable: true
  },
  {
    name: "Key",
    field: "key",
    width: "10%",
    sortable: true
  },
  {
    name: "Summary",
    field: "summary",
    width: "30%",
    sortable: true
  },
  {
    name: "P",
    field: "priority",
    width: "10%",
    sortable: true
  },
  {
    name: "Created",
    field: "created",
    width: "20%",
    sortable: true
  },
  {
    name: "Assignee",
    field: "assignee",
    width: "20%",
    sortable: true
  },
];

const IssueList = ({ widgetApi, settings, rootUrl }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [issues, setIssues] = useState([]);
  const [sortDir, setSortDir] = useState("asc");
  const [sortField, setSortField] = useState("");

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
        const result = await searchIssues(token, { jql: settings.jql || "", resourceId: settings.resourceId, maxResults: settings.maxResults || 10 });
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

  if (error) {
    return <div>Something went wrong</div>;
  }

  if (loading) {
    return <LoadingIssues />
  }

  return (
    <ListStripedContainer style={{ flex: 1 }}>
      <>
        <ListHeader headers={HEADERS} sortDir={sortDir} sortField={sortField} sortFn={setSort} />
        {issues.map((issue) => <Issue key={issue.id} issue={issue} rootUrl={rootUrl} />)}
      </>
    </ListStripedContainer>
  );
};


export default IssueList;
