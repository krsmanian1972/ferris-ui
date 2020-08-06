import React, { Component } from 'react';
import { Button, Row, Col, Tabs, Tooltip, Space } from 'antd';
import { EditOutlined, ItalicOutlined, UndoOutlined, RedoOutlined, ScissorOutlined } from '@ant-design/icons';
import { Spin, Result } from 'antd';
import {SmileOutlined } from '@ant-design/icons';

import socket from '../stores/socket';
import BoardListStore from "../stores/BoardListStore";
import { assetHost } from '../stores/APIEndpoints';
import { inject, observer } from 'mobx-react';
const { TabPane } = Tabs;


const PEN = 'PEN';
const ERASER = 'ERASER';
const TEXTBOX = 'TEXTBOX';


const cursorColour = '#FFFFFF';
const cursorBlinkSpeed = 1 * 1000;
const backgroundColour = '#646464';
const cursorSize = { width: 1, height: 18 };

const selected = { background: "white", color: "black", borderColor: "black" };
const unselected = {};
const initialPanes = [
    { title: 'Board 1', key: '1', closable: false, },
    { title: 'Board 2', key: '2', closable: false, },
];

@inject("appStore")
@observer
class Board extends Component {
    constructor(props) {
        super(props);
        this.store = new BoardListStore({ apiProxy: props.appStore.apiProxy });
        this.store.load(props.sessionUserFuzzyId);
        this.sessionUserFuzzyId = this.props.sessionUserFuzzyId;
        this.apiProxy = this.props.appStore.apiProxy;
        this.x = 0;
        this.y = 0;

        this.sentence = "";
        this.textWidth = 0;

        this.cursorPos = { x: 0, y: 0 };
        this.cursorSize = 10;

        this.mode = PEN;

        this.redoList = [];
        this.undoList = [];

        this.undoTabList = {};
        this.undoTabList[1] = [];
        this.undoTabList[2] = [];

        this.currentTab = 1;
        this.newTabIndex = 3;
        this.boardsRestored = false;

        this.state = {
            selectedButton: PEN,
            activeKey: initialPanes[0].key,
            panes: initialPanes,

        };

        this.hasCursor = false;
    }

    restoreBoardsFromPreviousSession = async (boardId, index) => {

        const url = `${assetHost}/boards/${this.props.sessionUserFuzzyId}/${boardId}`;

        const response = await this.apiProxy.getAsync(url);
        const data = await response.text();
       if(index <= 2) {
           // console.log(`less than newTabIndex ${index}`);
        }

        else{
           this.add();
        }
        
        console.log(`index is ${index}`);
        console.log(`newTabIndex is ${this.newTabIndex}`);
        this.undoTabList[index].push(data);

    }

    componentDidMount() {
        this.x = 0;
        this.y = 0;
        this.sentence = "";
        this.cursorPos = { x: 0, y: 0 };

        this.ctx = this.canvas.getContext("2d");
        this.ctx.font = "16px Courier";
        this.ctx.fillStyle = "white";

        var temp = this.ctx.measureText('M');
        this.yOffset = temp.actualBoundingBoxAscent;
        this.textWidth = temp.width;


        //In mouse down start drawing
        this.canvas.addEventListener('mousedown', (e) => {

            // Reset current path if any...
            this.ctx.beginPath();

            //save board on every mouse down in a stack
            this.pushUndoList();

            //Place the textBox only if the user has selected the TextBox
            if (this.mode === TEXTBOX && e.buttons === 1) {
                this.textBox(e);
            }

        });

        this.canvas.addEventListener('mousemove', (e) => {

            if (this.mode === PEN || this.mode === ERASER) {

                // Check whether we're holding the left click down while moving the mouse
                if (e.buttons === 1) {
                    this.paint(e);
                }

            }
        });

        window.addEventListener("keypress", this.write);

    }
    
    

    // unregister the event listeners
    componentWillUnmount() {


    }

