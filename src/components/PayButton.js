import React, { Component } from "react";
import { Notification, Message } from "element-react";
import StripeCheckout from "react-stripe-checkout";
import { API } from "aws-amplify";

const stripeConfing = {
  publishableAPIKey: "pk_test_rRsEsWJqdzJVsUsTri4cILuq",
  currency: "USD"
};
export class PayButton extends Component {
  handleCharge = async token => {
    try {
      const body = {
        body: {
          token
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
