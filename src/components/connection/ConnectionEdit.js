import React, {useState, useEffect, useContext} from "react";
import api from "../../services/api";

import loggedAccountContext from "../contexts/loggedAccount";
import messageContext from "../contexts/message";
import overlayContext from "../contexts/overlay";

import "../../css/connection/connectionEdit.css";

function ConnectionEdit ()
{
    const {loggedAccount, setLoggedAccount} = useContext (loggedAccountContext);
    const {message, setMessage} = useContext (messageContext);
    const {overlay, setOverlay} = useContext (overlayContext);
    const [brokerHost, setBrokerHost] = useState ("");
    const [accessCheckTopic, setAccessCheckTopic] = useState ("");
    const [accessReplyTopic, setAccessReplyTopic] = useState ("");
    const [statusUpdateTopic, setStatusUpdateTopic] = useState ("");
    const [directCommandTopic, setDirectCommandTopic] = useState ("");
    const [accessCheckRoute, setAccessCheckRoute] = useState ("");
    const [accessReplyRoute, setAccessReplyRoute] = useState ("");
    const [statusUpdateRoute, setStatusUpdateRoute] = useState ("");
    const [directCommandRoute, setDirectCommandRoute] = useState ("");
    const [protectedRoutes, setProtectedRoutes] = useState
    (
        [
            "accountlist",
            "accountidindex",
            "accountloginindex",
            "accountstore",
            "accountidupdate",
            "accountconnectionoptionsidupdate",
            "accountiddestroy",
            "userlist",
            "userlistpag",
            "useridindex",
            "userstore",
            "useridupdate",
            "useriddestroy",
            "itemlist",
            "itemlistpag",
            "itemidindex",
            "itemparentindex",
            "itemparentindexpag",
            "itemstore",
            "itemidupdate",
            "itemiddestroy",
            "grouplist",
            "groupidindex",
            "groupstore",
            "groupidupdate",
            "groupidupdatemove",
            "groupiddestroy",
            "locklist",
            "lockidindex",
            "lockidopen",
            "lockstore",
            "lockidupdate",
            "lockidupdatemove",
            "lockiddestroy",
            "rolelist",
            "rolelistpag",
            "roleidindex",
            "rolestore",
            "roleidupdate",
            "roleiddestroy",
            "timelist",
            "timeidindex",
            "timestore",
            "timeidupdate",
            "timeiddestroy",
            "loglist",
            "loglistpag",
            "logidindex",
            "logstore",
            "logidupdate",
            "logiddestroy"
        ]
    );
    
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
                setAccessCheckRoute (loggedAccount.connectionOptions.accessCheckRoute);
                setAccessReplyRoute (loggedAccount.connectionOptions.accessReplyRoute);
                setStatusUpdateRoute (loggedAccount.connectionOptions.statusUpdateRoute);
                setDirectCommandRoute (loggedAccount.connectionOptions.directCommandRoute);
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

    function handleChangeAccessCheckRoute (e)
    {
        setAccessCheckRoute (e.target.value);
    }

    function handleChangeAccessReplyRoute (e)
    {
        setAccessReplyRoute (e.target.value);
    }

    function handleChangeStatusUpdateRoute (e)
    {
        setStatusUpdateRoute (e.target.value);
    }

    function handleChangeDirectCommandRoute (e)
    {
        setDirectCommandRoute (e.target.value);
    }

    async function handleEdit ()
    {
        var validFields = false;
        var differentFields = false;
        var protectedFields = false;
        if
        (
            brokerHost.length > 0 &&
            accessCheckTopic.length > 0 &&
            accessReplyTopic.length > 0 &&
            statusUpdateTopic.length > 0 &&
            directCommandTopic.length > 0 &&
            accessCheckRoute.length > 0 &&
            accessReplyRoute.length > 0 &&
            statusUpdateRoute.length > 0 &&
            directCommandRoute.length > 0
        )
        {
            validFields = true;
        }
        if
        (
            accessCheckTopic !== accessReplyTopic &&
            accessCheckTopic !== statusUpdateTopic &&
            accessCheckTopic !== directCommandTopic &&
            accessReplyTopic !== statusUpdateTopic &&
            accessReplyTopic !== directCommandTopic &&
            statusUpdateTopic !== directCommandTopic &&
            accessCheckRoute !== accessReplyRoute &&
            accessCheckRoute !== statusUpdateRoute &&
            accessCheckRoute !== directCommandRoute &&
            accessReplyRoute !== statusUpdateRoute &&
            accessReplyRoute !== directCommandRoute &&
            statusUpdateRoute !== directCommandRoute
        )
        {
            differentFields = true;
        }
        if
        (
            protectedRoutes.some ((value) => {if (accessCheckRoute === value) {return true}}) === false &&
            protectedRoutes.some ((value) => {if (accessReplyRoute === value) {return true}}) === false &&
            protectedRoutes.some ((value) => {if (statusUpdateRoute === value) {return true}}) === false &&
            protectedRoutes.some ((value) => {if (directCommandRoute === value) {return true}}) === false
        )
        {
            protectedFields = true;
        }
        if (validFields && differentFields && protectedFields)
        {
            setOverlay (true);
            const response = await api.put
            (
                "/accountconnectionoptionsidupdate",
                {
                    connectionOptions:
                    {
                        identifier: loggedAccount.connectionOptions.identifier,
                        brokerHost,
                        accessCheckTopic,
                        accessReplyTopic,
                        statusUpdateTopic,
                        directCommandTopic,
                        accessCheckRoute,
                        accessReplyRoute,
                        statusUpdateRoute,
                        directCommandRoute
                    }
                },
                {
                    params:
                    {
                        _id: loggedAccount._id
                    }
                }
            );
            setOverlay (false);
            if (response.data !== null)
            {
                localStorage.setItem ("account", JSON.stringify (response.data));
                setLoggedAccount (response.data);
                setMessage ([{text: "Connection options successfully updated.", key: Math.random ()}]);
            }
            else
            {
                setMessage ([{text: "Broker is invalid.", key: Math.random ()}]);
            }
        }
        else
        {
            var messages = [];
            if (validFields === false)
            {
                messages.push ({text: "One, or more fields are invalid.", key: Math.random ()});
            }
            if (differentFields === false)
            {
                messages.push ({text: "Two, or more MQTT options, and/or HTTP options fields are equal.", key: Math.random ()});
            }
            if (protectedFields === false)
            {
                messages.push ({text: "One, or more routes are already used by the server's own API.", key: Math.random ()});
            }
            setMessage (messages);
        }
    }

    return (
        <div className = "connectionEditArea">
            <div className = "connectionOptions">
                <div className = "mqttOptions">
                    <div className = "title">MQTT</div>
                    <div className = "label brokerHostLabel">Broker host</div>
                    <input
                    className = "brokerHostInput"
                    value = {brokerHost}
                    onChange = {(e) => {handleChangeBrokerHost (e)}}
                    spellCheck = {false}
                    />
                    <div className = "label accessCheckTopicLabel">Access check topic</div>
                    <input
                    className = "accessCheckTopicInput"
                    value = {accessCheckTopic}
                    onChange = {(e) => {handleChangeAccessCheckTopic (e)}}
                    spellCheck = {false}
                    />
                    <div className = "label accessReplyTopicLabel">Access reply topic</div>
                    <input
                    className = "accessReplyTopicInput"
                    value = {accessReplyTopic}
                    onChange = {(e) => {handleChangeAccessReplyTopic (e)}}
                    spellCheck = {false}
                    />
                    <div className = "label statusUpdateTopicLabel">Status update topic</div>
                    <input
                    className = "statusUpdateTopicInput"
                    value = {statusUpdateTopic}
                    onChange = {(e) => {handleChangeStatusUpdateTopic (e)}}
                    spellCheck = {false}
                    />
                    <div className = "label directCommandTopicLabel">Direct command topic</div>
                    <input
                    className = "directCommandTopicInput"
                    value = {directCommandTopic}
                    onChange = {(e) => {handleChangeDirectCommandTopic (e)}}
                    spellCheck = {false}
                    />
                </div>
                <div className = "httpOptions">
                    <div className = "title">HTTP</div>
                    <div className = "label accessCheckRouteLabel">Access check route</div>
                    <input
                    className = "accessCheckRouteInput"
                    value = {accessCheckRoute}
                    onChange = {(e) => {handleChangeAccessCheckRoute (e)}}
                    spellCheck = {false}
                    />
                    <div className = "label accessReplyRouteLabel">Access reply route</div>
                    <input
                    className = "accessReplyRouteInput"
                    value = {accessReplyRoute}
                    onChange = {(e) => {handleChangeAccessReplyRoute (e)}}
                    spellCheck = {false}
                    />
                    <div className = "label statusUpdateRouteLabel">Status update route</div>
                    <input
                    className = "statusUpdateRouteInput"
                    value = {statusUpdateRoute}
                    onChange = {(e) => {handleChangeStatusUpdateRoute (e)}}
                    spellCheck = {false}
                    />
                    <div className = "label directCommandRouteLabel">Direct command route</div>
                    <input
                    className = "directCommandRouteInput"
                    value = {directCommandRoute}
                    onChange = {(e) => {handleChangeDirectCommandRoute (e)}}
                    spellCheck = {false}
                    />
                    <div className = "label identifierLabel">Account identifier</div>
                    <div className = "identifier">{loggedAccount.connectionOptions.identifier}</div>
                </div>
            </div>
            <button
            className = "editButton"
            onClick = {() => {handleEdit ()}}
            >
                <img
                className = "icon"
                src = {process.env.PUBLIC_URL+"/save-icon.svg"}
                />
            </button>
        </div>
    );
}

export default ConnectionEdit;