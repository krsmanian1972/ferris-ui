import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const stageStyle = {
    minHeight: 600,
    position: "relative",
    overflow: "hidden",
};

function VideoBoard({ screenStatus, localSrc, peerSrc }) {
    const peerVideo = useRef(null);
    const localVideo = useRef(null);


    useEffect(() => {
        if (peerVideo.current && peerSrc) peerVideo.current.srcObject = peerSrc;

        if (localVideo.current && localSrc) localVideo.current.srcObject = localSrc;
    });

    return (
        <div style={stageStyle}>
            <video id="localVideo" ref={localVideo} autoPlay muted />
            <video id="peerVideo" ref={peerVideo} autoPlay />
        </div>
    );
}

VideoBoard.propTypes = {
    screenStatus: PropTypes.string.isRequired,
    localSrc: PropTypes.object,
    peerSrc: PropTypes.object,
};

export default VideoBoard;