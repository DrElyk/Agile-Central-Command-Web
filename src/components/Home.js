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

        this.socket.onmessage = function (e) {
            console.log(e.data)
            // this.setState({actionItems: [...this.state.actionItems, e.data]});
        }
        this.submitText = this.submitText.bind(this)
    }

    submitText(e, data) {
        e.preventDefault()
        console.log(data)
        this.socket.send(JSON.stringify(data))
    }


    render() {
        // const socket = new WebSocket(
        //     "ws://localhost:8000/retro/" + this.state.sessionName + "/?" + this.props.email
        // )
        
        // function submitText(e, data) {
        //     e.preventDefault()
        //     console.log(data)
        //     socket.send(JSON.stringify(data))
        // }

        // socket.onmessage = function (e) {
        //     console.log(e.data)
        //     // this.setState({actionItems: [...this.state.actionItems, e.data]});
        // }

        return (
            <div>
                <h1>Welcome, {this.props.username} </h1>
                <button onClick={this.props.handle_logout}>Logout</button>
                <h2> Team name - {this.state.sessionName}</h2>
                <RetroActionItems messages={this.state.actionItems} />
                <RetroActionItemForm submitItem={this.submitText}/>
            </div>
        );
    }
}