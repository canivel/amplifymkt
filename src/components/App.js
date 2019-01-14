import React, { Component } from "react";
import { withAuthenticator, AmplifyTheme } from "aws-amplify-react";
import { AutoComplete } from "element-react";

export class App extends Component {
  render() {
    return (
      <div>
        <h1>App</h1>
      </div>
    );
  }
}

const theme = {
  ...AmplifyTheme,
  button: {
    ...AmplifyTheme.button,
    backgroundColor: "#4dbd7f",
    color: "white"
  },
  sectionBody: {
    ...AmplifyTheme.sectionBody,
    padding: "5px"
  },
  sectionHeader: {
    ...AmplifyTheme.sectionHeader,
    backgroundColor: "#4dbd7f",
    color: "white"
  },
  navBar: {
    ...AmplifyTheme.navBar,
    backgroundColor: "#4dbd7f",
    color: "white"
  },
  body: {
    ...AmplifyTheme.body,
    margin: "0"
  }
};

export default withAuthenticator(App, true, [], null, theme);
