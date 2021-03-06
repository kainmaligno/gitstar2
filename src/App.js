import React, { Component } from "react";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import fetch from "unfetch";
import {
  STATUS,
  Loading,
  Logo,
  Logotype,
  Container,
  Header
} from "gitstar-components";

import Avatar from "./Avatar";


const CLIENT_ID =    "03174074e722b75cc3b5" //process.env.CLIENT_ID
const REDIRECT_URI = "http://localhost:3000/" //process.env.REDIRECT_URI;
const AUTH_API_URI = "https://gitstar2.herokuapp.com/authenticate/" // process.env.AUTH_API_URI;

//apollo client
const client = new ApolloClient({
  uri: "https://api.github.com/graphql",
  request: operation => {
    const token = localStorage.getItem("github_token");
    if (token) {
      operation.setContext({
        headers: {
          authorization: `Bearer ${token}`
        }
      });
    }
  }
});


class App extends Component {
  state = {
    status: STATUS.INITIAL,
    token: null
  };
  componentDidMount() {
    const storedToken = localStorage.getItem("github_token");
    if (storedToken) {
      this.setState({
        status: STATUS.AUTHENTICATED
      });
      return;
    }
    const code =
    window.location.href.match(/\?code=(.*)/) &&
    window.location.href.match(/\?code=(.*)/)[1];
  if (code) {
    this.setState({ status: STATUS.LOADING });
    fetch(`${AUTH_API_URI}${code}`)
      .then(response => response.json())
      .then(({ token }) => {
        if (token) {
          localStorage.setItem("github_token", token);
        }
        this.setState({
          status: STATUS.FINISHED_LOADING
        });
      });
  }
}//componentdidmount ends here!!

  render() {
    return (

      <ApolloProvider client={client}>
         <Container>
        <Header>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Logo />
            <Logotype />
          </div>
          <Avatar
            style={{
              transform: `scale(${
                this.state.status === STATUS.AUTHENTICATED ? "1" : "0"
              })`
            }}
          />
          <a
            style={{
              display: this.state.status === STATUS.INITIAL ? "inline" : "none"
            }}
            href={`https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=user&redirect_uri=${REDIRECT_URI}`}
          >
            Login
          </a>
        </Header>
        <Loading
          status={this.state.status}
          callback={() => {
            if (this.props.status !== STATUS.AUTHENTICATED) {
              this.setState({
                status: STATUS.AUTHENTICATED
              });
            }
          }}
        />
      </Container>
      </ApolloProvider>
     
    );
  }
}

export default App;
