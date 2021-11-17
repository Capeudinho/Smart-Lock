import React, {useState, useEffect, useContext} from "react";

import messageContext from "../contexts/message";

import "../../css/message/messageList.css";

function MessageList ()
{
    const {message, setMessage} = useContext (messageContext);
    const [messages, setMessages] = useState ([]);

    useEffect
    (
        () =>
        {
            if (message.length > 0)
            {
                var newMessages = [...messages];
                newMessages.unshift (...message);
                setMessages (newMessages);
            }
        },
        [message]
    );

    function removeMessage (index)
    {
        var newMessages = [...messages];
        newMessages.splice (index, 1);
        setMessages (newMessages);
        if (newMessages.length === 0)
        {
            setMessage ([]);
        }
    }

    return (
        <div className = "messageListArea">
            <div className = "messageList">
                {
                    messages.map
                    (
                        (message, index) =>
                        {
                            return (
                                <div
                                className = "messageBox"
                                key = {messages[messages.length-1-index].key}
                                onAnimationEnd = {() => {removeMessage (messages.length-1-index)}}
                                >
                                    <div className = "message">
                                        {messages[messages.length-1-index].text}
                                    </div>
                                    <div/>
                                </div>
                            );
                        }
                    )
                }
            </div>
        </div>
    );
}

export default MessageList;