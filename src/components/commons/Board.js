import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Row, Col, Tabs, Tooltip, Space, Spin } from 'antd';

import { fabric } from 'fabric';

import { EditOutlined, ItalicOutlined, UndoOutlined, RedoOutlined, ScissorOutlined } from '@ant-design/icons';

import socket from '../stores/socket';
import BoardListStore from "../stores/BoardListStore";
import { assetHost } from '../stores/APIEndpoints';

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
    { title: 'Board-1', key: '1', closable: false, isLoaded: true },
    { title: 'Board-2', key: '2', closable: false, isLoaded: true },
];

const CANVAS_WIDTH = 1280
const CANVAS_HEIGHT = 1280;

@inject("appStore")
@observer
class Board extends Component {

    constructor(props) {
        super(props);

        this.fabricObjectMap = {};
        this.objectCounter = 0;
        this.x = 0;
        this.y = 0;
        this.currentJsonPatch = '';
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

        this.hasCursor = false;
        this.state = {
            selectedButton: PEN,
            activeKey: initialPanes[0].key,
            panes: initialPanes,
            isLoading: true
        };
        //stores all co-ordinates of the paint event and emit them over socket when we take screenshot
        this.paintEvent = [];
        console.log("sessionId :: " + this.props.sessionId);
        this.sessionId = this.props.sessionId;
        this.provisionPriorBoards();
    }

    setCanvasData = async() => {
      console.log("Canvas Down Stream!!");
    }
    /**
     * Let us lazily load the boards. We need to check if there is any
     * prior boards for this session. If Yes, Load the first and mark the
     * rest of the panes as to be loaded.
     */
    provisionPriorBoards = async () => {

        const listStore = new BoardListStore({ apiProxy: this.props.appStore.apiProxy });
        await listStore.load(this.props.sessionUserId);
        //remove this to get the provisionBoard woriking
        
        listStore.boardCount = 0;
        if (listStore.boardCount === 0) {
            this.setState({ isLoading: false });
            return;
        }

        const { panes } = this.state;

        this.expandInitialPanes(panes, listStore.boardCount);
        await this.forceLoad(panes, 1);
        this.undoTab(false);

        this.setState({ panes: panes, isLoading: false })
    }

    expandInitialPanes = (panes, capacity) => {

        for (var i = 0; i < panes.length; i++) {
            panes[i].isLoaded = false;
        }

        const diff = capacity - panes.length;
        var boardIndex = panes.length + 1;

        for (var j = 0; j < diff; j++) {
            this.undoTabList[boardIndex] = [];

            const tab = { title: `Board-${boardIndex}`, key: `${boardIndex}`, closable: false, isLoaded: false };
            panes.push(tab);

            boardIndex++;
        }

        this.newTabIndex = boardIndex;
    }

    /**
     * Load the Board if not loaded already
     * @param {*} boardKey
     */
    salvage = async (boardKey) => {

        const { panes } = this.state;

        if (panes[boardKey - 1].isLoaded) {
            return;
        }

        await this.forceLoad(panes, boardKey);
    }

    /**
     * Loading the board forcefully from the content repository.
     *
     * May be useful for the first time when the react-state is yet to commit
     * the reality.
     *
     * @param {*} panes
     * @param {*} boardKey
     */
    forceLoad = async (panes, boardKey) => {
        const boardFileName = `Board_${boardKey}`;

        this.undoTabList[boardKey] = []

        try {
            const url = `${assetHost}/boards/${this.props.sessionUserId}/${boardFileName}`;
            const response = await this.props.appStore.apiProxy.getAsync(url);
            const data = await response.text();
            this.undoTabList[boardKey].push(data);
            panes[boardKey - 1].isLoaded = true;
        }
        catch(e) {
            this.undoTabList[boardKey] = [];
            panes[boardKey - 1].isLoaded = true;
        }


    }

