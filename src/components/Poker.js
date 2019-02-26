import React, { Component } from "react";
import './Poker.css';

export default class Poker extends Component {
    constructor(props) {
        super(props)
        this.state = {
            stories: []
        }
        this.socket = new WebSocket(
            "ws://localhost:8000/poker/" + props.session.title + "/?" + props.email
        )
    }

    componentDidMount() {

    }

    render() {
        return (
            <div className="poker-session">
                <div className="current-story"></div>
                <div className="poker-table"></div>
                <div className="right-nav"></div>
                <div className="card-deck"></div>
            </div>
        )
    }
}