import React, { useState, useEffect } from "react";
import styled from "styled-components";

import widgetSDK from "@happeo/widget-sdk";
import { SETTINGS_KEYS, WIDGET_SETTINGS } from "./constants";
import { margin300, padding300 } from "@happeouikit/layout";

import { IssueList } from "./TicketList";
import { getAccessibleResources } from "./actions";
import LoadingTickets from "./TicketList/LoadingIssues";
import UnauthorizedMessage from "./UnauthorizedMessage";
import { BodyUI, TextEpsilon } from "@happeouikit/typography";

const JiraWidget = ({ id, editMode }) => {
  const [initialized, setInitialized] = useState(false);
  const [widgetApi, setWidgetApi] = useState();
  const [unauthorized, setUnauthorized] = useState(false);
  const [accessibleResources, setAccessibleResources] = useState([]);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    const doInit = async () => {
      const api = await widgetSDK.api.init(id);
      setWidgetApi(api);
      setInitialized(true);
    };
    doInit();
  }, [editMode, id]);

  useEffect(() => {
    if (!widgetApi) {
      return;
    }
    const settings = WIDGET_SETTINGS.map((item) => {
      if (item.key !== SETTINGS_KEYS.resourceId) {
        return item;
      }
      return {
        ...item,
        options: accessibleResources.map((item) => ({
          label: item.name,
          value: item.id,
        })),
      };
    });

    widgetApi.declareSettings(settings, setSettings);
  }, [accessibleResources]);

  useEffect(() => {
    if (!initialized || !widgetApi) {
      return;
    }

    const getResources = async () => {
      try {
        const token = await widgetApi.getJWT();
        const items = await getAccessibleResources(token);
        setAccessibleResources(items);
      } catch (error) {
        if (error.message === "unauthorized") {
          setUnauthorized(true);
        }
      }
    };
    getResources();
  }, [initialized]);

  const startAuthorization = async () => {
    const token = await widgetApi.getJWT();
    const url = `https://jira-integration-huuhwkj6na-ew.a.run.app/oauth/begin?token=${token}&origin=${window.origin}`;
    const params =
      "scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=600,height=600,left=100,top=100";
    const popup = window.open(url, "auth", params);

    window._h = (status) => {
      console.log(status);
      popup.close();
      if (status === "success") {
        setUnauthorized(false);
      }
      window._h = null;
    };
  };

  const showLoader =
    !initialized ||
    (initialized && accessibleResources.length === 0 && !unauthorized);

  if (showLoader) {
    return (
      <Container>
        <LoadingTickets />
      </Container>
    );
  }

  if (initialized && unauthorized) {
    return (
      <Container>
        <UnauthorizedMessage authorize={startAuthorization} />
      </Container>
    );
  }

  if (initialized && !settings.resourceId) {
    return (
      <SetupMessage>
        <TextEpsilon>Jira widget</TextEpsilon>
        {editMode ? (
          <BodyUI style={{ marginTop: margin300 }}>
            Configure Jira widget from the right side panel.
          </BodyUI>
        ) : (
          <BodyUI style={{ marginTop: margin300 }}>
            This widget needs to be configured. Please open pages edit mode to
            continue.
          </BodyUI>
        )}
      </SetupMessage>
    );
  }

  return (
    <Container>
      <IssueList
        widgetApi={widgetApi}
        settings={settings}
        rootUrl={
          accessibleResources.find(({ id }) => id === settings.resourceId)?.url
        }
        editMode={editMode}
      />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex: 1;
  min-height: 100px;
`;

const SetupMessage = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${padding300};
  align-items: center;
  justify-content: center;
`;

export default JiraWidget;
