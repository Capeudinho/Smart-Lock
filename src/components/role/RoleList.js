import React, {useState, useEffect, useContext} from "react";
import api from "../../services/api";
import {Link, Redirect} from "react-router-dom";

import loggedAccountContext from "../contexts/loggedAccount";
import accountRolesContext from "../contexts/accountRoles";
import messageContext from "../contexts/message";
import overlayContext from "../contexts/overlay";
import editedRoleContext from "../contexts/editedRole";
import deletedRoleContext from "../contexts/deletedRole";

import "../../css/role/roleList.css";

function RoleList ()
{
    const {loggedAccount, setLoggedAccount} = useContext (loggedAccountContext);
    const {accountRoles, setAccountRoles} = useContext (accountRolesContext);
    const {message, setMessage} = useContext (messageContext);
    const {overlay, setOverlay} = useContext (overlayContext);
    const {editedRole, setEditedRole} = useContext (editedRoleContext);
    const {deletedRole, setDeletedRole} = useContext (deletedRoleContext);
    const [roles, setRoles] = useState ([]);
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
                    "/rolelistpag",
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
                        setRoles (response.data.docs);
                    }
                    else
                    {
                        setRoles ([...roles, ...response.data.docs]);
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
            if (editedRole !== {})
            {
                var newRoles = [...roles];
                for (var a = 0; a < newRoles.length; a++)
                {
                    if (newRoles[a]._id === editedRole._id)
                    {
                        if (name === "" || editedRole.name.toUpperCase ().includes (name.toUpperCase ()))
                        {
                            newRoles[a] = editedRole;
                        }
                        else
                        {
                            newRoles.splice (a, 1);
                        }
                    }
                }
                setRoles (newRoles);
            }
        },
        [editedRole]
    );

    useEffect
    (
        () =>
        {
            if (deletedRole !== {})
            {
                var newRoles = [...roles];
                for (var a = 0; a < newRoles.length; a++)
                {
                    if (newRoles[a]._id === deletedRole._id)
                    {
                        newRoles.splice (a, 1);
                    }
                }
                setRoles (newRoles);
            }
        },
        [deletedRole]
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

    async function handleCreateRole ()
    {
        setOverlay (true);
        const response = await api.post
        (
            "/rolestore",
            {
                name: "New role",
                times: [],
                owner: loggedAccount._id
            }
        );
        setOverlay (false);
        var newAccountRoles = [...accountRoles];
        newAccountRoles.unshift (response.data);
        setAccountRoles (newAccountRoles);
        if (name === "" || response.data.name.toUpperCase ().includes (name.toUpperCase ()))
        {
            var newRoles = [...roles];
            newRoles.unshift (response.data);
            setRoles (newRoles);
        }
        setMessage ([{text: "Role successfully created.", key: Math.random ()}]);
        setRedirect (<Redirect to = {`/roles/${response.data._id}`}/>);
    }

    return (
        <div className = "roleListArea">
            <div className = "topBox">
                <div className = "nameGroup">
                    <div className = "label nameLabel">Name</div>
                    <input
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
                className = "createRoleButton"
                onClick = {() => {handleCreateRole ()}}
                >
                    <img
                    className = "icon"
                    src = {process.env.PUBLIC_URL+"/create-role-icon.svg"}
                    />
                </button>
            </div>
            <div
            className = "roleList"
            onScroll = {(e) => {handleLoadMore (e)}}
            >
                {
                    roles.map
                    (
                        (role, index) =>
                        {
                            return (
                                <Link
                                className = "roleLink"
                                key = {index}
                                onMouseEnter = {() => {setHover ({button: role._id})}}
                                onMouseLeave = {() => {setHover ({button: ""})}}
                                to = {`/roles/${role._id}`}
                                >
                                    <div
                                    className = "iconBox"
                                    style =
                                    {
                                        {
                                            backgroundColor:
                                            hover.button === role._id ?
                                            "#f2f2f2" :
                                            "#e6e6e6",
                                            borderColor:
                                            hover.button === role._id ?
                                            "#f2f2f2" :
                                            "#e6e6e6"
                                        }
                                    }
                                    >
                                        <img
                                        className = "icon"
                                        src = {process.env.PUBLIC_URL+"/role-grey-icon.svg"}
                                        />
                                    </div>
                                    <button
                                    className = "roleButton"
                                    key = {index}
                                    style =
                                    {
                                        {
                                            backgroundColor:
                                            hover.button === role._id ?
                                            "#f2f2f2" :
                                            "#ffffff",
                                            borderColor:
                                            hover.button === role._id ?
                                            "#f2f2f2" :
                                            "#e6e6e6"
                                        }
                                    }
                                    >
                                        {role.name}
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

export default RoleList;