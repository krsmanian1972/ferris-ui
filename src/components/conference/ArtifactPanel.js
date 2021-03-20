import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const panelStyle = { marginTop: 5, marginBottom: 5, border: "1px groove white", background: "#646464"};
const nameStyle = { color: "#fae78f", fontWeight: "bold", margin: 1 };

function ArtifactPanel({ stream, username }) {

    const videoEl = useRef(null);

    useEffect(() => {
        if (videoEl.current && stream) {
            videoEl.current.srcObject = stream;
        }
    });

    return (
        <div style={panelStyle}>
            <div className="activeItem">
                <p style={nameStyle}>{username}</p>
                <video poster="peerScreen.png" ref={videoEl} autoPlay/>
            </div>
        </div>
    )

}

ArtifactPanel.propTypes = {
    stream: PropTypes.object,
    username: PropTypes.string,
};

export default ArtifactPanel;
