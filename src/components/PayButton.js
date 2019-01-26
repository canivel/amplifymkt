import React, { Component } from "react";
import { Notification, Message } from "element-react";
import StripeCheckout from "react-stripe-checkout";
import { API, graphqlOperation } from "aws-amplify";
import { getUser } from "../graphql/queries";
import { createOrder } from "../graphql/mutations";
import { history } from "../components/App";

const stripeConfing = {
  publishableAPIKey: "pk_test_rRsEsWJqdzJVsUsTri4cILuq",
  currency: "USD"
};
export class PayButton extends Component {
  getOwnerEmail = async ownerId => {
    try {
      const input = { id: ownerId };
      const result = await API.graphql(graphqlOperation(getUser, input));
      return result.data.getUser.email;
    } catch (err) {
      console.error("Error fetching product owner email", err);
    }
  };

  createShippingAddress = source => ({
    city: source.address_city,
    country: source.address_country,
    address_line1: source.address_line1,
    address_state: source.address_state,
    address_zip: source.address_zip
  });

  handleCharge = async token => {
    const { product, userAttributes } = this.props;
    try {
      const ownerEmail = await this.getOwnerEmail(product.owner);
      console.log({ ownerEmail });
      const body = {
        body: {
          token,
          charge: {
            currency: stripeConfing.currency,
            amount: product.price,
            description: product.description
          },
          email: {
            customerEmail: userAttributes.email,
            ownerEmail,
            shipped: product.shipped
          }
        }
      };
      const result = await API.post("orderlambda", "/charge", body);
      console.log(result);
      if (result.charge.status === "Succeeded") {
        let shippingAddress = null;
        if (product.shipped) {
          shippingAddress = this.createShippingAddress(result.charge.source);
        }

        const input = {
          orderUserId: userAttributes.sub,
          orderProductId: product.id,
          shippingAddress
        };

        const order = await API.graphql(
          graphqlOperation(createOrder, { input })
        );

        console.log({ order });

        Notification({
          title: "Success",
          message: `${result.message}`,
          type: "success",
          duration: 3000
        });
        setTimeout(() => {
          history.push("/");
          Message({
            type: "info",
            message: "check your verified email for order details",
            duration: 5000,
            showClose: true
          });
        }, 3000);
      }
    } catch (err) {
      Notification({
        type: "error",
        message: `${err.message || "Error processing order"}`
      });
    }
  };

  render() {
    const { product, userAttributes } = this.props;
    return (
      <StripeCheckout
        token={this.handleCharge}
        email={userAttributes.email}
        name={product.description}
        amount={product.price}
        shippingAddress={product.shipped}
        billingAddress={product.shipped}
        currency={stripeConfing.currency}
        stripeKey={stripeConfing.publishableAPIKey}
        locale="auto"
        allowRememberMe={false}
      />
    );
  }
}

export default PayButton;
