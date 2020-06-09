import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const stageStyle = {
    position: "relative",
    overflow: "hidden",
    width: "100%",
    height: "100%",
    minHeight: 300,
    marginTop: 5,
};

function ScreenBoard({ screenStatus, screenSrc }) {
    
    const peerScreen = useRef(null);

    useEffect(() => {
        if (peerScreen.current && screenSrc) peerScreen.current.srcObject = screenSrc;
    });

    return (
        <div style={stageStyle}>
            <video id="peerScreen" ref={peerScreen} autoPlay />
        </div>
    );
}

ScreenBoard.propTypes = {
    screenStatus: PropTypes.string.isRequired,
    screenSrc: PropTypes.object,
};

export default ScreenBoard;