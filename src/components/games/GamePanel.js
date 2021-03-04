import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const panelStyle = { width:"100%", marginTop: "1px", marginBottom:"1px", border: "1px groove white"};

function GamePanel({ stream, username, height }) {

    const gameContainerStyle = { width:"100%", height: height*0.60 };

    const videoEl = useRef(null);

    useEffect(() => {
        if (videoEl.current && stream) {
            videoEl.current.srcObject = stream;
        }
    });

    return (
        <div style={panelStyle}>
            <video style={gameContainerStyle} poster="videoPeer.png" ref={videoEl} autoPlay />
        </div>
    )
}

GamePanel.propTypes = {
    stream: PropTypes.object,
    username: PropTypes.string,
    height: PropTypes.number,
};

export default GamePanel;
