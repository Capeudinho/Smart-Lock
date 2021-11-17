import React, {useState, useEffect} from "react";
import {Link} from "react-router-dom";

import "../../css/base/baseLeft.css";

function BaseLeft ()
{
    const [path, setPath] = useState ("");
    const [update, setUpdate] = useState (0);
    const [hoverButton, setHoverButton] = useState ("");

    useEffect
    (
        () =>
        {
            var newPath = window.location.pathname;
            newPath.split ("/");
            setPath (newPath);
        },
        [update]
    );

    return (
        <div className = "baseLeftArea">
            <Link to = "/">
                <button
                onClick = {() => {setUpdate (update+1);}}
                onMouseEnter = {() => {setHoverButton ("info")}}
                onMouseLeave = {() => {setHoverButton ("")}}
                style =
                {
                    {
                        backgroundColor:
                        path === "/" && hoverButton === "info" ?
                        "#52a3cc" :
                        path === "/" && hoverButton !== "info" ?
                        "#2996cc" :
                        path !== "/" && hoverButton === "info" ?
                        "#f2f2f2" :
                        "#e6e6e6",
                        borderColor:
                        path === "/" && hoverButton === "info" ?
                        "#52a3cc" :
                        path === "/" && hoverButton !== "info" ?
                        "#2996cc" :
                        path !== "/" && hoverButton === "info" ?
                        "#f2f2f2" :
                        "#e6e6e6"
                    }
                }
                >
                    <img
                    className = "icon"
                    src = {path === "/" ? process.env.PUBLIC_URL+"/info-white-icon.svg" : process.env.PUBLIC_URL+"/info-icon.svg"}
                    />
                </button>
            </Link>
            <Link to = "/users">
                <button
                onClick = {() => {setUpdate (update+1);}}
                onMouseEnter = {() => {setHoverButton ("users")}}
                onMouseLeave = {() => {setHoverButton ("")}}
                style =
                {
                    {
                        backgroundColor:
                        path === "/users" && hoverButton === "users" ?
                        "#52a3cc" :
                        path === "/users" && hoverButton !== "users" ?
                        "#2996cc" :
                        path !== "/users" && hoverButton === "users" ?
                        "#f2f2f2" :
                        "#e6e6e6",
                        borderColor:
                        path === "/users" && hoverButton === "users" ?
                        "#52a3cc" :
                        path === "/users" && hoverButton !== "users" ?
                        "#2996cc" :
                        path !== "/users" && hoverButton === "users" ?
                        "#f2f2f2" :
                        "#e6e6e6"
                    }
                }
                >
                    <img
                    className = "icon"
                    src = {path === "/users" ? process.env.PUBLIC_URL+"/user-white-icon.svg" : process.env.PUBLIC_URL+"/user-icon.svg"}
                    />
                </button>
            </Link>
            <Link to = "/items">
                <button
                onClick = {() => {setUpdate (update+1);}}
                onMouseEnter = {() => {setHoverButton ("items")}}
                onMouseLeave = {() => {setHoverButton ("")}}
                style =
                {
                    {
                        backgroundColor:
                        path === "/items" && hoverButton === "items" ?
                        "#52a3cc" :
                        path === "/items" && hoverButton !== "items" ?
                        "#2996cc" :
                        path !== "/items" && hoverButton === "items" ?
                        "#f2f2f2" :
                        "#e6e6e6",
                        borderColor:
                        path === "/items" && hoverButton === "items" ?
                        "#52a3cc" :
                        path === "/items" && hoverButton !== "items" ?
                        "#2996cc" :
                        path !== "/items" && hoverButton === "items" ?
                        "#f2f2f2" :
                        "#e6e6e6"
                    }
                }
                >
                    <img
                    className = "icon"
                    src = {path === "/items" ? process.env.PUBLIC_URL+"/item-white-icon.svg" : process.env.PUBLIC_URL+"/item-icon.svg"}
                    />
                </button>
            </Link>
            <Link to = "/roles">
                <button
                onClick = {() => {setUpdate (update+1);}}
                onMouseEnter = {() => {setHoverButton ("roles")}}
                onMouseLeave = {() => {setHoverButton ("")}}
                style =
                {
                    {
                        backgroundColor:
                        path === "/roles" && hoverButton === "roles" ?
                        "#52a3cc" :
                        path === "/roles" && hoverButton !== "roles" ?
                        "#2996cc" :
                        path !== "/roles" && hoverButton === "roles" ?
                        "#f2f2f2" :
                        "#e6e6e6",
                        borderColor:
                        path === "/roles" && hoverButton === "roles" ?
                        "#52a3cc" :
                        path === "/roles" && hoverButton !== "roles" ?
                        "#2996cc" :
                        path !== "/roles" && hoverButton === "roles" ?
                        "#f2f2f2" :
                        "#e6e6e6"
                    }
                }
                >
                    <img
                    className = "icon"
                    src = {path === "/roles" ? process.env.PUBLIC_URL+"/role-white-icon.svg" : process.env.PUBLIC_URL+"/role-icon.svg"}
                    />
                </button>
            </Link>
            <Link to = "/logs">
                <button
                onClick = {() => {setUpdate (update+1);}}
                onMouseEnter = {() => {setHoverButton ("logs")}}
                onMouseLeave = {() => {setHoverButton ("")}}
                style =
                {
                    {
                        backgroundColor:
                        path === "/logs" && hoverButton === "logs" ?
                        "#52a3cc" :
                        path === "/logs" && hoverButton !== "logs" ?
                        "#2996cc" :
                        path !== "/logs" && hoverButton === "logs" ?
                        "#f2f2f2" :
                        "#e6e6e6",
                        borderColor:
                        path === "/logs" && hoverButton === "logs" ?
                        "#52a3cc" :
                        path === "/logs" && hoverButton !== "logs" ?
                        "#2996cc" :
                        path !== "/logs" && hoverButton === "logs" ?
                        "#f2f2f2" :
                        "#e6e6e6"
                    }
                }
                >
                    <img
                    className = "icon"
                    src = {path === "/logs" ? process.env.PUBLIC_URL+"/log-white-icon.svg" : process.env.PUBLIC_URL+"/log-icon.svg"}
                    />
                </button>
            </Link>
            <Link to = "/connection">
                <button
                onClick = {() => {setUpdate (update+1);}}
                onMouseEnter = {() => {setHoverButton ("connection")}}
                onMouseLeave = {() => {setHoverButton ("")}}
                style =
                {
                    {
                        backgroundColor:
                        path === "/connection" && hoverButton === "connection" ?
                        "#52a3cc" :
                        path === "/connection" && hoverButton !== "connection" ?
                        "#2996cc" :
                        path !== "/connection" && hoverButton === "connection" ?
                        "#f2f2f2" :
                        "#e6e6e6",
                        borderColor:
                        path === "/connection" && hoverButton === "connection" ?
                        "#52a3cc" :
                        path === "/connection" && hoverButton !== "connection" ?
                        "#2996cc" :
                        path !== "/connection" && hoverButton === "connection" ?
                        "#f2f2f2" :
                        "#e6e6e6"
                    }
                }
                >
                    <img
                    className = "icon"
                    src = {path === "/connection" ? process.env.PUBLIC_URL+"/connection-white-icon.svg" : process.env.PUBLIC_URL+"/connection-icon.svg"}
                    />
                </button>
            </Link>
            <Link to = "/account">
                <button
                onClick = {() => {setUpdate (update+1);}}
                onMouseEnter = {() => {setHoverButton ("account")}}
                onMouseLeave = {() => {setHoverButton ("")}}
                style =
                {
                    {
                        backgroundColor:
                        path === "/account" && hoverButton === "account" ?
                        "#52a3cc" :
                        path === "/account" && hoverButton !== "account" ?
                        "#2996cc" :
                        path !== "/account" && hoverButton === "account" ?
                        "#f2f2f2" :
                        "#e6e6e6",
                        borderColor:
                        path === "/account" && hoverButton === "account" ?
                        "#52a3cc" :
                        path === "/account" && hoverButton !== "account" ?
                        "#2996cc" :
                        path !== "/account" && hoverButton === "account" ?
                        "#f2f2f2" :
                        "#e6e6e6"
                    }
                }
                >
                    <img
                    className = "icon"
                    src = {path === "/account" ? process.env.PUBLIC_URL+"/account-white-icon.svg" : process.env.PUBLIC_URL+"/account-icon.svg"}
                    />
                </button>
            </Link>
        </div>
    );
}

export default BaseLeft;