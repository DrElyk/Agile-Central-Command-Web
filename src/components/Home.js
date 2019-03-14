import React, { Component } from "react";
import Lobby from "./Lobby";

export default class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {
            sessions: [],
            currentSession: null,
            joinLobby: false
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
                        <SessionList
                            sessionList={this.state.sessions}
                            selectSession={this.selectSession}
                        />
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