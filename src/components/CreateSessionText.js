import React, { Component } from "react";

export default class PokerEditPoints extends Component {
    constructor(props) {
        super(props);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleSelectChange = this.handleSelectChange.bind(this);
        this.handleCardChange = this.handleCardChange.bind(this);
        this.handleVelocityChange = this.handleVelocityChange.bind(this);
        this.state={
            entered_text: "",
            selected_type: "poker",
            card_type: "Fibonacci",
            velocity: "50"
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
    handleCardChange(event) {
        this.setState({
            card_type: event.target.value
        });
    }
    handleVelocityChange(event) {
        let newVel = event.target.value;
        this.setState({
            velocity: newVel
        });
    }

    toHyphens() {
        this.setState({
            entered_text: this.state.entered_text.trim().replace(/\s+/g, '-')
        })
    }

    render() {
        return (
            <div>
                {this.state.selected_type === "poker" ?
                    <form onSubmit={e => this.props.createSessionPoker(e, this.state.entered_text, this.state.selected_type, this.state.card_type, this.state.velocity)}>
                        <h4><input type="text" value={this.state.entered_text} onChange={this.handleTextChange} /></h4>
                        <select onChange={this.handleSelectChange}>
                            <option value="poker">Planning Poker</option>
                            <option value="retro">Retrospective Board</option>
                        </select>
                        <div>
                            <h4>Card Type:</h4>
                            <select onChange={this.handleCardChange}>
                                <option value="fib">Fibonacci</option>
                                <option value="modfib">Modified Fibonacci</option>
                                <option value="seq">Sequential</option>
                            </select>
                            <h4><input type="number" value={this.state.velocity} onChange={this.handleVelocityChange} /></h4>
                        </div>
                        <input type="submit" value="Save Session" onClick={() => this.toHyphens()}/> 
                    </form> :
                    <form onSubmit={e => this.props.createSession(e, this.state.entered_text, this.state.selected_type)}>
                        <h4><input type="text" value={this.state.entered_text} onChange={this.handleTextChange} /></h4>
                        <select onChange={this.handleSelectChange}>
                            <option value="poker">Planning Poker</option>
                            <option value="retro">Retrospective Board</option>
                        </select>
                        <input type="submit" value="Save Session" onClick={() => this.toHyphens()}/>
                    </form>
                }
            </div>
        );
    }
}