import React, { Component } from "react";
import { API, graphqlOperation, Auth } from "aws-amplify";
import {
  Tabs,
  Icon,
  Card,
  Table,
  Button,
  Tag,
  Dialog,
  Form,
  Input,
  Message,
  Notification,
  MessageBox
} from "element-react";
import { convertCentsToDollar, formatOrderDate } from "../../utils";

const getUser = `query GetUser($id: ID!) {
  getUser(id: $id) {
    id
    username
    email
    registered
    orders(sortDirection: DESC, limit: 10) {
      items {
        id
        createdAt
        product{
          id
          owner
          price
          createdAt
          description
        }
      }
      shippingAddress {
        city
        country
        address_line1
        address_state
        address_zip
      }
      nextToken
    }
  }
}
`;

export class ProfilePage extends Component {
  state = {
    email: this.props.userAttributes && this.props.userAttributes.email,
    emailDialog: false,
    verificationForm: false,
    verificationCode: "",
    orders: [],
    columns: [
      { prop: "name", width: "150" },
      { prop: "value", width: "330" },
      {
        prop: "tag",
        width: "150",
        render: row => {
          if (row.name === "Email") {
            const emailVerified = this.props.userAttributes.email_verified;
            return emailVerified ? (
              <Tag type="success">Verified</Tag>
            ) : (
              <Tag type="danger">Unverified</Tag>
            );
          }
        }
      },
      {
        prop: "operations",
        render: row => {
          switch (row.name) {
            case "Email":
              return (
                <Button
                  type="info"
                  size="small"
                  onClick={() => this.setState({ emailDialog: true })}
                >
                  Edit
                </Button>
              );
            case "Delete Profile":
              return (
                <Button
                  onClick={this.handleDeleteProfile}
                  type="danger"
                  size="small"
                >
                  Delete
                </Button>
              );
            default:
              return;
          }
        }
      }
    ]
  };

  componentDidMount() {
    if (this.props.userAttributes) {
      this.getUserOrders(this.props.userAttributes.sub);
    }
  }

  getUserOrders = async userId => {
    const input = { id: userId };
    const result = await API.graphql(graphqlOperation(getUser, { input }));
    this.setState({ orders: result.data.getUser.order.items });
  };

  handleUpdateEmail = async () => {
    const updateAttributes = {
      email: this.state.email
    };
    try {
      const result = await Auth.updateUserAttributes(
        this.props.user,
        updateAttributes
      );
      if (result === "SUCCESS") {
        this.sendVerificationCode("email");
      }
    } catch (err) {
      console.error(err);
      Notification.error({
        title: "Error",
        message: `${err.message || "Error updating email"}`
      });
    }
  };

  sendVerificationCode = async attr => {
    const result = await Auth.verifyCurrentUserAttribute(attr);
    this.setState({ verificationForm: true });
    Message({
      type: "info",
      customClass: "message",
      message: `Verification code sent to ${this.state.email}`
    });
  };

  handleVerifiedEmail = async attr => {
    try {
      const result = await Auth.verifyCurrentUserAttributeSubmit(
        attr,
        this.state.verificationCode
      );
      Notification({
        title: "Success",
        message: "Email successfully verified",
        type: `${result.toLowerCase()}`
      });
      this.setState({ emailDialog: false });
    } catch (err) {
      console.error(err);
      Notification.error({
        title: "Error",
        message: `${err.message || "Error updating email"}`
      });
    }
  };

  handleDeleteProfile = () => {
    MessageBox.confirm(
      "This will delete your account, continue?",
      "Attention!",
      {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        type: "warning"
      }
    )
      .then(async () => {
        try {
          await this.props.user.deleteUser();
        } catch (err) {
          console.error(err);
        }
      })
      .catch(() => {
        Message({
          type: "info",
          message: "Delete was cancel"
        });
      });
  };

  render() {
    const {
      orders,
      columns,
      email,
      emailDialog,
      verificationCode,
      verificationForm
    } = this.state;
    const { user, userAttributes } = this.props;
    return (
      userAttributes && (
        <>
          <Tabs activeName="1" className="profile-tabs">
            <Tabs.Pane
              label={
                <>
                  <Icon name="document" className="icon" />
                  Summary
                </>
              }
              name="1"
            >
              <h2 className="header">Profile Summary</h2>
              <Table
                columns={columns}
                data={[
                  { name: "Your Id", value: userAttributes.sub },
                  { name: "Username", value: user.username },
                  { name: "Email", value: userAttributes.email },
                  { name: "Phone number", value: userAttributes.phone_number },
                  { name: "Delete Profile", value: "Sorry to see you go" }
                ]}
                showHeader={false}
                rowClassName={row =>
                  row.name === "Delete Profile" && "delete-profile"
                }
              />
            </Tabs.Pane>
            <Tabs.Pane
              label={
                <>
                  <Icon name="message" className="icon" />
                  Orders
                </>
              }
              name="2"
            >
              <h2 className="header">Order history</h2>
              {orders.map(order => (
                <div className="mb-1" key={order.id}>
                  <Card>
                    <pre>
                      <p>Order Id: {order.id}</p>
                      <p>Product Description: {order.product.description}</p>
                      <p>Price: ${convertCentsToDollar(order.product.price)}</p>
                      <p>Purchased on {formatOrderDate(order.createdAt)}</p>
                      {order.shippingAddress && (
                        <>
                          Shipping Address
                          <div className="ml-2">
                            <p>{order.shippingAddress.address_line1}</p>
                            <p>{order.shippingAddress.city}</p>
                            <p>{order.shippingAddress.address_state}</p>
                            <p>{order.shippingAddress.country}</p>
                            <p>{order.shippingAddress.address_zip}</p>
                          </div>
                        </>
                      )}
                    </pre>
                  </Card>
                </div>
              ))}
            </Tabs.Pane>
          </Tabs>

          {/* Email dialog */}
          <Dialog
            size="large"
            customClass="dialog"
            title="Edit Email"
            visible={emailDialog}
            onCancel={() => this.setState({ emailDialog: false })}
          >
            <Dialog.Body>
              <Form labelPosition="top">
                <Form.Item label="Email">
                  <Input
                    value={email}
                    onChange={email => this.setState({ email })}
                  />
                </Form.Item>
                {verificationForm && (
                  <Form.Item label="Enter Verification Code" labelWidth="120">
                    <Input
                      onChange={verificationCode =>
                        this.setState({ verificationCode })
                      }
                      value={verificationCode}
                    />
                  </Form.Item>
                )}
              </Form>
            </Dialog.Body>
            <Dialog.Footer>
              <Button onClick={() => this.setState({ emailDialog: false })}>
                Cancel
              </Button>
              {!verificationForm && (
                <Button type="primary" onClick={this.handleUpdateEmail}>
                  Save
                </Button>
              )}
              {verificationForm && (
                <Button
                  type="primary"
                  onClick={() => this.handleVerifiedEmail("email")}
                >
                  Submit
                </Button>
              )}
            </Dialog.Footer>
          </Dialog>
        </>
      )
    );
  }
}

export default ProfilePage;
