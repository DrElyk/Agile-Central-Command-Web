import React, { Component } from "react";
import RetroActionItems from "./RetroActionItems";
import RetroActionItemForm from "./RetroActionItemsForm";


export default class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {
            sessionName: "Test",
            actionItems: []
        }
        this.socket = new WebSocket(
            "ws://localhost:8000/retro/" + this.state.sessionName + "/?" + props.email
        )
        this.submitText = this.submitText.bind(this)
    }

    componentDidMount() {
        fetch('http://localhost:8000/retro-action-items/', {
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
                   actionItems: [...this.state.actionItems, ...json]
                });
            }
        });

        this.socket.onmessage = function (e) {
            console.log("this is onmessage: " + e.data)
            this.addRetroActionItems(e.data)
        }

        this.socket.onclose = () => {
            console.log('disconnected')
        }
    }
    submitText(e, data) {
        e.preventDefault()
        console.log("this is submitText: " + JSON.stringify(data))
        this.socket.send(JSON.stringify(data))
        this.addRetroActionItems(data.actionItemText)
    }

    addRetroActionItems = item => this.setState(state => ({
        actionItems: [item, ...state.actionItems]
    }))


    render() {
        return (
            <div>
                <h1>Hey Dude, this is Home Component. Welcome, {this.props.username} </h1>
                <button onClick={this.props.handle_logout}>Logout</button>
                <h2> Team name - {this.state.sessionName}</h2>
                {/* <RetroActionItems messages={this.state.actionItems} /> */}
                <RetroActionItemForm submitItem={this.submitText}/>
            </div>
        );
    }
}