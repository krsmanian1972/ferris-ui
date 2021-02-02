import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const height = window.innerHeight * 18 / 100;
const thumbnail = { maxHeight: height };

const panelStyle = { marginTop: 5, marginBottom: 5, border: "1px groove white", background: "#646464" };

const localNameStyle = { color: "#fae78f", fontWeight: "bold", margin: 1 };
const remoteNameStyle = { color: "white", fontWeight: "bold", margin: 1 };

function VideoPanel({ stream, isLocal, username }) {

    const videoEl = useRef(null);

    useEffect(() => {
        if (videoEl.current && stream) {
            videoEl.current.srcObject = stream;
        }
    });

    if (isLocal) {
        return (
            <div style={panelStyle}>
                <p style={localNameStyle}>{username}</p>
                <video style={thumbnail} poster="videoSelf.png" ref={videoEl} autoPlay muted />
            </div>
        )
    }
    return (
        <div style={panelStyle}>
            <p style={remoteNameStyle}>{username}</p>
            <video style={thumbnail} poster="videoPeer.png" ref={videoEl} autoPlay />
        </div>
    )
}

VideoPanel.propTypes = {
    stream: PropTypes.object,
    isLocal: PropTypes.bool,
    username: PropTypes.string,
};

export default VideoPanel;
