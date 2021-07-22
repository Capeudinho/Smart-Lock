import React, {useState, useEffect, useContext} from "react";
import api from "../../services/api";
import {Redirect} from "react-router-dom";

import loggedAccountContext from "../contexts/loggedAccount";
import accountRolesContext from "../contexts/accountRoles";
import messageContext from "../contexts/message";
import editedRoleContext from "../contexts/editedRole";
import deletedRoleContext from "../contexts/deletedRole";

import "../../css/role/roleInfo.css";

function RoleInfo ({match})
{
    const {loggedAccount, setLoggedAccount} = useContext (loggedAccountContext);
    const {accountRoles, setAccountRoles} = useContext (accountRolesContext);
    const {message, setMessage} = useContext (messageContext);
    const {editedRole, setEditedRole} = useContext (editedRoleContext);
    const {deletedRole, setDeletedRole} = useContext (deletedRoleContext);
    const [name, setName] = useState ("");
    const [times, setTimes] = useState ([]);
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
                    "/roleidindex",
                    {
                        params:
                        {
                            _id: match.params.id
                        }
                    }
                );
                if (mounted)
                {
                    setName (response.data.name);
                    setTimes (response.data.times);
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

    async function handleAddTime ()
    {
        var newTimes = [...times];
        newTimes.push
        (
            {
                start: 0,
                end: 0,
                days: [false, false, false, false, false, false, false],
                use: true,
                trackAccess: false,
                trackMiss: false,
                owner: loggedAccount._id,
                _id: null
            }
        );
        setTimes (newTimes);
    }

    async function handleRemoveTime (index)
    {
        var newTimes = [...times];
        newTimes.splice (index, 1);
        setTimes (newTimes);
    }

    async function handleChangeUse (index)
    {
        var newTimes = [...times];
        newTimes[index].use = !newTimes[index].use;
        setTimes (newTimes);
    }

    async function handleChangeDay (index, day)
    {
        var newTimes = [...times];
        newTimes[index].days[day] = !newTimes[index].days[day];
        setTimes (newTimes);
    }

    async function handleChangeStart (index, e)
    {
        var newTimes = [...times];
        var time = e.target.value.split (":");
        time = (parseInt (time[0])*60)+parseInt (time[1]);
        newTimes[index].start = time;
        setTimes (newTimes);
    }

    async function handleChangeEnd (index, e)
    {
        var newTimes = [...times];
        var time = e.target.value.split (":");
        time = (parseInt (time[0])*60)+parseInt (time[1]);
        newTimes[index].end = time;
        setTimes (newTimes);
    }

    async function handleChangeTrackAccess (index)
    {
        var newTimes = [...times];
        newTimes[index].trackAccess = !newTimes[index].trackAccess;
        setTimes (newTimes);
    }

    async function handleChangeTrackMiss (index)
    {
        var newTimes = [...times];
        newTimes[index].trackMiss = !newTimes[index].trackMiss;
        setTimes (newTimes);
    }

    async function handleEdit ()
    {
        if (name.length > 0)
        {
            const response = await api.put
            (
                "/roleidupdate",
                {
                    name,
                    timeInfos: times,
                    owner: loggedAccount._id
                },
                {
                    params:
                    {
                        _id: match.params.id
                    }
                }
            );
            for (var a = 0; a < times.length; a++)
            {
                times[a]._id = response.data.times[a]._id;
            }
            var newAccountRoles = [...accountRoles];
            for (var a = 0; a < newAccountRoles.length; a++)
            {
                if (newAccountRoles[a]._id === match.params.id)
                {
                    newAccountRoles[a] = response.data;
                }
            }
            setAccountRoles (newAccountRoles);
            setEditedRole (response.data);
            setMessage ({text: "Role successfully updated.", key: Math.random ()});
        }
        else
        {
            setMessage ({text: "Role name is invalid.", key: Math.random ()});
        }
    }

    async function handleDelete ()
    {
        const response = await api.delete
        (
            "/roleiddestroy",
            {
                params:
                {
                    _id: match.params.id
                }
            }
        );
        var newAccountRoles = [...accountRoles];
        for (var a = 0; a < newAccountRoles.length; a++)
        {
            if (newAccountRoles[a]._id === response.data._id)
            {
                newAccountRoles.splice (a, 1);
            }
        }
        setAccountRoles (newAccountRoles);
        setDeletedRole (response.data);
        setMessage ({text: "Role successfully deleted.", key: Math.random ()});
        setRedirect (<Redirect to = "/roles"/>);
    }

    return (
        <div className = "roleInfoArea">
            <div className = "topBox">
                <div className = "label nameLabel">Name</div>
                <input
                className = "nameInput"
                placeholder = "Name"
                value = {name}
                onChange = {(e) => {handleChangeName (e)}}
                />
                <div className = "label timesLabel">Times</div>
            </div>
            <div className = "timeList">
                {
                    times.map
                    (
                        (time, index) =>
                        {
                            return (
                                <div
                                className = "time"
                                key = {index}
                                >
                                    <button
                                    className = "useButton"
                                    onClick = {() => {handleChangeUse (index)}}
                                    style =
                                    {
                                        {
                                            backgroundColor: time.use ? "#2895cc" : "#cccccc",
                                            color: time.use ? "#ffffff" : "#333333"
                                        }
                                    }
                                    >
                                        <div className = "useButtonText">
                                            DEFAULT
                                        </div>
                                    </button>
                                    <div className = "timeInfo">
                                        <div className = "timeTopBox">
                                            <div className = "label daysLabel">Days</div>
                                            <button
                                            className = "dayButton"
                                            onClick = {() => {handleChangeDay (index, 0)}}
                                            style =
                                            {
                                                {
                                                    backgroundColor: time.days[0] ? "#2895cc" : "#cccccc",
                                                    borderColor: time.days[0] ? "#2895cc" : "#cccccc",
                                                    color: time.days[0] ? "#ffffff" : "#333333"
                                                }
                                            }
                                            >
                                                S
                                            </button>
                                            <button
                                            className = "dayButton"
                                            onClick = {() => {handleChangeDay (index, 1)}}
                                            style =
                                            {
                                                {
                                                    backgroundColor: time.days[1] ? "#2895cc" : "#cccccc",
                                                    borderColor: time.days[1] ? "#2895cc" : "#cccccc",
                                                    color: time.days[1] ? "#ffffff" : "#333333"
                                                }
                                            }
                                            >
                                                M
                                            </button>
                                            <button
                                            className = "dayButton"
                                            onClick = {() => {handleChangeDay (index, 2)}}
                                            style =
                                            {
                                                {
                                                    backgroundColor: time.days[2] ? "#2895cc" : "#cccccc",
                                                    borderColor: time.days[2] ? "#2895cc" : "#cccccc",
                                                    color: time.days[2] ? "#ffffff" : "#333333"
                                                }
                                            }
                                            >
                                                T
                                            </button>
                                            <button
                                            className = "dayButton"
                                            onClick = {() => {handleChangeDay (index, 3)}}
                                            style =
                                            {
                                                {
                                                    backgroundColor: time.days[3] ? "#2895cc" : "#cccccc",
                                                    borderColor: time.days[3] ? "#2895cc" : "#cccccc",
                                                    color: time.days[3] ? "#ffffff" : "#333333"
                                                }
                                            }
                                            >
                                                W
                                            </button>
                                            <button
                                            className = "dayButton"
                                            onClick = {() => {handleChangeDay (index, 4)}}
                                            style =
                                            {
                                                {
                                                    backgroundColor: time.days[4] ? "#2895cc" : "#cccccc",
                                                    borderColor: time.days[4] ? "#2895cc" : "#cccccc",
                                                    color: time.days[4] ? "#ffffff" : "#333333"
                                                }
                                            }
                                            >
                                                T
                                            </button>
                                            <button
                                            className = "dayButton"
                                            onClick = {() => {handleChangeDay (index, 5)}}
                                            style =
                                            {
                                                {
                                                    backgroundColor: time.days[5] ? "#2895cc" : "#cccccc",
                                                    borderColor: time.days[5] ? "#2895cc" : "#cccccc",
                                                    color: time.days[5] ? "#ffffff" : "#333333"
                                                }
                                            }
                                            >
                                                F
                                            </button>
                                            <button
                                            className = "dayButton"
                                            onClick = {() => {handleChangeDay (index, 6)}}
                                            style =
                                            {
                                                {
                                                    backgroundColor: time.days[6] ? "#2895cc" : "#cccccc",
                                                    borderColor: time.days[6] ? "#2895cc" : "#cccccc",
                                                    color: time.days[6] ? "#ffffff" : "#333333"
                                                }
                                            }
                                            >
                                                S
                                            </button>
                                        </div>
                                        <div className = "timeMiddleBox">
                                            <div className = "label startLabel">Start</div>
                                            <input
                                            className = "timeInput"
                                            style = {{height: 30}}
                                            value = {convertTime (time.start)}
                                            onChange = {(e) => {handleChangeStart (index, e)}}
                                            type = "time"
                                            />
                                            <div className = "label endLabel">End</div>
                                            <input
                                            className = "timeInput"
                                            style = {{height: 30}}
                                            value = {convertTime (time.end)}
                                            onChange = {(e) => {handleChangeEnd (index, e)}}
                                            type = "time"
                                            />
                                        </div>
                                        <div className = "timeBottomBox">
                                            <div className = "label trackLabel">Log accesses</div>
                                            <button
                                            className = "trackButton"
                                            onClick = {() => {handleChangeTrackAccess (index)}}
                                            style =
                                            {
                                                {
                                                    backgroundColor: time.trackAccess ? "#2895cc" : "#cccccc",
                                                    borderColor: time.trackAccess ? "#2895cc" : "#cccccc"
                                                }
                                            }
                                            />
                                            <div className = "label trackLabel">Log misses</div>
                                            <button
                                            className = "trackButton"
                                            onClick = {() => {handleChangeTrackMiss (index)}}
                                            style =
                                            {
                                                {
                                                    backgroundColor: time.trackMiss ? "#2895cc" : "#cccccc",
                                                    borderColor: time.trackMiss ? "#2895cc" : "#cccccc"
                                                }
                                            }
                                            />
                                        </div>
                                    </div>
                                    <img
                                    className = "removeButton"
                                    src = {process.env.PUBLIC_URL+"/close-icon.svg"}
                                    onClick = {() => handleRemoveTime (index)}
                                    />
                                </div>
                            );
                        }
                    )
                }
                <button
                className = "addTimeButton"
                onClick = {() => {handleAddTime ()}}
                >
                    Add time
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
                    Delete role
                </button>
            </div>
            {redirect}
        </div>
    );
}

export default RoleInfo;