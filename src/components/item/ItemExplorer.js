import React, {useState, useEffect, useContext} from "react";
import api from "../../services/api";
import {Link} from "react-router-dom";

import loggedAccountContext from "../contexts/loggedAccount";
import createdItemContext from "../contexts/createdItem";
import editedItemContext from "../contexts/editedItem";
import movedItemContext from "../contexts/movedItem";
import deletedItemContext from "../contexts/deletedItem";

import "../../css/item/itemExplorer.css";

function ItemExplorer ({location})
{
    const {loggedAccount, setLoggedAccount} = useContext (loggedAccountContext);
    const {createdItem, setCreatedItem} = useContext (createdItemContext);
    const {editedItem, setEditedItem} = useContext (editedItemContext);
    const {movedItem, setMovedItem} = useContext (movedItemContext);
    const {deletedItem, setDeletedItem} = useContext (deletedItemContext);
    const [items, setItems] = useState ([]);

    useEffect
    (
        () =>
        {
            let mounted = true;
            const runEffect = async () =>
            {
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

    function newUrl (_id)
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

    async function handleExpand (index)
    {
        var newItems = [...items];
        if (items[index].expanded === false)
        {
            newItems[index].expanded = true;
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
            {
                items.map
                (
                    (item, index) =>
                    {
                        if (item.type === "Group")
                        {
                            return (
                                <div key = {index} className = "group">
                                    <div className = "spaceBox">
                                        {
                                            item.parents.map
                                            (
                                                (parent, index) =>
                                                {
                                                    return (
                                                        <div
                                                        className = "line"
                                                        key = {index}
                                                        />
                                                    );
                                                }
                                            )
                                        }
                                        <div
                                        className = {item.expanded ? "downArrowButton" : "rightArrowButton"}
                                        onClick = {() => handleExpand (index)}
                                        />
                                    </div>
                                    <Link key = {index} to = {newUrl (item._id)}>
                                        <button
                                        className = "groupButton"
                                        key = {index}
                                        >
                                            {item.name}
                                        </button>
                                    </Link>
                                </div>
                            );
                        }
                        else
                        {
                            return (
                                <div key = {index} className = "lock">
                                    <div className = "spaceBox">
                                        {
                                            item.parents.map
                                            (
                                                (parent, index) =>
                                                {
                                                    return (
                                                        <div
                                                        className = "line"
                                                        key = {index}
                                                        />
                                                    );
                                                }
                                            )
                                        }
                                        <div className = "lockIcon"/>
                                    </div>
                                    <div key = {index} className = "lockName">
                                        {item.name}
                                    </div>
                                </div>
                            );
                        }
                    }
                )
            }
        </div>
    );
}

export default ItemExplorer;