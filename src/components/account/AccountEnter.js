import React, {useState, useContext} from "react";
import api from "../../services/api";
import {Redirect} from "react-router-dom";

import loggedAccountContext from "../contexts/loggedAccount";

import "../../css/account/accountEnter.css";

function AccountEnter ()
{
    const {loggedAccount, setLoggedAccount} = useContext (loggedAccountContext);
    const [logInEmail, setLogInEmail] = useState ("");
    const [logInPassword, setLogInPassword] = useState ("");
    const [showLogInPassword, setShowLogInPassword] = useState (false);
    const [signUpName, setSignUpName] = useState ("");
    const [signUpEmail, setSignUpEmail] = useState ("");
    const [signUpPassword, setSignUpPassword] = useState ("");
    const [showSignUpPassword, setShowSignUpPassword] = useState (false);
    const [messages, setMessages] = useState ([]);
    const [redirect, setRedirect] = useState (<></>);

    function removeMessage ()
    {
        var newMessages = [...messages];
        newMessages.splice (-1, 1);
        setMessages (newMessages);
    }

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
            if (response.data === null)
            {
                var newMessages = [...messages];
                newMessages.unshift ({text: "E-mail, and/or password are incorrect.", key: Math.random ()});
                setMessages (newMessages);
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
            var newMessages = [...messages];
            newMessages.unshift ({text: "E-mail, and/or password are invalid.", key: Math.random ()});
            setMessages (newMessages);
        }
    }

    async function handleSignUp ()
    {
        const regularExpression = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (signUpName.length > 0 && regularExpression.test (signUpEmail.toLowerCase ()) && signUpPassword.length > 0)
        {
            const response = await api.post
            (
                "/accountstore",
                {
                    name: signUpName,
                    email: signUpEmail,
                    password: signUpPassword
                }
            );
            if (response.data === null)
            {
                var newMessages = [...messages];
                newMessages.unshift ({text: "An account with this e-mail already exists.", key: Math.random ()});
                setMessages (newMessages);
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
            var newMessages = [...messages];
            newMessages.unshift ({text: "Name, e-mail, and/or password are invalid.", key: Math.random ()});
            setMessages (newMessages);
        }
    }

    return (
        <div className = "accountEnterArea">
            <div className = "form">
                <div className = "title">Enter an existing account...</div>
                <div className = "label">E-mail</div>
                <input
                className = "emailInput"
                value = {logInEmail}
                onChange = {(e) => {handleChangeLogInEmail (e)}}
                />
                <div className = "label">Password</div>
                <div className = "passwordInputGroup">
                    <input
                    className = "passwordInput"
                    value = {logInPassword}
                    type = {showLogInPassword ? "text" : "password"}
                    onChange = {(e) => {handleChangeLogInPassword (e)}}
                    />
                    <button
                    className = "showPasswordButton"
                    style =
                    {
                        {
                            backgroundColor: showLogInPassword ? "#b2b2b2" : "#cccccc",
                            borderColor: showLogInPassword ? "#b2b2b2" : "#cccccc"
                        }
                    }
                    onClick = {() => {setShowLogInPassword (!showLogInPassword)}}
                    >
                        Show
                    </button>
                </div>
                <button
                className = "logInButton"
                onClick = {() => {handleLogIn ()}}
                >
                    Log in
                </button>
                <div className = "title">Create a new account...</div>
                <div className = "label">Name</div>
                <input
                className = "nameInput"
                value = {signUpName}
                onChange = {(e) => {handleChangeSignUpName (e)}}
                />
                <div className = "label">E-mail</div>
                <input
                className = "emailInput"
                value = {signUpEmail}
                onChange = {(e) => {handleChangeSignUpEmail (e)}}
                />
                <div className = "label">Password</div>
                <div className = "passwordInputGroup">
                    <input
                    className = "passwordInput"
                    value = {signUpPassword}
                    type = {showSignUpPassword ? "text" : "password"}
                    onChange = {(e) => {handleChangeSignUpPassword (e)}}
                    />
                    <button
                    className = "showPasswordButton"
                    style =
                    {
                        {
                            backgroundColor: showSignUpPassword ? "#b2b2b2" : "#cccccc",
                            borderColor: showSignUpPassword ? "#b2b2b2" : "#cccccc"
                        }
                    }
                    onClick = {() => {setShowSignUpPassword (!showSignUpPassword)}}
                    >
                        Show
                    </button>
                </div>
                <button
                className = "signUpButton"
                onClick = {() => {handleSignUp ()}}
                >
                    Sign up
                </button>
                <div
                className = "messages"
                >
                    {
                        messages.map
                        (
                            (message) =>
                            {
                                return (
                                    <div
                                    className = "message"
                                    key = {message.key}
                                    onAnimationEnd = {() => {removeMessage ()}}
                                    >
                                        {message.text}
                                    </div>
                                );
                            }
                        )
                    }
                </div>
            </div>
            <div className = "image">

            </div>
            {redirect}
        </div>
    );
}

export default AccountEnter;