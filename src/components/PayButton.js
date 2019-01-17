import React, { Component } from "react";
import { Notification, Message } from "element-react";
import StripeCheckout from "react-stripe-checkout";

const stripeConfing = {
  publishableAPIKey: "pk_test_rRsEsWJqdzJVsUsTri4cILuq",
  currency: "USD"
};
export class PayButton extends Component {
  handleCharge = () => {};

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
