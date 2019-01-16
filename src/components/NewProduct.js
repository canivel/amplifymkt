import React, { Component } from "react";
import { PhotoPicker } from "aws-amplify-react";
import { Form, Input, Radio, Button } from "element-react";

export class NewProduct extends Component {
  state = {
    desctiption: "",
    price: "",
    shipped: false
  };

  handleAddProduct = event => {
    event.preventDefault();
    console.log(event);
  };

  render() {
    const { shipped } = this.state;
    return (
      <div className="flex-center">
        <h2 className="header">Add New Product</h2>
        <div>
          <Form className="market-header">
            <Form.Item lable="Add Product Descrition">
              <Input
                type="text"
                icon="information"
                placeholder="Description"
                onChange={description => this.setState({ description })}
              />
            </Form.Item>
            <Form.Item lable="Set Product Price">
              <Input
                type="number"
                icon="plus"
                placeholder="Price ($USD)"
                onChange={price => this.setState({ price })}
              />
            </Form.Item>
            <Form.Item lable="Is the product shipped or emailed to the customer">
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
            <PhotoPicker />
            <Form.Item>
              <Button type="primary" onClick={this.handleAddProduct}>
                Add Product
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    );
  }
}

export default NewProduct;
