import React, { Component } from "react";

export default class RetroActionItemsForm extends Component {
    state = {
        actionItemText: '',
    };

    handle_change = e => {
        const name = e.target.name;
        const value = e.target.value;
        this.setState(prevstate => {
            const newState = { ...prevstate };
            newState[name] = value;
            return newState;
        });
    };

    render() {
        return (
            <form onSubmit={e => this.props.submitItem(e, this.state)}>
                <input
                    type="text"
                    name="actionItemText"
                    value={this.state.actionItemText}
                    onChange={this.handle_change}
                />
                <input type="submit" />
            </form>
        );
    }
}
