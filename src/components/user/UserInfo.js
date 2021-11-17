import React, {useState, useEffect, useContext, useRef} from "react";
import api from "../../services/api";
import {Redirect} from "react-router-dom";

import loggedAccountContext from "../contexts/loggedAccount";
import accountRolesContext from "../contexts/accountRoles";
import messageContext from "../contexts/message";
import overlayContext from "../contexts/overlay";
import editedUserContext from "../contexts/editedUser";
import deletedUserContext from "../contexts/deletedUser";

import "../../css/user/userInfo.css";

function UserInfo ({match})
{
    const {loggedAccount, setLoggedAccount} = useContext (loggedAccountContext);
    const {accountRoles, setAccountRoles} = useContext (accountRolesContext);
    const {message, setMessage} = useContext (messageContext);
    const {overlay, setOverlay} = useContext (overlayContext);
    const {editedUser, setEditedUser} = useContext (editedUserContext);
    const {deletedUser, setDeletedUser} = useContext (deletedUserContext);
    const [name, setName] = useState ("");
    const [PINs, setPINs] = useState ([]);
    const [roles, setRoles] = useState ([]);
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
                    setOverlay (false);
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
                    setConfirmDelete (false);
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
        var validPINs = true;
        var uniquePINs = true;
        for (var a = 0; a < PINs.length; a++)
        {
            if (PINs[a].length === 0)
            {
                validPINs = false;
            }
            for (var b = 0; b < a; b++)
            {
                if (PINs[a] === PINs[b])
                {
                    uniquePINs = false;
                }
            }
        }
        if (name.length > 0 && validPINs && uniquePINs)
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
            setOverlay (false);
            if (response.data !== null)
            {
                setEditedUser (response.data);
                setMessage ([{text: "User successfully updated.", key: Math.random ()}]);
            }
            else
            {
                setMessage ([{text: "An user with one, or more of these PINs already exists.", key: Math.random ()}]);
            }
        }
        else
        {
            if (name.length === 0 || validPINs === false)
            {
                setMessage ([{text: "User name, and/or PINs are invalid.", key: Math.random ()}]);
            }
            if (uniquePINs === false)
            {
                setMessage ([{text: "Two, or more PINs are equal.", key: Math.random ()}]);
            }
        }
    }

    async function handleDelete ()
    {
        if (confirmDelete)
        {
            setOverlay (true);
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
            setOverlay (false);
            setDeletedUser (response.data);
            setMessage ([{text: "User successfully deleted.", key: Math.random ()}]);
            setRedirect (<Redirect to = "/users"/>);
        }
        else
        {
            setConfirmDelete (true);
        }
    }

    return (
        <div className = "userInfoArea">
            <div className = "userInfoContainer">
                <div className = "topBox">
                    <div className = "label nameLabel">Name</div>
                    <input
                    className = "nameInput"
                    value = {name}
                    onChange = {(e) => {handleChangeName (e)}}
                    spellCheck = {false}
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
                                        spellCheck = {false}
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
                <div className = "roleList">
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
                                                                    value = {roleOption.id}
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

export default UserInfo;