import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const height = screen.height * 20 / 100;

const panelStyle = {marginBottom: 5, border: "1px groove white", background: "black"};
const thumbnail = { maxHeight: height};
const localName = { color: "white", margin: 1 };
const remoteName = { color: "yellow", margin: 1 };

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
                <p style={localName}>{username}</p>
                <video style={thumbnail} poster="videoSelf.png" ref={videoEl} autoPlay muted />
            </div>
        )
    }
    return (
        <div style={panelStyle}>
            <p style={remoteName}>{username}</p>
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
