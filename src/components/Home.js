import React, { Component } from "react";
import Lobby from "./Lobby";
import PokerCreation from "./PokerCreation";
import Poker from "./Poker";

export default class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {
            sessions: [],
            currentSession: null,
            joinLobby: false,
            isSessionCreated: false
        }
    }

    componentDidMount() {
        fetch("http://localhost:8000/sessions/", {
            headers: {
                Authorization: `JWT ${localStorage.getItem("token")}`
            }
        })
        .then(res => res.json())
        .then(json => {
            json.forEach(session => {
                this.setState({
                    sessions: [...this.state.sessions, session]
                })
            })
        })
    }

    selectSession = (e, session) => {
        e.preventDefault()
        this.setState({
            joinLobby: true,
            currentSession: session
        })
    }

    createSession = () => {
        this.setState({
            isSessionCreated: true
        })
    }

    render() {
        return (
            <div>
                <h1>Welcome, {this.props.username}</h1>
                <button onClick={this.props.handle_logout}>Logout</button>
                <div>
                    {this.state.joinLobby ? 
                        <Lobby
                            session={this.state.currentSession}
                            username={this.props.username}
                            email={this.props.email}
                        />
                        :
                        <div>
                            <button  onClick={this.createSession}>Create Session</button>
                            <SessionList
                                sessionList={this.state.sessions}
                                selectSession={this.selectSession}
                            />
                            {this.state.isPokerCreated ?
                                <PokerCreation />
                                : null
                            }
                        </div>
                    }
                </div>
            </div>
        )
    }
}

function SessionList(props) {
    const selectSession = props.selectSession
    const sessions = props.sessionList.map((item) =>
        <div>
            <li>
                {item.title}
                <button onClick={e => {selectSession(e, item)}}>Join</button>
            </li>
        </div>
    )

    return (
        <ul>{sessions}</ul>
    )
}