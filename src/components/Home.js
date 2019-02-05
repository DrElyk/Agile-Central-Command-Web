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

        console.log("this is session name: " + this.state.sessionName)
        console.log("this is prop email: " + props.email)
        this.submitText = this.submitText.bind(this)
    }

    componentDidMount() {
        this.socket.onmessage = function (e) {
            console.log(e.data)
            // this.setState({ actionItems: [...this.state.actionItems, e.data] });
        }
    }
    submitText(e, data) {
        e.preventDefault()
        console.log(data)
        this.socket.send(JSON.stringify(data))
    }


    render() {
        return (
            <div>
                <h1>Hey Dude, this is Home Component. Welcome, {this.props.username} </h1>
                <button onClick={this.props.handle_logout}>Logout</button>
                <h2> Team name - {this.state.sessionName}</h2>
                <RetroActionItems messages={this.state.actionItems} />
                <RetroActionItemForm submitItem={this.submitText}/>
            </div>
        );
    }
}