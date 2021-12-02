import React from "react";

import "../../css/home/home.css";

function Home ()
{
    return (
        <div className = "homeArea">
            <p className = "title">
                Welcome to Smart Lock Manager
            </p>
            <p className = "text">
                Smart Lock Manager is a tool to model, prepare, and monitor your MQTT, and/or HTTP smart 
                lock system.
            </p>
            <p className = "title">
                How to use
            </p>
            <p className = "text">
                The site is simple to understand, and use. Follow the steps below, and you will be using 
                Smart Lock Manager to its fullest potential.
            </p>
            <p className = "subtitle">
                Model the environment
            </p>
            <p className = "text">
                Firstly, depict the place in which the locks will be used. The system uses four different 
                elements to make that description: users, items, which are made up of groups and locks, and 
                roles. Users are the people that will use your lock system. Groups are the spacial groups 
                that subdivide the evironment in which your system will take place in. Locks are the locks 
                that you'll create for your system. Roles are the collection of scheduled intervals of time 
                during which a given lock may be opened.
            </p>
            <p className = "subtitle">
                Assign roles
            </p>
            <p className = "text">
                Secondly, assign roles to users, and groups. Users use the roles assigned to them, and locks 
                use the roles assigned to its parent groups. A user of the system will only be able to 
                access a lock if both share one, or more used roles, and the moment in which the access is 
                being attemped is withing one of the time intervals detailed in one of those roles.
            </p>
            <p className = "subtitle">
                Configure connection
            </p>
            <p className = "text">
                Thirdly, edit the connection options, and the locks in the site so that it reflects the 
                values of the real locks. This task includes setting the locks' used protocol, and other 
                fields specifc to their used protocol. Furthermore, setting the routes they use, if their 
                protocol is HTTP, or the topics and broker they use, if their protocol is MQTT is also 
                necessary.
            </p>
            <p className = "subtitle">
                Monitor activity
            </p>
            <p className = "text">
                Fourthly, visit the site regularly in order to check the logs generate by the using of the 
                system. There are access logs, which presents the information of a successful accessing of a 
                lock, and miss logs, which presents the information of an access that a user should have 
                made, but did not.
            </p>
            <p className = "title">
                More information
            </p>
            <p className = "text">
                You can find a full PDF guide in portuguese to this system&nbsp;
                <a
                href = "https://drive.google.com/file/d/1krWqHnZkQGzRSTzxKU4XsHd0bsIn_E38/view?usp=sharing"
                target = "_blank"
                >
                    here
                </a>
                &nbsp;in this Google Drive file.
            </p>
        </div>
    );
}

export default Home;