import React from "react";
import JiraWidget from "./JiraWidget";

class happeoCustomReactWidget extends HTMLElement {
  connectedCallback() {
    const uniqueId = this.getAttribute("uniqueId") || "";
    const mode = this.getAttribute("mode") || "";

    ReactDOM.render(
      <JiraWidget id={uniqueId} editMode={mode === "edit"} />,
      this,
    );
  }
}

const slug = "jiraissues-iguqcpwt3vtrpqsouzeu";

window.customElements.get(slug) ||
  window.customElements.define(slug, happeoCustomReactWidget);