    pushUndoList = () => {
        const screenShot = this.canvas.toDataURL();
        this.undoTabList[this.currentTab].push(screenShot);

        const name = `Board_${this.currentTab}`;
        socket.emit('canvasupstream', { content: screenShot, sessionUserFuzzyId: this.props.sessionUserFuzzyId, name: name });
    }

    textBox = (event) => {
        if (!this.canvas) {
            return;
        }

        if (this.mode !== TEXTBOX) {
            return;
        }

        this.sentence = '';

        clearInterval(this.cursorBlinkFunc);
        this.ctx.beginPath();
        this.ctx.clearRect(this.cursorPos.x, this.cursorPos.y - 5, 8, 8);

        // Place Cursor at the double clicked Position
        var rect = this.canvas.getBoundingClientRect();
        this.x = Math.round((event.clientX - rect.left) / this.cursorSize * this.cursorSize);
        this.y = Math.round((event.clientY - rect.top) / this.cursorSize * this.cursorSize);

        this.cursorPos = { x: this.x, y: this.y - 10 };
        this.cursorBlinkFunc = setInterval(this.cursorBlink, cursorBlinkSpeed);
        this.hasCursor = true;
    }

    newLine = () => {

        this.sentence = '';

        clearInterval(this.cursorBlinkFunc);
        this.eraseCursor();
        this.ctx.beginPath();
        this.ctx.clearRect(this.cursorPos.x, this.cursorPos.y - 5, 8, 12);

        var rect = this.canvas.getBoundingClientRect();

        //move the cursor to a new line
        this.y = this.y + 15;
        this.cursorPos = { x: this.x, y: this.y - 10 };
        this.cursorBlinkFunc = setInterval(this.cursorBlink, cursorBlinkSpeed);

        this.pushUndoList();
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

        if(this.mode !== TEXTBOX) {
            return;
        }

        var c = String.fromCharCode(event.keyCode);

        if (event.keyCode === 13) {
            this.newLine();
            c = '';
        }
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

        if (this.mode === ERASER) {
            this.ctx.strokeStyle = backgroundColour;
            this.ctx.lineWidth = (cursorSize.width + 10);
        }
        else {
            this.ctx.strokeStyle = "white";
            this.ctx.lineWidth = cursorSize.width;
        }
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    stopCursorBlink = () => {
        if (!this.hasCursor) {
            return;
        }

        clearInterval(this.cursorBlinkFunc);
        this.eraseCursor();
        this.ctx.beginPath();
        this.ctx.clearRect(this.cursorPos.x, this.cursorPos.y - 5, 8, 0);
        this.hasCursor = false;
        this.sentence = '';
    }

    freeDrawing = () => {
        this.stopCursorBlink();
        this.mode = PEN;
        this.setState({ selectedButton: this.mode });
    }

    textWrite = () => {
        this.mode = TEXTBOX;
        this.setState({ selectedButton: this.mode });
    }

    erase = () => {
        this.stopCursorBlink();
        this.mode = ERASER;
        this.setState({ selectedButton: this.mode });
    }

    undoTab = (samePane) => {
        console.log(`Undoing tab : ${this.currentTab}`);
        if (this.undoTabList[this.currentTab].length === 0) {
            this.ctx.clearRect(0, 0, screen.width, screen.height);
            return;
        }

        var me = this;

        var img = new Image();
        img.src = this.undoTabList[this.currentTab].pop();

        if (samePane === false) {
            this.undoTabList[this.currentTab].push(img.src);
        }

        img.onload = function () {
            me.ctx.clearRect(0, 0, img.width, img.height);
            me.ctx.drawImage(img, 0, 0, img.width, img.height);
        }
    }

    onTabClick = (activeTab, mouseEvent) => {

        if (this.currentTab === activeTab) {
            return;
        }

        this.stopCursorBlink();
        this.pushUndoList();

        this.currentTab = activeTab;
        
        this.undoTab(false);
        this.freeDrawing();
    }

    onEdit = (targetKey, action) => {
        this[action](targetKey);
    };

    undoEvent = () => {
        this.undoTab(true);
    }

    add = () => {

        const activeKey = `${this.newTabIndex}`;

        this.undoTabList[this.newTabIndex] = [];

        const { panes } = this.state;
        const newPanes = [...panes];
        newPanes.push({ title: `Board - ${this.newTabIndex}`, key: activeKey, closable: false, });
        this.setState({
            panes: newPanes,
            activeKey,
        });

        this.newTabIndex++;
    };

    getStyle = (compKey) => {
        if (this.mode === compKey) {
            return selected;
        }
        return unselected;
    }
    loadPrevBoards = (boards,boardCount) =>{
        console.log(boards);
        console.log(boardCount);
        var index = 1;
        if(boardCount === 0){
           return;
        }
        if(this.boardsRestored === false){
            boards.map(item => {
                console.log(`${item.Ok}`);
                this.restoreBoardsFromPreviousSession(item.Ok, index);
                index = index + 1;
                if(index === boardCount){
                     this.boardsRestored = true;
                }
            });
        }
        
    }
    renderMethod = (panes, boards, boardCount) => {

        if (boardCount === 0 && !(this.isDone)) {
            return (
            <div style={{ padding: 0, height: screen.height }}>
//            <canvas height={screen.height} width={screen.width} className="activeBoard" key="canvas" ref={ref => (this.canvas = ref)} />
            <Result icon={<SmileOutlined />}  subTitle="Waiting for your boards."/>
            </div>
            )
        }
        else {
            return (
            <div style={{ padding: 0, height: screen.height }}>
                <Row>
                    <Col span={10}>
                        <Tabs type="editable-card"
                            defaultActiveKey="1" tabPosition="top" style={{ maxHeight: 30 }}
                            onTabClick={this.onTabClick} onEdit={this.onEdit}>
                            {panes.map(pane => (
                                <TabPane tab={pane.title} key={pane.key} closable={pane.closable}>
                                </TabPane>
                            ))}
                        </Tabs>
                    </Col>
                    <Col span={12}>
                        <div style={{ float: "right", textAlign: "left", paddingRight: "10px" }}>
                            <Space>
                                <Tooltip title="Pen">
                                    <Button onClick={this.freeDrawing} id="pen" style={this.getStyle(PEN)} type="primary" icon={<EditOutlined />} shape={"circle"} />
                                </Tooltip>
                                <Tooltip title="TextBox">
                                    <Button onClick={this.textWrite} id="textBox" style={this.getStyle(TEXTBOX)} type="primary" icon={<ItalicOutlined />} shape={"circle"} />
                                </Tooltip>
                                <Tooltip title="Undo">
                                    <Button onClick={this.undoEvent} id="undo" style={this.state.undoShape} type="primary" icon={<UndoOutlined />} shape={"circle"} />
                                </Tooltip>
                                <Tooltip title="Redo">
                                    <Button onClick={this.redo} id="redo" style={this.state.redoShape} type="primary" icon={<RedoOutlined />} shape={"circle"} />
                                </Tooltip>
                                <Tooltip title="Erase">
                                    <Button onClick={this.erase} id="erase" style={this.getStyle(ERASER)} type="primary" icon={<ScissorOutlined />} shape={"circle"} />
                                   <Button onClick={this.loadPrevBoards(boards,boardCount)} id="erase" style={this.getStyle(ERASER)} type="primary" icon={<ScissorOutlined />} shape={"circle"} />

                                </Tooltip>
                            </Space>
                        </div>
                    </Col>
                </Row>
                <canvas height={screen.height} width={screen.width} className="activeBoard" key="canvas" ref={ref => (this.canvas = ref)} />
            </div>
        )

        
        }

    }
    render() {
        const { panes } = this.state;
        const boards = this.store.boards;
        const boardCount = this.store.boardCount;
        return(
    		<>
		        {this.renderMethod(panes, boards, boardCount)}
	        </>
        )

    }
}
export default Board;
