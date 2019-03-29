import React, { Component } from "react";
import PokerEditPoints from "./PokerEditPoints";
import PokerSummary from "./PokerSummary";
import './RetroBoard.css';


export default class Poker extends Component {
    constructor(props) {
        super(props)
        this.state = {
            stories: [],
            selectedStoryIndex: 0,
            members: [],
            isOwner: false,
            isEndGame: false
        }

        this.socket = new WebSocket(
            "ws://localhost:8000/poker/" + props.session.title + "/?" + props.email
        )
    }

    componentDidMount() {
        let url = new URL("http://localhost:8000/stories/" + this.props.session.id)
        fetch(url, {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`
            }
        })
        .then(res => res.json())
        .then(json => {
            json.forEach(story => {
                let modified_story = {
                    id: story.id,
                    title: story.title,
                    description: story.description,
                    points: story.story_points,
                    key: story.key,
                    playedCards: [],
                    whoHasPlayed: [],
                    card: null,
                    isCardFlipped: false,
                    isUserPlayed: false,
                    isOwnerEdittedPoints: false
                }
                this.setState({
                    stories: [...this.state.stories, modified_story]
                })
            })
        })

        url = new URL("http://localhost:8000/session-members/" + this.props.session.id)
        fetch(url, {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`
            }
        })
            .then(res => res.json())
            .then(json => {
                json.forEach(member => {
                    this.setState({
                        members: [...this.state.members, member]
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

        this.socket.onmessage = (e) => {
            const dataFromSocket = JSON.parse(e.data)
            if (dataFromSocket.hasOwnProperty("toggle_next_story")) {
                this.toggleNextStory()
            } else if (dataFromSocket.hasOwnProperty("toggle_prev_story")) {
                this.togglePrevStory()
            } else if (dataFromSocket.hasOwnProperty("play_card")) {
                let player = dataFromSocket.player
                let currentStory = this.state.stories[this.state.selectedStoryIndex]
                if (!currentStory.whoHasPlayed.includes(player)) {
                    this.setState(state => ({
                        stories: state.stories.map((story, i) => {
                            if (i === state.selectedStoryIndex) {
                                if(this.state.isOwner && story.whoHasPlayed.length+1 >= this.state.members.length) {alert("All Players have played")}
                                return { ...story, isUserPlayed: true, whoHasPlayed: [...story.whoHasPlayed, player] }
                            }
                            return story
                        })
                    }))
                }
            } else if (dataFromSocket.hasOwnProperty("flip_card")) {
                let currentStory = this.state.stories[this.state.selectedStoryIndex]
                url = new URL("http://localhost:8000/cards/" + this.props.session.id + "/" + currentStory.id)
                fetch(url, {
                    headers: {
                        Authorization: `JWT ${localStorage.getItem('token')}`
                    }
                })
                .then(res => res.json())
                .then(json => {
                    json.forEach(card => {
                        this.setState(state => ({
                            stories: state.stories.map((story, i) => {
                                if (i === state.selectedStoryIndex) {
                                    return { ...story, playedCards: [...story.playedCards, card] }
                                }
                                return story
                            })
                        }))
                    })

                    let totalPoints = this.calculateStoryPoints()
                    if (totalPoints != null) {
                        this.setState(state => ({
                            stories: state.stories.map((story, i) => {
                                if (i === state.selectedStoryIndex) {
                                    return { ...story, points: totalPoints }
                                }
                                return story
                            })
                        }))

                        if (this.state.isOwner) {
                            fetch('http://localhost:8000/update_points/', {
                                method: "POST",
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `JWT ${localStorage.getItem('token')}`
                                },
                                body: JSON.stringify({
                                    'key': currentStory.key,
                                    'id': currentStory.id,
                                    'points': totalPoints,
                                    'access_token': localStorage.getItem('access_token'),
                                    'secret_access_token': localStorage.getItem('secret_access_token')
                                })
                            })
                        }
                    }

                    this.setState(state => ({
                        stories: state.stories.map((story, i) => {
                            if (i === state.selectedStoryIndex) {
                                return { ...story, isCardFlipped: true}
                            }
                            return story
                        })
                    }))
                })
            } else if (dataFromSocket.hasOwnProperty("submit_points")) {
                let currentStory = this.state.stories[this.state.selectedStoryIndex]
                if (dataFromSocket.story === currentStory.id) {
                    this.setState(state => ({
                        stories: state.stories.map((story, i) => {
                            if (i === state.selectedStoryIndex) {
                                return { ...story, points: dataFromSocket.points, isOwnerEdittedPoints: false}
                            }
                            return story
                        })
                    }))
                }
            } else if (dataFromSocket.hasOwnProperty("reset_cards")) {
                let currentStory = this.state.stories[this.state.selectedStoryIndex]
                if (dataFromSocket.story === currentStory.id) {
                    this.setState(state => ({
                        stories: state.stories.map((story, i) => {
                            if (i === state.selectedStoryIndex) {
                                return {
                                    ...story, 
                                    playedCards: [],
                                    whoHasPlayed: [],
                                    card: null,
                                    isCardFlipped: false,
                                    isUserPlayed: false,
                                    isOwnerEdittedPoints: false
                                }
                            }
                            return story
                        })
                    }))
                }
            } else if (dataFromSocket.hasOwnProperty("end_game")) {
                this.setState({isEndGame: true})
                this.socket.close()
            }
        }
    }

    toggleNextStory = () => {
        if (this.state.selectedStoryIndex === this.state.stories.length - 1)
            return

        this.setState(prevState => ({
            selectedStoryIndex: prevState.selectedStoryIndex + 1,
        }))
    }

    togglePrevStory = () => {
        if (this.state.selectedStoryIndex === 0)
            return

        this.setState(prevState => ({
            selectedStoryIndex: prevState.selectedStoryIndex - 1,
        }))
    }

    nextStory = () => {
        this.socket.send(
            JSON.stringify({
                'next_story': 'Owner wants to move to next story'
            })
        )
    }

    prevStory = () => {
        this.socket.send(
            JSON.stringify({
                'prev_story': 'Owner wants to go back to prev story'
            })
        )
    }

    playCards = (e, data) => {
        let currentStory = this.state.stories[this.state.selectedStoryIndex]

        switch (data) {
            case "?":
                data = -1
                break;
            case "Pass":
                data = -2
                break;
            case "Coffee Break":
                data = -3
                break;
            default:
                break;
        }

        this.socket.send(
            JSON.stringify({
                'play_card': 'User plays a card',
                'card': data, 
                'player': this.props.email,
                'story': currentStory.id
            })
        )

        this.setState(state => ({
            stories: state.stories.map((story, i) => {
                if (i === state.selectedStoryIndex) {
                    return { ...story, card: data}
                }
                return story
            })
        }))
    }

    flipCards = () => {
        let currentStory = this.state.stories[this.state.selectedStoryIndex]
        this.socket.send(JSON.stringify({
            'flip_card': 'Owner wants to flip cards',
            'story': currentStory.id
        }))
    }

    editPoints = () => {
        this.setState(state => ({
            stories: state.stories.map((story, i) => {
                if (i === state.selectedStoryIndex) {
                    return { ...story, isOwnerEdittedPoints: true }
                }
                return story
            })
        }))
    }

    submitPoints = (e, data) => {
        e.preventDefault()
        let currentStory = this.state.stories[this.state.selectedStoryIndex]
        fetch('http://localhost:8000/update_points/', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                'key': currentStory.key,
                'points': data.value,
                'access_token': localStorage.getItem('access_token'),
                'secret_access_token': localStorage.getItem('secret_access_token')
            })
        })
        this.socket.send(JSON.stringify({
            'submit_points': 'Owner wants to submit new story points',
            'points': data.value,
            'story': currentStory.id
        }))
    }

    resetCards = () => {
        let currentStory = this.state.stories[this.state.selectedStoryIndex]
        this.socket.send(JSON.stringify({
            'reset_cards': 'Owner wants to reset cards',
            'story': currentStory.id
        }))
    }

    submitToJira = () => {
        /*
        let currentStory = this.state.stories[this.state.selectedStoryIndex]
        this.socket.send(JSON.stringify({
            'end_game': 'Owner wants to end session',
            'story': currentStory.id
        }))
        */
        fetch('http://localhost:8000/end_poker/', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                'session': this.props.session.id,
                'access_token': localStorage.getItem('access_token'),
                'secret_access_token': localStorage.getItem('secret_access_token')
            })
        })
        this.socket.send(
            JSON.stringify({
                'close_socket': 'close the home socket'
            })
        )
        this.socket.close()
    }

    endGame = () => {
        this.setState({
            isEndGame: !this.state.isEndGame
        })
    }

    calculateStoryPoints = () => {
        let currentStory = this.state.stories[this.state.selectedStoryIndex]
        let cardDeck = this.props.cardDeck
        let points = 0
        let validPoints = 0
        currentStory.playedCards.forEach(card => {
            if (card.card >= 0) {
                points += card.card
                validPoints++
            }
        })

        if (points >= 0 && validPoints > 0) {
            points = (points / validPoints)
            for (let i = 0; i < cardDeck.length; i++) {
                const card = cardDeck[i];
                if (typeof card === 'number') {
                    if (points <= card) {
                        points = card
                        break;
                    }
                }
            }
        } else {
            points = null
        } 
        
        return points
    }

    render() {
        if (this.state.stories.length === 0) {
            return <div>Loading stories</div>
        }
        let currentStory = this.state.stories[this.state.selectedStoryIndex]
        return (
            <div>
                <h1>This is planning poker</h1>
                <div className="row">
                    <div className="column">
                        <h2>Current Story: {currentStory.title}</h2>
                        <h3>Story Description: {currentStory.description}</h3>
                        <TotalPoints
                            isOwner={this.state.isOwner}
                            currentStory={currentStory}
                            editPoints={this.editPoints}
                            submitPoints={this.submitPoints}
                        />
                    </div>
                    <div className="column">
                        <PokerTable
                            deck={this.props.cardDeck}
                            currentStory={currentStory}
                        />
                        <CardDeck
                            deck={this.props.cardDeck}
                            currentStory={currentStory}
                            playCards={this.playCards}
                        />
                    </div>
                    <div className="column">
                        <h2>Team Velocity: </h2>
                        <h3>Number of players: {this.state.members.length}</h3>
                        <MemberList memberList={this.state.members} />
                        <div>
                            <h3>Story: {this.state.selectedStoryIndex + 1} / {this.state.stories.length}</h3>
                            {this.state.isOwner ?
                                <div>
                                    <button onClick={this.prevStory}>Previous Story</button>
                                    <button onClick={this.nextStory}>Next Story</button>
                                    <button onClick={this.resetCards}>Reset Cards</button>
                                    {currentStory.whoHasPlayed.length !== 0 &&
                                        currentStory.whoHasPlayed.length === this.state.members.length && 
                                        currentStory.isCardFlipped === false 
                                        ?
                                        <button onClick={this.flipCards}>Flip Cards</button>
                                        :
                                        <button disabled>Flip Cards</button>
                                    }
                                    <button onClick={this.endGame}>End Game</button>
                                </div> : null
                            }
                            <h3>List of Stories: </h3>
                            <Stories stories={this.state.stories} />
                        </div>
                    </div>
                </div>
                {this.state.isEndGame ?
                    <PokerSummary 
                        stories={this.state.stories}
                        closeSummary={this.endGame}
                        session={this.props.session}
                        submitToJira={this.submitToJira}
                    />: null
                }
            </div>
        )
    }
}

