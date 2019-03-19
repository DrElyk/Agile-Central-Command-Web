import React, { Component } from "react";
import RetroBoard from "./RetroBoard";
import Poker from "./Poker";


export default class Lobby extends Component {
    constructor(props) {
        super(props)
        this.state = {
            players: [],
            isOwner: false,
            isGameStarts: false,
            isRetro: false,
        }

        this.socket = new WebSocket(
            "ws://localhost:8000/lobby/" + props.session.title + "/?" + props.email
        )
    }

    componentDidMount() {
        let url = new URL("http://localhost:8000/session-members/" + this.props.session.id)
        fetch(url, {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`
            }
        })
            .then(res => res.json())
            .then(json => {
                json.forEach(player => {
                    this.setState({
                        players: [...this.state.players, player.session_member_username]
                    })
                })
            })

        fetch('http://localhost:8000/session-owner/', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ 'session_title': this.props.session.title })
        })
        .then(res => res.json())
        .then(json => {
            if (json.is_owner === true) {
                this.setState({
                    isOwner: true
                })
            } else {
                console.log("You're a member, not an owner")
            }
        })

        this.socket.onopen = (e) => {
            this.socket.send(
                JSON.stringify({
                    'has_joined': 'player joins the session',
                    'player': this.props.email
                })
            )

            switch (this.props.session.session_type) {
                case "R":
                    this.displayRetro()
                    break;
                default:
                    break;
            }
        }

        this.socket.onmessage = (e) => {
            const dataFromSocket = JSON.parse(e.data)
            if (dataFromSocket.hasOwnProperty("has_joined")) {
                switch (dataFromSocket.has_joined) {
                    case 'User already joined the session':
                        break;
                    case 'New player joined the session':
                        const player = dataFromSocket.player
                        this.setState({
                            players: [...this.state.players, player]
                        })
                        break;
                    default:
                        break;
                }
            } else if (dataFromSocket.hasOwnProperty("start_game")) {
                this.setState({
                    isGameStarts: true
                })
            } else if (dataFromSocket.hasOwnProperty("display_retro")) {
                this.setState({
                    isRetro: true
                })
                this.socket.close()
            } else if (dataFromSocket.hasOwnProperty("cancel_game")) {
                alert("Owner of this session has cancelled the game.")

                /* 
                    Redirect all users back to dashboard 
                 */
            } else if (dataFromSocket.hasOwnProperty("exit_game")) {
                let indexPlayer = this.state.players.indexOf(dataFromSocket.player)
                this.setState((prevState) => ({
                    players: prevState.players.filter((_, i) => i !== indexPlayer),
                }));

                /*
                    Redirect user back to dashboard if user is not the owner
                */
            }
        }
    }

    startGame = () => {
        this.socket.send(
            JSON.stringify({ 'start_game': 'Owner wants to start game' })
        )
    }

    cancelGame = () => {
        this.socket.send(
            JSON.stringify({ 'cancel_game': 'Owner wants to cancel game' })
        )
    }

    exitGame = () => {
        this.socket.send(
            JSON.stringify({
                'exit_game': 'Player wants to exit game',
                'player': this.props.email
            })
        )
    }

    displayRetro = () => {
        this.socket.send(
            JSON.stringify({'display_retro': 'Retro board'})
        )
    }

    render() {
        // This cardDeck will be set by poker creation form
        const cardDeck = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, "?", "Pass", "Coffee Break"]

        return (
            <div>
                {this.state.isGameStarts ? 
                    <div>
                        {this.state.isRetro ? (
                            <RetroBoard 
                                username={this.props.username}
                                email={this.props.email}
                                session={this.props.session}
                            />
                        ) : (
                            <Poker 
                                username={this.props.username}
                                email={this.props.email}
                                session={this.props.session}
                                cardDeck={cardDeck}
                            />
                        )}
                    </div> 
                :
                    <div>
                        <h1>Session: {this.props.session.title}</h1>
                        {this.state.isOwner ?
                            <div>
                                <button onClick={this.startGame}>Start Game</button>
                                <button onClick={this.cancelGame}>Cancel Game</button>
                            </div> :
                            <div>
                                <button onClick={this.exitGame}>Exit</button>
                            </div>
                        }
                        <PlayerList
                            players={this.state.players}
                        />
                    </div>
                }
            </div>
        )
    }
}

function PlayerList(props) {
    const players = props.players.map((item) =>
        <div>
            <li>
                {item} has joined!
            </li>
        </div>
    )
    return (
        <ul>{players}</ul>
    )
}