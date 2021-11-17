import React, {useState, useEffect, useContext} from "react";
import api from "../../services/api";
import {Redirect} from "react-router-dom";

import loggedAccountContext from "../contexts/loggedAccount";
import messageContext from "../contexts/message";
import overlayContext from "../contexts/overlay";

import "../../css/account/accountEdit.css";

function AccountEdit ()
{
    const {loggedAccount, setLoggedAccount} = useContext (loggedAccountContext);
    const {message, setMessage} = useContext (messageContext);
    const {overlay, setOverlay} = useContext (overlayContext);
    const [name, setName] = useState ("");
    const [email, setEmail] = useState ("");
    const [password, setPassword] = useState ("");
    const [showPassword, setShowPassword] = useState (false);
    const [confirmDelete, setConfirmDelete] = useState (false);
    const [hover, setHover] = useState ({button: ""});
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
            setOverlay (true);
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
            setOverlay (false);
            if (response.data === null)
            {
                setMessage ([{text: "An account with this e-mail already exists.", key: Math.random ()}]);
            }
            else
            {
                localStorage.setItem ("account", JSON.stringify (response.data));
                setLoggedAccount (response.data);
                setMessage ([{text: "Account successfully updated.", key: Math.random ()}]);
            }
        }
        else
        {
            setMessage ([{text: "Name, e-mail, and/or password are invalid.", key: Math.random ()}]);
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
        if (confirmDelete)
        {
            setOverlay (true);
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
            setOverlay (false);
            localStorage.clear ();
            setLoggedAccount (null);
            setRedirect (<Redirect to = "/enter"/>);
        }
        else
        {
            setConfirmDelete (true);
        }
    }

    return (
        <div className = "accountEditArea">
            <div className = "form">
                <div className = "label nameLabel">Name</div>
                <input
                className = "nameInput"
                value = {name}
                onChange = {(e) => {handleChangeName (e)}}
                spellCheck = {false}
                />
                <div className = "label emailLabel">E-mail</div>
                <input
                className = "emailInput"
                value = {email}
                onChange = {(e) => {handleChangeEmail (e)}}
                spellCheck = {false}
                />
                <div className = "label passwordLabel">Password</div>
                <div className = "passwordInputGroup">
                    <input
                    className = "passwordInput"
                    value = {password}
                    onChange = {(e) => {handleChangePassword (e)}}
                    type = {showPassword ? "text" : "password"}
                    spellCheck = {false}
                    />
                    <button
                    className = "showPasswordButton"
                    onClick = {() => {setShowPassword (!showPassword)}}
                    >
                        <img
                        className = "icon"
                        src = {showPassword ? process.env.PUBLIC_URL+"/hide-icon.svg" : process.env.PUBLIC_URL+"/show-icon.svg"}
                        />
                    </button>
                </div>
                <div className = "bottomBox">
                    <button
                    className = "fullButton updateButton"
                    onClick = {() => {handleUpdate ()}}
                    >
                        <img
                        className = "icon"
                        src = {process.env.PUBLIC_URL+"/save-icon.svg"}
                        />
                        <div className = "buttonText updatetext">
                            Save changes
                        </div>
                    </button>
                    <button
                    className = "fullButton logOutButton"
                    onClick = {() => {handleLogOut ()}}
                    >
                        <img
                        className = "icon"
                        src = {process.env.PUBLIC_URL+"/log-out-icon.svg"}
                        />
                        <div className = "buttonText logOutText">
                            Log out
                        </div>
                    </button>
                    <button
                    className = "fullButton cancelButton"
                    onClick = {() => {setConfirmDelete (false)}}
                    style = {{display: confirmDelete ? "flex" : "none"}}
                    >
                        <img
                        className = "icon"
                        src = {process.env.PUBLIC_URL+"/cancel-icon.svg"}
                        />
                        <div className = "buttonText cancelText">
                            Cancel
                        </div>
                    </button>
                    <button
                    className = "fullButton deleteButton"
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
                        <div
                        className = "buttonText deleteText"
                        style = {{color: confirmDelete ? "#ffffff" : "#000000"}}
                        >
                            Delete account
                        </div>
                    </button>
                </div>
            </div>
            <div className = "splash">
                <div className = "splashItems">
                    <div className = "logoContainer">
                        <img
                        className = "logo"
                        src = {process.env.PUBLIC_URL+"/logo-bordered.svg"}
                        />
                    </div>
                    <div className = "welcome">
                        Smart Lock
                    </div>
                    <div className = "welcome">
                        Manager
                    </div>
                </div>
            </div>
            {redirect}
        </div>
    );
}

export default AccountEdit;