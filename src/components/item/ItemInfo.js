import React, {useState, useEffect, useContext} from "react";
import api from "../../services/api";
import {Redirect} from "react-router-dom";

import loggedAccountContext from "../contexts/loggedAccount";
import accountRolesContext from "../contexts/accountRoles";
import messageContext from "../contexts/message";
import editedItemContext from "../contexts/editedItem";
import movedItemContext from "../contexts/movedItem";
import deletedItemContext from "../contexts/deletedItem";

import "../../css/item/itemInfo.css";

function ItemInfo ({match, location})
{
    const {loggedAccount, setLoggedAccount} = useContext (loggedAccountContext);
    const {accountRoles, setAccountRoles} = useContext (accountRolesContext);
    const {message, setMessage} = useContext (messageContext);
    const {editedItem, setEditedItem} = useContext (editedItemContext);
    const {movedItem, setMovedItem} = useContext (movedItemContext);
    const {deletedItem, setDeletedItem} = useContext (deletedItemContext);
    const [name, setName] = useState ("");
    const [type, setType] = useState ("");
    const [roles, setRoles] = useState ([]);
    const [redirect, setRedirect] = useState (<></>);

    useEffect
    (
        () =>
        {
            let mounted = true;
            const runEffect = async () =>
            {
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

    function handleAddRole ()
    {
        if (accountRoles.length === 0)
        {
            setMessage ({text: "There are no created roles.", key: Math.random ()});
        }
        else
        {
            var validRole = true;
            for (var a = 0; a < accountRoles.length; a++)
            {
                validRole = true;
                for (var b = 0; b < roles.length; b++)
                {
                    if (accountRoles[a]._id === roles[b]._id)
                    {
                        validRole = false;
                        b = roles.length;
                    }
                }
                if (validRole)
                {
                    var newRoles = [...roles];
                    const accountRole = JSON.parse (JSON.stringify (accountRoles[a]));
                    newRoles.push (accountRole);
                    newRoles[newRoles.length-1].expanded = false;
                    setRoles (newRoles);
                    a = accountRoles.length;
                }
                else
                {
                    setMessage ({text: "There are no more roles.", key: Math.random ()});
                }
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
        const newRoles = [...roles];
        newRoles[index] = JSON.parse (e.target.options[e.target.selectedIndex].id);
        newRoles[index].expanded = false;
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
        if (name.length > 0)
        {
            if (type === "Group")
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
                setMessage ({text: "Group successfully updated.", key: Math.random ()});
            }
            else
            {
                var response = await api.put
                (
                    "/lockidupdate",
                    {
                        name,
                        owner: loggedAccount._id
                    },
                    {
                        params:
                        {
                            _id: match.params.id
                        }
                    }
                );
                setMessage ({text: "Lock successfully updated.", key: Math.random ()});
            }
            setEditedItem (response.data);
        }
        else
        {
            if (type === "Group")
            {
                setMessage ({text: "Group name is invalid.", key: Math.random ()});
            }
            else
            {
                setMessage ({text: "Group name is invalid.", key: Math.random ()});
            }
        }
    }

    async function handleMove ()
    {
        if (match.params.hasOwnProperty ("otherid"))
        {
            if (type === "Group")
            {
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
                if (response.data === null)
                {
                    setMessage ({text: "Group cannot be moved to that destination.", key: Math.random ()});
                }
                else
                {
                    setMovedItem (response.data);
                    setMessage ({text: "Group successfully moved.", key: Math.random ()});
                }
            }
            else
            {
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
                if (response.data === null)
                {
                    setMessage ({text: "Lock cannot be moved to that destination.", key: Math.random ()});
                }
                else
                {
                    setMovedItem (response.data);
                    setMessage ({text: "Lock successfully moved.", key: Math.random ()});
                }
            }
        }
    }

    async function handleDelete ()
    {
        if (type === "Group")
        {
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
            setMessage ({text: "Group successfully deleted.", key: Math.random ()});
        }
        else
        {
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
            setMessage ({text: "Lock successfully deleted.", key: Math.random ()});
        }
        setDeletedItem (response.data);
        setRedirect (<Redirect to = {deletedItemUrl ()}/>);
    }

    return (
        <div className = "itemInfoArea">
            <div className = "topBox">
                <div className = "label nameLabel">Name</div>
                <input
                className = "nameInput"
                placeholder = "Name"
                value = {name}
                onChange = {(e) => {handleChangeName (e)}}
                />
            </div>
            <div
            className = "RoleList"
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
                                        <div
                                        className = {role.expanded ? "downArrowButton" : "rightArrowButton"}
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
                                                            style =
                                                                    {
                                                                        {
                                                                            backgroundColor: time.use ? "#2895cc" : "#cccccc",
                                                                            color: time.use ? "#ffffff" : "#333333"
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
                                                                <div className = "timeMiddleBox">
                                                                    <div className = "label trackLabel">Log accesses</div>
                                                                    <div
                                                                    className = "trackValue"
                                                                    style = {{backgroundColor: time.trackAccess ? "#cccccc" : "#ffffff"}}
                                                                    />
                                                                    <div className = "label trackLabel">Log misses</div>
                                                                    <div
                                                                    className = "trackValue"
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
                    Save changes
                </button>
                <button
                className = "moveButton"
                style =
                {
                    {
                        backgroundColor: match.params.hasOwnProperty ("otherid") ? "#cccccc" : "#e5e5e5",
                        borderColor: match.params.hasOwnProperty ("otherid") ? "#cccccc" : "#e5e5e5",
                        color: match.params.hasOwnProperty ("otherid") ? "#000000" : "#7f7f7f"
                    }
                }
                onClick = {() => {handleMove ()}}
                >
                    Move item
                </button>
                <button
                className = "deleteButton"
                onClick = {() => {handleDelete ()}}
                >
                    Delete item
                </button>
            </div>
            {redirect}
        </div>
    );
}

export default ItemInfo;