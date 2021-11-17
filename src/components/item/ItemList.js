import React, {useState, useEffect, useContext} from "react";
import api from "../../services/api";
import {Link, Redirect} from "react-router-dom";

import loggedAccountContext from "../contexts/loggedAccount";
import messageContext from "../contexts/message";
import overlayContext from "../contexts/overlay";
import createdItemContext from "../contexts/createdItem";
import editedItemContext from "../contexts/editedItem";
import movedItemContext from "../contexts/movedItem";
import deletedItemContext from "../contexts/deletedItem";

import "../../css/item/itemList.css";

function ItemList ({match, location})
{
    const {loggedAccount, setLoggedAccount} = useContext (loggedAccountContext);
    const {message, setMessage} = useContext (messageContext);
    const {overlay, setOverlay} = useContext (overlayContext);
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
    const [hover, setHover] = useState ({button: ""});
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
                            if (newItems[a].hasOwnProperty ("parentInfos"))
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
                    else if (newItems[a].hasOwnProperty ("parentInfos"))
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
            setOverlay (true);
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
            setOverlay (false);
            if (page > 1)
            {
                setItems ([...items, ...response.data.items.docs]);
            }
            else
            {
                setItems (response.data.items.docs);
            }
            setPathInfos (response.data.parentInfos);
            setPages (response.data.items.pages);
        }
        else
        {
            setOverlay (true);
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
            setOverlay (false);
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

    function handleLoadMore (e)
    {
        if (e.target.scrollHeight-e.target.scrollTop <= e.target.clientHeight*1.2 && page < pages)
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
            setOverlay (true);
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
            setOverlay (false);
            var newItems = [...items];
            newItems.unshift (response.data);
            setItems (newItems);
            setCreatedItem (response.data);
            setMessage ([{text: "Group successfully created.", key: Math.random ()}]);
            setRedirect (<Redirect to = {newItemUrl (response.data._id)}/>);
        }
    }

    async function handleCreateLock ()
    {
        if (match.params.hasOwnProperty ("id"))
        {
            setOverlay (true);
            const response = await api.post
            (
                "/lockstore",
                {
                    name: "New lock",
                    lastParent: match.params.id,
                    protocol: "mqtt",
                    host: "",
                    port: "",
                    owner: loggedAccount._id
                }
            );
            setOverlay (false);
            var newItems = [...items];
            newItems.unshift (response.data);
            setItems (newItems);
            setCreatedItem (response.data);
            setMessage ([{text: "Lock successfully created.", key: Math.random ()}]);
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
                    spellCheck = {false}
                    />
                </div>
                <Link to = {searchUrl ()}>
                    <button
                    className = "searchButton"
                    onClick = {() => {handleSearch ()}}
                    >
                        <img
                        className = "icon"
                        src = {process.env.PUBLIC_URL+"/search-icon.svg"}
                        />
                    </button>
                </Link>
                <button
                className = "createGroupButton"
                onClick = {() => {handleCreateGroup ()}}
                >
                    <img
                    className = "icon"
                    src =
                    {
                        match.params.hasOwnProperty ("id") ?
                        process.env.PUBLIC_URL+"/create-group-icon.svg" :
                        process.env.PUBLIC_URL+"/create-group-grey-icon.svg"
                    }
                    />
                </button>
                <button
                className = "createGroupButton"
                onClick = {() => {handleCreateLock ()}}
                >
                   <img
                    className = "icon"
                    src =
                    {
                        match.params.hasOwnProperty ("id") ?
                        process.env.PUBLIC_URL+"/create-lock-icon.svg" :
                        process.env.PUBLIC_URL+"/create-lock-grey-icon.svg"
                    }
                    />
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
                                    <div key = {index}>
                                        {
                                            pathInfo.type === "Group" ?
                                            <div className = "itemGroup">
                                                <div
                                                className = "itemName itemNameLink"
                                                key = {index}
                                                onClick = {() => {setRedirect (<Redirect to = {newPathUrl (pathInfo._id)}/>)}}
                                                >
                                                    {pathInfo.name}
                                                </div>
                                                {
                                                    typeof pathInfos[index+1] === "undefined" ?
                                                    <></> :
                                                    <div className = "rightArrow"/>
                                                }
                                            </div> :
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
                                    </div>
                                );
                            }
                        )
                    }
                </div>
            </div>
            <div
            className = "itemList"
            onScroll = {(e) => {handleLoadMore (e)}}
            >
                {
                    items.map
                    (
                        (item, index) =>
                        {
                            return (
                                <Link
                                className = "itemLink"
                                key = {index}
                                onMouseEnter = {() => {setHover ({button: item._id})}}
                                onMouseLeave = {() => {setHover ({button: ""})}}
                                to = {newUrl (item._id)}
                                >
                                    <div
                                    className = "iconBox"
                                    style =
                                    {
                                        {
                                            backgroundColor:
                                            hover.button === item._id ?
                                            "#f2f2f2" :
                                            "#e6e6e6",
                                            borderColor:
                                            hover.button === item._id ?
                                            "#f2f2f2" :
                                            "#e6e6e6"
                                        }
                                    }
                                    >
                                        <img
                                        className = "icon"
                                        src =
                                        {
                                            item.type === "Group" ?
                                            process.env.PUBLIC_URL+"/group-grey-icon.svg" :
                                            process.env.PUBLIC_URL+"/lock-grey-icon.svg"
                                        }
                                        />
                                    </div>
                                    <button
                                    className = "itemButton"
                                    style =
                                    {
                                        {
                                            backgroundColor:
                                            hover.button === item._id ?
                                            "#f2f2f2" :
                                            "#ffffff",
                                            borderColor:
                                            hover.button === item._id ?
                                            "#f2f2f2" :
                                            "#e6e6e6"
                                        }
                                    }
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
                                                            <div key = {index}>
                                                                {
                                                                    parentInfo.type === "Group" ?
                                                                    <div  className = "itemGroup">
                                                                        <div
                                                                        className = "itemName itemNameLink"
                                                                        key = {index}
                                                                        onClick = {() => {setRedirect (<Redirect to = {newPathUrl (parentInfo._id)}/>)}}
                                                                        >
                                                                            {parentInfo.name}
                                                                        </div>
                                                                        {
                                                                            typeof item.parentInfos[index+1] === "undefined" ?
                                                                            <></> :
                                                                            <div className = "rightArrow"/>
                                                                        }
                                                                    </div> :
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
                                                            </div>
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
            {redirect}
        </div>
    );
}

export default ItemList;