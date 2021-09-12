import React, { useState, useEffect } from "react";
import styled from "styled-components";

import widgetSDK from "@happeo/widget-sdk";
import { SETTINGS_KEYS, WIDGET_SETTINGS } from "./constants";

import { IssueList, TicketList } from "./TicketList";
import { SubmitTicket } from "./SubmitTicket";
import { getAccessibleResources } from "./actions";
import { ButtonPrimary } from "@happeouikit/buttons";
import LoadingTickets from "./TicketList/LoadingIssues";

const ZendeskWidget = ({ id, editMode }) => {
  const [initialized, setInitialized] = useState(false);
  const [widgetApi, setWidgetApi] = useState();
  const [unauthorized, setUnauthorized] = useState(false);
  const [accessibleResources, setAccessibleResources] = useState([])
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
    const settings = WIDGET_SETTINGS.map(item => {
      if (item.key !== SETTINGS_KEYS.resourceId) {
        return item;
      }
      return {
        ...item,
        options: accessibleResources.map(item => ({label: item.name, value: item.id}))
      }
    })

    widgetApi.declareSettings(settings, setSettings);
  },[accessibleResources])

  useEffect(() => {
    if (!initialized || !widgetApi) {
      return;
    }

    const getResources = async () => {
      try {
        const token = await widgetApi.getJWT();
        const items = await getAccessibleResources(token);
        setAccessibleResources(items);
        } catch (error) {
          if (error.message === "unauthorized") {
            setUnauthorized(true)
          }
        }
      
    }
    getResources()
  },[initialized])

  const startAuthorization = async () => {
    const token = await widgetApi.getJWT();
    window.open(`https://jira-integration-huuhwkj6na-ew.a.run.app/oauth/begin?token=${token}&origin=${window.origin}`, '_blank').focus();
  }

  if (!initialized) {
    // We don't want to show any loaders
    return null;
  }

  const showLoader = !initialized || initialized && accessibleResources.length === 0;

  return (
    <Container>
      {showLoader && <LoadingTickets />}
      {initialized && editMode && !settings.resourceId && <p>Select Jira site on the right side panel.</p>}
      {initialized && unauthorized && <ButtonPrimary onClick={startAuthorization} text="Authorize Jira"/>}
      {!unauthorized && settings.resourceId && accessibleResources.length > 0 && <IssueList widgetApi={widgetApi} settings={settings} rootUrl={accessibleResources.find(({id}) => id === settings.resourceId)?.url} />}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex: 1;
  min-height: 100px;
`;

export default ZendeskWidget;