    componentDidMount() {

        this.x = 0;
        this.y = 0;
        this.sentence = "";
        this.cursorPos = { x: 0, y: 0 };
        this.currentFreeDrawing = [];
        this.ctx = new fabric.Canvas('c', {isDrawingMode: false});
        var rect = new fabric.Rect({
            left: 100,
            top: 100,
            fill: 'red',
            width: 20,
            height: 20,
            id: 'RECT1',
            });
        var rect2 = new fabric.Rect({
                left: 180,
                top: 100,
                fill: 'red',
                width: 20,
                height: 20,
                id: 'RECT2',
                });
        this.ctx.add(rect);
        this.ctx.add(rect2);
        rect.excludeFromExport = true;
        rect2.excludeFromExport = true;
        this.fabricObjectMap[this.props.sessionUserId + 'RECT1'] = rect;
        this.fabricObjectMap[this.props.sessionUserId + 'RECT2'] = rect2;

        this.ctx.on('mouse:down', this.fabricOnMouseDown);
        this.ctx.on('mouse:move', this.fabricOnMouseMove);
        this.ctx.on('mouse:up', this.fabricOnMouseUp);
        this.ctx.on('path:created', this.fabricOnPathCreated)
        // var temp = this.ctx.measureText('M');
        // this.yOffset = temp.actualBoundingBoxAscent;
        // this.textWidth = temp.width;


        // this.canvas.addEventListener('touchstart', this.onTouchStart);
        // this.canvas.addEventListener('touchmove', this.onTouchMove);

        // window.addEventListener("keypress", this.write);

        // this.container.addEventListener('touchstart', this.preventScrolling);
        // this.container.addEventListener('touchmove', this.preventScrolling);
        // this.container.addEventListener('touchend', this.preventScrolling);

        socket.on('canvasdownstream', async (data) => {
            this.setCanvasData();
            console.log("Received Down Stream!!");
        });
        socket.on('dsPaint', (data) => {
             this.socketPaint(data);
        });

        
    }
    fabricOnMouseDown = (options) => {
        if(this.mode === PEN){
            this.currentFreeDrawing.push({x:options.e.clientX, y:options.e.clientY});
        }
    }

    fabricOnMouseMove = (options) => {
        if(this.mode === PEN){
            this.currentFreeDrawing.push({x:options.e.clientX, y:options.e.clientY});
        }
    }

    fabricOnMouseUp = (options) => {
        if(this.mode === PEN){
            this.currentFreeDrawing = [];
        }
    }
    fabricOnPathCreated = (options) => {
        if(this.mode === PEN){
            //console.log(options);
            options.path['id'] = this.props.sessionUserId + 'LINE' + this.objectCounter;
            this.fabricObjectMap[this.props.sessionUserId + 'LINE'+this.objectCounter] = options.path
            this.objectCounter = this.objectCounter + 1;
            //console.log("Export after object created");
            this.currentJsonPatch = this.ctx.toJSON(['id']);
            //console.log(this.currentJsonPatch);
            //disable exporting the object
            options.path['excludeFromExport'] = true;
            //publish the patch to the listeners

            socket.emit('usPaint', {jsonData: this.currentJsonPatch, sessionUserFuzzyId: this.props.sessionUserId, sessionId: this.sessionId })
        }
    }

    socketPaint = (data) => {
      console.log("SocketPaint Recieved");
      console.log(data);
      this.loadFromJsonPatch(data.data.jsonData);
    }

    preventScrolling = (e) => {
        if (e.target === this.canvas) {
            e.preventDefault();
        }
    }

    onMouseMove = (e) => {
        if (this.mode === PEN || this.mode === ERASER) {

            // Check whether we're holding the left click down while moving the mouse
            if (e.buttons === 1) {
              this.paintEvent.push([e.clientX, e.clientY]);
              this.paint(e);
            }
        }
    }

    onMouseDown = (e) => {
        // Reset current path if any...
        this.ctx.beginPath();

        //save board on every mouse down in a stack
        this.pushUndoList();

        //Place the textBox only if the user has selected the TextBox
        if (this.mode === TEXTBOX && e.buttons === 1) {
            this.textBox(e);
        }
    }

