import React, { Component } from "react";
import NewMarket from "../NewMarket";
import MarkeList from "../MarketList";

export class Dashboard extends Component {
  render() {
    return (
      <>
        <NewMarket />
        <MarkeList />
      </>
    );
  }
}

export default Dashboard;
