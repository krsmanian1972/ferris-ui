import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const standardStyle = {
    height: "100%",
    width: "100%",
    background: "#646464",
    position: "relative",
    overflow: "hidden",
};


function PeerVideoBoard({ artifactId, localSrc, peerSrc, screenSrc, artifact, isMinimized }) {

    const peerVideo = useRef(null);
    const peerScreen = useRef(null);
    const localVideo = useRef(null);

    useEffect(() => {
        if (peerScreen.current && screenSrc) {
            peerScreen.current.srcObject = screenSrc;
        }
        if (peerVideo.current && peerSrc) {
            peerVideo.current.srcObject = peerSrc;
        }
        if (localVideo.current && localSrc) {
            localVideo.current.srcObject = localSrc;
        }
    });

    const peerScreenElement = <video key="peerScreen" className="videoItem" style={{ width: "100%" }} poster="peerScreen.png" ref={peerScreen} autoPlay />;

    const getWidgetHeight = () => {
        if (isMinimized === true) {
            return { height: "0%" };
        }
        return { height: "15%" };
    }

    const getActiveItem = () => {
        if (artifactId === "none") {
            return <video key="peerVideo" className="videoItem" style={{ width: "100%" }} poster="videoPeer.png" ref={peerVideo} autoPlay />
        }
        if (artifactId === "peerScreen") {
            return peerScreenElement;
        }
        return artifact;
    }

    const getPeerVideoItem = () => {
        if (artifactId === "none") {
            return <></>
        }
        return (
            <div className="peerVideoContainer" style={getWidgetHeight()}>
                <video key="peerVideo" className="videoItem" poster="videoPeer.png" ref={peerVideo} autoPlay />
            </div>
        )
    }

    return (
        <div style={standardStyle} >
            <div className="activeItem">
                {getActiveItem()}
            </div>

            {getPeerVideoItem()}

            <div className="myVideoContainer" style={getWidgetHeight()}>
                <video key="myVideo" className="videoItem" poster="videoSelf.png" ref={localVideo} autoPlay muted />
            </div>
        </div>
    );
}

PeerVideoBoard.propTypes = {
    artifactId: PropTypes.string,

    localSrc: PropTypes.object,
    peerSrc: PropTypes.object,
    screenSrc: PropTypes.object,

    artifact: PropTypes.object,
    isMinimized: PropTypes.bool,
};

export default PeerVideoBoard;
