import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';


const standardStyle = {
    height: "100%",
    width: "100%",
    background: "#666",
    position: "relative",
    overflow: "hidden",
};

function VideoBoard({ localSrc, peerSrc, screenSrc }) {

    const [key, setKey] = useState('peerVideo');
    const [go, setGo] = useState('start');

    const peerVideo = useRef(null);
    const localVideo = useRef(null);
    const peerScreen = useRef(null);


    useEffect(() => {
        if (peerScreen.current && screenSrc) {
            peerScreen.current.srcObject = screenSrc;
        }
    });

    useEffect(() => {
        if (peerVideo.current && peerSrc) {
            peerVideo.current.srcObject = peerSrc;
            setGo("start");
        }
        if (localVideo.current && localSrc) {
            localVideo.current.srcObject = localSrc;
        }
    });

    const getStyle = (compKey) => {
        if (compKey === key) {
            return "peerVideo";
        }
        return "minPeerVideo";
    }

    return (
        <div style={standardStyle} >
            <video id={getStyle("peerVideo")} ref={peerVideo} autoPlay onClick={() => setKey("peerVideo")} />
            <video id={getStyle("peerScreen")} poster="screen_ph.png" ref={peerScreen} autoPlay onClick={() => setKey("peerScreen")} />
            <video id="localVideo" ref={localVideo} autoPlay muted />
        </div>
    );
}

VideoBoard.propTypes = {
    localSrc: PropTypes.object,
    peerSrc: PropTypes.object,
    screenSrc: PropTypes.object,
};

export default VideoBoard;