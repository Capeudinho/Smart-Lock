import React, {useState, useEffect, useContext} from "react";
import api from "../../services/api";
import {Redirect} from "react-router-dom";

import loggedAccountContext from "../contexts/loggedAccount";
import messageContext from "../contexts/message";

import "../../css/account/accountEdit.css";

function AccountEdit ()
{
    const {loggedAccount, setLoggedAccount} = useContext (loggedAccountContext);
    const {message, setMessage} = useContext (messageContext);
    const [name, setName] = useState ("");
    const [email, setEmail] = useState ("");
    const [password, setPassword] = useState ("");
    const [showPassword, setShowPassword] = useState (false);
    const [redirect, setRedirect] = useState (<></>);

    useEffect
    (
        () =>
        {
            if (loggedAccount !== null)
            {
                setName (loggedAccount.name);
                setEmail (loggedAccount.email);
                setPassword (loggedAccount.password);
            }
        },
        [loggedAccount]
    );

    function handleChangeName (e)
    {
        setName (e.target.value);
    }

    function handleChangeEmail (e)
    {
        setEmail (e.target.value);
    }

    function handleChangePassword (e)
    {
        setPassword (e.target.value);
    }

    async function handleUpdate ()
    {
        const regularExpression = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (name.length > 0 && regularExpression.test (email.toLowerCase ()) && password.length > 0)
        {
            const response = await api.put
            (
                "/accountidupdate",
                {
                    name,
                    email,
                    password
                },
                {
                    params:
                    {
                        _id: loggedAccount._id
                    }
                }
            );
            if (response.data === null)
            {
                setMessage ({text: "An account with this e-mail already exists.", key: Math.random ()});
            }
            else
            {
                localStorage.setItem ("account", JSON.stringify (response.data));
                setLoggedAccount (response.data);
                setMessage ({text: "Account successfully updated.", key: Math.random ()});
            }
        }
        else
        {
            setMessage ({text: "Name, e-mail, and/or password are invalid.", key: Math.random ()});
        }
    }

    function handleLogOut ()
    {
        localStorage.clear ();
        setLoggedAccount (null);
        setRedirect (<Redirect to = "/enter"/>);
    }

    async function handleDelete ()
    {
        await api.delete
        (
            "/accountiddestroy",
            {
                params:
                {
                    _id: loggedAccount._id
                }
            }
        );
        localStorage.clear ();
        setLoggedAccount (null);
        setRedirect (<Redirect to = "/enter"/>);
    }

    return (
        <div className = "accountEditArea">
            <div className = "form">
                <div className = "label nameLabel">Name</div>
                <input
                className = "nameInput"
                value = {name}
                onChange = {(e) => {handleChangeName (e)}}
                />
                <div className = "label emailLabel">E-mail</div>
                <input
                className = "emailInput"
                value = {email}
                onChange = {(e) => {handleChangeEmail (e)}}
                />
                <div className = "label passwordLabel">Password</div>
                <div className = "passwordInputGroup">
                    <input
                    className = "passwordInput"
                    value = {password}
                    type = {showPassword ? "text" : "password"}
                    onChange = {(e) => {handleChangePassword (e)}}
                    />
                    <button
                    className = "showPasswordButton"
                    style =
                    {
                        {
                            backgroundColor: showPassword ? "#b2b2b2" : "#cccccc",
                            borderColor: showPassword ? "#b2b2b2" : "#cccccc"
                        }
                    }
                    onClick = {() => {setShowPassword (!showPassword)}}
                    >
                        Show
                    </button>
                </div>
                <button
                className = "updateButton"
                onClick = {() => {handleUpdate ()}}
                >
                    Save changes
                </button>
                <button
                className = "logOutButton"
                onClick = {() => {handleLogOut ()}}
                >
                    Log out
                </button>
                <button
                className = "deleteButton"
                onClick = {() => {handleDelete ()}}
                >
                    Delete account
                </button>
            </div>
            <div className = "image">

            </div>
            {redirect}
        </div>
    );
}

export default AccountEdit;