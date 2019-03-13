import React, { Component } from "react";
import Poker from "./Poker";


export default class PokerCreation extends Component {
    constructor(props) {

    }

    render() {
        return (
            <div className='popup'>
                <div className='popup_inner'>
                    <form>
                        <label>
                            Session Title
                    <input type="text" name="session-title" />
                        </label>
                        <label>
                            Description
                    <input type="text" name="session-description" />
                        </label>
                        <label>
                            Team Velocity
                    <input type="text" name="team-velocity" />
                        </label>
                        <label>
                            Choose your card deck
                    <select>
                                <option value="fibonacci">Fibonacci</option>
                                <option value="modified-fibonacci">Modified Fibonacci</option>
                                <option value="tshirts">T-shirts</option>
                                <option value="power2">Power of 2</option>
                            </select>
                        </label>
                        <label>
                            Would you like to auto-flip the cards after everyone has voted?
                    <select>
                                <option value="auto-flip-yes">Yes</option>
                                <option value="auto-flip-no">No</option>
                            </select>
                        </label>
                        <label>
                            Would you like a story timer?
                    <select>
                                <option value="story-timer-yes">Yes</option>
                                <option value="story-timer-no">No</option>
                            </select>
                        </label>
                        <input type="submit" value="Submit" />
                    </form>
                </div>
            </div>
        )
    }
}