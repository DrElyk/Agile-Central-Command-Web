import React, { Component } from 'react';
import './RetroBoard.css';
import RetroActionItems from "./RetroActionItems";
import RetroActionItemForm from "./RetroActionItemsForm";


export default class RetroBoard extends Component {
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
        }

        this.submitActionItems = this.submitActionItems.bind(this)
    }

    submitActionItems(e,data) {
        e.preventDefault()
        console.log(data)
        this.socket.send(JSON.stringify(data))
    }

    render() {
        return (
            <div>
                <h1>Welcome, {this.props.username}</h1>
                <button onClick={this.props.handle_logout}>Logout</button>
                <h2>Team Name - { this.state.sessionName }</h2>
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
                        <RetroActionItemForm submitActionItems={this.submitActionItems} />
                    </div>
                </div>
            </div>
        );
    }
}
