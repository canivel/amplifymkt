import React, { Component } from "react";
import { API, graphqlOperation } from "aws-amplify";
import {
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct
} from "../../graphql/subscriptions";
import { Loading, Tabs, Icon } from "element-react";
import { Link } from "react-router-dom";
import NewProduct from "../NewProduct";
import Product from "../Product";

export const getMarket = `query GetMarket($id: ID!) {
  getMarket(id: $id) {
    id
    name
    products(sortDirection: DESC, limit: 999) {
      items {
        id
        description
        price
        shipped
        owner
        file {
          key
        }
        createdAt
      }
      nextToken
    }
    tags
    owner
    createdAt
  }
}
`;
export class MarketPage extends Component {
  state = {
    market: null,
    isLoading: true,
    isMarketOwner: false
  };

  componentDidMount() {
    this.handleGetMarket();

    // Create Product graphql subscription
    this.createProductListener = API.graphql(
      graphqlOperation(onCreateProduct)
    ).subscribe({
      next: productData => {
        const createdProduct = productData.value.data.onCreateProduct;
        const prevProducts = this.state.market.products.items.filter(
          item => item.id !== createdProduct.id
        );
        const updatedProducts = [createdProduct, ...prevProducts];
        const marketCopy = { ...this.state.market };
        marketCopy.products.items = updatedProducts;
        this.setState({ market: marketCopy });
      }
    });

    // Update Product graphql subscription
    this.updateProductListener = API.graphql(
      graphqlOperation(onUpdateProduct)
    ).subscribe({
      next: productData => {
        const updatedProduct = productData.value.data.onUpdateProduct;
        const updatedProductIndex = this.state.market.products.items.findIndex(
          item => item.id === updatedProduct.id
        );
        const updatedProducts = [
          ...this.state.market.products.items.slice(0, updatedProductIndex),
          updatedProduct,
          ...this.state.market.products.items.slice(updatedProductIndex + 1)
        ];
        const market = { ...this.state.market };
        market.products.items = updatedProducts;
        this.setState({ market });
      }
    });

    // Delete Product graphql subscription
    this.deleteProductListener = API.graphql(
      graphqlOperation(onDeleteProduct)
    ).subscribe({
      next: productData => {
        const deletedProduct = productData.value.data.onDeleteProduct;
        const updatedProducts = this.state.market.products.items.filter(
          item => item.id !== deletedProduct.id
        );
        const market = { ...this.state.market };
        market.products.items = updatedProducts;
        this.setState({ market });
      }
    });
  }

  componentWillUnmount = () => {
    this.createProductListener.unsubscribe();
    this.updateProductListener.unsubscribe();
    this.deleteProductListener.unsubscribe();
  };

  handleGetMarket = async () => {
    const input = {
      id: this.props.marketId
    };
    const result = await API.graphql(graphqlOperation(getMarket, input));
    this.setState({ market: result.data.getMarket, isLoading: false }, () => {
      this.checkMarketOwner();
    });
  };

  checkMarketOwner = () => {
    const { user } = this.props;
    const { market } = this.state;

    if (user) {
      this.setState({ isMarketOwner: user.username === market.owner });
    }
  };

  renderMarket = () => {
    const { market, isLoading, isMarketOwner } = this.state;
    return isLoading ? (
      <Loading fullscreen={true} />
    ) : (
      <>
        {/* Back Button */}
        <Link to="/" className="link">
          Back to Market List
        </Link>
        {/* Market Metadata */}
        <span className="items-center pt-2">
          <h2 className="mb-mr">{market.name}</h2> - {market.owner}
        </span>
        <div className="items-center pt-2">
          <span style={{ color: "var(--lightSquidInk)", paddingBottom: "1em" }}>
            <Icon name="date" className="icon" />
            {market.createdAt}
          </span>
        </div>

        {/* New Product */}
        <Tabs type="border-card" value={isMarketOwner ? "1" : "2"}>
          {isMarketOwner && (
            <Tabs.Pane
              label={
                <>
                  <Icon name="plus" className="icon" />
                  Add Product
                </>
              }
              name="1"
            >
              <NewProduct marketId={this.props.marketId} />
            </Tabs.Pane>
          )}
          <Tabs.Pane
            label={
              <>
                <Icon name="menu" className="icon" />
                Products ({market.products.items.length})
              </>
            }
            name="2"
          >
            <div className="product-list">
              {market.products.items.map(product => (
                <Product product={product} key={product.id} />
              ))}
            </div>
          </Tabs.Pane>
        </Tabs>
      </>
    );
  };

  render() {
    return <div>{this.renderMarket()}</div>;
  }
}

export default MarketPage;
