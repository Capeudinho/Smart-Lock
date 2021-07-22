import React, {useState, useEffect, useContext} from "react";
import api from "../../services/api";
import {Link, Redirect} from "react-router-dom";

import loggedAccountContext from "../contexts/loggedAccount";
import messageContext from "../contexts/message";
import createdItemContext from "../contexts/createdItem";
import editedItemContext from "../contexts/editedItem";
import movedItemContext from "../contexts/movedItem";
import deletedItemContext from "../contexts/deletedItem";

import "../../css/item/itemList.css";

function ItemList ({match, location})
{
    const {loggedAccount, setLoggedAccount} = useContext (loggedAccountContext);
    const {message, setMessage} = useContext (messageContext);
    const {createdItem, setCreatedItem} = useContext (createdItemContext);
    const {editedItem, setEditedItem} = useContext (editedItemContext);
    const {movedItem, setMovedItem} = useContext (movedItemContext);
    const {deletedItem, setDeletedItem} = useContext (deletedItemContext);
    const [items, setItems] = useState ([]);
    const [name, setName] = useState ("");
    const [page, setPage] = useState (1);
    const [pages, setPages] = useState (1);
    const [listType, setListType] = useState (true);
    const [pathInfos, setPathInfos] = useState ([]);
    const [redirect, setRedirect] = useState (<></>);

    useEffect
    (
        () =>
        {
            if (match.params.hasOwnProperty ("id"))
            {
                getItems (true, 1);
                setPage (1);
                setListType (true);
            }
        },
        [match.url, loggedAccount]
    );

    useEffect
    (
        () =>
        {
            if (editedItem !== {})
            {
                var newItems = [...items];
                var newPathInfos = [...pathInfos];
                for (var a = 0; a < newItems.length; a++)
                {
                    if (newItems[a]._id === editedItem._id)
                    {
                        if (listType || name === "" || editedItem.name.toUpperCase ().includes (name.toUpperCase ()))
                        {
                            if (newItems[a].hasOwnProperty ("parentInfos")) // or 'if (listType)'
                            {
                                var parentInfos = newItems[a].parentInfos;
                                parentInfos[parentInfos.length-1].name = editedItem.name;
                            }
                            newItems[a] = editedItem;
                            if (parentInfos !== undefined)
                            {
                                newItems[a].parentInfos = parentInfos;
                            }
                        }
                        else
                        {
                            newItems.splice (a, 1);
                            a--;
                        }
                    }
                    else if (newItems[a].hasOwnProperty ("parentInfos")) // or 'if (listType)'
                    {
                        for (var b = 0; b < newItems[a].parentInfos.length; b++)
                        {
                            if (newItems[a].parentInfos[b]._id === editedItem._id)
                            {
                                newItems[a].parentInfos[b].name = editedItem.name;
                            }
                        }
                    }
                }
                for (var c = 0; c < pathInfos.length; c++)
                {
                    if (pathInfos[c]._id === editedItem._id)
                    {
                        pathInfos[c].name = editedItem.name;
                    }
                }
                setItems (newItems);
                setPathInfos (newPathInfos);
            }
        },
        [editedItem]
    );

    useEffect
    (
        () =>
        {
            if (movedItem !== {})
            {
                var newItems = [...items];
                newItems.unshift (movedItem);
                setItems (newItems);
            }
        },
        [movedItem]
    );

    useEffect
    (
        () =>
        {
            if (deletedItem !== {})
            {
                var newItems = [...items];
                for (var a = 0; a < newItems.length; a++)
                {
                    if (newItems[a]._id === deletedItem._id)
                    {
                        newItems.splice (a, 1);
                        a--;
                    }
                    else if (newItems[a].hasOwnProperty ("parentInfos")) // or 'if (listType)'
                    {
                        for (var b = 0; b < newItems[a].parentInfos.length; b++)
                        {
                            if (newItems[a].parentInfos[b]._id === editedItem._id)
                            {
                                newItems.splice (a, 1);
                                a--;
                            }
                        }
                    }
                }
                setItems (newItems);
            }
        },
        [deletedItem]
    );

    function newUrl (_id)
    {
        var url = location.pathname;
        var array = url.split ("/");
        if (array[2] === undefined)
        {
            array[2] = "item";
            array[3] = _id;
        }
        else if (array[2] === "item")
        {
            array[3] = _id;
        }
        else
        {
            array[3] = "item";
            array[4] = _id;
        }
        url = array.join ("/");
        return url;
    }

    function searchUrl ()
    {
        var url = location.pathname;
        var array = url.split ("/");
        if (array[2] !== "item" && array[2] !== undefined)
        {
            array.splice (2, 1);
        }
        url = array.join ("/");
        return url;
    }

    function newItemUrl (_id)
    {
        var url = location.pathname;
        var array = url.split ("/");
        array[3] = "item";
        array[4] = _id;
        url = array.join ("/");
        return url;
    }

    function newPathUrl (_id)
    {
        var url = location.pathname;
        var array = url.split ("/");
        if (array[2] === "item")
        {
            array.splice (2, 0, _id);
        }
        else
        {
            array[2] = _id;
        }
        url = array.join ("/");
        return url;
    }

    async function getItems (type, page)
    {
        if (type)
        {
            var response = await api.get
            (
                "/itemparentindexpag",
                {
                    params:
                    {
                        page,
                        parent: match.params.id
                    }
                }
            );
            if (page > 1)
            {
                setItems ([...items, ...response.data.items.docs]);
            }
            else
            {
                setItems (response.data.items.docs);
            }
            setPages (response.data.items.pages);
            setPathInfos (response.data.parentInfos);
        }
        else
        {
            var response = await api.get
            (
                "/itemlistpag",
                {
                    params:
                    {
                        page,
                        name,
                        owner: loggedAccount._id
                    }
                }
            );
            if (page === 1)
            {
                setItems (response.data.docs);
            }
            else
            {
                setItems ([...items, ...response.data.docs]);
            }
            setPathInfos ([]);
            setPages (response.data.pages);
        }
    }

    function handleLoadMore ()
    {
        if (page < pages)
        {
            getItems (listType, page+1);
            setPage (page+1);
        }
    }

    async function handleSearch ()
    {
        getItems (false, 1);
        setPage (1);
        setListType (false);
    }

    function handleChangeName (e)
    {
        setName (e.target.value);
    }

    async function handleCreateGroup ()
    {
        if (match.params.hasOwnProperty ("id"))
        {
            const response = await api.post
            (
                "/groupstore",
                {
                    name: "New group",
                    lastParent: match.params.id,
                    roles: [],
                    usedTimes: [],
                    owner: loggedAccount._id
                }
            );
            var newItems = [...items];
            newItems.unshift (response.data);
            setItems (newItems);
            setCreatedItem (response.data);
            setMessage ({text: "Group successfully created.", key: Math.random ()});
            setRedirect (<Redirect to = {newItemUrl (response.data._id)}/>);
        }
    }

    async function handleCreateLock ()
    {
        if (match.params.hasOwnProperty ("id"))
        {
            const response = await api.post
            (
                "/lockstore",
                {
                    name: "New lock",
                    lastParent: match.params.id,
                    owner: loggedAccount._id
                }
            );
            var newItems = [...items];
            newItems.unshift (response.data);
            setItems (newItems);
            setCreatedItem (response.data);
            setMessage ({text: "Lock successfully created.", key: Math.random ()});
            setRedirect (<Redirect to = {newItemUrl (response.data._id)}/>);
        }  
    }

    return (

        <div className = "itemListArea">
            <div className = "topBox">
                <div>
                    <div className = "label nameLabel">Name</div>
                    <input
                    value = {name}
                    onChange = {(e) => {handleChangeName (e)}}
                    />
                </div>
                <Link to = {searchUrl ()}>
                    <button
                    className = "searchButton"
                    onClick = {() => {handleSearch ()}}
                    >
                        Search
                    </button>
                </Link>
                <button
                className = "createGroupButton"
                style =
                {
                    {
                        backgroundColor: match.params.hasOwnProperty ("id") ? "#cccccc" : "#e5e5e5",
                        borderColor: match.params.hasOwnProperty ("id") ? "#cccccc" : "#e5e5e5",
                        color: match.params.hasOwnProperty ("id") ? "#000000" : "#7f7f7f"
                    }
                }
                onClick = {() => {handleCreateGroup ()}}
                >
                    Create group
                </button>
                <button
                className = "createGroupButton"
                style =
                {
                    {
                        backgroundColor: match.params.hasOwnProperty ("id") ? "#cccccc" : "#e5e5e5",
                        borderColor: match.params.hasOwnProperty ("id") ? "#cccccc" : "#e5e5e5",
                        color: match.params.hasOwnProperty ("id") ? "#000000" : "#7f7f7f"
                    }
                }
                onClick = {() => {handleCreateLock ()}}
                >
                    Create lock
                </button>
            </div>
            <div
            className = "middleBox"
            style = {{display: pathInfos.length > 0 ? "block" : "none"}}
            >
                <div
                className = "locationPath"
                >
                    {
                        pathInfos.map
                        (
                            (pathInfo, index) =>
                            {
                                return (
                                    <>
                                        {
                                            pathInfo.type === "Group" ?
                                            <Link to = {newPathUrl (pathInfo._id)}>
                                                <div
                                                className = "itemName itemLink"
                                                key = {index}
                                                >
                                                    <div>{pathInfo.name}</div>
                                                    {
                                                        typeof pathInfos[index+1] === "undefined" ?
                                                        <></> :
                                                        <div className = "rightArrow"/>
                                                    }
                                                </div>
                                            </Link> :
                                            <div
                                            className = "itemName"
                                            key = {index}
                                            >
                                                <div>{pathInfo.name}</div>
                                                {
                                                    typeof pathInfos[index+1] === "undefined" ?
                                                    <></> :
                                                    <div className = "rightArrow"/>
                                                }
                                            </div>
                                        }
                                    </>
                                );
                            }
                        )
                    }
                </div>
            </div>
            <div className = "itemList">
                {
                    items.map
                    (
                        (item, index) =>
                        {
                            return (
                                <Link key = {index} to = {newUrl (item._id)}>
                                    <button
                                    className = "itemButton"
                                    key = {index}
                                    >
                                        {item.name}
                                        <div
                                        className = "itemPath"
                                        style = {{display: item.hasOwnProperty ("parentInfos") ? "flex" : "none"}}
                                        >
                                            {
                                                item.hasOwnProperty ("parentInfos") ?
                                                item.parentInfos.map
                                                (
                                                    (parentInfo, index) =>
                                                    {
                                                        return (
                                                            <>
                                                                {
                                                                    parentInfo.type === "Group" ?
                                                                    <Link to = {newPathUrl (parentInfo._id)}>
                                                                        <div
                                                                        className = "itemName itemLink"
                                                                        key = {index}
                                                                        >
                                                                            <div>{parentInfo.name}</div>
                                                                            {
                                                                                typeof item.parentInfos[index+1] === "undefined" ?
                                                                                <></> :
                                                                                <div className = "rightArrow"/>
                                                                            }
                                                                        </div>
                                                                    </Link> :
                                                                    <div
                                                                    className = "itemName"
                                                                    key = {index}
                                                                    >
                                                                        <div>{parentInfo.name}</div>
                                                                        {
                                                                            typeof item.parentInfos[index+1] === "undefined" ?
                                                                            <></> :
                                                                            <div className = "rightArrow"/>
                                                                        }
                                                                    </div>
                                                                }
                                                            </>
                                                        );
                                                    }
                                                ) :
                                                <></>
                                            }
                                        </div>
                                    </button>
                                </Link>
                            );
                        }
                    )
                }
            </div>
            <div
            className = "bottomBox"
            style = {{display: items.length > 0 ? "block" : "none"}}
            >
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

export default ItemList;