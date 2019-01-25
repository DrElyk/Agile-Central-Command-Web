import React, { Component } from "react";

export default class RetroActionItem extends Component {
    render() {
        return (
            <ul>
                {this.props.messages.map(message => {
                    return (
                        <li>
                            <div>
                                {message}
                            </div>
                        </li>
                    )
                })}
            </ul>
        )
    }
}