import React, { Component } from 'react';

class Board extends Component {
    constructor(props) {
        super(props);
        this.x = 0;
        this.y = 0;
        this.sentence = "";
        this.canWrite = -1;
    }

    componentDidMount() {
        this.ctx = this.canvas.getContext("2d");
        this.ctx.font = "16px Arial";
        this.ctx.fillStyle = "white";

        var temp=this.ctx.measureText('M');
        this.yOffset = temp.actualBoundingBoxAscent;
        this.textWidth = temp.width;

        this.canvas.addEventListener("dblclick", this.toggleWriting);
        window.addEventListener("keypress",this.write);
        this.restore();

        this.x = 0;
        this.y = 0;
        this.sentence = "";
        this.canWrite = -1;
    }

    componentWillUnmount() {
        this.save();
    }

    save = () => {
        const data = this.canvas.toDataURL();
        this.props.saveBoardData(this.props.boardId, data);
    }

    restore = () => {
        var img = new Image();
        var me = this;
        img.onload = function () {
            me.ctx.drawImage(img, 0, 0, img.width, img.height);
        }
        img.src = this.props.getBoardData(this.props.boardId);
    }

    toggleWriting = (event) => {
        if (!this.canvas) {
            return;
        }

        this.canWrite = this.canWrite == -1 ? 0 : -1;

        if(this.canWrite == -1) {
            // Remove any dangling cursor
            return;
        }

        // Place Cursor at the double clicked Position
        var rect = this.canvas.getBoundingClientRect();

        this.x = event.clientX - rect.left;
        this.y = event.clientY - rect.top;

        this.cursorX = this.x;
        this.cursorY = this.y;

        this.ctx.fillStyle = "white";
        this.ctx.fillText("_",this.x,this.y);
    }

    write = (event) => {
        if (this.canWrite == 0) {
            // Remove dangling cursor;
            
            this.canvas == 1;
            return;
        }
    
        var dim = this.ctx.measureText(this.sentence);
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(this.x,this.y-this.yOffset,dim.width,this.textWidth);

        var c = String.fromCharCode(event.keyCode);
        this.sentence += c;
        this.ctx.fillStyle = "white";
        this.ctx.fillText(this.sentence, this.x, this.y);
    }

    render() {
        const boardKey = `canvas-${this.props.boardId}`;

        return (
            <>
                <p className="boardTitle">{this.props.boardId}</p>
                <canvas height={screen.height} width={screen.width} className="activeBoard" key={boardKey} ref={ref => (this.canvas = ref)} />
            </>    
        )
    }
}
export default Board;