import React, { Component } from "react";
import { Authenticator, AmplifyTheme } from "aws-amplify-react";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import MarketPage from "./pages/MarketPage";
import { Auth, Hub, API, graphqlOperation } from "aws-amplify";
import { Router, Route } from "react-router-dom";
import createBrowserHistory from "history/createBrowserHistory";
import NavBar from "./Navbar";
import "../static/css/App.css";
import { getUser } from "../graphql/queries";
import { registerUser } from "../graphql/mutations";

export const history = createBrowserHistory();

export const UserContext = React.createContext();

export class App extends Component {
  state = { user: null, userAttributes: null };

  async componentDidMount() {
    //Auth.signOut().then(c => console.log(c));
    this.getUserData();
    Hub.listen("auth", this, "onHubCapsule");
  }

  getUserData = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      user
        ? this.setState({ user }, () => this.getuserAttributes(this.state.user))
        : this.setState({ user: null });
    } catch (err) {
      console.log(err);
    }
  };

  getuserAttributes = async authUserData => {
    const attributesArr = await Auth.userAttributes(authUserData);
    const attributesObj = await Auth.attributesToObject(attributesArr);
    this.setState({ userAttributes: attributesObj });
  };

  onHubCapsule = capsule => {
    switch (capsule.payload.event) {
      case "signIn":
        console.log("signed in");
        this.getUserData();
        this.registerNewUser(capsule.payload.data);
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

  registerNewUser = async signInData => {
    const getUserInput = {
      id: signInData.signInUserSession.idToken.payload.sub
    };

    const { data } = await API.graphql(graphqlOperation(getUser, getUserInput));

    if (!data.getUser) {
      try {
        const registerUserInput = {
          ...getUserInput,
          username: signInData.username,
          email: signInData.signInUserSession.idToken.payload.email,
          registered: true
        };
        const newUser = await API.graphql(
          graphqlOperation(registerUser, {
            input: registerUserInput
          })
        );

        console.log(newUser);
      } catch (err) {
        console.error("error registering new user", err);
      }
    }
  };

  handleSignOut = async () => {
    try {
      await Auth.signOut();
    } catch (err) {
      console.err("signout error", err);
    }
  };

  render() {
    const { user, userAttributes } = this.state;
    return !user ? (
      <Authenticator theme={theme} />
    ) : (
      <UserContext.Provider value={{ user, userAttributes }}>
        <Router history={history}>
          <>
            {/* Navbar */}
            <NavBar user={user} handleSignOut={this.handleSignOut} />
            {/* Routes */}
            <div className="app-container">
              <Route exact path="/" component={Dashboard} />
              <Route
                exact
                path="/profile"
                component={() => (
                  <ProfilePage user={user} userAttributes={userAttributes} />
                )}
              />
              <Route
                exact
                path="/markets/:marketId"
                component={({ match }) => (
                  <MarketPage
                    marketId={match.params.marketId}
                    user={user}
                    userAttributes={userAttributes}
                  />
                )}
              />
            </div>
          </>
        </Router>
      </UserContext.Provider>
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

export default App;
