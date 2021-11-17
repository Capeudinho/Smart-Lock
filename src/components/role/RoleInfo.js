import React, {useState, useEffect, useContext} from "react";
import api from "../../services/api";
import {Redirect} from "react-router-dom";

import loggedAccountContext from "../contexts/loggedAccount";
import accountRolesContext from "../contexts/accountRoles";
import messageContext from "../contexts/message";
import overlayContext from "../contexts/overlay";
import editedRoleContext from "../contexts/editedRole";
import deletedRoleContext from "../contexts/deletedRole";

import "../../css/role/roleInfo.css";

function RoleInfo ({match})
{
    const {loggedAccount, setLoggedAccount} = useContext (loggedAccountContext);
    const {accountRoles, setAccountRoles} = useContext (accountRolesContext);
    const {message, setMessage} = useContext (messageContext);
    const {overlay, setOverlay} = useContext (overlayContext);
    const {editedRole, setEditedRole} = useContext (editedRoleContext);
    const {deletedRole, setDeletedRole} = useContext (deletedRoleContext);
    const [name, setName] = useState ("");
    const [times, setTimes] = useState ([]);
    const [confirmDelete, setConfirmDelete] = useState (false);
    const [hover, setHover] = useState ({time: "", button: ""});
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
                    setOverlay (false);
                    setName (response.data.name);
                    setTimes (response.data.times);
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
                _id: "createdTime/////"+Math.random ()
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
            setOverlay (true);
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
            setOverlay (false);
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
            setMessage ([{text: "Role successfully updated.", key: Math.random ()}]);
        }
        else
        {
            setMessage ([{text: "Role name is invalid.", key: Math.random ()}]);
        }
    }

    async function handleDelete ()
    {
        if (confirmDelete)
        {
            setOverlay (true);
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
            setOverlay (false);
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
            setMessage ([{text: "Role successfully deleted.", key: Math.random ()}]);
            setRedirect (<Redirect to = "/roles"/>);
        }
        else
        {
            setConfirmDelete (true);
        }
    }

    return (
        <div className = "roleInfoArea">
            <div className = "roleInfoContainer">
                <div className = "topBox">
                    <div className = "label nameLabel">Name</div>
                    <input
                    className = "nameInput"
                    placeholder = "Name"
                    value = {name}
                    onChange = {(e) => {handleChangeName (e)}}
                    spellCheck = {false}
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
                                        onMouseEnter = {() => {setHover ({time: time._id, button: "use"})}}
                                        onMouseLeave = {() => {setHover ({time: "", button: ""})}}
                                        style =
                                        {
                                            {
                                                backgroundColor:
                                                time.use && hover.time === time._id && hover.button === "use" ?
                                                "#52a3cc" :
                                                time.use && hover.time !== time._id || time.use && hover.button !== "use" ?
                                                "#2996cc" :
                                                time.use === false && hover.time === time._id && hover.button === "use" ?
                                                "#d9d9d9" :
                                                "#cccccc",
                                                borderColor:
                                                time.use && hover.time === time._id && hover.button === "use" ?
                                                "#52a3cc" :
                                                time.use && hover.time !== time._id || time.use && hover.button !== "use" ?
                                                "#2996cc" :
                                                time.use === false && hover.time === time._id && hover.button === "use" ?
                                                "#d9d9d9" :
                                                "#cccccc",
                                                color: time.use ? "#ffffff" : "#000000"
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
                                                onMouseEnter = {() => {setHover ({time: time._id, button: "days0"})}}
                                                onMouseLeave = {() => {setHover ({time: "", button: ""})}}
                                                style =
                                                {
                                                    {
                                                        backgroundColor:
                                                        time.days[0] && hover.time === time._id && hover.button === "days0" ?
                                                        "#52a3cc" :
                                                        time.days[0] && hover.time !== time._id || time.days[0] && hover.button !== "days0" ?
                                                        "#2996cc" :
                                                        time.days[0] === false && hover.time === time._id && hover.button === "days0" ?
                                                        "#d9d9d9" :
                                                        "#cccccc",
                                                        borderColor:
                                                        time.days[0] && hover.time === time._id && hover.button === "days0" ?
                                                        "#52a3cc" :
                                                        time.days[0] && hover.time !== time._id || time.days[0] && hover.button !== "days0" ?
                                                        "#2996cc" :
                                                        time.days[0] === false && hover.time === time._id && hover.button === "days0" ?
                                                        "#d9d9d9" :
                                                        "#cccccc",
                                                        color: time.days[0] ? "#ffffff" : "#000000"
                                                    }
                                                }
                                                >
                                                    S
                                                </button>
                                                <button
                                                className = "dayButton"
                                                onClick = {() => {handleChangeDay (index, 1)}}
                                                onMouseEnter = {() => {setHover ({time: time._id, button: "days1"})}}
                                                onMouseLeave = {() => {setHover ({time: "", button: ""})}}
                                                style =
                                                {
                                                    {
                                                        backgroundColor:
                                                        time.days[1] && hover.time === time._id && hover.button === "days1" ?
                                                        "#52a3cc" :
                                                        time.days[1] && hover.time !== time._id || time.days[1] && hover.button !== "days1" ?
                                                        "#2996cc" :
                                                        time.days[1] === false && hover.time === time._id && hover.button === "days1" ?
                                                        "#d9d9d9" :
                                                        "#cccccc",
                                                        borderColor:
                                                        time.days[1] && hover.time === time._id && hover.button === "days1" ?
                                                        "#52a3cc" :
                                                        time.days[1] && hover.time !== time._id || time.days[1] && hover.button !== "days1" ?
                                                        "#2996cc" :
                                                        time.days[1] === false && hover.time === time._id && hover.button === "days1" ?
                                                        "#d9d9d9" :
                                                        "#cccccc",
                                                        color: time.days[1] ? "#ffffff" : "#000000"
                                                    }
                                                }
                                                >
                                                    M
                                                </button>
                                                <button
                                                className = "dayButton"
                                                onClick = {() => {handleChangeDay (index, 2)}}
                                                onMouseEnter = {() => {setHover ({time: time._id, button: "days2"})}}
                                                onMouseLeave = {() => {setHover ({time: "", button: ""})}}
                                                style =
                                                {
                                                    {
                                                        backgroundColor:
                                                        time.days[2] && hover.time === time._id && hover.button === "days2" ?
                                                        "#52a3cc" :
                                                        time.days[2] && hover.time !== time._id || time.days[2] && hover.button !== "days2" ?
                                                        "#2996cc" :
                                                        time.days[2] === false && hover.time === time._id && hover.button === "days2" ?
                                                        "#d9d9d9" :
                                                        "#cccccc",
                                                        borderColor:
                                                        time.days[2] && hover.time === time._id && hover.button === "days2" ?
                                                        "#52a3cc" :
                                                        time.days[2] && hover.time !== time._id || time.days[2] && hover.button !== "days2" ?
                                                        "#2996cc" :
                                                        time.days[2] === false && hover.time === time._id && hover.button === "days2" ?
                                                        "#d9d9d9" :
                                                        "#cccccc",
                                                        color: time.days[2] ? "#ffffff" : "#000000"
                                                    }
                                                }
                                                >
                                                    T
                                                </button>
                                                <button
                                                className = "dayButton"
                                                onClick = {() => {handleChangeDay (index, 3)}}
                                                onMouseEnter = {() => {setHover ({time: time._id, button: "days3"})}}
                                                onMouseLeave = {() => {setHover ({time: "", button: ""})}}
                                                style =
                                                {
                                                    {
                                                        backgroundColor:
                                                        time.days[3] && hover.time === time._id && hover.button === "days3" ?
                                                        "#52a3cc" :
                                                        time.days[3] && hover.time !== time._id || time.days[3] && hover.button !== "days3" ?
                                                        "#2996cc" :
                                                        time.days[3] === false && hover.time === time._id && hover.button === "days3" ?
                                                        "#d9d9d9" :
                                                        "#cccccc",
                                                        borderColor:
                                                        time.days[3] && hover.time === time._id && hover.button === "days3" ?
                                                        "#52a3cc" :
                                                        time.days[3] && hover.time !== time._id || time.days[3] && hover.button !== "days3" ?
                                                        "#2996cc" :
                                                        time.days[3] === false && hover.time === time._id && hover.button === "days3" ?
                                                        "#d9d9d9" :
                                                        "#cccccc",
                                                        color: time.days[3] ? "#ffffff" : "#000000"
                                                    }
                                                }
                                                >
                                                    W
                                                </button>
                                                <button
                                                className = "dayButton"
                                                onClick = {() => {handleChangeDay (index, 4)}}
                                                onMouseEnter = {() => {setHover ({time: time._id, button: "days4"})}}
                                                onMouseLeave = {() => {setHover ({time: "", button: ""})}}
                                                style =
                                                {
                                                    {
                                                        backgroundColor:
                                                        time.days[4] && hover.time === time._id && hover.button === "days4" ?
                                                        "#52a3cc" :
                                                        time.days[4] && hover.time !== time._id || time.days[4] && hover.button !== "days4" ?
                                                        "#2996cc" :
                                                        time.days[4] === false && hover.time === time._id && hover.button === "days4" ?
                                                        "#d9d9d9" :
                                                        "#cccccc",
                                                        borderColor:
                                                        time.days[4] && hover.time === time._id && hover.button === "days4" ?
                                                        "#52a3cc" :
                                                        time.days[4] && hover.time !== time._id || time.days[4] && hover.button !== "days4" ?
                                                        "#2996cc" :
                                                        time.days[4] === false && hover.time === time._id && hover.button === "days4" ?
                                                        "#d9d9d9" :
                                                        "#cccccc",
                                                        color: time.days[4] ? "#ffffff" : "#000000"
                                                    }
                                                }
                                                >
                                                    T
                                                </button>
                                                <button
                                                className = "dayButton"
                                                onClick = {() => {handleChangeDay (index, 5)}}
                                                onMouseEnter = {() => {setHover ({time: time._id, button: "days5"})}}
                                                onMouseLeave = {() => {setHover ({time: "", button: ""})}}
                                                style =
                                                {
                                                    {
                                                        backgroundColor:
                                                        time.days[5] && hover.time === time._id && hover.button === "days5" ?
                                                        "#52a3cc" :
                                                        time.days[5] && hover.time !== time._id || time.days[5] && hover.button !== "days5" ?
                                                        "#2996cc" :
                                                        time.days[5] === false && hover.time === time._id && hover.button === "days5" ?
                                                        "#d9d9d9" :
                                                        "#cccccc",
                                                        borderColor:
                                                        time.days[5] && hover.time === time._id && hover.button === "days5" ?
                                                        "#52a3cc" :
                                                        time.days[5] && hover.time !== time._id || time.days[5] && hover.button !== "days5" ?
                                                        "#2996cc" :
                                                        time.days[5] === false && hover.time === time._id && hover.button === "days5" ?
                                                        "#d9d9d9" :
                                                        "#cccccc",
                                                        color: time.days[5] ? "#ffffff" : "#000000"
                                                    }
                                                }
                                                >
                                                    F
                                                </button>
                                                <button
                                                className = "dayButton"
                                                onClick = {() => {handleChangeDay (index, 6)}}
                                                onMouseEnter = {() => {setHover ({time: time._id, button: "days6"})}}
                                                onMouseLeave = {() => {setHover ({time: "", button: ""})}}
                                                style =
                                                {
                                                    {
                                                        backgroundColor:
                                                        time.days[6] && hover.time === time._id && hover.button === "days6" ?
                                                        "#52a3cc" :
                                                        time.days[6] && hover.time !== time._id || time.days[6] && hover.button !== "days6" ?
                                                        "#2996cc" :
                                                        time.days[6] === false && hover.time === time._id && hover.button === "days6" ?
                                                        "#d9d9d9" :
                                                        "#cccccc",
                                                        borderColor:
                                                        time.days[6] && hover.time === time._id && hover.button === "days6" ?
                                                        "#52a3cc" :
                                                        time.days[6] && hover.time !== time._id || time.days[6] && hover.button !== "days6" ?
                                                        "#2996cc" :
                                                        time.days[6] === false && hover.time === time._id && hover.button === "days6" ?
                                                        "#d9d9d9" :
                                                        "#cccccc",
                                                        color: time.days[6] ? "#ffffff" : "#000000"
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
                                                value = {convertTime (time.start)}
                                                onChange = {(e) => {handleChangeStart (index, e)}}
                                                type = "time"
                                                style = {{height: 30}}
                                                spellCheck = {false}
                                                />
                                                <div className = "label endLabel">End</div>
                                                <input
                                                className = "timeInput"
                                                value = {convertTime (time.end)}
                                                onChange = {(e) => {handleChangeEnd (index, e)}}
                                                type = "time"
                                                style = {{height: 30}}
                                                spellCheck = {false}
                                                />
                                            </div>
                                            <div className = "timeBottomBox">
                                                <div className = "label trackAccessLabel">Log accesses</div>
                                                <button
                                                className = "trackAccessButton"
                                                onClick = {() => {handleChangeTrackAccess (index)}}
                                                onMouseEnter = {() => {setHover ({time: time._id, button: "trackAccess"})}}
                                                onMouseLeave = {() => {setHover ({time: "", button: ""})}}
                                                style =
                                                {
                                                    {
                                                        backgroundColor:
                                                        time.trackAccess && hover.time === time._id && hover.button === "trackAccess" ?
                                                        "#52a3cc" :
                                                        time.trackAccess && hover.time !== time._id || time.trackAccess && hover.button !== "trackAccess" ?
                                                        "#2996cc" :
                                                        time.trackAccess === false && hover.time === time._id && hover.button === "trackAccess" ?
                                                        "#d9d9d9" :
                                                        "#cccccc",
                                                        borderColor:
                                                        time.trackAccess && hover.time === time._id && hover.button === "trackAccess" ?
                                                        "#52a3cc" :
                                                        time.trackAccess && hover.time !== time._id || time.trackAccess && hover.button !== "trackAccess" ?
                                                        "#2996cc" :
                                                        time.trackAccess === false && hover.time === time._id && hover.button === "trackAccess" ?
                                                        "#d9d9d9" :
                                                        "#cccccc",
                                                        color: time.trackAccess ? "#ffffff" : "#000000"
                                                    }
                                                }
                                                />
                                                <div className = "label trackMissLabel">Log misses</div>
                                                <button
                                                className = "trackMissButton"
                                                onClick = {() => {handleChangeTrackMiss (index)}}
                                                onMouseEnter = {() => {setHover ({time: time._id, button: "trackMiss"})}}
                                                onMouseLeave = {() => {setHover ({time: "", button: ""})}}
                                                style =
                                                {
                                                    {
                                                        backgroundColor:
                                                        time.trackMiss && hover.time === time._id && hover.button === "trackMiss" ?
                                                        "#52a3cc" :
                                                        time.trackMiss && hover.time !== time._id || time.trackMiss && hover.button !== "trackMiss" ?
                                                        "#2996cc" :
                                                        time.trackMiss === false && hover.time === time._id && hover.button === "trackMiss" ?
                                                        "#d9d9d9" :
                                                        "#cccccc",
                                                        borderColor:
                                                        time.trackMiss && hover.time === time._id && hover.button === "trackMiss" ?
                                                        "#52a3cc" :
                                                        time.trackMiss && hover.time !== time._id || time.trackMiss && hover.button !== "trackMiss" ?
                                                        "#2996cc" :
                                                        time.trackMiss === false && hover.time === time._id && hover.button === "trackMiss" ?
                                                        "#d9d9d9" :
                                                        "#cccccc",
                                                        color: time.trackMiss ? "#ffffff" : "#000000"
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
                    onMouseEnter = {() => {setHover ({time: "", button: "delete"})}}
                    onMouseLeave = {() => {setHover ({time: "", button: ""})}}
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

export default RoleInfo;