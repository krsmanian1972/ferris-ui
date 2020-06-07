import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const stageStyle = {
    position: "relative",
    overflow: "hidden",
    width: "100%",
    height: "100%",
    minHeight: 300
};

function VideoBoard({ screenStatus, peerSrc, localSrc,screenSrc }) {
    const peerVideo = useRef(null);
    const localVideo = useRef(null);
    const peerScreen = useRef(null);
  
    useEffect(() => {
        if (peerVideo.current && peerSrc) {
            peerVideo.current.srcObject = peerSrc;
        }
        if (localVideo.current && localSrc) localVideo.current.srcObject = localSrc;
        
        if (peerScreen.current && screenSrc) {
            peerScreen.current.srcObject = screenSrc;
        }
    });
    
    return (
        <div style={stageStyle}>
            <video id="peerVideo" ref={peerVideo} autoPlay />
            <video id="localVideo" ref={localVideo} autoPlay muted />
            <video id="peerScreen" ref={peerScreen} autoPlay />
        </div>
    );
}

VideoBoard.propTypes = {
    screenStatus:PropTypes.string.isRequired,
    localSrc: PropTypes.object, 
    peerSrc: PropTypes.object,
    screenSrc:PropTypes.object, 
};

export default VideoBoard;