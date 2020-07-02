import React, { Component } from 'react';

class MiniBoard extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.ctx = this.canvas.getContext("2d");
        this.restore();
    }

    restore = () => {
        var img = new Image();
        var me = this;
        img.onload = function () {
            me.ctx.drawImage(img,0,0,img.width,img.height);
        }
        img.src = this.props.getBoardData(this.props.boardId);
    }

    render() {
        const boardKey = `mini-canvas-${this.props.boardId}`;

        return (
            <>
                {this.props.boardId}
                <canvas key={boardKey} ref={ref => (this.canvas = ref)} />
            </>
        )
    }
}
export default MiniBoard;