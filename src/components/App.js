import React, { Component } from "react";
import { Authenticator, AmplifyTheme } from "aws-amplify-react";
import Dashboard from "./Dashboard";
import { Auth, Hub } from "aws-amplify";
import { BrowserRouter as Router, Route } from "react-router-dom";

export class App extends Component {
  state = { user: null };

  async componentDidMount() {
    //Auth.signOut().then(c => console.log(c));
    this.getUserData();
    Hub.listen("auth", this, "onHubCapsule");
  }

  getUserData = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      user ? this.setState({ user }) : this.setState({ user: null });
      console.log(user);
    } catch (err) {
      console.log(err);
    }
  };

  onHubCapsule = capsule => {
    switch (capsule.payload.event) {
      case "signIn":
        console.log("signed in");
        this.getUserData();
        break;
      case "signUp":
        console.log("sign up");
        break;
      case "signOut":
        console.log("sign out");
        this.setState({ user: null });
        break;
      default:
        // console.log(capsule.payload.event);
        return;
    }
  };

  renderHelper = () => {
    const { user } = this.state;
    return !user ? (
      <Authenticator theme={theme} />
    ) : (
      <Router>
        <>
          {/* Routes */}
          <div className="app-container">
            <Route exact path="/" component={HomePage} />
          </div>
        </>
      </Router>
    );
  };

  render() {
    return <div>{this.renderHelper()}</div>;
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

export default App;
