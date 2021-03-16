import React, { Component } from 'react';
import { assetHost } from '../stores/APIEndpoints';

import { fabric } from 'fabric';

const CANVAS_WIDTH = 1280
const CANVAS_HEIGHT = 1280;

class MiniBoard extends Component {

    componentDidMount() {
        this.restore();
    }

    getName = () => {
        return <p style={{ textAlign: "center" }}>{this.props.boardId}</p>
    }

    /**
     * Introduce a timestamp to avoid caching
     */
    restore = async () => {

        const fabricCanvas = new fabric.Canvas(this.canvas);

        const ver = new Date().getTime();
        const url = `${assetHost}/boards/${this.props.sessionId}/${this.props.boardId}?nocache=${ver}`;
        try {
            const response = await this.props.apiProxy.getAsync(url);
            const data = await response.text();
            fabricCanvas.loadFromJSON(
                data,
                fabricCanvas.renderAll.bind(fabricCanvas),
            );
        }
        catch (e) {
            console.log(e);
        }
    }

    getSessionBoard = () => {

        const boardKey = `board_can-${this.props.boardId}`;

        const boardStyle = { backgroundColor: "#646464", marginLeft: 4, border: "2px solid rgb(59,109,171)" };
        const titleStyle = { background: "rgb(59,109,171)", height: 30, color: "white", fontWeight: "bold" };
        const canvasStyle = { height: "50%", width: "50%" };

        return (
            <div style={boardStyle}>
                <div style={titleStyle}>{this.getName()}</div>
                <div style={{ overflow: "auto", border: "3px solid rgb(59,109,171)"}}>
                    <div key="container" id="container" ref={ref => (this.container = ref)}>
                        <canvas height={CANVAS_HEIGHT} width={CANVAS_WIDTH} style={canvasStyle} key={boardKey} ref={ref => (this.canvas = ref)} />
                    </div>
                </div>
            </div>
        )
    }

    getMatrixBoard = () => {

        const boardKey = `board_can-${this.props.boardId}`;

        const boardHeight = window.screen.height * 0.5;
        const matrixBoardStyle = { backgroundColor: "#646464", maxHeight: boardHeight, overflow: "auto" };

        return (
            <div style={matrixBoardStyle}>
                <canvas height={CANVAS_HEIGHT} width={CANVAS_WIDTH} key={boardKey} ref={ref => (this.canvas = ref)} />
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
