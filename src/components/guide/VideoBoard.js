import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const standardStyle = {
    height: "100%",
    width: "100%",
    background: "#666",
    position: "relative",
    overflow: "hidden",
};

function VideoBoard({ screenStatus, localSrc, peerSrc, screenSrc }) {

    const peerVideo = useRef(null);
    const localVideo = useRef(null);
    const peerScreen = useRef(null);

    useEffect(() => {
        if (peerScreen.current && screenSrc) peerScreen.current.srcObject = screenSrc;
    });

    useEffect(() => {
        if (peerVideo.current && peerSrc) peerVideo.current.srcObject = peerSrc;
        if (localVideo.current && localSrc) localVideo.current.srcObject = localSrc;
    });

    const getVideoStyle = () => {
        if (screenStatus && screenStatus === 'active') {
            return "minPeerVideo";
        }
        return "peerVideo";
    }

    const getScreenStyle = () => {
        if (screenStatus && screenStatus === 'active') {
            return "peerVideo";
        }
        return "minPeerVideo";
    }

    return (
        <div style={standardStyle} >
            <video id={getVideoStyle()} ref={peerVideo} autoPlay />
            <video id={getScreenStyle()} ref={peerScreen} autoPlay />
            <video id="localVideo" ref={localVideo} autoPlay muted />
        </div>
    );
}

VideoBoard.propTypes = {
    screenStatus: PropTypes.string.isRequired,
    localSrc: PropTypes.object,
    peerSrc: PropTypes.object,
    screenSrc: PropTypes.object,
};

export default VideoBoard;