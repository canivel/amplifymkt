import React, { Component } from "react";
import { Connect } from "aws-amplify-react";
import { listMarkets } from "../graphql/queries";
import { onCreateMarket } from "../graphql/subscriptions";
import { graphqlOperation } from "aws-amplify";
import { Loading, Card, Tag, Icon } from "element-react";
import Error from "./Error";
import { Link } from "react-router-dom";

export class MarketList extends Component {
  onNewMarket = (prevQuery, newData) => {
    let updatedQuery = { ...prevQuery };
    const updatedMarketList = [
      newData.onCreateMarket,
      ...prevQuery.listMarkets.items
    ];
    updatedQuery.listMarkets.items = updatedMarketList;
    return updatedQuery;
  };

  render() {
    const { searchResults, searchTerm } = this.props;
    return (
      <Connect
        query={graphqlOperation(listMarkets)}
        subscription={graphqlOperation(onCreateMarket)}
        onSubscriptionMsg={this.onNewMarket}
      >
        {({ data, loading, errors }) => {
          if (errors.length > 0) return <Error errors={errors} />;
          if (loading || !data.listMarkets)
            return <Loading fullscreen={true} />;

          const markets =
            searchResults.length > 0 ? searchResults : data.listMarkets.items;

          return (
            <>
              {searchResults.length > 0 ? (
                <h2 className="text-green">
                  <Icon type="success" name="check" className="icon" />
                  {searchResults.length} Results for {searchTerm}
                </h2>
              ) : (
                <h2 className="header">Markets</h2>
              )}
              {markets.map(market => (
                <div className="my-2" key={market.id}>
                  <Card
                    bodyStyle={{
                      padding: "0.7em",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <div>
                      <span className="flex">
                        <Link className="link" to={`/markets/${market.id}`}>
                          {market.name}
                        </Link>
                        <span style={{ color: "var(--darkAmazonOrange" }}>
                          {market.products.items
                            ? market.products.items.length
                            : 0}
                        </span>
                        <img
                          src="https://icon.now.sh/shopping_cart/f60"
                          alt="Shopping Cart"
                        />
                      </span>
                      <div style={{ color: "var(--lightSquidInk)" }}>
                        {market.owner}
                      </div>
                    </div>
                    <div>
                      {market.tags &&
                        market.tags.map(tag => (
                          <Tag key={tag} type="danger" className="mx-1">
                            {tag}
                          </Tag>
                        ))}
                    </div>
                  </Card>
                </div>
              ))}
            </>
          );
        }}
      </Connect>
    );
  }
}

export default MarketList;
