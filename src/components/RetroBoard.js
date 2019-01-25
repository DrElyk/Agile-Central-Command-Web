import React, { Component } from 'react';
import './RetroBoard.css';
import RetroActionItems from "./RetroActionItems";
import RetroActionItemForm from "./RetroActionItemsForm";


export default class RetroBoard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            actionItems: [],
            username: "",
            email: "",
            logged_in: localStorage.getItem('token') ? true : false,
            ws: ""
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
                this.setState({
                    username: json.username,
                    email: json.email
                });
            });

            this.setState({
                ws: new WebSocket("ws://localhost:8000/retro/" + this.props.sessionName + "/?" + this.state.email)
            })

            this.state.ws.onopen = () => {
                console.log("connected")
        }
        }
    }
    // componentDidMount() {
        // this.ws = new WebSocket(
        //     "ws://localhost:8000/retro/" + this.state.sessionName + "/?" + this.props.email
        // )

        // this.state.ws.onopen = () => {
        //     console.log("connected")
        // }

        // this.ws.onmessage = e => {
        //     const actionItems = e.data
        //     this.addActionItems(actionItems)
        // }

        // this.ws.onclose = () => {
        //     console.log('disconnected')
        //     this.setState({
        //         ws: new WebSocket(
        //             "ws://localhost:8000/retro/" + this.props.sessionName + "/?" + this.props.email
        //         )
        //     })
        // }
    // }

    // openWebsocket = (sessionName, email) => {
    //     const ws = new WebSocket(
    //         "ws://localhost:8000/retro/" + sessionName + "/?" + email
    //     )
    //     return ws
    // }

    addActionItems = item => {
        this.setState(state => ({actionItems: [item, ...state.actionItems]}))
    }

    // submitActionItems = itemText => {
    //     const item = {actionItemText: itemText}
    //     console.log(item)
    //     this.ws.send(JSON.stringify(item))
    //     this.addActionItems(item)
    // }
    submitActionItems = (e, data) => {
        e.preventDefault()
        
    }

    render() {
        return (
            <div>
                <h1>Welcome, {this.props.username}</h1>
                <button onClick={this.props.handle_logout}>Logout</button>
                <h2>Team Name - { this.props.sessionName }</h2>
                <div className="row">
                    <div className="column">
                        <h3>What Went Well</h3>
                        <button>+</button>
                    </div>
                    <div className="column">
                        <h3>What Didn't</h3>
                        <button>+</button>
                    </div>
                    <div className="column">
                        <h3>Action Items</h3>
                        <RetroActionItems messages={this.state.actionItems} />
                        <RetroActionItemForm 
                            ws={this.ws}
                            submitActionItems={item => this.submitActionItems(item)}
                        />

                    </div>
                </div>
            </div>
        );
    }
}
