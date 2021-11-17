import React, {useState, useEffect, useContext} from "react";
import api from "../../services/api";
import {Redirect} from "react-router-dom";

import loggedAccountContext from "../contexts/loggedAccount";
import accountRolesContext from "../contexts/accountRoles";
import messageContext from "../contexts/message";
import overlayContext from "../contexts/overlay";
import editedItemContext from "../contexts/editedItem";
import movedItemContext from "../contexts/movedItem";
import deletedItemContext from "../contexts/deletedItem";

import "../../css/item/itemInfo.css";

function ItemInfo ({match, location})
{
    const {loggedAccount, setLoggedAccount} = useContext (loggedAccountContext);
    const {accountRoles, setAccountRoles} = useContext (accountRolesContext);
    const {message, setMessage} = useContext (messageContext);
    const {overlay, setOverlay} = useContext (overlayContext);
    const {editedItem, setEditedItem} = useContext (editedItemContext);
    const {movedItem, setMovedItem} = useContext (movedItemContext);
    const {deletedItem, setDeletedItem} = useContext (deletedItemContext);
    const [name, setName] = useState ("");
    const [type, setType] = useState ("");
    const [roles, setRoles] = useState ([]);
    const [PIN, setPIN] = useState ("");
    const [protocol, setProtocol] = useState ("");
    const [host, setHost] = useState ("");
    const [port, setPort] = useState ("");
    const [status, setStatus] = useState ({});
    const [confirmDelete, setConfirmDelete] = useState (false);
    const [hover, setHover] = useState ({button: ""});
    const [redirect, setRedirect] = useState (<></>);

    useEffect
    (
        () =>
        {
            let mounted = true;
            const runEffect = async () =>
            {
                setOverlay (true);
                const response = await api.get
                (
                    "/itemidindex",
                    {
                        params:
                        {
                            _id: match.params.id
                        }
                    }
                );
                if (mounted)
                {
                    setOverlay (false);
                    if (response.data.type === "Group")
                    {
                        for (var a = 0; a < response.data.roles.length; a++)
                        {
                            response.data.roles[a].expanded = false;
                            for (var b = 0; b < response.data.roles[a].times.length; b++)
                            {
                                if (response.data.usedTimes.includes (response.data.roles[a].times[b]._id))
                                {
                                    response.data.roles[a].times[b].use = true;
                                }
                                else
                                {
                                    response.data.roles[a].times[b].use = false;
                                }
                            }
                        }
                        setRoles (response.data.roles);
                    }
                    else
                    {
                        setPIN (response.data.PIN);
                        setProtocol (response.data.protocol);
                        setHost (response.data.host);
                        setPort (response.data.port);
                        setStatus (response.data.status);
                    }
                    setName (response.data.name);
                    setType (response.data.type);
                }
            }
            runEffect ();
            return (() => {mounted = false});
        },
        [match.params.id]
    );

    function convertTime (time)
    {
        var minute = time%60;
        var hour = (time-minute)/60;
        if (hour < 10) {var hourZero = "0"}
        else {var hourZero = ""}
        if (minute < 10) {var minuteZero = "0"}
        else {var minuteZero = ""}
        var newTime = hourZero+hour+":"+minuteZero+minute;
        return newTime;
    }

    function deletedItemUrl ()
    {
        var url = location.pathname;
        var array = url.split ("/");
        array.splice (-2, 2);
        url = array.join ("/");
        return url;
    }

    function handleChangeName (e)
    {
        setName (e.target.value);
    }

    function handleChangePIN (e)
    {
        setPIN (e.target.value);
    }

    function handleChangeProtocol (e)
    {
        setProtocol (e.target.options[e.target.selectedIndex].id);
    }

    function handleChangeHost (e)
    {
        setHost (e.target.value);
    }

    function handleChangePort (e)
    {
        setPort (e.target.value);
    }

    function handleAddRole ()
    {
        if (accountRoles.length === 0)
        {
            setMessage ([{text: "There are no created roles.", key: Math.random ()}]);
        }
        else
        {
            var validRole = -1;
            for (var a = 0; a < accountRoles.length; a++)
            {
                var possibleRole = true;
                for (var b = 0; b < roles.length; b++)
                {
                    if (accountRoles[a]._id === roles[b]._id)
                    {
                        possibleRole = false;
                        b = roles.length;
                    }
                }
                if (possibleRole)
                {
                    validRole = a;
                    a = accountRoles.length;
                }
            }
            if (validRole > -1)
            {
                var newRoles = [...roles];
                const accountRole = JSON.parse (JSON.stringify (accountRoles[validRole]));
                newRoles.push (accountRole);
                newRoles[newRoles.length-1].expanded = false;
                setRoles (newRoles);
            }
            else
            {
                setMessage ([{text: "There are no more roles.", key: Math.random ()}]);
            }
        }
    }

    function handleRemoveRole (index)
    {
        var newRoles = [...roles];
        newRoles.splice (index, 1);
        setRoles (newRoles);
    }

    function handleChangeRole (index, e)
    {
        var newRoles = [...roles];
        var expanded = newRoles[index].expanded;
        for (var a = 0; a < accountRoles.length; a++)
        {
            if (accountRoles[a]._id === e.target.options[e.target.selectedIndex].id)
            {
                var newRole = JSON.parse (JSON.stringify (accountRoles[a]));
            }
        }
        newRoles[index] = newRole;
        newRoles[index].expanded = expanded;
        setRoles (newRoles);
    }

    function handleExpandRole (index)
    {
        var newRoles = [...roles];
        newRoles[index].expanded = !newRoles[index].expanded;
        setRoles (newRoles);
    }

    function handleChangeUse (index, timeIndex)
    {
        var newRoles = [...roles];
        newRoles[index].times[timeIndex].use = !newRoles[index].times[timeIndex].use;
        setRoles (newRoles);
    }

    async function handleEdit ()
    {
        if (type === "Group")
        {
            if (name.length > 0)
            {
                var roleValues = [];
                var usedTimeValues = [];
                for (var a = 0; a < roles.length; a++)
                {
                    roleValues.push (roles[a]._id);
                    for (var b = 0; b < roles[a].times.length; b++)
                    {
                        if (roles[a].times[b].use)
                        {
                            usedTimeValues.push (roles[a].times[b]._id);
                        }
                    }
                }
                setOverlay (true);
                var response = await api.put
                (
                    "/groupidupdate",
                    {
                        name,
                        roles: roleValues,
                        usedTimes: usedTimeValues,
                        owner: loggedAccount._id
                    },
                    {
                        params:
                        {
                            _id: match.params.id
                        }
                    }
                );
                setOverlay (false);
                setEditedItem (response.data);
                setMessage ([{text: "Group successfully updated.", key: Math.random ()}]);
            }
            else
            {
                setMessage ([{text: "Group name is invalid.", key: Math.random ()}]);
            }
        }
        else
        {
            if (name.length > 0 && PIN.length > 0)
            {
                setOverlay (true);
                var response = await api.put
                (
                    "/lockidupdate",
                    {
                        name,
                        PIN,
                        protocol,
                        host,
                        port,
                        owner: loggedAccount._id
                    },
                    {
                        params:
                        {
                            _id: match.params.id
                        }
                    }
                );
                setOverlay (false);
                if (response.data !== null)
                {
                    setEditedItem (response.data);
                    setMessage ([{text: "Lock successfully updated.", key: Math.random ()}]);
                }
                else
                {
                    setMessage ([{text: "A lock with this identifier already exists.", key: Math.random ()}]);
                }
            }
            else
            {
                setMessage ([{text: "Lock name, and/or identifier is invalid.", key: Math.random ()}]);
            }
        }
    }

    async function handleMove ()
    {
        if (match.params.hasOwnProperty ("otherid"))
        {
            if (type === "Group")
            {
                setOverlay (true);
                var response = await api.put
                (
                    "/groupidupdatemove",
                    {},
                    {
                        params:
                        {
                            _id: match.params.id,
                            destination_id: match.params.otherid
                        }
                    }
                );
                setOverlay (false);
                if (response.data === null)
                {
                    setMessage ([{text: "Group cannot be moved to that destination.", key: Math.random ()}]);
                }
                else
                {
                    setMovedItem (response.data);
                    setMessage ([{text: "Group successfully moved.", key: Math.random ()}]);
                }
            }
            else
            {
                setOverlay (true);
                var response = await api.put
                (
                    "/lockidupdatemove",
                    {},
                    {
                        params:
                        {
                            _id: match.params.id,
                            destination_id: match.params.otherid
                        }
                    }
                );
                setOverlay (false);
                if (response.data === null)
                {
                    setMessage ([{text: "Lock cannot be moved to that destination.", key: Math.random ()}]);
                }
                else
                {
                    setMovedItem (response.data);
                    setMessage ([{text: "Lock successfully moved.", key: Math.random ()}]);
                }
            }
        }
    }

    async function handleDelete ()
    {
        if (confirmDelete)
        {
            if (type === "Group")
            {
                setOverlay (true);
                var response = await api.delete
                (
                    "/groupiddestroy",
                    {
                        params:
                        {
                            _id: match.params.id
                        }
                    }
                );
                setOverlay (false);
                setMessage ([{text: "Group successfully deleted.", key: Math.random ()}]);
            }
            else
            {
                setOverlay (true);
                var response = await api.delete
                (
                    "/lockiddestroy",
                    {
                        params:
                        {
                            _id: match.params.id
                        }
                    }
                );
                setOverlay (false);
                setMessage ([{text: "Lock successfully deleted.", key: Math.random ()}]);
            }
            setDeletedItem (response.data);
            setRedirect (<Redirect to = {deletedItemUrl ()}/>);
        }
        else
        {
            setConfirmDelete (true);
        }
    }

    async function handleOpen ()
    {
        setOverlay (true);
        await api.get
        (
            "/lockidopen",
            {
                params:
                {
                    _id: match.params.id
                }
            }
        );
        setOverlay (false);
        setMessage ([{text: "Lock successfully opened.", key: Math.random ()}]);
    }

    return (
        <div className = "itemInfoArea">
            <div className = "itemInfoContainer">
                <div className = "topBox">
                    <div className = "label nameLabel">Name</div>
                    <input
                    className = "nameInput"
                    value = {name}
                    onChange = {(e) => {handleChangeName (e)}}
                    spellCheck = {false}
                    />
                </div>
                <div
                className = "protocolFields"
                style = {{display: type === "Lock" ? "block" : "none"}}
                >
                    <div className = "label PINLabel">Identifier</div>
                    <input
                    className = "PINInput"
                    value = {PIN}
                    onChange = {(e) => {handleChangePIN (e)}}
                    spellCheck = {false}
                    />
                    <div className = "label protocolLabel">Protocol</div>
                    <select
                    className = "protocolSelect"
                    value = {protocol}
                    onChange = {(e) => {handleChangeProtocol (e)}}
                    >
                        <option
                        id = "mqtt"
                        key = {0}
                        value = "mqtt"
                        >
                            MQTT
                        </option>
                        <option
                        id = "http"
                        key = {1}
                        value = "http"
                        >
                            HTTP
                        </option>
                    </select>
                    <div
                    className = "optionFields"
                    style = {{display: protocol === "http" ? "block" : "none"}}
                    >
                        <div className = "label hostLabel">Host</div>
                        <input
                        className = "hostInput"
                        value = {host}
                        onChange = {(e) => {handleChangeHost (e)}}
                        spellCheck = {false}
                        />
                        <div className = "label portLabel">Port</div>
                        <input
                        className = "portInput"
                        value = {port}
                        onChange = {(e) => {handleChangePort (e)}}
                        spellCheck = {false}
                        />
                    </div>
                </div>
                <div
                className = "statusBox"
                style = {{display: type === "Lock" ? "block" : "none"}}
                >
                    {
                        JSON.stringify (status) === JSON.stringify ({}) ?
                        <div className = "propertyName">
                            Status unknown
                        </div> :
                        <div className = "propertyList">
                            {
                                Object.getOwnPropertyNames (status).map
                                (
                                    (property, index) =>
                                    {
                                        return (
                                            <div
                                            className = "propertyGroup"
                                            key = {index}
                                            >
                                                <div
                                                className = "propertyName"
                                                >
                                                    {property}
                                                </div>
                                                <div
                                                className = "propertyValue"
                                                >
                                                    {status [property]}
                                                </div>
                                            </div>
                                        );
                                    }
                                )
                            }
                        </div>
                    }
                </div>
                <div
                className = "roleList"
                style = {{display: type === "Group" ? "block" : "none"}}
                >
                    <div className = "label roleLabel">Roles</div>
                    {
                        roles.map
                        (
                            (role, index) =>
                            {
                                return (
                                    <div
                                    className = "role"
                                    key = {index}
                                    >
                                        <div
                                        className = "roleInfo"
                                        key = {index}
                                        >
                                            <img
                                            className = "expandButton"
                                            src = {role.expanded ? process.env.PUBLIC_URL+"/opened-icon.svg" : process.env.PUBLIC_URL+"/closed-icon.svg"}
                                            onClick = {() => handleExpandRole (index)}
                                            />
                                            <select
                                            className = "roleSelect"
                                            value = {role.name}
                                            onChange = {(e) => {handleChangeRole (index, e)}}
                                            >
                                                {
                                                    accountRoles.map
                                                    (
                                                        (roleOption, index) =>
                                                        {
                                                            var validOption = true;
                                                            for (var a = 0; a < roles.length; a++)
                                                            {
                                                                if (roles[a]._id === roleOption._id && roles[a]._id !== role._id)
                                                                {
                                                                    validOption = false;
                                                                    a = roles.length;
                                                                }
                                                            }
                                                            if (validOption)
                                                            {
                                                                return (
                                                                    <option
                                                                    id = {roleOption._id}
                                                                    key = {index}
                                                                    value = {roleOption.name}
                                                                    >
                                                                        {roleOption.name}
                                                                    </option>
                                                                );
                                                            }
                                                        }
                                                    )
                                                }
                                            </select>
                                            <img
                                            className = "removeButton"
                                            src = {process.env.PUBLIC_URL+"/close-icon.svg"}
                                            onClick = {() => handleRemoveRole (index)}
                                            />
                                        </div>
                                        <div
                                        className = "times"
                                        style = {{display: role.expanded ? "block" : "none"}}
                                        >
                                            {
                                                role.times.map
                                                (
                                                    (time, timeIndex) =>
                                                    {
                                                        return (
                                                            <div
                                                            className = "time"
                                                            key = {timeIndex}
                                                            >
                                                                <button
                                                                className = "useButton"
                                                                onClick = {() => {handleChangeUse (index, timeIndex)}}
                                                                onMouseEnter = {() => {setHover ({button: time._id})}}
                                                                onMouseLeave = {() => {setHover ({button: ""})}}
                                                                style =
                                                                {
                                                                    {
                                                                        backgroundColor:
                                                                        time.use && hover.button === time._id ?
                                                                        "#52a3cc" :
                                                                        time.use && hover.button !== time._id ?
                                                                        "#2996cc" :
                                                                        time.use === false && hover.button === time._id ?
                                                                        "#d9d9d9" :
                                                                        "#cccccc",
                                                                        borderColor:
                                                                        time.use && hover.button === time._id ?
                                                                        "#52a3cc" :
                                                                        time.use && hover.button !== time._id ?
                                                                        "#2996cc" :
                                                                        time.use === false && hover.button === time._id ?
                                                                        "#d9d9d9" :
                                                                        "#cccccc",
                                                                        color: time.use ? "#ffffff" : "#000000"
                                                                    }
                                                                }
                                                                >
                                                                    <div className = "useButtonText">
                                                                        USE
                                                                    </div>
                                                                </button>
                                                                <div className = "timeInfo">
                                                                    <div className = "timeTopBox">
                                                                        <div className = "label daysLabel">Days</div>
                                                                        <div
                                                                        className = "dayValue"
                                                                        style = {{backgroundColor: time.days[0] ? "#cccccc" : "#ffffff"}}
                                                                        >
                                                                            S
                                                                        </div>
                                                                        <div
                                                                        className = "dayValue"
                                                                        style = {{backgroundColor: time.days[1] ? "#cccccc" : "#ffffff"}}
                                                                        >
                                                                            M
                                                                        </div>
                                                                        <div
                                                                        className = "dayValue"
                                                                        style = {{backgroundColor: time.days[2] ? "#cccccc" : "#ffffff"}}
                                                                        >
                                                                            T
                                                                        </div>
                                                                        <div
                                                                        className = "dayValue"
                                                                        style = {{backgroundColor: time.days[3] ? "#cccccc" : "#ffffff"}}
                                                                        >
                                                                            W
                                                                        </div>
                                                                        <div
                                                                        className = "dayValue"
                                                                        style = {{backgroundColor: time.days[4] ? "#cccccc" : "#ffffff"}}
                                                                        >
                                                                            T
                                                                        </div>
                                                                        <div
                                                                        className = "dayValue"
                                                                        style = {{backgroundColor: time.days[5] ? "#cccccc" : "#ffffff"}}
                                                                        >
                                                                            F
                                                                        </div>
                                                                        <div
                                                                        className = "dayValue"
                                                                        style = {{backgroundColor: time.days[6] ? "#cccccc" : "#ffffff"}}
                                                                        >
                                                                            S
                                                                        </div>
                                                                    </div>
                                                                    <div className = "timeMiddleBox">
                                                                        <div className = "label startLabel">Start</div>
                                                                        <div className = "timeValue">{convertTime (time.start)}</div>
                                                                        <div className = "label endLabel">End</div>
                                                                        <div className = "timeValue">{convertTime (time.end)}</div>
                                                                    </div>
                                                                    <div className = "timeBottomBox">
                                                                        <div className = "label trackAccessLabel">Log accesses</div>
                                                                        <div
                                                                        className = "trackAccessValue"
                                                                        style = {{backgroundColor: time.trackAccess ? "#cccccc" : "#ffffff"}}
                                                                        />
                                                                        <div className = "label trackMissLabel">Log misses</div>
                                                                        <div
                                                                        className = "trackMissValue"
                                                                        style = {{backgroundColor: time.trackMiss ? "#cccccc" : "#ffffff"}}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                )
                                            }
                                        </div>
                                    </div>
                                );
                            }
                        )
                    }
                    <button
                    className = "addRoleButton"
                    onClick = {() => {handleAddRole ()}}
                    >
                        Add role
                    </button>
                </div>
                <div className = "bottomBox">
                    <button
                    className = "editButton"
                    onClick = {() => {handleEdit ()}}
                    >
                        <img
                        className = "icon"
                        src = {process.env.PUBLIC_URL+"/save-icon.svg"}
                        />
                    </button>
                    <button
                    className = "moveButton"
                    onClick = {() => {handleMove ()}}
                    >
                        <img
                        className = "icon"
                        src = {match.params.hasOwnProperty ("otherid") ? process.env.PUBLIC_URL+"/move-icon.svg" : process.env.PUBLIC_URL+"/move-grey-icon.svg"}
                        />
                    </button>
                    <button
                    className = "openButton"
                    onClick = {() => {handleOpen ()}}
                    style = {{display: type === "Lock" ? "block" : "none"}}
                    >
                        <img
                        className = "icon"
                        src = {process.env.PUBLIC_URL+"/open-icon.svg"}
                        />
                    </button>
                    <button
                    className = "cancelButton"
                    onClick = {() => {setConfirmDelete (false)}}
                    style = {{display: confirmDelete ? "block" : "none"}}
                    >
                        <img
                        className = "icon"
                        src = {process.env.PUBLIC_URL+"/cancel-icon.svg"}
                        />
                    </button>
                    <button
                    className = "deleteButton"
                    onClick = {() => {handleDelete ()}}
                    onMouseEnter = {() => {setHover ({button: "delete"})}}
                    onMouseLeave = {() => {setHover ({button: ""})}}
                    style =
                    {
                        {
                            backgroundColor:
                            confirmDelete && hover.button === "delete" ?
                            "#cc5252" :
                            confirmDelete && hover.button !== "delete" ?
                            "#cc2929" :
                            confirmDelete === false && hover.button === "delete" ?
                            "#f2f2f2" :
                            "#e6e6e6",
                            borderColor:
                            confirmDelete && hover.button === "delete" ?
                            "#cc5252" :
                            confirmDelete && hover.button !== "delete" ?
                            "#cc2929" :
                            confirmDelete === false && hover.button === "delete" ?
                            "#f2f2f2" :
                            "#e6e6e6"
                        }
                    }
                    >
                        <img
                        className = "icon"
                        src = {confirmDelete ? process.env.PUBLIC_URL+"/delete-white-icon.svg" : process.env.PUBLIC_URL+"/delete-icon.svg"}
                        />
                    </button>
                </div>
            </div>
            {redirect}
        </div>
    );
}

export default ItemInfo;