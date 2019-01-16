import React, { Component } from "react";
import NewMarket from "../NewMarket";
import MarkeList from "../MarketList";
import { API, graphqlOperation } from "aws-amplify";
import { searchMarkets } from "../../graphql/queries";

export class Dashboard extends Component {
  state = {
    searchTerm: "",
    searchResults: [],
    isSearching: false
  };

  handleSearchChange = searchTerm => this.setState({ searchTerm });

  handleClearSearch = () =>
    this.setState({ searchTerm: "", searchResults: [] });

  handleSearch = async event => {
    try {
      event.preventDefault();
      this.setState({ isSearching: true });
      const result = await API.graphql(
        graphqlOperation(searchMarkets, {
          filter: {
            or: [
              { name: { match: this.state.searchTerm } },
              { owner: { match: this.state.searchTerm } },
              { tags: { match: this.state.searchTerm } }
            ]
          },
          sort: {
            field: "createdAt",
            direction: "desc"
          }
        })
      );
      // console.log({ result });
      this.setState({
        searchResults: result.data.searchMarkets.items,
        isSearching: false
      });
    } catch (err) {
      console.error(err);
    }
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
        <MarkeList
          searchResults={this.state.searchResults}
          searchTerm={this.state.searchTerm}
        />
      </>
    );
  }
}

export default Dashboard;
