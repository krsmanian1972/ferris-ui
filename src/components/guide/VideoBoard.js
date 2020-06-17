import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { message } from 'antd';

const standardStyle = {
    height: "100%",
    width: "100%",
    background: "#666",
    position: "relative",
    overflow: "hidden",
};

function VideoBoard({ screenStatus, localSrc, peerSrc, screenSrc }) {

    const [key, setKey] = useState('peerVideo');

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
            <video id={getStyle("peerVideo")} ref={peerVideo} autoPlay onClick={() => setKey("peerVideo")}>
                <source src="https://youtu.be/8EPsnf_ZYU0" type="video/mp4" />
            </video>
            <video id={getStyle("peerScreen")} poster="screen_ph.png" ref={peerScreen} autoPlay onClick={() => setKey("peerScreen")} />
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