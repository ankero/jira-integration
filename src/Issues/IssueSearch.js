import React, { useEffect, useState, useRef } from "react";
import { IconButton } from "@happeouikit/buttons";
import { Input, LinkExternal } from "@happeouikit/form-elements";
import { IconSearch } from "@happeouikit/icons";
import styled from "styled-components";
import { BodyUI } from "@happeouikit/typography";
import { suggestIssues } from "../actions";
import { Loader } from "@happeouikit/loaders";
import { radius300, shadow300 } from "@happeouikit/theme";
import { margin200, padding200 } from "@happeouikit/layout";
import { toSafeText } from "../utils";
import { warn, active, lighten, alert } from "@happeouikit/colors";

const IssueSearch = ({ widgetApi, rootUrl }) => {
  const autocompleteContainer = useRef();
  const [inFocus, setInFocus] = useState(false);
  const [query, setQuery] = useState("");
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState(false);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    const doQuery = async () => {
      try {
        setLoading(true);
        setSelectedIndex(-1);
        const token = await widgetApi.getJWT();

        const { sections = [] } = await suggestIssues(token, { query });
        let issueList = [];
        sections.forEach(({ issues }) => {
          issueList = [...issueList, ...issues];
        });
        setIssues(issueList);
        setShowList(true);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError(error);
      }
    };

    if (query.length > 1) {
      doQuery();
    }
  }, [query]);

  useEffect(() => {
    const el = autocompleteContainer.current;
    if (!el) {
      return;
    }

    const inputEl = el.querySelector("INPUT");
    if (!inputEl) {
      return;
    }

    function handleDir(event) {
      const key = event.key;

      if (key === "Enter") {
        const selectedLink = el.querySelector(".selected a");
        if (selectedLink) {
          window.open(selectedLink.href, "_blank");
        } else {
          window.open(
            `${rootUrl}/issues/?jql=text%20~%20"${query}*"%20OR%20summary%20~%20"${query}*"`,
            "_blank",
          );
        }
      }

      const dirNo =
        key === "ArrowUp" ? -1 : key === "ArrowDown" || key === "Tab" ? 1 : 0;

      setSelectedIndex((prevValue) => {
        const newVal = Math.max(-1, prevValue + dirNo);

        if (key === "Tab" && newVal !== issues.length) {
          event.preventDefault();
        }

        const minVal = Math.min(newVal, issues.length - 1);

        return minVal;
      });
    }

    function handleFocus() {
      setShowList(true);
      inputEl.addEventListener("keydown", handleDir);
    }

    function handleClick(event) {
      if (!el.contains(event.target)) {
        setShowList(false);
        return;
      }
      if (event.target === inputEl) {
        return;
      }
      inputEl.removeEventListener("keydown", handleDir);
    }

    inputEl.addEventListener("keydown", handleDir);
    inputEl.addEventListener("focus", handleFocus);
    document.addEventListener("click", handleClick);
    return () => {
      inputEl.removeEventListener("keydown", handleDir);
      inputEl.removeEventListener("focus", handleFocus);
      document.removeEventListener("click", handleClick);
    };
  }, [query, issues]);

  const search = (e) => {
    setQuery(e.target.value);
    if (e.target.value === "") {
      setIssues([]);
    }
  };

  return (
    <>
      {inFocus && (
        <AutocompleteContainer ref={autocompleteContainer}>
          <Input
            icon={IconSearch}
            placeholder="Search"
            onChange={search}
            autoFocus
          />
          {showList && (
            <AutocompleteList className="autocomplete-list">
              {issues.map((item, index) => (
                <AutocompleteItem
                  key={item.id}
                  isSelected={index === selectedIndex}
                  className={index === selectedIndex ? "selected" : ""}
                >
                  <LinkExternal href={`${rootUrl}/browse/${item.key}`}>
                    {item.img && <IssueImage src={`${rootUrl}${item.img}`} />}
                    <BodyUI
                      dangerouslySetInnerHTML={{
                        __html: toSafeText(item.summary),
                      }}
                    ></BodyUI>
                  </LinkExternal>
                </AutocompleteItem>
              ))}
              {loading && <Loader containerHeight="40px" />}
              {error && (
                <BodyUI style={{ color: alert, padding: padding200 }}>
                  Unable to search
                </BodyUI>
              )}
            </AutocompleteList>
          )}
        </AutocompleteContainer>
      )}
      {!inFocus && (
        <IconButton
          icon={IconSearch}
          onClick={() => {
            setInFocus(true);
          }}
        />
      )}
    </>
  );
};

const AutocompleteContainer = styled.div`
  position: relative;
  width: 280px;
  max-width: 100%;
`;
const AutocompleteList = styled.ul`
  position: absolute;
  background-color: #fff;
  width: 100%;
  border-radius: 0 0 ${radius300} ${radius300};
  z-index: 1;
  box-shadow: ${shadow300};
`;
const AutocompleteItem = styled.li`
  padding: ${padding200};
  ${({ isSelected }) =>
    isSelected
      ? `
    background-color: ${lighten(active, 0.9)};
  `
      : ``}
  a {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
  }
  p b {
    font-weight: normal;
    background-color: ${warn};
  }
`;
const IssueImage = styled.img`
  width: 24px;
  height: 24px;
  margin-right: ${margin200};
`;
export default IssueSearch;
