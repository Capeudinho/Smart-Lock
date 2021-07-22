import React, {useContext} from "react";

import loggedAccountContext from "../contexts/loggedAccount";

import "../../css/base/baseTop.css";

function BaseTop ()
{ 
    const {loggedAccount, setLoggedAccount} = useContext (loggedAccountContext);

    return (
        <div className = "baseTopArea">
            <div className = "ownerName">
                {loggedAccount !== null ? loggedAccount.name : ""}
            </div>
        </div>
    );
}

export default BaseTop;