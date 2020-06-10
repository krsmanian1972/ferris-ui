import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const stageStyle = {
    minHeight: 400,
    position: "relative",
    overflow: "hidden",
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