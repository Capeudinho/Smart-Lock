import React, {useState, useEffect, useContext} from "react";
import api from "../../services/api";
import {Link} from "react-router-dom";

import loggedAccountContext from "../contexts/loggedAccount";
import overlayContext from "../contexts/overlay";
import createdItemContext from "../contexts/createdItem";
import editedItemContext from "../contexts/editedItem";
import movedItemContext from "../contexts/movedItem";
import deletedItemContext from "../contexts/deletedItem";

import "../../css/item/itemExplorer.css";

function ItemExplorer ({location})
{
    const {loggedAccount, setLoggedAccount} = useContext (loggedAccountContext);
    const {overlay, setOverlay} = useContext (overlayContext);
    const {createdItem, setCreatedItem} = useContext (createdItemContext);
    const {editedItem, setEditedItem} = useContext (editedItemContext);
    const {movedItem, setMovedItem} = useContext (movedItemContext);
    const {deletedItem, setDeletedItem} = useContext (deletedItemContext);
    const [items, setItems] = useState ([]);
    const [hover, setHover] = useState ({button: ""});

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
                    "/itemparentindex",
                    {
                        params:
                        {
                            parent: "",
                            owner: loggedAccount._id
                        }
                    }
                );
                if (mounted)
                {
                    setOverlay (false);
                    for (var a = 0; a < response.data.length; a++)
                    {
                        response.data[a].expanded = false;
                    }
                    setItems (response.data);
                }
            }
            runEffect();
            return (() => {mounted = false;});
        },
        [loggedAccount]
    );

    useEffect
    (
        () =>
        {
            if (editedItem !== {})
            {
                var newItems = [...items];
                for (var a = 0; a < newItems.length; a++)
                {
                    if (newItems[a]._id === editedItem._id)
                    {
                        newItems[a] = {...editedItem, expanded: newItems[a].expanded};

                    }
                }
                setItems (newItems);
            }
        },
        [editedItem]
    );

    useEffect
    (
        () =>
        {
            if (movedItem != {})
            {
                var newItems = [...items];
                for (var a = 0; a < newItems.length; a++)
                {
                    if (newItems[a]._id === movedItem.parents[movedItem.parents.length-1] && newItems[a].expanded)
                    {
                        newItems.splice (a+1, 0, {...movedItem, expanded: false});
                        a++;
                    }
                    else if (newItems[a]._id === movedItem._id || newItems[a].parents.includes (movedItem._id))
                    {
                        newItems.splice (a, 1);
                        a--;
                    }
                }
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
                    else if (newItems[a].parents.includes (deletedItem._id))
                    {
                        newItems.splice (a, 1);
                        a--;
                    }
                }
                setItems (newItems);
            }
        },
        [deletedItem]
    );

    useEffect
    (
        () =>
        {
            if (createdItem !== {})
            {
                var newItems = [...items];
                for (var a = 0; a < newItems.length; a++)
                {
                    if (newItems[a]._id === createdItem.parents[createdItem.parents.length-1] && newItems[a].expanded)
                    {
                        newItems.splice (a+1, 0, {...createdItem, expanded: false});
                    }
                }
                setItems (newItems);
            }
        },
        [createdItem]
    );

    function newGroupUrl (_id)
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

    function newLockUrl (_id)
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

    async function handleExpand (index)
    {
        var newItems = [...items];
        if (items[index].expanded === false)
        {
            newItems[index].expanded = true;
            setOverlay (true);
            const response = await api.get
            (
                "/itemparentindex",
                {
                    params:
                    {
                        parent: items[index]._id,
                        owner: loggedAccount._id
                    }
                }
            );
            setOverlay (false);
            for (var a = 0; a < response.data.length; a++)
            {
                response.data[a].expanded = false;
            }
            newItems.splice.apply (newItems, [index+1, 0].concat (response.data));
            setItems (newItems);
        }
        else
        {
            newItems[index].expanded = false;
            for (var a = 0; a < newItems.length; a++)
            {
                if (newItems[a].parents.includes (items[index]._id))
                {
                    newItems.splice (a, 1);
                    a--;
                }
            }
            setItems (newItems);
        }
    }

    return (
        <div className = "itemExplorerArea">
            <div className = "itemExplorerContainer">
                {
                    items.map
                    (
                        (item, index) =>
                        {
                            return (
                                <div key = {index} className = "item">
                                    <div className = "spaceBox">
                                        {
                                            item.parents.map
                                            (
                                                (parent, parentIndex) =>
                                                {
                                                    return (
                                                        <div
                                                        className = "line"
                                                        key = {parentIndex}
                                                        style =
                                                        {
                                                            {
                                                                marginBottom:
                                                                index+1 === items.length ||
                                                                // items[index+1].parents.length < item.parents.length ?
                                                                items[index+1].parents.length < parentIndex+1 ?
                                                                "5px" :
                                                                "0px"
                                                            }
                                                        }
                                                        />
                                                    );
                                                }
                                            )
                                        }
                                        <div className = "expandButtonBox">
                                            {
                                                item.type === "Group" ?
                                                <img
                                                className = "expandButton"
                                                src =
                                                {
                                                    item.expanded ?
                                                    process.env.PUBLIC_URL+"/opened-icon.svg" :
                                                    process.env.PUBLIC_URL+"/closed-icon.svg"
                                                }
                                                onClick = {() => handleExpand (index)}
                                                /> :
                                                <img
                                                className = "lockIcon"
                                                src = {process.env.PUBLIC_URL+"/lock-icon.svg"}
                                                />
                                            }
                                        </div>
                                    </div>
                                    <Link
                                    className = "itemLink"
                                    key = {index}
                                    onMouseEnter = {() => {setHover ({button: item._id})}}
                                    onMouseLeave = {() => {setHover ({button: ""})}}
                                    style = {{marginBottom: "5px"}}
                                    to = {item.type === "Group" ? newGroupUrl (item._id) : newLockUrl (item._id)}
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
                                        key = {index}
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
                                        >
                                            {item.name}
                                        </button>
                                    </Link>
                                </div>
                            );
                        }
                    )
                }
            </div>
        </div>
    );
}

export default ItemExplorer;