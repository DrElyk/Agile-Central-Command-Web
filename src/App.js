import React, { Component } from "react";
import OAuth from "./components/OAuth";
import Home from "./components/Home";
import "./App.css";
import { Route } from "react-router-dom";

import OauthPopup from "./components/OauthPopup";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      logged_in: localStorage.getItem("token") ? true : false,
      username: "",
      email: "",
      oauth_url: "",
      auth: false,
      oauth: false
    };
  }

  componentDidMount() {
    if (this.state.logged_in) {
      fetch("http://localhost:8000/current-user/", {
        headers: {
          Authorization: `JWT ${localStorage.getItem("token")}`
        }
      })
      .then(res => res.json())
      .then(json => {
        if (json.detail === "Signature has expired.") {
          this.setState({
            logged_in: false
          });
        } else {
          this.setState({
            username: json.username,
            email: json.email,
            auth: true
          });
        }
      });
    }
  }

  handle_login = (e, data) => {
    e.preventDefault();
    fetch("http://localhost:8000/login/")
    .then(res => res.json())
    .then(json => {
      localStorage.setItem("oauth_token", json.oauth_token);
      localStorage.setItem("oauth_token_secret", json.oauth_token_secret);
      this.setState({
        oauth_url: json.oauth_url,
        auth: true
      })
    })
  }

  handle_logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("oauth_token");
    localStorage.removeItem("oauth_token_secret");
    localStorage.removeItem("access_token");
    localStorage.removeItem("secret_access_token");
    this.setState({
      logged_in: false,
      auth: false,
      oauth: false,
      username: "",
      email: ""
    });
    window.location.reload();
  };

  oauth_user_props = () => {
    return (
      <div>
        {this.state.auth ? (
          <OAuth oauth_user={this.oauth_user.bind(this)} />
        ) : null}
      </div>
    );
  };

  oauth_user = () => {
    fetch("http://localhost:8000/oauth_user/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        oauth_token: localStorage.getItem("oauth_token"),
        oauth_token_secret: localStorage.getItem("oauth_token_secret")
      })
    })
      .then(res => res.json())
      .then(json => {
        if(json.token !== undefined) {
          localStorage.setItem("token", json.token);
          localStorage.setItem("access_token", json.access_token);
          localStorage.setItem("secret_access_token", json.secret_access_token);
          this.setState({
            logged_in: true,
            username: json.username,
            email: json.email,
            auth: false,
            oauth: true
          });
        } else {
          window.location.reload();
          localStorage.removeItem("oauth_token");
          localStorage.removeItem("oauth_token_secret");
        }
      });
  };

  // render() {
  //   // when the oauth is completed, continue to oauth_user function
  //   const onCode = (code, params) => {
  //     this.oauth_user();
  //   };

  //   const onClose = () => {
  //     console.log("closed!");
  //     console.log(this.state.oauth_url);
  //   };

  //   return (
  //     <div>
  //       {this.state.logged_in ? (
  //         this.state.email && this.state.username ? (
  //           <RetroBoard
  //             handle_logout={this.handle_logout}
  //             username={this.state.username}
  //             email={this.state.email}
  //           />
  //         ) : (
  //           <div>Loading...</div>
  //         )
  //       ) : (
  //         <div>
  //           <h1>Just log in, please!</h1>
  //           <button onClick={this.handle_login}>Login</button>
  //         </div>
  //       )}
  //       <Route path="/oauth_user" render={this.oauth_user_props} />
  //       {this.state.oauth_url !== "" ? (
  //         <OauthPopup
  //           url={this.state.oauth_url}
  //           onCode={onCode}
  //           onClose={onClose}
  //         />
  //       ) : (
  //         <div />
  //       )}
  //     </div>
  //   );
  // }

  render() {
    // when the oauth is completed, continue to oauth_user function
    const onCode = (code, params) => {
      this.oauth_user();
    };

    const onClose = () => {
      console.log("closed!");
      console.log(this.state.oauth_url);
    };

    return (
      <div>
        {this.state.logged_in ? (
          this.state.email && this.state.username ? (
            <Home 
              handle_logout={this.handle_logout}
              username={this.state.username}
              email={this.state.email}
            />
          ) : (
            <div>Loading...</div>
          )
        ) : (
          <div>
            <h1>Just log in, please!</h1>
            <button onClick={this.handle_login}>Login</button>
          </div>
        )}
        <Route path="/oauth_user" render={this.oauth_user_props} />
        {this.state.oauth_url !== "" ? (
          <OauthPopup
            url={this.state.oauth_url}
            onCode={onCode}
            onClose={onClose}
          />
        ) : (
          <div />
        )}
      </div>
    );
  }
}
