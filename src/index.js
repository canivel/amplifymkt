import React from "react";
import ReactDOM from "react-dom";
import Amplify from "aws-amplify";
import aws_exports from "./aws-exports";
import App from "./components/App";

import "element-theme-default";
import { i18n } from "element-react";
import locale from "element-react/src/locale/lang/en";

i18n.use(locale);

Amplify.configure(aws_exports);

ReactDOM.render(<App />, document.querySelector("#root"));
