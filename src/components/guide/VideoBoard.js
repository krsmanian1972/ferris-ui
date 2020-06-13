import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const standardStyle = {
    height:"100%",
    width:"100%",
    background: "#666",
    position: "relative",
    overflow: "hidden",
};

function VideoBoard({ screenStatus, localSrc, peerSrc,portalSize }) {
 
    const peerVideo = useRef(null);
    const localVideo = useRef(null);
    
                        
    useEffect(() => {
        if (peerVideo.current && peerSrc) peerVideo.current.srcObject = peerSrc;
        if (localVideo.current && localSrc) localVideo.current.srcObject = localSrc;
    });

    return (
        <div style={standardStyle} >
            <video id="localVideo" ref={localVideo} autoPlay muted />
            <video id="peerVideo" ref={peerVideo} autoPlay />
        </div>
    );
}

VideoBoard.propTypes = {
    screenStatus: PropTypes.string.isRequired,
    localSrc: PropTypes.object,
    peerSrc: PropTypes.object,
    portalSize: PropTypes.object
};

export default VideoBoard;