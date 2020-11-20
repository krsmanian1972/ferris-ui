import React, { Component } from 'react';
import { assetHost } from '../stores/APIEndpoints';

const CANVAS_HEIGHT = 3000;
const CANVAS_WIDTH = 2000;

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

    render() {
        const boardKey = `mini-canvas-${this.props.boardId}`;

        const listType = this.props.listType;
        const boardHeight = listType === "matrix" ? screen.height * 0.5 : screen.height * 0.5;
        return (
            <div>
                {listType === "session" && this.getName()}
                <div style={{ maxHeight: boardHeight, overflow: "auto", marginLeft: 3, border: "2px solid rgb(59,109,171)", borderRadius:12 }}>
                    <canvas height={CANVAS_HEIGHT} width={CANVAS_WIDTH} className="miniBoard" key={boardKey} ref={ref => (this.canvas = ref)} />
                </div>
            </div>
        )
    }
}
export default MiniBoard;
