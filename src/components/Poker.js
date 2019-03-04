import React, { Component } from "react";
import './RetroBoard.css';

export default class Poker extends Component {
    constructor(props) {
        super(props)
        this.state = {
            stories: [],
            cardDeck: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, "Coffee Break", "Pass"],
            currentStory: {
                title: '',
                description: '',
                points: null
            },
            selectedStoryIndex: 0,
            playedCards: [],
            totalPoints: null,
            whoHasPlayed: [],
            currentCard: {
                card_owner: '',
                card: null,
                story: null
            },
            members: [],
            isFlipped: false,
            isOwner: false,
            isPlayed: false,
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
                this.setState({
                    stories: [...this.state.stories, story]
                })
            })
            this.setState(prevState => ({
                currentStory: {
                    ...prevState.currentStory,
                    title: json[0].title,
                    description: json[0].description,
                    points: json[0].story_points
                }
            }))
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
                this.setState({
                    whoHasPlayed: [...this.state.whoHasPlayed, dataFromSocket]
                })
            } else if (dataFromSocket.hasOwnProperty("flip_card")) {
                this.setState({isFlipped: true})
                this.socket.send(JSON.stringify({
                    "card_owner": this.state.currentCard.card_owner,
                    "card": this.state.currentCard.card,
                    "story": this.state.currentStory 
                }))
            } else {
                // show all cards on the table
                const card = dataFromSocket
                this.setState({
                    playedCards: [...this.state.playedCards, card]
                })
            }
        }
    }

    toggleNextStory = () => {
        if (this.state.selectedStoryIndex === this.state.stories.length - 1)
            return

        this.setState(prevState => ({
            currentStory: {
                ...prevState.currentStory,
                title: this.state.stories[prevState.selectedStoryIndex + 1].title,
                description: this.state.stories[prevState.selectedStoryIndex + 1].description,
                points: this.state.stories[prevState.selectedStoryIndex + 1].story_points,
            },
            selectedStoryIndex: prevState.selectedStoryIndex + 1,
            playedCards: [],
            totalPoints: null,
            whoHasPlayed: [],
            currentCard: {
                card_owner: '',
                card: null,
                story: null
            },
            isFlipped: false,
            isPlayed: false,
        }))
    }

    togglePrevStory = () => {
        if (this.state.selectedStoryIndex === 0)
            return

        this.setState(prevState => ({
            currentStory: {
                ...prevState.currentStory,
                title: this.state.stories[prevState.selectedStoryIndex - 1].title,
                description: this.state.stories[prevState.selectedStoryIndex - 1].description,
                points: this.state.stories[prevState.selectedStoryIndex - 1].story_points
            },
            selectedStoryIndex: prevState.selectedStoryIndex - 1,
            playedCards: [],
            totalPoints: null,
            whoHasPlayed: [],
            currentCard: {
                card_owner: '',
                card: null,
                story: null
            },
            isFlipped: false,
            isPlayed: false,
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
        this.setState(prevState => ({
            currentCard: {
                ...prevState.currentCard,
                card_owner: this.props.username,
                card: data,
                story: this.state.currentStory
            }
        }))

        if (this.state.isPlayed === false) {
            this.socket.send(
                JSON.stringify({
                    'play_card': 'Member plays a card',
                    'story': this.state.currentStory
                })
            )
            this.setState({isPlayed: true})
        }
    }

    flipCards = () => {
        this.socket.send(JSON.stringify({
            'flip_card': 'Owner wants to flip cards',
        }))
    }

    totalPoints = () => {

    }


    render() {
        return (
            <div>
                <h1>This is planning poker</h1>
                <div className="row">
                    <div className="column">
                        <CurrentStory currentStory={this.state.currentStory} />
                        <h4>Total points: </h4>
                        {this.state.isOwner ?
                            <div>
                               <button>Edit Points</button>
                            </div> : null
                        }
                        <h3>Time Remaining: </h3>
                    </div>
                    <div className="column">
                        <PokerTable 
                            isFlipped={this.state.isFlipped} 
                            playedCards={this.state.playedCards} 
                            whoHasPlayed={this.state.whoHasPlayed} 
                            totalPoints={this.state.totalPoints} 
                            deck={this.state.deck}
                            story={this.state.currentStory}
                        />
                        <CardDeck 
                            deck={this.state.cardDeck} 
                            currentStory={this.state.currentStory}
                            playCards={this.playCards}
                            isFlipped={this.state.isFlipped}
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
                                    <button >Reset Cards</button>
                                    {this.state.whoHasPlayed.length !== 0 && this.state.isFlipped === false ?
                                        <button onClick={this.flipCards}>Flip Cards</button>
                                        :
                                        <button disabled>Flip Cards</button>
                                    }
                                    <button>Add Stories</button>
                                    <button>End Game</button>
                                </div> : <div></div>
                            }
                            <h3>List of Stories: </h3>
                            <Stories stories={this.state.stories} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

function Stories(props) {
    const stories = props.stories.map((item, i) =>
        <div>
            <li>
                {item.title} with {item.points == null ? item.points="-" : item.points} points
            </li>
        </div>
    )
    return(
        <ul>{stories}</ul>
    )
}

function PokerTable(props) {
    if (props.isFlipped === false) {
        const players = props.whoHasPlayed.map((item) => 
            (isEquivalent(props.story, item.story)) ?
            (<div>
                <li>
                    {item.user} has played!
                </li>
            </div>) : null
        )

        return(
            <ul>{ players } </ul>
        )
    } else {
        const cards = props.playedCards.map((item, i) =>
            (isEquivalent(props.story, item.story)) ?
            (<div>
                <li>
                    { item.card }
                </li>
            </div>) : null
        )
        return (
            <ul>{ cards }</ul>
        )
        
        // var totalPoints = props.totalPoints
        

    }
}

function CardDeck(props) {
    let deck = null
    if (props.isFlipped === false) {
        deck = props.deck.map((item, i) =>
            <button onClick={e => props.playCards(e, item)}>{item}</button>
        )
    } else {
        deck = props.deck.map((item, i) =>
            <button disabled>{item}</button>
        )
    }
    

    return(
        <div>{ deck }</div>
    )
}

function CurrentStory(props) {
    return(
        <div>
            <h2>Current Story: {props.currentStory.title}</h2>
            <h3>Story Description: {props.currentStory.description}</h3>
        </div>
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
    return(
        <ul>{member}</ul>
    )
}

function isEquivalent(a, b) {
    // Create arrays of property names
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length !== bProps.length) {
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];

        // If values of same property are not equal,
        // objects are not equivalent
        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
}
