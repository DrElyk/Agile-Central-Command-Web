import React, { Component } from 'react';
import Login from './components/Login';
import RetroBoard from './components/RetroBoard';
import Home from './components/Home';
import './App.css';

export default class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            logged_in: localStorage.getItem('token') ? true : false,
            username: "",
            email: ""
        }
    }

    componentDidMount() {
        if (this.state.logged_in) {
            fetch('http://localhost:8000/current-user/', {
                headers: {
                    Authorization: `JWT ${localStorage.getItem('token')}`
                }
            })
            .then(res => res.json())
            .then(json => {
                if (json.detail === "Signature has expired.") {
                    this.setState({
                        logged_in: false
                    })
                } else {
                    this.setState({
                        username: json.username,
                        email: json.email
                    });
                }
            });
        }
    }

    handle_authentication = (e, data) => {
        e.preventDefault();
        fetch('http://localhost:8000/users/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(json => {
            localStorage.setItem('token', json.token);
            this.setState({
                logged_in: true,
                username: json.username,
                email: json.email
            });
        });
    };

    handle_logout = () => {
        localStorage.removeItem('token');
        this.setState({
            logged_in: false,
            username: "",
            email: ""
        });
    };

    render() {
        return (
            <div>
                {this.state.logged_in ? this.state.email && this.state.username ? 
                    <Home 
                        handle_logout={this.handle_logout} 
                        username={this.state.username} 
                        email={this.state.email}
                    /> : <div>Loading...</div>
                    :
                    <Login 
                        handle_authentication={this.handle_authentication} 
                    />
                }
            </div>
        );
    }
}
