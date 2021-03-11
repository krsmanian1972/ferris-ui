import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const standardStyle = {
    height: "100%",
    width: "100%",
    background: "#646464",
    position: "relative",
    overflow: "hidden",
};


function PeerVideoBoard({ localSrc, peerSrc, screenSrc, myBoard, coachingPlan, actionList, isMinimized, preference, isCoach,onArtifactChange }) {

    const [peerKey, setPeerKey] = useState('none');
    const [myKey, setMyKey] = useState(preference);

    const peerVideo = useRef(null);
    const peerScreen = useRef(null);

    const localVideo = useRef(null);

    useEffect(() => {
        if (peerScreen.current && screenSrc) {
            peerScreen.current.srcObject = screenSrc;
        }
        if (peerVideo.current && peerSrc) {
            peerVideo.current.srcObject = peerSrc;
        }
        if (localVideo.current && localSrc) {
            localVideo.current.srcObject = localSrc;
        }
    });

    /**
     * A coach can lock a members accessible widgets.
     * @returns 
     */
    const canSelect = () => {
        if (isCoach) {
            return true;
        }
        return preference === "none";
    }

    const setSelected = (compKey, compCategory) => {
        if (!canSelect()) {
            return;
        }

        if (compCategory === "peer") {
            setPeerKey(compKey);
            setMyKey("none");
            onArtifactChange("none");
            return;
        }

        setMyKey(compKey);
        setPeerKey("none");
        onArtifactChange(compKey);
    }

    const minimizeAll = () => {
        if(preference !== "none") {
            return;
        }
        setPeerKey("none");
        setMyKey("none");
    }

    const getPeerStyle = (compKey) => {
        if (peerKey === compKey) {
            return { width: "100%" };
        }

        if (peerKey === "none") {
            return { width: "48%", marginRight: "1%" };
        }

        return { width: "96%", marginRight: "1%" };
    }

    const getMyStyle = (compKey) => {
        if (myKey === compKey) {
            return { width: "100%" };
        }

        if (myKey === "none") {
            return { width: "24%", marginRight: "1%"};
        }

        return { width: "31%", marginRight: "1%" };
    }

    const getPeerItems = (widgets, activeKey) => {
        
        let toSuspend = [];
        for (const [key, value] of widgets) {
            
            let isActive = (key === activeKey);

            if (!isActive) {
                toSuspend.push(value);
            }
        }
        return toSuspend;
    }

    const getMyItems = (widgets, activeKey) => {

        if(preference !== "none") {
            return [];
        }
        
        let toSuspend = [];
        for (const [key, value] of widgets) {
            
            let isActive = (key === activeKey || key === preference);

            if (!isActive) {
                toSuspend.push(value);
            }
        }
        return toSuspend;
    }

    const getWidgetHeight = () => {
        if (isMinimized === true) {
            return { height: "0%" };
        }
        else {
            return { height: "15%" };
        }
    }

    const peerWidgets = new Map();
    peerWidgets.set("peerVideo", <video key="peerVideo" className="videoItem" style={getPeerStyle("peerVideo")} poster="videoPeer.png" ref={peerVideo} autoPlay onClick={() => setSelected("peerVideo", "peer")} />);
    peerWidgets.set("peerScreen", <video key="peerScreen" className="videoItem" style={getPeerStyle("peerScreen")} poster="peerScreen.png" ref={peerScreen} autoPlay onClick={() => setSelected("peerScreen", "peer")} />);

    const boardKey = 'myBoard';
    const boardDiv = <div key="myBoardDiv" className="non-videoItem" style={getMyStyle(boardKey)} onClick={() => setSelected(boardKey, "self")} >Board</div>

    const planKey = "coachingPlan";
    const planDiv = <div key="coachingPlanDiv" className="non-videoItem" style={getMyStyle(planKey)} onClick={() => setSelected(planKey, "self")} >Coaching Plan</div>

    const actionPlanKey = "actionPlan";
    const actionPlanDiv = <div key="actionPlanDiv" className="non-videoItem" style={getMyStyle(actionPlanKey)} onClick={() => setSelected(actionPlanKey, "self")} >Action Plan</div>

    const myWidgets = new Map();
    myWidgets.set(boardKey, boardDiv);
    myWidgets.set(planKey, planDiv);
    myWidgets.set(actionPlanKey, actionPlanDiv);

    const getActiveItem = () => {

        if(!isCoach && preference === boardKey) {
            return myBoard;
        }

        if(!isCoach && preference === planKey) {
            return coachingPlan;
        }

        if(!isCoach && preference === actionPlanKey) {
            return actionList;
        }

        if (myKey === "none" && peerKey === "none") {
            return <></>;
        }

        if (peerKey !== "none") {
            return peerWidgets.get(peerKey);
        }

        if (myKey === boardKey) {
            return myBoard;
        }

        if (myKey === actionPlanKey) {
            return actionList;
        }

        return coachingPlan;
    }

    return (
        <div style={standardStyle} >

            <div className="activeItem">
                {getActiveItem()}
            </div>

            <div className="peerVideoContainer" style={getWidgetHeight()}>
                {getPeerItems(peerWidgets, peerKey).map(value => value)}
            </div>

            <div className="artifactsContainer" style={getWidgetHeight()}>
                {getMyItems(myWidgets, myKey).map(value => value)}
            </div>

            <div className="myVideoContainer" style={getWidgetHeight()}>
                <video key="myVideo" className="videoItem" poster="videoSelf.png" onClick={() => minimizeAll()} ref={localVideo} autoPlay muted />
            </div>
        </div>
    );
}

PeerVideoBoard.propTypes = {
    localSrc: PropTypes.object,
    peerSrc: PropTypes.object,
    screenSrc: PropTypes.object,

    myBoard: PropTypes.object,
    coachingPlan: PropTypes.object,
    actionList: PropTypes.object,
    isMinimized: PropTypes.bool,
    preference: PropTypes.string,
    isCoach: PropTypes.bool,
};

export default PeerVideoBoard;
