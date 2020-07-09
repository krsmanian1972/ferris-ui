import React, { Component } from 'react';
import { Button, Row, Col, Tooltip, Space } from 'antd';
import { message } from 'antd';
import { EditOutlined, ItalicOutlined } from '@ant-design/icons';

const POINTER = 'Pointer';
const PEN = 'PEN';
const ERASER = 'ERASER';
const TEXTBOX = 'TEXTBOX';
const DEFAULT = '';

const cursorColour = '#000000';
const cursorBlinkSpeed = 1 * 1000;
const backgroundColour = '#FFFFFF';
const cursorSize = { width: 1, height: 15 };

const selected = { background: "white", color: "black", borderColor: "black" };
const unselected = {};

class Board extends Component {
    constructor(props) {
        super(props);

        this.x = 0;
        this.y = 0;
        this.sentence = "";
        this.canWrite = -1;
        this.textWidth = 0;
        this.cursorPos = { x: 0, y: 0 };
        this.mode = DEFAULT;
        this.gridPixelSize = 10;
        this.majorGrid = this.gridPixelSize * 10
        this.majorGridLineWidth = 1
        this.minorGridLineWidth = 0.5

        this.state = {
            penShape: unselected,
            textBoxShape: unselected,
        };
    }

    componentDidMount() {
        this.x = 0;
        this.y = 0;
        this.sentence = "";
        this.canWrite = -1;
        this.cursorPos = { x: 0, y: 0 };

        this.ctx = this.canvas.getContext("2d");
        this.ctx.font = "16px Courier";
        this.ctx.fillStyle = "white";

        var temp = this.ctx.measureText('M');
        this.yOffset = temp.actualBoundingBoxAscent;
        this.textWidth = temp.width;
        this.drawGrid();
        this.canvas.addEventListener("dblclick", this.toggleWriting);
        //In mouse down start drawing
        this.canvas.addEventListener('mousedown', (e) => {

            this.ctx.beginPath();

            if (this.mode === TEXTBOX) {
                if (e.buttons === 1) {
                    this.textBox(e);
                }
            }

        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.mode === PEN) {

                // Check whether we're holding the left click down while moving the mouse
                if (e.buttons === 1) {
                    this.paint(e);
                }

            }
        });
        window.addEventListener("keypress", this.write);
        this.restore();
    }
    componentWillUnmount() {

        this.save();
    }

    drawGrid = () => {
        this.ctx.lineWidth = 0.1;
        this.ctx.strokeStyle = 'rgb(110,110,110)';

        // horizontal grid lines
        for (var i = 0; i <= this.canvas.height; i = i + this.gridPixelSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            if (i % parseInt(this.majorGrid) == 0) {
                this.ctx.lineWidth = this.majorGridLineWidth;
            } else {
                this.ctx.lineWidth = this.minorGridLineWidth;
            }
            this.ctx.closePath();
            this.ctx.stroke();
        }

        // // vertical grid lines
        for (var j = 0; j <= this.canvas.width; j = j + this.gridPixelSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(j, 0);
            this.ctx.lineTo(j, this.canvas.height);
            if (j % parseInt(this.majorGrid) == 0) {
                this.ctx.lineWidth = this.majorGridLineWidth;
            } else {
                this.ctx.lineWidth = this.minorGridLineWidth;
            }
            this.ctx.closePath();
            this.ctx.stroke();
        }
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

    textBox = (event) => {
        if (this.mode === TEXTBOX) {
            if (!this.canvas) {
                return;
            }
            this.sentence = '';
            clearInterval(this.cursorBlinkFunc);
            this.ctx.beginPath();
            this.ctx.clearRect(this.cursorPos.x, this.cursorPos.y - 5, 8, 8);
            console.log("writing!!");
            // Place Cursor at the double clicked Position
            var rect = this.canvas.getBoundingClientRect();

            this.x = Math.round((event.clientX - rect.left) / this.gridPixelSize * this.gridPixelSize);
            this.y = Math.round((event.clientY - rect.top) / this.gridPixelSize * this.gridPixelSize);
            console.log(this.x, this.y);
            this.cursorPos = { x: this.x, y: this.y - 10 };
            this.cursorBlinkFunc = setInterval(this.cursorBlink, cursorBlinkSpeed);

        }
    }

    cursorBlink = () => {

        this.drawCursor();

        setTimeout(() => this.eraseCursor(), cursorBlinkSpeed / 2);
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

    eraseCursor = () => {
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
        this.cursorPos = { x: this.cursorPos.x + dim.width, y: this.cursorPos.y };

        this.cursorBlinkFunc = setInterval(this.cursorBlink, cursorBlinkSpeed);
    }

    paint = (e) => {

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = cursorSize.width;
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';
        this.ctx.lineTo(x, y);
        this.ctx.stroke();

    }

    freeDrawing = () => {
        console.log("FreeDrawing!!");
        this.mode = PEN;

        //stop the cursor blink
        clearInterval(this.cursorBlinkFunc);
        this.ctx.beginPath();
        this.ctx.clearRect(this.cursorPos.x, this.cursorPos.y - 5, 8, 8);

        this.setState({ penShape: selected, textBoxShape: unselected });
    }

    textWrite = () => {
        this.mode = TEXTBOX;
        this.setState({ penShape: unselected, textBoxShape: selected });
        console.log("TextBox!!");
    }


    render() {
        const boardKey = `canvas-${this.props.boardId}`;

        return (
            <div style={{ padding: 0, height: screen.height }}>
                <Row>
                    <Col span={12}>
                        <p className="boardTitle" style={{ float: "left", paddingLeft: "10px" }}>{this.props.boardId}</p>
                    </Col>
                    <Col span={12}>
                        <div style={{ float: "right", textAlign: "left", paddingRight: "10px" }}>
                            <Space>
                                <Tooltip title="Pen">
                                    <Button onClick={this.freeDrawing} id="pen" style={this.state.penShape} type="primary" icon={<EditOutlined />} shape={"circle"} />
                                </Tooltip>
                                <Tooltip title="TextBox">
                                    <Button onClick={this.textWrite} id="pen" style={this.state.textBoxShape} type="primary" icon={<ItalicOutlined />} shape={"circle"} />
                                </Tooltip>
                            </Space>
                        </div>
                    </Col>
                </Row>

                <canvas height={screen.height} width={screen.width} className="activeBoard" key={boardKey} ref={ref => (this.canvas = ref)} />
            </div>
        )
    }
}
export default Board;
