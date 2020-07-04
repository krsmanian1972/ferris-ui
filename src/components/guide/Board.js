import React, { Component } from 'react';

class Board extends Component {
    constructor(props) {
        super(props);
        this.x = 0;
        this.y = 0;
        this.sentence = "";
        this.canWrite = -1;
        this.state = {
            cursorPos: [0, 0],
            cursorSize: [1, 15],
            cursorColour: '#FFFFFF',
            cursorBlinkSpeed: 1,
            backgroundColour: '#666',
            font: 'Arial',
            fontSize: 30,
            fontColour: '#000000',
            text: ''
        };
        this.cursorBlink = this.cursorBlink.bind(this);
    }

    componentDidMount() {
        this.ctx = this.canvas.getContext("2d");
        this.ctx.font = "16px Arial";
        this.ctx.fillStyle = "white";

        var temp=this.ctx.measureText('M');
        this.yOffset = temp.actualBoundingBoxAscent;
        this.textWidth = temp.width;
        //clearInterval(this.cursorBlinkFunc);
        //this.cursorBlinkFunc = setInterval(this.cursorBlink, this.state.cursorBlinkSpeed * 1000);

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
        this.eraseCursor(this.state.cursorPos[0], (this.state.cursorPos[1]));
        this.ctx.clearRect(this.state.cursorPos[0], (this.state.cursorPos[1]-5),5, 5);
        // Place Cursor at the double clicked Position
        this.ctx.beginPath();
        var rect = this.canvas.getBoundingClientRect();

        this.x = event.clientX - rect.left;
        this.y = event.clientY - rect.top;

        this.cursorX = this.x;
        this.cursorY = this.y;
        this.state.cursorPos = [this.cursorX, this.cursorY-10] 
        clearInterval(this.cursorBlinkFunc);
        this.cursorBlinkFunc = setInterval(this.cursorBlink, this.state.cursorBlinkSpeed * 1000);
        //this.ctx.fillStyle = "white";
        //this.ctx.fillText("_",this.x,this.y);
        this.sentence = '';
    }
    cursorBlink() {
        const x = this.state.cursorPos[0];
        const y = this.state.cursorPos[1];
        console.log('cursorBlink:', x, y);
        this.drawCursor(x, y);
        setTimeout(() => {
          this.eraseCursor(x, y);
        }, this.state.cursorBlinkSpeed / 2 * 1000);
      }
    
      drawCursor(x, y) {
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x, y + this.state.cursorSize[1]);
        this.ctx.lineWidth = this.state.cursorSize[0];
        this.ctx.strokeStyle = this.state.cursorColour;
        this.ctx.stroke();
      }
    
      eraseCursor(x, y) {
        this.ctx.lineTo(x, y + this.state.cursorSize[1]);
        this.ctx.strokeStyle = this.state.backgroundColour;
        this.ctx.stroke();
      }
    

    write = (event) => {
//        if (this.canWrite == 0) {
//            // Remove dangling cursor;
//            
//           this.canvas == 1;
//            return;
//        }
    
        this.ctx.beginPath();
        var c = String.fromCharCode(event.keyCode);
        this.sentence += c;
        this.ctx.fillStyle = "white";
        this.eraseCursor[this.state.cursorPos[0], this.state.cursorPos[1]];
        clearInterval(this.cursorBlinkFunc);

        var dim = this.ctx.measureText(this.sentence);
        this.ctx.fillStyle = "black";
        this.ctx.clearRect(this.x-5,this.y-this.yOffset,dim.width,this.textWidth+5);

        var dim = this.ctx.measureText(c);
        this.ctx.fillText(this.sentence, this.x, this.y);
        this.state.cursorPos =[this.state.cursorPos[0]+dim.width, this.state.cursorPos[1]];
        clearInterval(this.cursorBlinkFunc);
        this.cursorBlinkFunc = setInterval(this.cursorBlink, this.state.cursorBlinkSpeed * 1000);

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