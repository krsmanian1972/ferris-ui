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
        //update objectCounter on Load
        this.objectCounter = 0;

        this.mode = PEN;

        this.state = {
            selectedButton: PEN,
            activeKey: initialPanes[0].key,
            panes: initialPanes,
            isLoading: true
        };
        this.sessionId = this.props.sessionId;
    }

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

        this.ctx = new fabric.Canvas('canvas', {isDrawingMode: true});

        this.ctx.on('mouse:down', this.fabricOnMouseDown);
        this.ctx.on('mouse:move', this.fabricOnMouseMove);
        this.ctx.on('mouse:up', this.fabricOnMouseUp);
        this.ctx.on('path:created', this.fabricOnPathCreated)
        //rename
        socket.on('dsPaint', (data) => {
             this.socketPaint(data);
        });

        this.provisionPriorBoards();

        
    }
    fabricOnMouseDown = (options) => {
    }

    fabricOnMouseMove = (options) => {
    }

    fabricOnMouseUp = (options) => {
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

    // Save the current tab information as the user may switch to a differnt tab
    componentWillUnmount() {
    }


    pushUndoList = () => {
    }

    loadFromJsonPatch = (jsonData) =>{
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
        this.mode = PEN;
        this.setState({ selectedButton: this.mode });
        this.ctx.isDrawingMode = true;

    }

    textWrite = () => {
        this.mode = TEXTBOX;
        this.setState({ selectedButton: this.mode });
        this.ctx.isDrawingMode = false;
        var text = new fabric.Textbox('Type your Text Here',  
        { 
            width: 450 
        }); 
        text['id'] = this.props.sessionUserId + 'LINE' + this.objectCounter;
        this.objectCounter = this.objectCounter + 1;

        text['excludeFromExport'] = true;

        this.ctx.add(text);
    }

    erase = () => {
    }

    undoTab = (samePane) => {
    }

    onTabClick = async (activeTab, mouseEvent) => {

    }

    add = () => {
    };

    undoEvent = () => {
    }

    getStyle = (compKey) => {
        if (this.mode === compKey) {
            return selected;
        }
        return unselected;
    }

    renderControls = (isLoading) => {

        // if (isLoading) {
        //     return <Spin />
        // }

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
                        <canvas height={CANVAS_HEIGHT} width={CANVAS_WIDTH} className="activeBoard" key="canvas" ref={ref => (this.canvas = ref)} id='canvas' />
                    </div>
                </div>
            </div>
        )
    }
}
export default Board;
