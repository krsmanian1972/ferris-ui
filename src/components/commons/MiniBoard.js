import React, { Component } from 'react';
import { assetHost } from '../stores/APIEndpoints';

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

        var klass = this.props.cssKlass;

        if (!klass) {
            klass = "miniBoardFrame"
        }

        return (
            <div className={klass}>
                {!this.props.cssKlass && this.getName()}
                <canvas height={screen.height * 0.80} width={screen.width * 0.94} className="miniBoard" key={boardKey} ref={ref => (this.canvas = ref)} />
            </div>
        )
    }
}
export default MiniBoard;
