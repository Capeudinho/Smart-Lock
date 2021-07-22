import React, {useState, useEffect, useContext} from "react";
import api from "../../services/api";
import {Redirect} from "react-router-dom";

import loggedAccountContext from "../contexts/loggedAccount";
import accountRolesContext from "../contexts/accountRoles";
import messageContext from "../contexts/message";
import editedUserContext from "../contexts/editedUser";
import deletedUserContext from "../contexts/deletedUser";

import "../../css/user/userInfo.css";

function UserInfo ({match})
{
    const {loggedAccount, setLoggedAccount} = useContext (loggedAccountContext);
    const {accountRoles, setAccountRoles} = useContext (accountRolesContext);
    const {message, setMessage} = useContext (messageContext);
    const {editedUser, setEditedUser} = useContext (editedUserContext);
    const {deletedUser, setDeletedUser} = useContext (deletedUserContext);
    const [name, setName] = useState ("");
    const [PINs, setPINs] = useState ([]);
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
                    "/useridindex",
                    {
                        params:
                        {
                            _id: match.params.id
                        }
                    }
                );
                if (mounted)
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
                    setName (response.data.name);
                    setPINs (response.data.PINs);
                    setRoles (response.data.roles);
                }
            }
            runEffect ();
            return (() => {mounted = false;});
        },
        [match.url]
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

    function handleChangeName (e)
    {
        setName (e.target.value);
    }

    function handleAddPIN ()
    {
        var newPINs = [...PINs];
        newPINs.push ("");
        setPINs (newPINs);
    }

    function handleRemovePIN (index)
    {
        var newPINs = [...PINs];
        newPINs.splice (index, 1);
        setPINs (newPINs);
    }

    function handleChangePIN (index, e)
    {
        var newPINs = [...PINs];
        newPINs[index] = e.target.value;
        setPINs (newPINs);
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
        var validPINs = true;
        for (var a = 0; a < PINs.length; a++)
        {
            if (PINs[a].length === 0)
            {
                validPINs = false;
            }
        }
        if (name.length > 0 && validPINs)
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
            const response = await api.put
            (
                "/useridupdate",
                {
                    name,
                    PINs,
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
            setEditedUser (response.data);
            setMessage ({text: "User successfully updated.", key: Math.random ()});
        }
        else
        {
            setMessage ({text: "User name, and/or PINs are invalid.", key: Math.random ()});
        }
    }

    async function handleDelete ()
    {
        const response = await api.delete
        (
            "/useriddestroy",
            {
                params:
                {
                    _id: match.params.id
                }
            }
        );
        setDeletedUser (response.data);
        setMessage ({text: "User successfully deleted.", key: Math.random ()});
        setRedirect (<Redirect to = "/users"/>);
    }

    return (
        <div className = "userInfoArea">
            <div className = "topBox">
                <div className = "label nameLabel">Name</div>
                <input
                className = "nameInput"
                placeholder = "Name"
                value = {name}
                onChange = {(e) => {handleChangeName (e)}}
                />
                <div className = "label PINsLabel">PINs</div>
            </div>
            <div className = "PINList">
                {
                    PINs.map
                    (
                        (PIN, index) =>
                        {
                            return (
                                <div
                                className = "PIN"
                                key = {index}
                                >
                                    <input
                                    className = "PINInput"
                                    value = {PIN}
                                    onChange = {(e) => {handleChangePIN (index, e)}}
                                    />
                                    <img
                                    className = "removeButton"
                                    src = {process.env.PUBLIC_URL+"/close-icon.svg"}
                                    onClick = {() => handleRemovePIN (index)}
                                    />
                                </div>
                            );
                        }
                    )
                }
                <button
                className = "addPINButton"
                onClick = {() => {handleAddPIN ()}}
                >
                    Add PIN
                </button>
            </div>
            <div className = "middleBox">
                <div className = "label rolesLabel">Roles</div>
            </div>
            <div className = "RoleList">
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
                                                                <div className = "timeBottomBox">
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
                className = "deleteButton"
                onClick = {() => {handleDelete ()}}
                >
                    Delete user
                </button>
            </div>
            {redirect}
        </div>
    );
}

export default UserInfo;