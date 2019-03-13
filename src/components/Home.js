import React, { Component } from "react";
import RetroBoard from "./RetroBoard";
import Poker from "./Poker";
import CreateSessionText from "./CreateSessionText"; 

export default class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {
            sessions: [],
            isRetro: false,
            isPoker: false,
            creatingSession: false,
            newSession: {
                id: -1,
                title: "",
                session_type: ""
            },
            selectedSession: {
                id: -1,
                title: ""
            }
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

    displayRetro = () => {
        this.setState({
            isRetro: true
        })
    }

    displayPoker = () => {
        this.setState({
            isPoker: true
        })
    }

    selectedSession = (e, id, title) => {
        e.preventDefault()
        this.setState({
            selectedSession: {
                id: id,
                title: title
            }
        })
    }

    createSession = (e, entered_text, selected_type) => {
        //update ui and database
        this.setState({
            creatingSession: false
        })

        fetch('http://localhost:8000/sessions/', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                'username': this.props.username,
                'title': entered_text,
                'session_type': selected_type,
            })
        })
          .then(res => res.json())
          .then(json => {
            this.setState({
                newSession: {
                    id: json.id,
                    title: json.title,
                    session_type: json.session_type
                }
            })
            this.setState({
                sessions: [...this.state.sessions, this.state.newSession]
            })
          })
    }

    deleteSession = (session) => {
        fetch('http://localhost:8000/delete_session/', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                'session': session
            })
        })

        this.setState(prevState => ({
            sessions: prevState.sessions.filter(el => el.id != session),
        }));
    }

    render() {
        const cardDeck = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, "?", "Pass", "Coffee Break"]
        return (
            <div>
                {this.state.isRetro ? (
                    <RetroBoard
                        username={this.props.username}
                        email={this.props.email}
                        session={this.state.selectedSession}
                    />
                ) : (
                    this.state.isPoker ? (
                        <Poker 
                            username={this.props.username}
                            email={this.props.email}
                            session={this.state.selectedSession}
                            cardDeck={cardDeck}
                        />
                    ) : (
                        <div>
                            <h1>Welcome, {this.props.username}</h1>
                            <button onClick={this.props.handle_logout}>Logout</button>
                            {!this.state.creatingSession ?
                                <button onClick={e => 
                                    this.setState({
                                        creatingSession: true
                                    })
                                }>Create New Session</button> :
                                <CreateSession
                                    createSession={this.createSession}
                                />
                            }
                            <div>
                                <SessionList
                                    sessionList={this.state.sessions}
                                    displayRetro={this.displayRetro}
                                    displayPoker={this.displayPoker}
                                    selectedSession={this.selectedSession}
                                    deleteSession={this.deleteSession}
                                />
                            </div>
                        </div>
                    )
                )}
               
            </div>
        )
    }
}

function SessionList(props) {
    const displayRetro = props.displayRetro
    const displayPoker = props.displayPoker
    const selectedSession = props.selectedSession
    const deleteSession = props.deleteSession
    const sessions = props.sessionList.map((item, i) =>
        <div>
            <li>
                {item.session_type === "R" ?
                    <b>Retrospective Board - </b> :
                    <b>Planning Poker - </b>
                }
                {item.title}
                <div>
                    <button onClick={
                        e => { 
                            if (item.session_type === "R") {
                                displayRetro()
                            } else {
                                displayPoker()
                            }
                            selectedSession(e, item.id, item.title)
                        }
                    }>Join</button>
                    <button onClick={() => deleteSession(item.id)}>Delete</button>
                </div>
            </li>
        </div>
    )

    return (
        <ul>{sessions}</ul>
    )
}

function CreateSession(props) {
    const createSession = props.createSession;
    return (
        <CreateSessionText
            createSession = {createSession}
        />
    )

}