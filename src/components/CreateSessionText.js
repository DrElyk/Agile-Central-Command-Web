import React, { Component } from "react";

export default class PokerEditPoints extends Component {
    constructor(props) {
        super(props);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleSelectChange = this.handleSelectChange.bind(this);
        this.state={
            entered_text: "",
            selected_type: "poker"
        }
    }

    handleTextChange(event) {
        let newText = event.target.value;
        this.setState({
            entered_text: newText
        });
    }
    handleSelectChange(event) {
        this.setState({
            selected_type: event.target.value
        });
    }

    toHyphens() {
        this.setState({
            entered_text: this.state.entered_text.trim().replace(/\s+/g, '-')
        })
    }

    render() {
        return (
            <form onSubmit={e => this.props.createSession(e, this.state.entered_text, this.state.selected_type)}>
                <h4><input type="text" value={this.state.entered_text} onChange={this.handleTextChange} /></h4>
                <select onChange={this.handleSelectChange}>
                    <option value="poker">Planning Poker</option>
                    <option value="retro">Retrospective Board</option>
                </select>
                <input type="submit" value="Save Session" onClick={() => this.toHyphens()}/>
            </form>
        );
    }
}