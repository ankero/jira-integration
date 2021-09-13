import React, { useState, useEffect } from "react";
import styled from "styled-components";
import widgetSDK from "@happeo/widget-sdk";

import {
  BASE_URL,
  POPUP_PARAMS,
  SETTINGS_KEYS,
  WIDGET_SETTINGS,
} from "./constants";
import { IssueList, LoadingIssues } from "./Issues";
import { getAccessibleResources } from "./actions";
import {
  UnauthorizedMessage,
  ErrorMessage,
  SetupMessage,
} from "./StateMessages";

const JiraWidget = ({ id, editMode }) => {
  const [initialized, setInitialized] = useState(false);
  const [widgetApi, setWidgetApi] = useState();
  const [unauthorized, setUnauthorized] = useState(false);
  const [accessibleResources, setAccessibleResources] = useState([]);
  const [settings, setSettings] = useState({});
  const [error, setError] = useState(false);

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
    setError(false);
    const getResources = async () => {
      try {
        const token = await widgetApi.getJWT();
        const items = await getAccessibleResources(token);
        setAccessibleResources(items);
      } catch (error) {
        if (error.message === "unauthorized") {
          setUnauthorized(true);
          setInitialized(false);
        } else {
          setError(error.message);
          widgetApi.reportError(error.message || "unknown error");
        }
      }
    };
    getResources();
  }, [initialized]);

  const retryAuthorization = () => {
    setUnauthorized(false);
    setInitialized(true);
  };

  useEffect(() => {
    if (!unauthorized) {
      return () => {
        window.removeEventListener("focus", retryAuthorization);
      };
    }
  }, [unauthorized]);

  const startAuthorization = async () => {
    const token = await widgetApi.getJWT();
    const url = `${BASE_URL}/oauth/begin?token=${token}&origin=${window.origin}`;
    const params = POPUP_PARAMS;
    const popup = window.open(url, "auth", params);
    window.addEventListener("focus", retryAuthorization);
    window._h = (status) => {
      popup.close();
      if (status === "success") {
        setUnauthorized(false);
        setInitialized(true);
      }
      window._h = null;
    };
  };

  if (unauthorized) {
    return (
      <Container>
        <UnauthorizedMessage authorize={startAuthorization} />
      </Container>
    );
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  const showLoader =
    !initialized ||
    (initialized && accessibleResources.length === 0 && !unauthorized);

  if (showLoader) {
    return (
      <Container>
        <LoadingIssues />
      </Container>
    );
  }

  if (initialized && !settings.resourceId) {
    return <SetupMessage editMode={editMode} />;
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

export default JiraWidget;
