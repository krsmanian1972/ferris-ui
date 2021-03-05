import React, { Component } from 'react';

const CANVAS_WIDTH = 1280
const CANVAS_HEIGHT = 1280;

class PeerBoard extends Component {
    constructor(props) {
        super(props);
        props.onInit(this.reflectHook());
    }

    componentDidMount() {
        this.ctx = this.canvas.getContext("2d");
    }

    reflectHook = () => {
        return this.reflect;
    }
    /**
     * Capure the data as received from the peer board
     */
    reflect = (data) => {
        if (data) {
            this.ctx.drawImage(data, 0, 0);
        }
    }

    render() {

        const boardHeight = window.screen.height * 0.8;
        const matrixBoardStyle = { backgroundColor: "#646464", maxHeight: boardHeight, overflow: "auto" };

        return (
            <div style={matrixBoardStyle}>
                <p>Peer Board</p>
                <canvas height={CANVAS_HEIGHT} width={CANVAS_WIDTH} className="miniBoard" key="peerBoardCanvas" ref={ref => (this.canvas = ref)} />
            </div>
        )
    }
}
export default PeerBoard;
