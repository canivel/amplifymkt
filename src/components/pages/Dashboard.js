import React, { Component } from "react";
import NewMarket from "../NewMarket";
import MarkeList from "../MarketList";

export class Dashboard extends Component {
  state = {
    searchTerm: "",
    searchResults: [],
    isSearching: false
  };

  handleSearchChange = searchTerm => this.setState({ searchTerm });

  handleClearSearch = () =>
    this.setState({ searchTerm: "", searchResults: [] });

  handleSearch = event => {
    event.preventDefault();
    console.log(this.state.searchTerm);
  };

  render() {
    return (
      <>
        <NewMarket
          searchTerm={this.state.searchTerm}
          isSearching={this.state.isSearching}
          handleSearchChange={this.handleSearchChange}
          handleClearSearch={this.handleClearSearch}
          handleSearch={this.handleSearch}
        />
        <MarkeList />
      </>
    );
  }
}

export default Dashboard;
