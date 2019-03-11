import React, { Component } from "react";
import RetroBoard from "./RetroBoard";
import Poker from "./Poker";

export default class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {
            sessions: [],
            isRetro: false,
            isPoker: false,
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

    addStories = (session) => {
        fetch("http://localhost:8000/story_select/", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            Authorization: `JWT ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            'session': session.id,
            'access_token': localStorage.getItem('access_token'),
            'secret_access_token': localStorage.getItem('secret_access_token')
          })
        })
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
                            <div>
                                <SessionList
                                    sessionList={this.state.sessions}
                                    displayRetro={this.displayRetro}
                                    displayPoker={this.displayPoker}
                                    selectedSession={this.selectedSession}
                                    addStories={this.addStories}
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
    const addStories = props.addStories
    const sessions = props.sessionList.map((item, i) =>
        <div>
            <li>
                {item.title}
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
                {item.session_type === "P" ?
                    <button onClick={() => addStories(item)}>Add Stories</button>:
                    <></>
                }
            </li>
        </div>
    )

    return (
        <ul>{sessions}</ul>
    )
}