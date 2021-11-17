import React, {useState, useEffect, useContext} from "react";
import api from "../../services/api";
import {Link, Redirect} from "react-router-dom";

import loggedAccountContext from "../contexts/loggedAccount";
import messageContext from "../contexts/message";
import overlayContext from "../contexts/overlay";
import editedUserContext from "../contexts/editedUser";
import deletedUserContext from "../contexts/deletedUser";

import "../../css/user/userList.css";

function UserList ()
{
    const {loggedAccount, setLoggedAccount} = useContext (loggedAccountContext);
    const {message, setMessage} = useContext (messageContext);
    const {overlay, setOverlay} = useContext (overlayContext);
    const {editedUser, setEditedUser} = useContext (editedUserContext);
    const {deletedUser, setDeletedUser} = useContext (deletedUserContext);
    const [users, setUsers] = useState ([]);
    const [name, setName] = useState ("");
    const [page, setPage] = useState (1);
    const [pages, setPages] = useState (1);
    const [hover, setHover] = useState ({button: ""});
    const [redirect, setRedirect] = useState (<></>);
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
                    "/userlistpag",
                    {
                        params:
                        {
                            page,
                            name,
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
                        setUsers (response.data.docs);
                    }
                    else
                    {
                        setUsers ([...users, ...response.data.docs]);
                    }
                }
            }
            runEffect ();
            return (() => {mounted = false;});
        },
        [loggedAccount, page, update]
    );

    useEffect
    (
        () =>
        {
            if (editedUser !== {})
            {
                var newUsers = [...users];
                for (var a = 0; a < newUsers.length; a++)
                {
                    if (newUsers[a]._id === editedUser._id)
                    {
                        if (name === "" || editedUser.name.toUpperCase ().includes (name.toUpperCase ()))
                        {
                            newUsers[a] = editedUser;
                        }
                        else
                        {
                            newUsers.splice (a, 1);
                        }
                    }
                }
                setUsers (newUsers);
            }
        },
        [editedUser]
    );

    useEffect
    (
        () =>
        {
            if (deletedUser !== {})
            {
                var newUsers = [...users];
                for (var a = 0; a < newUsers.length; a++)
                {
                    if (newUsers[a]._id === deletedUser._id)
                    {
                        newUsers.splice (a, 1);
                    }
                }
                setUsers (newUsers);
            }
        },
        [deletedUser]
    );

    function handleChangeName (e)
    {
        setName (e.target.value);
    }

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
        if (e.target.scrollHeight-e.target.scrollTop <= e.target.clientHeight*1.2 && page < pages)
        {
            setPage (page+1);
        }
    }

    async function handleCreateUser ()
    {
        setOverlay (true);
        const response = await api.post
        (
            "/userstore",
            {
                name: "New user",
                PINs: [],
                roles: [],
                usedTimes: [],
                owner: loggedAccount._id
            }
        );
        setOverlay (false);
        if (name === "" || response.data.name.toUpperCase ().includes (name.toUpperCase ()))
        {
            var newUsers = [...users];
            newUsers.unshift (response.data);
            setUsers (newUsers);
        }
        setMessage ([{text: "User successfully created.", key: Math.random ()}]);
        setRedirect (<Redirect to = {`/users/${response.data._id}`}/>);
    }

    return (
        <div className = "userListArea">
            <div className = "topBox">
                <div className = "nameBox">
                    <div className = "label nameLabel">Name</div>
                    <input
                    className = "nameInput"
                    value = {name}
                    onChange = {(e) => {handleChangeName (e)}}
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
                <button
                className = "createUserButton"
                onClick = {() => {handleCreateUser ()}}
                >
                    <img
                    className = "icon"
                    src = {process.env.PUBLIC_URL+"/create-user-icon.svg"}
                    />
                </button>
            </div>
            <div
            className = "userList"
            onScroll = {(e) => {handleLoadMore (e)}}
            >
                {
                    users.map
                    (
                        (user, index) =>
                        {
                            return (
                                <Link
                                className = "userLink"
                                key = {index}
                                onMouseEnter = {() => {setHover ({button: user._id})}}
                                onMouseLeave = {() => {setHover ({button: ""})}}
                                to = {`/users/${user._id}`}
                                >
                                    <div
                                    className = "iconBox"
                                    style =
                                    {
                                        {
                                            backgroundColor:
                                            hover.button === user._id ?
                                            "#f2f2f2" :
                                            "#e6e6e6",
                                            borderColor:
                                            hover.button === user._id ?
                                            "#f2f2f2" :
                                            "#e6e6e6"
                                        }
                                    }
                                    >
                                        <img
                                        className = "icon"
                                        src = {process.env.PUBLIC_URL+"/user-grey-icon.svg"}
                                        />
                                    </div>
                                    <button
                                    className = "userButton"
                                    key = {index}
                                    style =
                                    {
                                        {
                                            backgroundColor:
                                            hover.button === user._id ?
                                            "#f2f2f2" :
                                            "#ffffff",
                                            borderColor:
                                            hover.button === user._id ?
                                            "#f2f2f2" :
                                            "#e6e6e6"
                                        }
                                    }
                                    >
                                        {user.name}
                                    </button>
                                </Link>
                            )
                        }
                    )
                }
            </div>
            {redirect}
        </div>
    );
}

export default UserList;