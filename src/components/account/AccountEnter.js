import React, {useState, useContext} from "react";
import api from "../../services/api";
import {Redirect} from "react-router-dom";

import loggedAccountContext from "../contexts/loggedAccount";
import messageContext from "../contexts/message";
import overlayContext from "../contexts/overlay";

import "../../css/account/accountEnter.css";

function AccountEnter ()
{
    const {loggedAccount, setLoggedAccount} = useContext (loggedAccountContext);
    const {message, setMessage} = useContext (messageContext);
    const {overlay, setOverlay} = useContext (overlayContext);
    const [logInEmail, setLogInEmail] = useState ("");
    const [logInPassword, setLogInPassword] = useState ("");
    const [showLogInPassword, setShowLogInPassword] = useState (false);
    const [signUpName, setSignUpName] = useState ("");
    const [signUpEmail, setSignUpEmail] = useState ("");
    const [signUpPassword, setSignUpPassword] = useState ("");
    const [showSignUpPassword, setShowSignUpPassword] = useState (false);
    const [redirect, setRedirect] = useState (<></>);

    function handleChangeLogInEmail (e)
    {
        setLogInEmail (e.target.value);
    }

    function handleChangeLogInPassword (e)
    {
        setLogInPassword (e.target.value);
    }

    function handleChangeSignUpName (e)
    {
        setSignUpName (e.target.value);
    }

    function handleChangeSignUpEmail (e)
    {
        setSignUpEmail (e.target.value);
    }

    function handleChangeSignUpPassword (e)
    {
        setSignUpPassword (e.target.value);
    }

    async function handleLogIn ()
    {
        const regularExpression = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (regularExpression.test (logInEmail.toLowerCase ()) && logInPassword.length > 0)
        {
            setOverlay (true);
            const response = await api.get
            (
                "/accountloginindex",
                {
                    params:
                    {
                        email: logInEmail,
                        password: logInPassword
                    }
                }
            );
            setOverlay (false);
            if (response.data === null)
            {
                setMessage ([{text: "E-mail, and/or password are incorrect.", key: Math.random ()}]);
            }
            else
            {
                localStorage.setItem ("account", JSON.stringify (response.data));
                setLoggedAccount (response.data);
                setRedirect (<Redirect to = "/"/>);
            }
        }
        else
        {
            setMessage ([{text: "E-mail, and/or password are invalid.", key: Math.random ()}]);
        }
    }

    async function handleSignUp ()
    {
        const regularExpression = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (signUpName.length > 0 && regularExpression.test (signUpEmail.toLowerCase ()) && signUpPassword.length > 0)
        {
            setOverlay (true);
            const response = await api.post
            (
                "/accountstore",
                {
                    name: signUpName,
                    email: signUpEmail,
                    password: signUpPassword
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
                setRedirect (<Redirect to = "/"/>);
            }
        }
        else
        {
            setMessage ([{text: "Name, e-mail, and/or password are invalid.", key: Math.random ()}]);
        }
    }

    return (
        <div className = "accountEnterArea">
            <div className = "form">
                <div className = "title">Log in</div>
                <div className = "label">E-mail</div>
                <input
                className = "emailInput"
                value = {logInEmail}
                onChange = {(e) => {handleChangeLogInEmail (e)}}
                spellCheck = {false}
                />
                <div className = "label">Password</div>
                <div className = "passwordInputGroup">
                    <input
                    className = "passwordInput"
                    value = {logInPassword}
                    onChange = {(e) => {handleChangeLogInPassword (e)}}
                    type = {showLogInPassword ? "text" : "password"}
                    spellCheck = {false}
                    />
                    <button
                    className = "showPasswordButton"
                    onClick = {() => {setShowLogInPassword (!showLogInPassword)}}
                    >
                        <img
                        className = "icon"
                        src = {showLogInPassword ? process.env.PUBLIC_URL+"/hide-icon.svg" : process.env.PUBLIC_URL+"/show-icon.svg"}
                        />
                    </button>
                </div>
                <button
                className = "logInButton fullButton"
                onClick = {() => {handleLogIn ()}}
                >
                    <img
                    className = "icon"
                    src = {process.env.PUBLIC_URL+"/log-in-icon.svg"}
                    />
                    <div className = "buttonText">
                        Log in
                    </div>
                </button>
                <div className = "title">Sign up</div>
                <div className = "label">Name</div>
                <input
                className = "nameInput"
                value = {signUpName}
                onChange = {(e) => {handleChangeSignUpName (e)}}
                spellCheck = {false}
                />
                <div className = "label">E-mail</div>
                <input
                className = "emailInput"
                value = {signUpEmail}
                onChange = {(e) => {handleChangeSignUpEmail (e)}}
                spellCheck = {false}
                />
                <div className = "label">Password</div>
                <div className = "passwordInputGroup">
                    <input
                    className = "passwordInput"
                    value = {signUpPassword}
                    onChange = {(e) => {handleChangeSignUpPassword (e)}}
                    type = {showSignUpPassword ? "text" : "password"}
                    spellCheck = {false}
                    />
                    <button
                    className = "showPasswordButton"
                    onClick = {() => {setShowSignUpPassword (!showSignUpPassword)}}
                    >
                        <img
                        className = "icon"
                        src = {showSignUpPassword ? process.env.PUBLIC_URL+"/hide-icon.svg" : process.env.PUBLIC_URL+"/show-icon.svg"}
                        />
                    </button>
                </div>
                <button
                className = "signUpButton fullButton"
                onClick = {() => {handleSignUp ()}}
                >
                    <img
                    className = "icon"
                    src = {process.env.PUBLIC_URL+"/sign-up-icon.svg"}
                    />
                    <div className = "buttonText">
                        Sign up
                    </div>
                </button>
            </div>
            <div className = "splash">
                <div className = "splashItems">
                    <div className = "welcome">
                        Welcome to
                    </div>
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

export default AccountEnter;