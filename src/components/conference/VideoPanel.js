import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

function VideoPanel({ stream, muted }) {

    const videoEl = useRef(null);

    useEffect(() => {
        if (videoEl.current && stream) {
            videoEl.current.srcObject = stream;
        }
    });

    const getMyStyle = (compKey) => {
        return { width: "31%", marginRight: "1%" };
    }

    if (muted) {
        return <video className="videoItem" style={getMyStyle("myVideo")} poster="videoSelf.png" ref={videoEl} autoPlay muted />
    }
    return <video className="videoItem" style={getMyStyle("myVideo")} poster="videoSelf.png" ref={videoEl} autoPlay />
}

VideoPanel.propTypes = {
    stream: PropTypes.object,
};

export default VideoPanel;
