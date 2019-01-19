import React, { Component } from "react";
import { Notification, Message } from "element-react";
import StripeCheckout from "react-stripe-checkout";
import { API, graphqlOperation } from "aws-amplify";
import { getUser } from "../graphql/queries";

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

  handleCharge = async token => {
    const { product, user } = this.props;
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
            customerEmail: user.attributes.email,
            ownerEmail,
            shipped: product.shipped
          }
        }
      };
      const result = await API.post("orderlambda", "/charge", body);
      console.log(result);
    } catch (err) {
      console.error(err);
    }
  };

  render() {
    const { product, user } = this.props;
    return (
      <StripeCheckout
        token={this.handleCharge}
        email={user.attributes.email}
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
