import React, {useState, useEffect} from "react";
import api from "../services/api";
import {BrowserRouter, Route, Switch, Redirect} from "react-router-dom";

import "../css/routes.css";

import Home from "./home/Home";
import AccountEnter from "./account/AccountEnter";
import AccountEdit from "./account/AccountEdit";
import BaseTop from "./base/BaseTop";
import BaseLeft from "./base/BaseLeft";
import BaseCenter from "./base/BaseCenter";
import BaseRight from "./base/BaseRight";
import UserList from "./user/UserList";
import UserInfo from "./user/UserInfo";
import ItemExplorer from "./item/ItemExplorer";
import ItemList from "./item/ItemList";
import ItemInfo from "./item/ItemInfo";
import RoleList from "./role/RoleList";
import RoleInfo from "./role/RoleInfo";
import LogList from "./log/LogList";

import loggedAccountContext from "./contexts/loggedAccount";
import accountRolesContext from "./contexts/accountRoles";
import messageContext from "./contexts/message";
import editedUserContext from "./contexts/editedUser";
import deletedUserContext from "./contexts/deletedUser";
import createdItemContext from "./contexts/createdItem";
import editedItemContext from "./contexts/editedItem";
import movedItemContext from "./contexts/movedItem";
import deletedItemContext from "./contexts/deletedItem";
import editedRoleContext from "./contexts/editedRole";
import deletedRoleContext from "./contexts/deletedRole";

