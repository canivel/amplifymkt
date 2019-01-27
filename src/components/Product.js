import React, { Component } from "react";
import {
  Card,
  Button,
  Form,
  Radio,
  Input,
  Dialog,
  Notification,
  Popover
} from "element-react";
import { UserContext } from "./App";
import { S3Image } from "aws-amplify-react";
import { convertCentsToDollar, convertDollarsToCents } from "../utils";
import PayButton from "./PayButton";
import { API, graphqlOperation } from "aws-amplify";
import { updateProduct, deleteProduct } from "../graphql/mutations";
import { Link } from "react-router-dom";
export class Product extends Component {
  state = {
    updateProductDialog: false,
    deleteProductDialog: false,
    description: "",
    price: "",
    shipped: false
  };

  handleProductUpdate = async productId => {
    try {
      const { description, shipped, price } = this.state;

      this.setState({ updateProductDialog: false });

      const input = {
        id: productId,
        description,
        shipped,
        price: convertDollarsToCents(price)
      };

      const result = await API.graphql(
        graphqlOperation(updateProduct, {
          input
        })
      );

      console.log("Updated", result);

      Notification({
        title: "Success",
        message: "Product successfully updated!",
        type: "success"
      });
    } catch (err) {
      Notification.error({
        title: "Error",
        message: "Error updating New Product!",
        type: "error"
      });
      console.error(err);
    }
  };

  handleProductDelete = async productId => {
    try {
      this.setState({ deleteProductDialog: false });

      const input = {
        id: productId
      };

      const result = await API.graphql(
        graphqlOperation(deleteProduct, {
          input
        })
      );

      console.log("Deleted", result);

      Notification({
        title: "Success",
        message: "Product successfully removed!",
        type: "success"
      });
    } catch (err) {
      console.error(err);

      Notification.error({
        title: "Error",
        message: "Erro deleting Product!",
        type: "error"
      });
    }
  };

  renderUpdateProductDialog = () => {
    const { product } = this.props;
    const { updateProductDialog, description, price, shipped } = this.state;
    return (
      <Dialog
        title="Update Product"
        size="large"
        customClass="dialog"
        visible={updateProductDialog}
        onCancel={() => this.setState({ updateProductDialog: false })}
      >
        <Dialog.Body>
          <Form labelPosition="top">
            <Form.Item lable="Update Product Descrition">
              <Input
                type="text"
                icon="information"
                placeholder="Product Description"
                value={description}
                trim={true}
                onChange={description => this.setState({ description })}
              />
            </Form.Item>
            <Form.Item lable="Update Product Price">
              <Input
                type="number"
                icon="plus"
                placeholder="Price ($USD)"
                value={price}
                onChange={price => this.setState({ price })}
              />
            </Form.Item>
            <Form.Item lable="Update Shipping">
              <div className="text-center">
                <Radio
                  value="true"
                  checked={shipped === true}
                  onChange={() => this.setState({ shipped: true })}
                >
                  Shipped
                </Radio>
                <Radio
                  value="true"
                  checked={shipped === false}
                  onChange={() => this.setState({ shipped: false })}
                >
                  Emailed
                </Radio>
              </div>
            </Form.Item>
          </Form>
        </Dialog.Body>
        <Dialog.Footer>
          <Button onClick={() => this.setState({ updateProductDialog: false })}>
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={() => this.handleProductUpdate(product.id)}
          >
            Update
          </Button>
        </Dialog.Footer>
      </Dialog>
    );
  };

  render() {
    const { product } = this.props;
    const { deleteProductDialog } = this.state;
    return (
      <UserContext.Consumer>
        {({ userAttributes }) => {
          const isProductOwner =
            userAttributes && userAttributes.sub === product.owner;
          const isEmailVerified =
            userAttributes && userAttributes.email_verified;
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
                    {isEmailVerified ? (
                      !isProductOwner && (
                        <PayButton
                          product={product}
                          userAttributes={userAttributes}
                        />
                      )
                    ) : (
                      <Link to="/profile" className="Link">
                        Verify Email First
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
              {/* Update / Delete Products */}
              <div className="text-center">
                {isProductOwner && (
                  <>
                    <Button
                      type="warning"
                      icon="edit"
                      className="m-1"
                      onClick={() =>
                        this.setState({
                          updateProductDialog: true,
                          description: product.description,
                          shipped: product.shipped,
                          price: convertCentsToDollar(product.price)
                        })
                      }
                    />
                    <Popover
                      placement="top"
                      width="160"
                      trigger="click"
                      visible={deleteProductDialog}
                      content={
                        <>
                          <p>Do you want to delete this product</p>
                          <div className="text-right">
                            <Button
                              size="mini"
                              type="text"
                              className="m-1"
                              onClick={() =>
                                this.setState({ deleteProductDialog: false })
                              }
                            >
                              Cancel
                            </Button>
                            <Button
                              size="mini"
                              type="primary"
                              className="m-1"
                              onClick={() =>
                                this.handleProductDelete(product.id)
                              }
                            >
                              Confirm
                            </Button>
                          </div>
                        </>
                      }
                    >
                      <Button
                        type="danger"
                        icon="delete"
                        onClick={() =>
                          this.setState({ deleteProductDialog: true })
                        }
                      />
                    </Popover>
                  </>
                )}
              </div>
              {/* Update Product Dialog */}
              {this.renderUpdateProductDialog()}
            </div>
          );
        }}
      </UserContext.Consumer>
    );
  }
}

export default Product;
