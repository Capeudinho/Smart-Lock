import React, {useState, useEffect, useContext} from "react";
import api from "../../services/api";
import {Link, Redirect} from "react-router-dom";

import loggedAccountContext from "../contexts/loggedAccount";
import messageContext from "../contexts/message";
import editedUserContext from "../contexts/editedUser";
import deletedUserContext from "../contexts/deletedUser";

import "../../css/user/userList.css";

function UserList ()
{
    const {loggedAccount, setLoggedAccount} = useContext (loggedAccountContext);
    const {message, setMessage} = useContext (messageContext);
    const {editedUser, setEditedUser} = useContext (editedUserContext);
    const {deletedUser, setDeletedUser} = useContext (deletedUserContext);
    const [users, setUsers] = useState ([]);
    const [name, setName] = useState ("");
    const [page, setPage] = useState (1);
    const [pages, setPages] = useState (1);
    const [redirect, setRedirect] = useState (<></>);
    const [update, setUpdate] = useState (0);

    useEffect
    (
        () =>
        {
            let mounted = true;
            const runEffect = async () =>
            {
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

    function handleLoadMore ()
    {
        if (page < pages)
        {
            setPage (page+1);
        }
    }

    async function handleCreateUser ()
    {
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
        if (name === "" || response.data.name.toUpperCase ().includes (name.toUpperCase ()))
        {
            var newUsers = [...users];
            newUsers.unshift (response.data);
            setUsers (newUsers);
        }
        setMessage ({text: "User successfully created.", key: Math.random ()});
        setRedirect (<Redirect to = {`/users/${response.data._id}`}/>);
    }

    return (
        <div className = "userListArea">
            <div className = "topBox">
                <div className = "nameBox">
                    <div className = "label nameLabel">Name</div>
                    <input
                    value = {name}
                    onChange = {(e) => {handleChangeName (e)}}
                    />
                </div>
                <button
                className = "searchButton"
                onClick = {() => {handleSearch ()}}
                >
                    Search
                </button>
                <button
                className = "createUserButton"
                onClick = {() => {handleCreateUser ()}}
                >
                    Create user
                </button>
            </div>
            <div className = "userList">
                {
                    users.map
                    (
                        (user, index) =>
                        {
                            return (
                                <Link key = {index} to = {`/users/${user._id}`}>
                                    <button
                                    className = "userButton"
                                    key = {index}>
                                        {user.name}
                                    </button>
                                </Link>
                            )
                        }
                    )
                }
            </div>
            <div className = "bottomBox">
                <button
                className = "loadButton"
                style =
                {
                    {
                        backgroundColor: page === pages ? "#e5e5e5" : "#cccccc",
                        borderColor: page === pages ? "#e5e5e5" : "#cccccc",
                        color: page === pages ? "#7f7f7f" : "#000000"
                    }
                }
                onClick = {() => {handleLoadMore ()}}>
                    Load more
                </button>
            </div>
            {redirect}
        </div>
    );
}

export default UserList;