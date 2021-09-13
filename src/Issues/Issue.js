import React from "react";
import styled from "styled-components";
import { active } from "@happeouikit/colors";
import { BodyUI } from "@happeouikit/typography";
import { Tooltip } from "@happeouikit/tooltip";
import { LiStriped, LiCol } from "@happeouikit/list";

import IssueBadge from "./IssueBadge";
import { AVAILABLE_COLUMNS, ISSUE_FIELDS } from "../constants";

const Issue = ({ issue, rootUrl, selectedColumns }) => {
  const { id, key, fields } = issue;
  const {
    issuetype,
    priority,
    summary,
    created,
    assignee,
    reporter,
    duedate,
    updated,
    status,
  } = fields;

  const assigneeName = assignee?.displayName || "Unassigned";
  const reporterName = reporter?.displayName || "na";
  const issueUrl = `${rootUrl}/browse/${key}`;
  const createdTimestamp = new Date(created).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const duedateTimestamp = new Date(duedate).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const updatedTimestamp = new Date(updated).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const openIssue = () => window.open(issueUrl, "_blank").focus();

  const getColumnContent = (field) => {
    switch (field) {
      case ISSUE_FIELDS.issuetype:
        return <IssueBadge item={issuetype} />;
      case ISSUE_FIELDS.key:
        return (
          <StyledLink aria-label={summary} role="button" onClick={openIssue}>
            <BodyUI>{key}</BodyUI>
          </StyledLink>
        );
      case ISSUE_FIELDS.summary:
        return (
          <>
            <StyledLink aria-label={summary} role="button" onClick={openIssue}>
              <LongText data-for={id} data-tip={summary}>
                {summary}
              </LongText>
            </StyledLink>
            <Tooltip id={id} />
          </>
        );
      case ISSUE_FIELDS.priority:
        return <IssueBadge item={priority} />;
      case ISSUE_FIELDS.status:
        return <IssueBadge item={status} />;
      case ISSUE_FIELDS.created:
        return <BodyUI>{createdTimestamp}</BodyUI>;
      case ISSUE_FIELDS.duedate:
        return <BodyUI>{duedateTimestamp}</BodyUI>;
      case ISSUE_FIELDS.updated:
        return <BodyUI>{updatedTimestamp}</BodyUI>;
      case ISSUE_FIELDS.assignee:
        return (
          <BodyUI style={{ fontStyle: assignee ? "" : "italic" }}>
            {assigneeName}
          </BodyUI>
        );
      case ISSUE_FIELDS.reporter:
        return (
          <BodyUI style={{ fontStyle: reporter ? "" : "italic" }}>
            {reporterName}
          </BodyUI>
        );
      default:
        break;
    }
  };

  const columns = AVAILABLE_COLUMNS.filter(({ field }) =>
    selectedColumns.includes(field),
  );

  return (
    <LiStriped key={id}>
      {columns.map(({ field }) => (
        <LiCol key={field} width={"auto"}>
          {getColumnContent(field)}
        </LiCol>
      ))}
    </LiStriped>
  );
};

const LongText = styled(BodyUI)`
  min-width: 0;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 200px;
`;

const StyledLink = styled.div`
  cursor: pointer;
  width: 100%;
  text-align: left;
  :hover p {
    color: ${active};
    text-decoration: underline;
  }
`;

export default Issue;