    // Let us transform the touchstart as MouseDownEvent and
    // dispatch back to the canvas
    onTouchStart = (e) => {
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY,
            buttons: 1
        });
        this.canvas.dispatchEvent(mouseEvent);
    }

    onTouchMove = (e) => {
        if (this.mode === PEN || this.mode === ERASER) {
            const touch = e.touches[0];
            const event = { clientX: touch.clientX, clientY: touch.clientY };
            this.paint(event);
        }
    }


    // Save the current tab information as the user may switch to a differnt tab
    componentWillUnmount() {
        this.pushUndoList();
    }


    pushUndoList = () => {
        const screenShot = this.canvas.toDataURL();
        this.undoTabList[this.currentTab].push(screenShot);

        const name = `Board_${this.currentTab}`;
        //this.sessionId = this.props.params.sessionId;
        //console.log(this.sessionId);
        socket.emit('canvasupstream', { content: screenShot, sessionUserFuzzyId: this.props.sessionUserId, name: name, sessionId: this.sessionId });
        console.log("Upstream::" + this.paintEvent);
        socket.emit('usPaint', {paintEvent: this.paintEvent, sessionUserFuzzyId: this.props.sessionUserId, name: name, sessionId: this.sessionId });
        //clear the array
        this.paintEvent = [];
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

        if (this.mode !== TEXTBOX) {
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

        var dimChar = this.ctx.measureText(c);
        this.cursorPos = { x: this.cursorPos.x + dimChar.width, y: this.cursorPos.y };

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

    loadFromJsonPatch = (jsonData) =>{
        //console.log(this.currentJsonPatch.objects[0]);
        //for(var i = 0; i < this.currentJsonPatch.)
        if(jsonData.objects[0].type === "path"){
            var pathArray = jsonData.objects[0].path;
            var id = jsonData.objects[0].id;
            
            var lineArray = new fabric.Path(pathArray);
            lineArray['id'] = id;

            lineArray['fill'] = backgroundColour;
            lineArray['stroke'] = '#000000';
            this.fabricObjectMap[id] = lineArray;
            lineArray['excludeFromExport'] = true;
            this.ctx.add(lineArray);
            this.ctx.renderAll();
            //console.log(this.ctx);

        }
    }

    freeDrawing = () => {
        this.stopCursorBlink();
        this.mode = PEN;
        this.setState({ selectedButton: this.mode });
        this.ctx.isDrawingMode = true;
        //console.log(this.ctx);

    }

    textWrite = () => {
        this.mode = TEXTBOX;
        this.setState({ selectedButton: this.mode });
        this.ctx.isDrawingMode = false;
        this.loadFromJsonPatch();
        //var json = this.ctx.toJSON(['id']);
        //console.log(json);


    }

    erase = () => {
        console.log("Original fabric canvas for comparision");
        console.log(this.ctx);
        this.stopCursorBlink();
        this.mode = ERASER;
        this.ctx.isDrawingMode = false;
        this.setState({ selectedButton: this.mode });
        console.log("Erase the RECT1 object");
        //erase the current Object
        this.ctx.remove(this.fabricObjectMap['RECT1']);
        this.ctx.remove(this.fabricObjectMap['LINE0']);
        this.ctx.remove(this.fabricObjectMap['LINE1']);


        
    }

    undoTab = (samePane) => {

        this.ctx.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);

        if (this.undoTabList[this.currentTab].length === 0) {
            return;
        }

        var me = this;

        var img = new Image();
        img.src = this.undoTabList[this.currentTab].pop();

        if (samePane === false) {
            this.undoTabList[this.currentTab].push(img.src);
        }

        img.onload = function () {
            me.ctx.drawImage(img, 0, 0, img.width, img.height);
        }
    }

    onTabClick = async (activeTab, mouseEvent) => {

        if (this.currentTab === activeTab) {
            return;
        }

        this.stopCursorBlink();
        this.pushUndoList();

        await this.salvage(activeTab);

        this.currentTab = activeTab;
        this.undoTab(false);
        this.freeDrawing();
    }

    onEdit = (targetKey, action) => {
        this[action](targetKey);
    };

    add = () => {

        const activeKey = `${this.newTabIndex}`;

        this.undoTabList[this.newTabIndex] = [];

        const { panes } = this.state;
        panes.push({ title: `Board-${this.newTabIndex}`, key: activeKey, closable: false, isLoaded: true });

        this.setState({ panes: panes, activeKey });

        this.newTabIndex++;
    };

    undoEvent = () => {
        this.undoTab(true);
    }

    getStyle = (compKey) => {
        if (this.mode === compKey) {
            return selected;
        }
        return unselected;
    }

    renderControls = (isLoading) => {

        if (isLoading) {
            return <Spin />
        }

        const { panes } = this.state;

        return (
            <Row>
                <Col span={12}>
                    <Tabs type="editable-card"
                        defaultActiveKey="1" tabPosition="top" style={{ height: 30 }}
                        onTabClick={this.onTabClick} onEdit={this.onEdit}>
                        {panes.map(pane => (
                            <TabPane tab={pane.title} key={pane.key} closable={pane.closable}>
                            </TabPane>
                        ))}
                    </Tabs>
                </Col>
                <Col span={10}>
                    <div style={{ float: "right", textAlign: "left", paddingRight: "10px", height: 30 }}>
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
                            </Tooltip>
                        </Space>
                    </div>
                </Col>
            </Row>
        )
    }

    render() {

        const { isLoading } = this.state;

        return (
            <div style={{ padding: 0 }}>
                <div style={{ background: "rgb(59,109,171)", height: 30 }}>
                    {this.renderControls(isLoading)}
                </div>
                <div style={{ overflow: "auto", border: "3px solid rgb(59,109,171)" }}>
                    <div key="container" id="container" ref={ref => (this.container = ref)}>
                        <canvas height={CANVAS_HEIGHT} width={CANVAS_WIDTH} className="activeBoard" key="canvas" ref={ref => (this.canvas = ref)} id='c' />
                    </div>
                </div>
            </div>
        )
    }
}
export default Board;
