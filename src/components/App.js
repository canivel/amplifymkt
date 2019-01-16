import React, { Component } from "react";
import { Authenticator, AmplifyTheme } from "aws-amplify-react";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import MarketPage from "./pages/MarketPage";
import { Auth, Hub } from "aws-amplify";
import { BrowserRouter as Router, Route } from "react-router-dom";
import NavBar from "./Navbar";
import "../static/css/App.css";

export const UserContext = React.createContext();

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

  handleSignOut = async () => {
    try {
      await Auth.signOut();
    } catch (err) {
      console.log(err);
    }
  };

  renderHelper = () => {
    const { user } = this.state;
    return !user ? (
      <Authenticator theme={theme} />
    ) : (
      <UserContext.Provider value={{ user }}>
        <Router>
          <>
            {/* Navbar */}
            <NavBar user={user} handleSignOut={this.handleSignOut} />
            {/* Routes */}
            <div className="app-container">
              <Route exact path="/" component={Dashboard} />
              <Route exact path="/profile" component={ProfilePage} />
              <Route
                exact
                path="/markets/:marketId"
                component={({ match }) => (
                  <MarketPage marketId={match.params.marketId} user={user} />
                )}
              />
            </div>
          </>
        </Router>
      </UserContext.Provider>
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
