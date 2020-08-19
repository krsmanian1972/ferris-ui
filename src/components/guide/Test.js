import React, { useState, useEffect, useRef } from 'react';


const viewStyle = {
    padding: 8,
    height: window.innerHeight*0.94,
}

const standardStyle = {
    height: "100%",
    width: "100%",
    background: "#666",
    position: "relative",
    overflow: "hidden",
};

function Test() {

    const peerVideo = useRef(null);
    const peerScreen = useRef(null);
    const peerBoard = useRef(null);

    const myBoard = useRef(null);
    const localVideo = useRef(null);

    const width=window.innerWidth/5;

    return (

        <div style={viewStyle}>
            <div style={standardStyle}>
                <video key="peerVideo"  className="videoItem"  style={{left:0,height:"20%",width:width}} poster="videoPeer.png" ref={peerVideo} autoPlay />
                <video key="peerScreen" className="videoItem" style={{height:"100%",width:"100%",zIndex:0}}  poster="peerScreen.png" ref={peerScreen} autoPlay />
                <video key="peerBoard"  className="videoItem"  style={{left:width*2,height:"20%",width:width}} poster="peerBoard.png" ref={peerBoard} autoPlay />
                
                <div key="myMiniBoard" className="videoItem"  style={{left:width*3,height:"20%",width:width}} ref={myBoard}>My Board</div>
                <video key="myVideo"   className="videoItem"  style={{left:width*4,height:"20%",width:width}} poster="videoSelf.png" ref={localVideo} autoPlay muted />
            </div>
        </div>
    );
}

export default Test;
