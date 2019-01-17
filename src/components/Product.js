import React, { Component } from "react";
import { Card } from "element-react";
import { UserContext } from "./App";
import { S3Image } from "aws-amplify-react";
import { convertCentsToDollar } from "../utils";
import PayButton from "./PayButton";
export class Product extends Component {
  state = {};
  render() {
    const { product } = this.props;
    return (
      <UserContext.Consumer>
        {({ user }) => {
          const isProductOwner = user && user.attributes.sub === product.owner;

          return (
            <div className="card-container">
              <Card bodyStyle={{ padding: 0, minWidth: "200px" }}>
                <S3Image
                  imgKey={product.file.key}
                  theme={{ photoImg: { maxWidth: "100%", maxHeight: "100%" } }}
                />
                <div className="card-body">
                  <h3 className="m-0">{product.description}</h3>
                  <div className="items-center">
                    <img
                      src={`https://icon.now.sh/${
                        product.shipped ? "markunread_mailbox" : "mail"
                      }`}
                      alt="Shipping Icon"
                      className="icon"
                    />
                    {product.shipped ? "Shipped" : "Emailed"}
                  </div>
                  <div className="text-right">
                    <span className="mx-1">
                      ${convertCentsToDollar(product.price)}
                    </span>
                    {!isProductOwner && <PayButton />}
                  </div>
                </div>
              </Card>
            </div>
          );
        }}
      </UserContext.Consumer>
    );
  }
}

export default Product;
