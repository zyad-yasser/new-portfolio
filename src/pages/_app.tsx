import { withRedux } from "next-redux-wrapper";
import type { AppProps } from "next/app";
import React from "react";
import { Provider } from "react-redux";
import "../styles/_app.sass";
import { wrapper } from "@/store";

interface MyAppProps extends AppProps {
  store: any;
}

function MyApp({ Component, pageProps }: MyAppProps) {
  return <Component {...pageProps} />;
}

export default wrapper.withRedux(MyApp);