function Routes ()
{
    const [loggedAccount, setLoggedAccount] = useState ({name: "", email: "", password: "", _id: ""});
    const [accountRoles, setAccountRoles] = useState ([]);
    const [message, setMessage] = useState (null);
    const [editedUser, setEditedUser] = useState ({});
    const [deletedUser, setDeletedUser] = useState ({});
    const [createdItem, setCreatedItem] = useState ({});
    const [editedItem, setEditedItem] = useState ({});
    const [movedItem, setMovedItem] = useState ({});
    const [deletedItem, setDeletedItem] = useState ({});
    const [editedRole, setEditedRole] = useState ({});
    const [deletedRole, setDeletedRole] = useState ({});
    const [redirect, setRedirect] = useState (<></>);

    useEffect
    (
        () =>
        {
            let mounted = true;
            const runEffect = async () =>
            {
                if (localStorage.getItem ("account") !== null)
                {
                    const account = JSON.parse (localStorage.getItem ("account"));
                    const response = await api.get
                    (
                        "/accountloginindex",
                        {
                            params:
                            {
                                email: account.email,
                                password: account.password
                            }
                        }
                    );
                    if (response.data === null)
                    {
                        localStorage.clear ();
                        setRedirect (<Redirect to = "/enter"/>);
                    }
                    else
                    {
                        setLoggedAccount (response.data);
                    }
                }
                else
                {
                    setRedirect (<Redirect to = "/enter"/>);
                }
            }
            runEffect();
            return (() => {mounted = false});
        },
        []
    );

    useEffect
    (
        () =>
        {
            let mounted = true;
            const runEffect = async () =>
            {
                if (loggedAccount !== undefined)
                {
                    if (loggedAccount !== null)
                    {
                        const response = await api.get
                        (
                            "/rolelist",
                            {
                                params:
                                {
                                    owner: loggedAccount._id
                                }
                            }
                        );
                        if (mounted)
                        {
                            setAccountRoles (response.data);
                        }
                    }
                    else
                    {
                        setAccountRoles ([]);
                    }
                }
            }
            runEffect ();
            return (() => {mounted = false;});
        },
        [loggedAccount]
    );

    return (
        <div className = "routes">
            <BrowserRouter>
                <loggedAccountContext.Provider value = {{loggedAccount, setLoggedAccount}}>
                <accountRolesContext.Provider value = {{accountRoles, setAccountRoles}}>
                <messageContext.Provider value = {{message, setMessage}}>
                <editedUserContext.Provider value = {{editedUser, setEditedUser}}>
                <deletedUserContext.Provider value = {{deletedUser, setDeletedUser}}>
                <createdItemContext.Provider value = {{createdItem, setCreatedItem}}>
                <editedItemContext.Provider value = {{editedItem, setEditedItem}}>
                <movedItemContext.Provider value = {{movedItem, setMovedItem}}>
                <deletedItemContext.Provider value = {{deletedItem, setDeletedItem}}>
                <editedRoleContext.Provider value = {{editedRole, setEditedRole}}>
                <deletedRoleContext.Provider value = {{deletedRole, setDeletedRole}}>
                    <Switch>
                        <Route
                        exact
                        path = "/"
                        render =
                        {
                            () =>
                            {
                                return (
                                    <div className = "area">
                                        <div className = "topSection">
                                            <BaseTop/>
                                        </div>
                                        <div className = "otherBottomSection">
                                            <div className = "mainSection leftSection">
                                                <BaseLeft/>
                                            </div>
                                            <div className = "mainSection fullSection">
                                                <Home/>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        }
                        />
                        <Route path = "/enter" component = {AccountEnter}/>
                        <Route
                        path = "/account"
                        render =
                        {
                            () =>
                            {
                                return (
                                    <div className = "area">
                                        <div className = "topSection">
                                            <BaseTop/>
                                        </div>
                                        <div className = "otherBottomSection">
                                            <div className = "mainSection leftSection">
                                                <BaseLeft/>
                                            </div>
                                            <div className = "mainSection fullSection">
                                                <AccountEdit/>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        }
                        />
                        <Route
                        path = "/logs"
                        render =
                        {
                            () =>
                            {
                                return (
                                    <div className = "area">
                                        <div className = "topSection">
                                            <BaseTop/>
                                        </div>
                                        <div className = "otherBottomSection">
                                            <div className = "mainSection leftSection">
                                                <BaseLeft/>
                                            </div>
                                            <div className = "mainSection fullSection">
                                                <LogList/>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        }
                        />
                        <Route
                        path = "/"
                        render =
                        {
                            () =>
                            {
                                return (
                                    <div className = "area">
                                        <div className = "topSection">
                                            <BaseTop/>
                                        </div>
                                        <div className = "bottomSection">
                                            <div className = "mainSection leftSection">
                                                <BaseLeft/>
                                            </div>
                                            <div className = "mainSection centerSection">
                                                <Route exact path = "/" component = {BaseCenter}/>
                                                <Route path = "/users" component = {UserList}/>
                                                <Route path = "/items">
                                                    <div className = "itemCenterArea">
                                                        <Route path = "/items" component = {ItemExplorer}/>
                                                        <Switch>
                                                            <Route path = "/items/item" component = {ItemList}/>
                                                            <Route path = "/items/:id" component = {ItemList}/>
                                                            <Route path = "/items" component = {ItemList}/>
                                                        </Switch>
                                                    </div>
                                                </Route>
                                                <Route path = "/roles" component = {RoleList}/>
                                            </div>
                                            <div className = "mainSection rightSection">
                                                <Route exact path = "/" component = {BaseRight}/>
                                                <Route path = "/users/:id" component = {UserInfo}/>
                                                <Switch>
                                                    <Route path = "/items/item/:id" component = {ItemInfo}/>
                                                    <Route path = "/items/:otherid/item/:id" component = {ItemInfo}/>
                                                    <Route path = "/items" component = {BaseRight}/>
                                                </Switch>
                                                <Route path = "/roles/:id" component = {RoleInfo}/>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        }
                        />
                    </Switch>
                </deletedRoleContext.Provider>
                </editedRoleContext.Provider>
                </deletedItemContext.Provider>
                </movedItemContext.Provider>
                </editedItemContext.Provider>
                </createdItemContext.Provider>
                </deletedUserContext.Provider>
                </editedUserContext.Provider>
                </messageContext.Provider>
                </accountRolesContext.Provider>
                </loggedAccountContext.Provider>
                {redirect}
            </BrowserRouter>
        </div>
    );
}

export default Routes;