import React, {useState, useEffect, useContext} from "react";
import api from "../../services/api";

import loggedAccountContext from "../contexts/loggedAccount";
import messageContext from "../contexts/message";

import "../../css/connection/connectionEdit.css";

function ConnectionEdit ()
{
    const {loggedAccount, setLoggedAccount} = useContext (loggedAccountContext);
    const {message, setMessage} = useContext (messageContext);
    const [brokerHost, setBrokerHost] = useState ("");
    const [accessCheckTopic, setAccessCheckTopic] = useState ("");
    const [accessReplyTopic, setAccessReplyTopic] = useState ("");
    const [statusUpdateTopic, setStatusUpdateTopic] = useState ("");
    const [directCommandTopic, setDirectCommandTopic] = useState ("");
    
    useEffect
    (
        () =>
        {
            if (loggedAccount !== null)
            {
                setBrokerHost (loggedAccount.connectionOptions.brokerHost);
                setAccessCheckTopic (loggedAccount.connectionOptions.accessCheckTopic);
                setAccessReplyTopic (loggedAccount.connectionOptions.accessReplyTopic);
                setStatusUpdateTopic (loggedAccount.connectionOptions.statusUpdateTopic);
                setDirectCommandTopic (loggedAccount.connectionOptions.directCommandTopic);
            }
        },
        [loggedAccount]
    );

    function handleChangeBrokerHost (e)
    {
        setBrokerHost (e.target.value);
    }

    function handleChangeAccessCheckTopic (e)
    {
        setAccessCheckTopic (e.target.value);
    }

    function handleChangeAccessReplyTopic (e)
    {
        setAccessReplyTopic (e.target.value);
    }

    function handleChangeStatusUpdateTopic (e)
    {
        setStatusUpdateTopic (e.target.value);
    }

    function handleChangeDirectCommandTopic (e)
    {
        setDirectCommandTopic (e.target.value);
    }

    async function handleUpdate ()
    {
        console.log ("gay");
        var validFields = false;
        var differentTopics = false;
        if
        (
            brokerHost.length > 0 &&
            accessCheckTopic.length > 0 &&
            accessReplyTopic.length > 0 &&
            statusUpdateTopic.length > 0 &&
            directCommandTopic.length > 0
        )
        {
            validFields = true;
        }
        else
        {
            // Make setMessage accept an array of messages, change other setMessage calls.
            setTimeout (() => {setMessage ({text: "One, or more fields are invalid.", key: Math.random ()});}, 1);
        }
        if
        (
            accessCheckTopic !== accessReplyTopic &&
            accessCheckTopic !== statusUpdateTopic &&
            accessCheckTopic !== directCommandTopic &&
            accessReplyTopic !== statusUpdateTopic &&
            accessReplyTopic !== directCommandTopic &&
            statusUpdateTopic !== directCommandTopic
        )
        {
            differentTopics = true;
        }
        else
        {
            setMessage ({text: "Two, or more topics are equal.", key: Math.random ()});
        }
        if (validFields && differentTopics)
        {
            const response = await api.put
            (
                "/accountconnectionoptionsidupdate",
                {
                    connectionOptions:
                    {
                        brokerHost,
                        accessCheckTopic,
                        accessReplyTopic,
                        statusUpdateTopic,
                        directCommandTopic,
                    }
                },
                {
                    params:
                    {
                        _id: loggedAccount._id
                    }
                }
            );
            if (response.data !== null)
            {
                localStorage.setItem ("account", JSON.stringify (response.data));
                setLoggedAccount (response.data);
                setMessage ({text: "Connection options successfully updated.", key: Math.random ()});
            }
            else
            {
                setMessage ({text: "Broker is invalid.", key: Math.random ()});
            }
        }
    }

    return (
        <div className = "connectionEditArea">
            <div className = "label brokerHostLabel">Broker host</div>
            <input
            className = "brokerHostInput"
            value = {brokerHost}
            onChange = {(e) => {handleChangeBrokerHost (e)}}
            />
            <div className = "label accessCheckTopicLabel">Access check topic</div>
            <input
            className = "accessCheckTopicInput"
            value = {accessCheckTopic}
            onChange = {(e) => {handleChangeAccessCheckTopic (e)}}
            />
            <div className = "label accessReplyTopicLabel">Access reply topic</div>
            <input
            className = "accessReplyTopicInput"
            value = {accessReplyTopic}
            onChange = {(e) => {handleChangeAccessReplyTopic (e)}}
            />
            <div className = "label statusUpdateTopicLabel">Status update topic</div>
            <input
            className = "statusUpdateTopicInput"
            value = {statusUpdateTopic}
            onChange = {(e) => {handleChangeStatusUpdateTopic (e)}}
            />
            <div className = "label directCommandTopicLabel">Direct command topic</div>
            <input
            className = "directCommandTopicInput"
            value = {directCommandTopic}
            onChange = {(e) => {handleChangeDirectCommandTopic (e)}}
            />
            <button
            className = "updateButton"
            onClick = {() => {handleUpdate ()}}
            >
                Save changes
            </button>
        </div>
    );
}

export default ConnectionEdit;