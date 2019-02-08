import React, { Component } from 'react';
import './RetroBoard.css';
import RetroBoardForm from './RetroBoardForm';


export default class RetroBoard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            sessionName: "Test",
            whatWentWellItems: [],
            whatDidNotItems: [],
            actionItems: []
        }
        this.socket = new WebSocket(
            "ws://localhost:8000/retro/" + this.state.sessionName + "/?" + props.email
        )
    }

    componentDidMount() {
        fetch('http://localhost:8000/retro-board-items/', {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`
            }
        })
        .then(res => res.json())
        .then(json => {
            if (json.detail === "Signature has expired.") {
                this.setState({
                    logged_in: false
                })
            } else {
                console.log(json)
                json.forEach(retroBoardItem => {
                    switch (retroBoardItem.item_type) {
                        case "WWW":
                            this.setState({
                                whatWentWellItems: [...this.state.whatWentWellItems, retroBoardItem]
                            })
                            break;
                        case "WDN":
                            this.setState({
                                whatDidNotItems: [...this.state.whatDidNotItems, retroBoardItem]
                            })
                            break;
                        case "AI":
                            this.setState({
                                actionItems: [...this.state.actionItems, retroBoardItem]
                            })
                            break;
                        default:
                            break;
                    }
                });
            }
        })


        this.socket.onmessage = (e) => {
            const retroBoardItem = JSON.parse(e.data)
            this.addRetroBoardItems(retroBoardItem)
        }

        this.socket.onclose = () => {
            console.log('disconnected')
        }
    }

    submitText = (e, data) => {
        e.preventDefault()
        this.socket.send(JSON.stringify(data))
    }

    addRetroBoardItems = item => {
        switch (item.item_type) {
            case "WWW":
                this.setState({
                    whatWentWellItems: [...this.state.whatWentWellItems, item]
                })
                break;
            case "WDN":
                this.setState({
                    whatDidNotItems: [...this.state.whatDidNotItems, item]
                })
                break;
            case "AI":
                this.setState({
                    actionItems: [...this.state.actionItems, item]
                })
                break;
            default:
                break;
        }
    }


    render() {
        return (
            <div>
                <h1>Welcome, {this.props.username}</h1>
                <button onClick={this.props.handle_logout}>Logout</button>
                <h2>Team Name - { this.state.sessionName }</h2>
                <RetroBoardForm submitText={this.submitText} />
                <div className="row">
                    <div className="column">
                        <h3>What Went Well</h3>
                        <RetroBoardItemList convertKeyToString= {this.convertKeyToString} itemList={this.state.whatWentWellItems}></RetroBoardItemList>
                    </div>
                    <div className="column">
                        <h3>What Didn't</h3>
                        <RetroBoardItemList itemList={this.state.whatDidNotItems}></RetroBoardItemList>
                    </div>
                    <div className="column">
                        <h3>Action Items</h3>
                        <RetroBoardItemList itemList={this.state.actionItems}></RetroBoardItemList>
                    </div>
                </div>
            </div>
        );
    }
}


function RetroBoardItemList(props) {
    const itemList = props.itemList
    console.log(itemList)
    const items = itemList.map((item) => 
        <li key={item.item_id}>
            {item.item_text}
        </li>
    )
    return (
        <ul>{items}</ul>
    )
}

