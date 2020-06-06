import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const stageStyle = {
    position: "relative",
    overflow: "hidden",
    width: "100%",
    height: "100%",
    minHeight: 300
};

function VideoBoard({ peerSrc, localSrc, peerScreenSrc }) {
    const peerVideo = useRef(null);
    const localVideo = useRef(null);
    const peerScreen = useRef(null);
  
    useEffect(() => {
        if (peerVideo.current && peerSrc) peerVideo.current.srcObject = peerSrc;
        if (localVideo.current && localSrc) localVideo.current.srcObject = localSrc;
        if (peerScreen.current && peerScreenSrc) peerScreen.current.srcObject = peerScreenSrc;
    });

    return (
        <div style={stageStyle}>
            <video id="peerScreen" ref={peerScreen} autoPlay />
            <video id="peerVideo" ref={peerVideo} autoPlay />
            <video id="localVideo" ref={localVideo} autoPlay muted />
        </div>
    );
}

VideoBoard.propTypes = {
    localSrc: PropTypes.object, // eslint-disable-line
    peerSrc: PropTypes.object, // eslint-disable-line
    peerScreenSrc: PropTypes.object, // eslint-disable-line
};

export default VideoBoard;