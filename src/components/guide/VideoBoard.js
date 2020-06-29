import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import TestCanvas from './TestCanvas';

const standardStyle = {
    height: "100%",
    width: "100%",
    background: "#666",
    position: "relative",
    overflow: "hidden",
};

function VideoBoard({ localSrc, peerSrc, screenSrc }) {

    const [peerKey, setPeerKey] = useState('none');
    const [myKey, setMyKey] = useState('none');

    const peerVideo = useRef(null);
    const peerScreen = useRef(null);
    const peerBoard = useRef(null);

    const localVideo = useRef(null);

    useEffect(() => {
        if (peerScreen.current && screenSrc) {
            peerScreen.current.srcObject = screenSrc;
        }
    });

    useEffect(() => {
        if (peerVideo.current && peerSrc) {
            peerVideo.current.srcObject = peerSrc;
        }
        if (localVideo.current && localSrc) {
            localVideo.current.srcObject = localSrc;
        }
    });

    const setSelected = (compKey, compCategory) => {
        if (compCategory === "peer") {
            setPeerKey(compKey);
            setMyKey("none");
            return;
        }

        setMyKey(compKey);
        setPeerKey("none");
    }

    const minimizeAll = () => {
        setPeerKey("none");
        setMyKey("none");
    }

    const getPeerStyle = (compKey) => {
        if (peerKey === compKey) {
            return { width: "100%" };
        }

        if (peerKey === "none") {
            return { width: "33.3%" };
        }

        return { width: "50%" };
    }

    const getMyStyle = (compKey) => {
        if (myKey === compKey) {
            return { width: "100%" };
        }

        if (myKey === "none") {
            return { width: "33.3%" };
        }
      
        return { width: "50%" };
    }

    const getSuspendedItems = (widgets, activeKey) => {
        let toSuspend = [];

        for (const [key, value] of widgets) {
            if (key !== activeKey) {
                toSuspend.push(value);
            }
        }

        return toSuspend;
    }


    const peerWidgets = new Map();
    peerWidgets.set("peerVideo", <video key="peerVideo" className="videoItem" style={getPeerStyle("peerVideo")} poster="videoPeer.png" ref={peerVideo} autoPlay onClick={() => setSelected("peerVideo", "peer")} />);
    peerWidgets.set("peerScreen", <video key="peerScreen" className="videoItem" style={getPeerStyle("peerScreen")} poster="peerScreen.png" ref={peerScreen} autoPlay onClick={() => setSelected("peerScreen", "peer")} />);
    peerWidgets.set("peerBoard", <video key="peerBoard" className="videoItem" style={getPeerStyle("peerBoard")} poster="peerBoard.png" ref={peerBoard} autoPlay onClick={() => setSelected("peerBoard", "peer")} />);

    const myWidgets = new Map();
    for (var i = 1; i < 3; i++) {
        const boardKey = `Board - ${i}`;
        const el = <div key={boardKey} className="videoItem" style={getMyStyle(boardKey)} onClick={() => setSelected(boardKey, "self")} >{boardKey}</div>
        myWidgets.set(boardKey, el);
    }
    myWidgets.set("myVideo", <video key="myVideo" className="videoItem" style={getMyStyle("myVideo")} poster="videoSelf.png" onClick={() => minimizeAll()} ref={localVideo} autoPlay muted />)


    const getActiveItem = () => {
        if (myKey === "none" && peerKey === "none") {
            return <></>;
        }

        if (peerKey !== "none") {
            return peerWidgets.get(peerKey);
        }

        return myWidgets.get(myKey);
    }

    return (
        <div style={standardStyle} >

            <div className="activeItem">{getActiveItem()}</div>

            <div className="peerVideoContainer">
                {getSuspendedItems(peerWidgets, peerKey).map(value => value)}
            </div>

            <div className="myVideoContainer">
                {getSuspendedItems(myWidgets, myKey).map(value => value)}
            </div>
        </div>
    );
}

VideoBoard.propTypes = {
    localSrc: PropTypes.object,
    peerSrc: PropTypes.object,
    screenSrc: PropTypes.object,
};

export default VideoBoard;