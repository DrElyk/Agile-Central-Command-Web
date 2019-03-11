import React, { Component } from 'react';
import './RetroBoard.css';
import RetroBoardForm from './RetroBoardForm';
import update from 'immutability-helper';

// Note: Only session owner can see "End Sesion" button

export default class RetroBoard extends Component {
    constructor(props) {
        super(props)
        this.username = props.username;
        this.state = {
            // sessionName: "Test",
            isOwner: false,
            whatWentWellItems: [],
            whatDidNotItems: [],
            actionItems: [],
            // sessionId: 1,
        }
        this.socket = new WebSocket(
            "ws://localhost:8000/retro/" + props.session.title + "/?" + props.email
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

        fetch('http://localhost:8000/session-owner/', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({'session_title': this.props.session.title})
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
            if (dataFromSocket.hasOwnProperty("end_session_message")) {
                // We should replace alert with something else
                alert(dataFromSocket.session_owner + " has ended this session!!! Please go back to Dashboard")
                this.socket.close()
                console.log("Kate, redirect user to dashboard here")
            } else if (dataFromSocket.hasOwnProperty("exit_session_message")) {
                alert(dataFromSocket.member + " left the session")
                console.log("Kate, redirect user to dashboard here")
            } else if(dataFromSocket.hasOwnProperty("delete_item_message")) {
                const item_id = dataFromSocket.id;
                const item_type = dataFromSocket.item_type;
                this.refreshDeletedItem(item_id, item_type);
            } else if(dataFromSocket.hasOwnProperty("edit_item_message")) {
                const item_id = dataFromSocket.id;
                const item_type = dataFromSocket.item_type;
                const new_item_text = dataFromSocket.new_item_text;
                const item_index = dataFromSocket.item_index;
                this.refreshEditedItem(item_id, item_type, new_item_text, item_index);
            }
            else {
                const retroBoardItem = dataFromSocket
                this.addRetroBoardItems(retroBoardItem)
            }
        }

        // this.socket.onclose = () => {}
    }

    submitText = (e, data) => {
        e.preventDefault()
        this.socket.send(JSON.stringify(data))
    }

    refreshEditedItem = (item_id, item_type, new_item_text, i) => {
        if(item_type === 'WWW') {
            this.setState({
                whatWentWellItems: update(this.state.whatWentWellItems, {[i]: {item_text: {$set: new_item_text}}}),
            })
        } else if(item_type === 'WDN') {
            this.setState({
                whatDidNotItems: update(this.state.whatDidNotItems, {[i]: {item_text: {$set: new_item_text}}}),
            })
        } else if(item_type === 'AI') {
            this.setState({
                actionItems: update(this.state.actionItems, {[i]: {item_text: {$set: new_item_text}}}),
            })
        }
    }

    refreshDeletedItem = (item_id, item_type) => {
        if(item_type === 'WWW') {
            this.setState(prevState => ({
                whatWentWellItems: prevState.whatWentWellItems.filter(el => el.id != item_id),
            }));
        } else if (item_type === 'WDN') {
            this.setState(prevState => ({
                whatDidNotItems: prevState.whatDidNotItems.filter(el => el.id != item_id),
            }));
        } else if (item_type === 'AI') {
            this.setState(prevState => ({
                actionItems: prevState.actionItems.filter(el => el.id != item_id),
            }));
        }
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

    endSession = () => {
        this.socket.send(
            JSON.stringify({'end_session': 'Owner wants to end this session!'})
        )
        fetch('http://localhost:8000/end_retro/', {
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

    }

    exitSession = () => {
        this.socket.send(
            JSON.stringify({
                'session_member': this.props.username,
                'exit_session': 'User wants to exit this session!'
            })
        )
    }

    editItem = (e, item, i) => {
        var entered_text = 'Text Changing';
        var item_state = {
            itemText: item.item_text,
            itemType: item.item_type,
            newItemText: entered_text,
            item_id: item.id,
            index: i
        };
        if(item.item_type === 'WWW') {
            this.setState({
                whatWentWellItems: update(this.state.whatWentWellItems, {[i]: {item_text: {$set: entered_text}}}),
            })
        } else if(item.item_type === 'WDN') {
            this.setState({
                whatDidNotItems: update(this.state.whatDidNotItems, {[i]: {item_text: {$set: entered_text}}}),
            })
        } else if(item.item_type === 'AI') {
            this.setState({
                actionItems: update(this.state.actionItems, {[i]: {item_text: {$set: entered_text}}}),
            })
        }
        this.submitText(e, item_state);
    }

    deleteItem = (e, item) => {
        var item_state = {
            itemText: item.item_text,
            itemType: item.item_type,
            item_id: item.id ? item.id : item.item_id,
            delete: true
        };
        if(item.item_type === 'WWW') {
            this.setState(prevState => ({
                whatWentWellItems: prevState.whatWentWellItems.filter(el => el != item),
            }));
        } else if (item.item_type === 'WDN') {
            this.setState(prevState => ({
                whatDidNotItems: prevState.whatDidNotItems.filter(el => el != item),
            }));
        } else if (item.item_type === 'AI') {
            this.setState(prevState => ({
                actionItems: prevState.actionItems.filter(el => el != item),
            }));
        }
        this.submitText(e, item_state);
    }

    render() {
        return (
            <div>
                <h1>Session: {this.props.session.title}</h1>
                <RetroBoardForm submitText={this.submitText} />
                <div className="row">
                    <div className="column">
                        <h3>What Went Well</h3>
                        <RetroBoardItemList itemList={this.state.whatWentWellItems} username={this.username} editItem={this.editItem} deleteItem={this.deleteItem}></RetroBoardItemList>
                    </div>
                    <div className="column">
                        <h3>What Did Not</h3>
                        <RetroBoardItemList itemList={this.state.whatDidNotItems} username={this.username} editItem={this.editItem} deleteItem={this.deleteItem}></RetroBoardItemList>
                    </div>
                    <div className="column">
                        <h3>Action Items</h3>
                        <RetroBoardItemList itemList={this.state.actionItems} username={this.username} editItem={this.editItem} deleteItem={this.deleteItem}></RetroBoardItemList>
                    </div>
                </div>
                {this.state.isOwner ?
                    <button onClick={this.endSession}>End Session</button> : <div></div>
                }
                <button onClick={this.exitSession}>Exit Session</button>
            </div>
        );
    }

}

function RetroBoardItemList(props) {
    const itemList = props.itemList;
    const editItem = props.editItem;
    const deleteItem = props.deleteItem;
    const username = props.username;
    const items = itemList.map((item, i) => 
        <div>
            <li key={i}>
                {item.owner_username == username || item.item_owner == username ?
                    <div>
                        {item.item_text}
                        <button type="button" onClick={e=>editItem(e, item, i)} style={{marginLeft: 5 + 'px'}}>Edit</button>
                        <button type="button" onClick={e=>deleteItem(e, item, i)} style={{marginLeft: 5 + 'px'}}>Delete</button>
                    </div> :
                    <div>{item.item_text}</div>
                }
            </li>
        </div>
    )
    return (
        <ul>{items}</ul>
    )
}

