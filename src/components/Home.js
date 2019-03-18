import React, { Component } from "react";
import CreateSessionText from "./CreateSessionText"; 
import update from 'immutability-helper';
import Lobby from "./Lobby";

export default class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {
            stories: [],
            sessions: [],
            isAddingStories: false,
            creatingSession: false,
            newSession: {
                id: -1,
                title: "",
                session_type: ""
            },
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
                sessions: [...this.state.sessions, this.state.newSession],
            })

              if(selected_type === "poker") {
                this.setState({
                    isAddingStories: true
                })

                fetch("http://localhost:8000/story_select/", {
                  method: "POST",
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `JWT ${localStorage.getItem('token')}`
                  },
                  body: JSON.stringify({
                    'session': this.state.newSession.id,
                    'access_token': localStorage.getItem('access_token'),
                    'secret_access_token': localStorage.getItem('secret_access_token')
                  })
                })
                .then(res => res.json())
                .then(json => {
                    fetch("http://localhost:8000/stories/" + this.state.newSession.id, {
                        headers: {
                            Authorization: `JWT ${localStorage.getItem('token')}`
                        }
                    })
                    .then(res => res.json())
                    .then(json => {
                        json.forEach(story => {
                            story.selected = false;
                            this.setState({
                                stories: [...this.state.stories, story]
                            })
                        })
                    })
                })
              }

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
            sessions: prevState.sessions.filter(el => el.id !== session),
        }));
    }

    finishSelecting = () => {
        this.setState({
            isAddingStories: false
        })
        fetch('http://localhost:8000/remove_stories/', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                'stories': this.state.stories
            })
        })
    }

    chooseStory = (index) => {
        this.setState({
            stories: update(this.state.stories, {[index]: {selected: {$set: true}}}),
        })
    }

    unChooseStory = (index) => {
        this.setState({
            stories: update(this.state.stories, {[index]: {selected: {$set: false}}}),
        })
    }

    render() {
        return (
            <div>
                <h1>Welcome, {this.props.username}</h1>
                <button onClick={this.props.handle_logout}>Logout</button>
                {this.state.joinLobby ? 
                    <Lobby
                        session={this.state.currentSession}
                        username={this.props.username}
                        email={this.props.email}
                    />
                    :
                    <div>
                        {this.state.isAddingStories ? (
                            <div>
                                <SelectStories
                                    finishSelecting = {this.finishSelecting}
                                    chooseStory = {this.chooseStory}
                                    unChooseStory = {this.unChooseStory}
                                    session = {this.state.newSession}
                                    storyList = {this.state.stories}
                                />
                            </div>
                        ) : (
                            <div>
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
                                        deleteSession={this.deleteSession}
                                        selectSession={this.selectSession}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                }
            </div>
        )
    }
}

function SessionList(props) {
    const selectSession = props.selectSession
    const deleteSession = props.deleteSession
    const sessions = props.sessionList.map((item, i) =>
        <div>
            <li>
                <div>
                    {item.session_type === "R" ?
                        <b>Retrospective Board - </b> :
                        <b>Planning Poker - </b>
                    }
                    {(item.title).trim().replace(/-/g, ' ')}
                    <button onClick={e => selectSession(e, item)}>Join</button>
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

function SelectStories(props) {
    const finishSelecting = props.finishSelecting;
    const chooseStory = props.chooseStory;
    const unChooseStory = props.unChooseStory;
    const session = props.session;
    const stories = props.storyList.map((item, i) =>
        <div>
            <ul>{item.session === session.id && item.selected === false ?
                    <div>
                        <li>{item.title}&nbsp;<button onClick={() => chooseStory(i)}>Select</button></li>
                    </div> :
                    <></>
                }
            </ul>
        </div>
    )
    const selected_stories = props.storyList.map((item, i) =>
        <div>
            <ul>{item.session === session.id && item.selected === true ?
                    <div>
                        <li>{item.title}&nbsp;<button onClick={() => unChooseStory(i)}>Remove</button></li>
                    </div> :
                    <></>
                }
            </ul>
        </div>
    )
    return (
        <div>
            <h2>Select stories to add to {session.title}</h2>
            <ul>{stories}</ul>
            <button onClick={() => finishSelecting()}>Finish</button>
            <h3>Selected Stories</h3>
            <ul>{selected_stories}</ul>
        </div>
    )
}