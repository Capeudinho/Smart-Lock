import React, {useState, useEffect, useContext} from "react";
import api from "../../services/api";

import loggedAccountContext from "../contexts/loggedAccount";
import overlayContext from "../contexts/overlay";

import "../../css/log/logList.css";

function LogList ()
{
    const {loggedAccount, setLoggedAccount} = useContext (loggedAccountContext);
    const {overlay, setOverlay} = useContext (overlayContext);
    const [logs, setLogs] = useState ([]);
    const [page, setPage] = useState (1);
    const [pages, setPages] = useState (0);
    const [user, setUser] = useState ("");
    const [item, setItem] = useState ("");
    const [role, setRole] = useState ("");
    const [start, setStart] = useState ("");
    const [end, setEnd] = useState ("");
    const [update, setUpdate] = useState (0);

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
                    "/loglistpag",
                    {
                        params:
                        {
                            page,
                            user,
                            item,
                            role,
                            start,
                            end,
                            owner: loggedAccount._id
                        }
                    }
                );
                if (mounted)
                {
                    setOverlay (false);
                    setPages (response.data.pages);
                    if (page === 1)
                    {
                        setLogs (response.data.docs);
                    }
                    else
                    {
                        setLogs ([...logs, ...response.data.docs]);
                    }
                }
            }
            runEffect ();
            return (() => {mounted = false;});
        },
        [loggedAccount, page, update]
    );

    function handleSearch ()
    {
        if (page === 1)
        {
            setUpdate (update+1);
        }
        else
        {
            setPage (1);
        }
    }

    function handleLoadMore (e)
    {
        if (e.target.scrollHeight-e.target.scrollTop <= e.target.clientHeight*1.25 && page < pages && overlay === false)
        {
            setPage (page+1);
        }
    }

    function convertDate (date)
    {
        date = date.split ("T");
        var day = date[0].split ("-");
        var hour = date[1].split (":");
        return (hour[0]+":"+hour[1]+", "+day[2]+"/"+day[1]+"/"+day[0]);
    }

    function handleChangeUser (e)
    {
        setUser (e.target.value);
    }

    function handleChangeItem (e)
    {
        setItem (e.target.value);
    }

    function handleChangeRole (e)
    {
        setRole (e.target.value);
    }

    function handleChangeStart (e)
    {
        setStart (e.target.value);
    }

    function handleChangeEnd (e)
    {
        setEnd (e.target.value);
    }

    return (
        <div className = "logListArea">
            <div className = "topBox">
                <div className = "userGroup">
                    <div className = "label userLabel">User</div>
                    <input
                    className = "userInput"
                    value = {user}
                    onChange = {(e) => {handleChangeUser (e)}}
                    spellCheck = {false}
                    />
                </div>
                <div className = "itemGroup">
                    <div className = "label itemLabel">Item</div>
                    <input
                    className = "itemInput"
                    value = {item}
                    onChange = {(e) => {handleChangeItem (e)}}
                    spellCheck = {false}
                    />
                </div>
                <div className = "roleGroup">
                    <div className = "label roleLabel">Role</div>
                    <input
                    className = "roleInput"
                    value = {role}
                    onChange = {(e) => {handleChangeRole (e)}}
                    spellCheck = {false}
                    />
                </div>
                <div className = "startGroup">
                    <div className = "label startLabel">Interval start</div>
                    <input
                    className = "startInput"
                    value = {start}
                    onChange = {(e) => {handleChangeStart (e)}}
                    type = "datetime-local"
                    style = {{height: 30}}
                    spellCheck = {false}
                    />
                </div>
                <div className = "endGroup">
                    <div className = "label endLabel">Interval end</div>
                    <input
                    className = "endInput"
                    value = {end}
                    onChange = {(e) => {handleChangeEnd (e)}}
                    type = "datetime-local"
                    style = {{height: 30}}
                    spellCheck = {false}
                    />
                </div>
                <button
                className = "searchButton"
                onClick = {() => {handleSearch ()}}
                >
                    <img
                    className = "icon"
                    src = {process.env.PUBLIC_URL+"/search-icon.svg"}
                    />
                </button>
            </div>
            <div
            className = "logList"
            onScroll = {(e) => {handleLoadMore (e)}}
            >
                {
                    logs.map
                    (
                        (log, index) =>
                        {
                            return (
                                <div
                                className = "log"
                                key = {index}>
                                    <div
                                    className = "typeBox"
                                    style =
                                    {
                                        {
                                            backgroundColor: log.type === "Access" ? "#28cc28" : "#cc2828",
                                            borderColor: log.type === "Access" ? "#28cc28" : "#cc2828",
                                            color: log.type === "Access" ? "#0a330a" : "#330a0a"
                                        }
                                    }
                                    >
                                        <div className = "typeText">
                                            {log.type === "Access" ? "ACCESS" : "MISS"}
                                        </div>
                                    </div>
                                    <div className = "infoBox">
                                        <div className = "leftBox">
                                            <div className = "topInfo">
                                                <div className = "label userLabel">User</div>
                                                <div className = "user">{log.user}</div>
                                            </div>
                                            <div className = "middleInfo">
                                                <div className = "label lockLabel">Lock</div>
                                                <div className = "lock">{log.lock}</div>
                                            </div>
                                            <div className = "bottomInfo">
                                                <div className = "label roleLabel">Role</div>
                                                <div className = "role">{log.role}</div>
                                            </div>
                                        </div>
                                        <div className = "rightBox">
                                            <div className = "date">{convertDate (log.creationDate)}</div>
                                            <div className = "path">
                                                {
                                                    log.path.map
                                                    (
                                                        (item, index) =>
                                                        {
                                                            return (
                                                                <div
                                                                className = "itemName"
                                                                key = {index}
                                                                >
                                                                    <div>{item}</div>
                                                                    {
                                                                        typeof log.path[index+1] === "undefined" ?
                                                                        <></> :
                                                                        <div className = "rightArrow"/>
                                                                    }
                                                                </div>
                                                            );
                                                        }
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    )
                }
            </div>
        </div>
    );
}

export default LogList;