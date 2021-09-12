import React from "react"
import styled from "styled-components";
import { active } from "@happeouikit/colors";
import { BodyUI } from "@happeouikit/typography";
import { Tooltip }from "@happeouikit/tooltip"
import {
  LiStriped,
  LiCol,
} from "@happeouikit/list";

import IssueBadge from "./IssueBadge"


const Issue = ({ issue, rootUrl }) => {
  const { id, key, fields } = issue;
  const { issuetype, priority, summary, created, assignee } = fields;

  const assigneeName = assignee?.displayName || "Unassigned";

  const issueUrl = `${rootUrl}/browse/${key}`;
  const timestamp = new Date(created).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const openIssue = () => window.open(issueUrl, "_blank").focus()

  return (
    <LiStriped key={id}>
      <LiCol width="10%">
        <IssueBadge item={issuetype} />
      </LiCol>
      <LiCol width="10%">
        <StyledLink
          aria-label={summary}
          role="button"
          onClick={openIssue}
        >
          <BodyUI>{key}</BodyUI></StyledLink>
      </LiCol>
      <LiCol width="30%">
        <StyledLink
          aria-label={summary}
          role="button"
          onClick={openIssue}
        >
          <LongText data-for={id} data-tip={summary}>
            {summary}
          </LongText>
          
        </StyledLink>
        <Tooltip id={id} />
      </LiCol>
      <LiCol width="10%"><IssueBadge item={priority} /></LiCol>
      <LiCol width="20%"><BodyUI>{timestamp}</BodyUI></LiCol>
      <LiCol width="20%"><BodyUI style={{fontStyle: assignee ? "" : "italic"}}>{assigneeName}</BodyUI></LiCol>
    </LiStriped>
  );
}

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