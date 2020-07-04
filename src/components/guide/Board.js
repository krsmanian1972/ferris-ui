import React, { Component } from 'react';

const cursorColour = '#FFFFFF';
const cursorBlinkSpeed = 1*1000;
const backgroundColour = '#666';
const cursorSize = { width: 1, height: 15 };

class Board extends Component {
    constructor(props) {
        super(props);

        this.x = 0;
        this.y = 0;
        this.sentence = "";
        this.canWrite = -1;
        this.textWidth = 0;
        this.cursorPos= { x: 0, y: 0 };
    }

    componentDidMount() {
        this.x = 0;
        this.y = 0;
        this.sentence = "";
        this.canWrite = -1;
        this.cursorPos= { x: 0, y: 0 };

        this.ctx = this.canvas.getContext("2d");
        this.ctx.font = "16px Arial";
        this.ctx.fillStyle = "white";

        var temp = this.ctx.measureText('M');
        this.yOffset = temp.actualBoundingBoxAscent;
        this.textWidth = temp.width;

        this.canvas.addEventListener("dblclick", this.toggleWriting);
        window.addEventListener("keypress", this.write);
        this.restore();
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

        if (this.canWrite == -1) {
            // Remove any dangling cursor
            return;
        }

        this.eraseCursor();
        this.ctx.clearRect(this.cursorPos.x, this.cursorPos.y - 5, 5, 5);

        // Place Cursor at the double clicked Position
        this.ctx.beginPath();
        var rect = this.canvas.getBoundingClientRect();

        this.x = event.clientX - rect.left;
        this.y = event.clientY - rect.top;

        this.cursorPos = {x:this.x, y:this.y - 10};

        this.cursorBlinkFunc = setInterval(this.cursorBlink, cursorBlinkSpeed);
        
        this.sentence = '';
    }

    cursorBlink = () => {
       
        this.drawCursor();
        
        setTimeout(() => this.eraseCursor(), cursorBlinkSpeed / 2 );
    }

    drawCursor = () => {
        const x = this.cursorPos.x; 
        const y = this.cursorPos.y;

        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x, y + cursorSize.height);
        this.ctx.lineWidth = cursorSize.width;
        this.ctx.strokeStyle = cursorColour;
        this.ctx.stroke();
    }

    eraseCursor = () =>{
        const x = this.cursorPos.x; 
        const y = this.cursorPos.y;

        this.ctx.lineTo(x, y + cursorSize.height);
        this.ctx.strokeStyle = backgroundColour;
        this.ctx.stroke();
    }


    write = (event) => {
   
        var c = String.fromCharCode(event.keyCode);
        this.sentence += c;

        this.ctx.beginPath();
        
        clearInterval(this.cursorBlinkFunc);

        var dim = this.ctx.measureText(this.sentence);
        this.ctx.clearRect(this.x - 5, this.y - this.yOffset, dim.width, this.textWidth + 5);
        
        this.ctx.fillStyle = "white";
        this.ctx.fillText(this.sentence, this.x, this.y);
        
        var dim = this.ctx.measureText(c);
        this.cursorPos = {x: this.cursorPos.x + dim.width, y: this.cursorPos.y};

        this.cursorBlinkFunc = setInterval(this.cursorBlink, cursorBlinkSpeed);
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