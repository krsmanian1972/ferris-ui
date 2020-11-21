import React, { Component } from 'react';
import { assetHost } from '../stores/APIEndpoints';

const CANVAS_WIDTH = 1280
const CANVAS_HEIGHT = 1280;

class MiniBoard extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.ctx = this.canvas.getContext("2d");
        this.restore();
    }

    getName = () => {
        return <p style={{ textAlign: "center" }}>{this.props.boardId}</p>
    }

    /**
     * Introduce a timestamp to avoid caching
     */
    restore = async () => {

        const url = `${assetHost}/boards/${this.props.sessionUserId}/${this.props.boardId}`;

        const response = await this.props.apiProxy.getAsync(url);
        const data = await response.text();

        var img = new Image();
        var me = this;
        img.onload = function () {
            me.ctx.drawImage(img, 0, 0, img.width, img.height);
        }
        img.src = data;
    }

    getSessionBoard = () => {

        const boardKey = `mini-canvas-${this.props.boardId}`;
   
        const boardStyle = { backgroundColor: "#646464", marginLeft: 4, border: "2px solid rgb(59,109,171)"};
        const titleStyle = { background: "rgb(59,109,171)", height: 30, color: "white", fontWeight: "bold" };
        const canvasStyle = { backgroundColor: "#646464", height: "50%", width:"50%"};
    
        return (
            <div style={boardStyle}>
                <div style={titleStyle}>{this.getName()}</div>
                <canvas height={CANVAS_HEIGHT} width={CANVAS_WIDTH} style={canvasStyle} key={boardKey} ref={ref => (this.canvas = ref)} />
            </div>
        )
    }

    getMatrixBoard = () => {

        const boardKey = `mini-canvas-${this.props.boardId}`;

        const boardHeight = screen.height * 0.5;
        const matrixBoardStyle = { backgroundColor: "#646464", maxHeight: boardHeight, overflow: "auto" };
        
        return (
            <div style={matrixBoardStyle}>
                <canvas height={CANVAS_HEIGHT} width={CANVAS_WIDTH} className="miniBoard" key={boardKey} ref={ref => (this.canvas = ref)} />
            </div>
        )
    }

    render() {

        const listType = this.props.listType;
        const board = listType === "matrix" ? this.getMatrixBoard() : this.getSessionBoard();

        return (
            <>
                { board}
            </>
        )
    }
}
export default MiniBoard;
