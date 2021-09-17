import React, {useState, useEffect, useContext, useRef} from "react";
import {Link} from "react-router-dom";

import messageContext from "../contexts/message";

import "../../css/base/baseLeft.css";

function BaseLeft ()
{
    const {message, setMessage} = useContext (messageContext);
    const [messages, setMessages] = useState ([]);

    useEffect
    (
        () =>
        {
            if (message !== null)
            {
                var newMessages = [...messages];
                newMessages.unshift (message);
                setMessages (newMessages);
            }
        },
        [message]
    );

    function removeMessage ()
    {
        var newMessages = [...messages];
        newMessages.splice (-1, 1);
        setMessages (newMessages);
    }

    return (
        <div className = "baseLeftArea">
            <Link to = "/">
                <button>Info</button>
            </Link>
            <Link to = "/users">
                <button>Users</button>
            </Link>
            <Link to = "/items">
                <button>Items</button>
            </Link>
            <Link to = "/roles">
                <button>Roles</button>
            </Link>
            <Link to = "/logs">
                <button>Logs</button>
            </Link>
            <Link to = "/connection">
                <button>Connection</button>
            </Link>
            <Link to = "/account">
                <button>Account</button>
            </Link>
            <div
            className = "messages"
            >
                {
                    messages.map
                    (
                        (message) =>
                        {
                            return (
                                <div
                                className = "message"
                                key = {message.key}
                                onAnimationEnd = {() => {removeMessage ()}}
                                >
                                    {message.text}
                                </div>
                            );
                        }
                    )
                }
            </div>
        </div>
    );
}

export default BaseLeft;