function Stories(props) {
    const stories = props.stories.map((item, i) =>
        <div>
            <li>
                {item.title} with {item.points} points
            </li>
        </div>
    )
    return (
        <ul>{stories}</ul>
    )
}

function PokerTable(props) {
    if (props.currentStory.isCardFlipped === false) {
        const players = props.currentStory.whoHasPlayed.map(item => (
            <div>
                <li>
                    {item} has played!
                </li>
            </div>
        ))

        return (
            <ul>{players}</ul>
        )
    }
    const cards = props.currentStory.playedCards.map(item => {
        switch (item.card) {
            case -1:
                item.card = "?"
                break;
            case -2:
                item.card = "Pass"
                break;
            case -3:
                item.card = "Coffee Break"
                break;
            default:
                break;
        }
        return (<div>
            <li>{item.player} played {item.card}</li>
        </div>)
    })

    return (
        <ul>{cards}</ul>
    )
}

function CardDeck(props) {
    let deck
    if (props.currentStory.isCardFlipped === false) {
        deck = props.deck.map((item, i) =>
            <button onClick={e => props.playCards(e, item)}>{item}</button>
        )
    } else {
        deck = props.deck.map((item, i) =>
            <button disabled>{item}</button>
        )
    }


    return (
        <div>{deck}</div>
    )
}

function MemberList(props) {
    const member = props.memberList.map((item, i) =>
        <div>
            <li>
                {item.session_member_username}
            </li>
        </div>
    )
    return (
        <ul>{member}</ul>
    )
}

function TotalPoints(props) {
    const isOwner = props.isOwner
    const currentStory = props.currentStory
    const editPoints = props.editPoints
    const submitPoints = props.submitPoints
    if (isOwner) {
        if (currentStory.isOwnerEdittedPoints) {
            return (
               <PokerEditPoints
                currentStory={currentStory}
                submitPoints={submitPoints}
               />
            )
        } else {
            return (
                <div>
                    <h4>Total Points: {currentStory.points}</h4>
                    <button onClick={editPoints}>Edit Points</button>
                </div>
            )
        }
    } else {
        return <h4>Total Points: {currentStory.points}</h4>
    }
}