import React, {useState, useEffect, useContext} from "react";
import api from "../../services/api";
import {Link, Redirect} from "react-router-dom";

import loggedAccountContext from "../contexts/loggedAccount";
import accountRolesContext from "../contexts/accountRoles";
import messageContext from "../contexts/message";
import editedRoleContext from "../contexts/editedRole";
import deletedRoleContext from "../contexts/deletedRole";

import "../../css/role/roleList.css";

function RoleList ()
{
    const {loggedAccount, setLoggedAccount} = useContext (loggedAccountContext);
    const {accountRoles, setAccountRoles} = useContext (accountRolesContext);
    const {message, setMessage} = useContext (messageContext);
    const {editedRole, setEditedRole} = useContext (editedRoleContext);
    const {deletedRole, setDeletedRole} = useContext (deletedRoleContext);
    const [roles, setRoles] = useState ([]);
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

    function handleLoadMore ()
    {
        if (page < pages)
        {
            setPage (page+1);
        }
    }

    async function handleCreateRole ()
    {
        const response = await api.post
        (
            "/rolestore",
            {
                name: "New role",
                times: [],
                owner: loggedAccount._id
            }
        );
        var newAccountRoles = [...accountRoles];
        newAccountRoles.unshift (response.data);
        setAccountRoles (newAccountRoles);
        if (name === "" || response.data.name.toUpperCase ().includes (name.toUpperCase ()))
        {
            var newRoles = [...roles];
            newRoles.unshift (response.data);
            setRoles (newRoles);
        }
        setMessage ({text: "Role successfully created.", key: Math.random ()});
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
                    />
                </div>
                <button
                className = "searchButton"
                onClick = {() => {handleSearch ()}}
                >
                    Search
                </button>
                <button
                className = "createRoleButton"
                onClick = {() => {handleCreateRole ()}}
                >
                    Create role
                </button>
            </div>
            <div className = "roleList">
                {
                    roles.map
                    (
                        (role, index) =>
                        {
                            return (
                                <Link key = {index} to = {`/roles/${role._id}`}>
                                    <button
                                    className = "roleButton"
                                    key = {index}>
                                        {role.name}
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

export default RoleList;