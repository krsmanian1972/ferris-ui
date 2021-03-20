import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Row, Col, Tabs, Tooltip, Space } from 'antd';

import { fabric } from 'fabric';

import moment from 'moment';

import { EditOutlined, ItalicOutlined, ScissorOutlined, SelectOutlined } from '@ant-design/icons';

import socket from '../stores/socket';
import BoardListStore from "../stores/BoardListStore";
import { assetHost } from '../stores/APIEndpoints';

const { TabPane } = Tabs;

const CANVAS = 'canvas'
const PEN = 'PEN';
const ERASER = 'ERASER';
const TEXTBOX = 'TEXTBOX';
const SELECTION = 'SELECTION';

const BACKGROUND_COLOR = '#646464';
const COLOR = '#FFFFFF';
const FONT_SIZE = 20;
const DEFAULT_TEXT = 'Type here...'

const selected = { background: "white", color: "black", borderColor: "black" };
const unselected = {};
const initialPanes = [
    { title: 'Board-1', key: '1', closable: false, isLoaded: true },
    { title: 'Board-2', key: '2', closable: false, isLoaded: true },
];

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 1280;

const DOWNSTREAM_PAINT = "downstreamPaint";
const UPSTREAM_PAINT = "upstreamPaint";

const CANVAS_EVENT = "canvasEvent";
const WHICH_TAB_EVENT = "whichTab";
const TAB_CHANGED_EVENT = 'tabChanged';
const TAB_CREATION_EVENT = 'newTab';

const ADD_ACTION = "add";
const MODIFY_ACTION = "modify";
const ERASE_ACTION = "erase";

@inject("appStore")
@observer
class Board extends Component {

    constructor(props) {
        super(props);

        this.fabricObjectMap = new Map();
        this.objectCounter = 0;

        this.currentTab = 1;
        this.mode = PEN;

        this.state = {
            selectedButton: PEN,
            activeKey: initialPanes[0].key,
            panes: initialPanes,
            isLoading: true
        };

        this.isPushing = false;
    }

    componentDidMount() {

        this.ctx = new fabric.Canvas(this.canvas, { isDrawingMode: true });
        this.ctx.freeDrawingBrush.color = COLOR;

        this.ctx.on('path:created', this.fabricOnPathCreated);
        this.ctx.on('object:modified', this.fabricOnModified);
        this.ctx.on('object:removed', this.fabricOnRemoved);

        socket.on(DOWNSTREAM_PAINT, (event) => {
            this.socketEvent(event);
        });

        this.provisionPriorBoards();

        this.alignWithCoach();

        this.publishMyTab();
    }


    /**
     * We prefer a lazy load approach to load the boards.
     * 
     * We start by creating placeholder tabs and load the first tab if available.
     * 
     * Our strategy is to load a board when the user clicks on the tab. Loading by demand.
     * 
     * Before we load a board we should save the current board (No dirty check as of now).
     */
    provisionPriorBoards = async () => {

        const listStore = new BoardListStore({ apiProxy: this.props.appStore.apiProxy });
        await listStore.load(this.props.sessionId);

        if (listStore.boardCount === 0) {
            this.setState({ isLoading: false });
            return;
        }

        const { panes } = this.state;

        this.expandInitialPanes(panes, listStore.boardCount);

        // Ensure that we start from the 1st Tab
        this.currentTab = 1;

        this.pull();

        this.setState({ panes: panes, isLoading: false })
    }

    expandInitialPanes = (panes, capacity) => {

        for (var i = 0; i < panes.length; i++) {
            panes[i].isLoaded = false;
        }

        const diff = capacity - panes.length;
        var boardIndex = panes.length + 1;

        for (var j = 0; j < diff; j++) {
            const tab = { title: `Board-${boardIndex}`, key: `${boardIndex}`, closable: false, isLoaded: false };
            panes.push(tab);
            boardIndex++;
        }

        this.newTabIndex = boardIndex;
    }

    /**
     * if the user is not a coach, she/he will ask for which tab to focus. 
     * Usefull when a user disconnects and join into an ongoing session.
     * @returns 
     */
    alignWithCoach = () => {
        if (this.props.isCoach) {
            return;
        }
        socket.emit(UPSTREAM_PAINT, {
            type: WHICH_TAB_EVENT,
            userId: this.props.userId,
            sessionId: this.props.sessionId
        });
    }


    /**
     * We need a unique id for each of the objects on the canvas.
     * The Object Id is a combination of userId+"~"+Object Counter
     * 
     * Let us increment the objectCounter whenever we invoke this method.
     * 
     * Kind of RDBMS sequence creating technique!!!
     * 
     */
    nextObjectId = () => {
        var now = moment();
        return now;
    }

    /**
     * To notify the members of the conference/session about a change in the canvas.
     * The action may be either "add" or "modify".
     * 
     * @param {*} action 
     */
    emitCanvasEvent = (action) => {
        socket.emit(UPSTREAM_PAINT, {
            type: CANVAS_EVENT,
            action: action,
            jsonData: this.currentJsonPatch,
            isCoach: this.props.isCoach,
            userId: this.props.userId,
            sessionId: this.props.sessionId
        });
    }


    /**
     * When the user creates a new path in the canvas, we should notify
     * the listeners.
     * 
     * @param {*} options 
     */
    fabricOnPathCreated = (options) => {

        const objectId = this.nextObjectId();

        options.path['id'] = objectId;
        this.currentJsonPatch = this.ctx.toJSON(['id']);

        options.path['excludeFromExport'] = true;
        this.fabricObjectMap.set(objectId, options.path);

        this.emitCanvasEvent(ADD_ACTION);
    }

    /**
     * When the user modifies a canvas element. 
     * 
     * For example when changing
     * the text of a text box or transforming or translating 
     * the text box,  we send the event to the listeners.
     * 
     * @param {*} event 
     * 
     */
    fabricOnModified = (event) => {

        const objectId = event.target.id;

        const anObject = this.fabricObjectMap.get(objectId);

        if (!anObject) {
            return;
        }

        anObject.excludeFromExport = false;
        this.currentJsonPatch = this.ctx.toJSON(['id']);
        anObject.excludeFromExport = true;

        this.emitCanvasEvent(MODIFY_ACTION);
    }

    fabricOnRemoved = (event) => {
        const objectId = event.target.id;

        socket.emit(UPSTREAM_PAINT, {
            type: CANVAS_EVENT,
            action: ERASE_ACTION,
            jsonData: { id: objectId },
            isCoach: this.props.isCoach,
            userId: this.props.userId,
            sessionId: this.props.sessionId
        });
    }

    createTextBox = () => {
        this.mode = TEXTBOX;
        this.setState({ selectedButton: this.mode });
        this.ctx.isDrawingMode = false;

        const objectId = this.nextObjectId();

        const text = new fabric.Textbox(DEFAULT_TEXT, { width: 450 });
        text['id'] = objectId;
        text.set('backgroundColor', BACKGROUND_COLOR);
        text.set('stroke', COLOR);
        text.set('fill', COLOR);
        text.set("fontSize", FONT_SIZE);

        this.ctx.add(text);

        text.excludeFromExport = false;
        this.fabricObjectMap.set(objectId, text);
        this.currentJsonPatch = this.ctx.toJSON(['id']);
        text.excludeFromExport = true;

        this.emitCanvasEvent(ADD_ACTION);
    }

    addText = (jsonPart) => {
        const id = jsonPart.id;
        const textBox = new fabric.Textbox(jsonPart.text, { ...jsonPart });
        textBox.excludeFromExport = true;
        this.fabricObjectMap.set(id, textBox);
        this.ctx.add(textBox);
    }

    addPath = (jsonPart) => {
        const id = jsonPart.id;
        const path = new fabric.Path(jsonPart.path, { ...jsonPart });
        path.excludeFromExport = true;
        this.fabricObjectMap.set(id, path);
        this.ctx.add(path);
    }

    addObject = (jsonData) => {
        if (jsonData.objects.length === 0) {
            return;
        }

        const anObject = jsonData.objects[0];

        if (anObject.type === "textbox") {
            this.addText(anObject);
        }
        else {
            this.addPath(anObject);
        }

        this.ctx.renderAll();
    }

    deleteObject = (jsonData) => {
        if (!jsonData) {
            return;
        }
        const id = jsonData.id;
        const anObject = this.fabricObjectMap.get(id);
        if (anObject) {
            this.ctx.remove(anObject);
            this.fabricObjectMap.delete(id);
        }
    }

    modifyObject = (jsonData) => {
        if (jsonData.objects.length === 0) {
            return;
        }

        const anObject = jsonData.objects[0];
        const currentObject = this.fabricObjectMap.get(anObject.id);
        if (currentObject) {
            this.ctx.off('object:removed');
            this.ctx.remove(currentObject);
            this.ctx.on('object:removed', this.fabricOnRemoved);
        }

        if (anObject.type === "textbox") {
            this.addText(anObject);
        }
        else {
            this.addPath(anObject);
        }

        this.ctx.renderAll();
    }

    /**
     * When we receive events from upstream, we branch 
     * the Upstream events to the respective handlers
     * @param {*} event 
     * @returns 
     */
    socketEvent = (event) => {
        if (event.type === CANVAS_EVENT) {
            if (event.action === ADD_ACTION) {
                this.addObject(event.jsonData);
            }
            else if (event.action === MODIFY_ACTION) {
                this.modifyObject(event.jsonData);
            }
            else if (event.action === ERASE_ACTION) {
                this.deleteObject(event.jsonData);
            }
            this.push();
        }
        else if (event.type === TAB_CHANGED_EVENT) {
            this.onTabClick(event.activeKey);
        }
        else if (event.type === TAB_CREATION_EVENT) {
            this.onNewTab(event.activeKey);
        }
        else if (event.type === WHICH_TAB_EVENT) {
            this.publishMyTab();
        }
    }

    /**
     * Saving the canvas to a local storage. 
     * 
     * Saving is allowed only from the Coach's canvas.
     * 
     */
    push = async () => {
        if (!this.props.isCoach) {
            return;
        }
        this.isPushing = true;
        for (let path of this.fabricObjectMap.values()) {
            path.excludeFromExport = false;
        }

        const whole = this.ctx.toJSON(['id']);
        const name = `Board_${this.currentTab}`;
        socket.emit('canvasupstream', {
            content: whole,
            sessionId: this.props.sessionId,
            name: name
        });

        for (let path of this.fabricObjectMap.values()) {
            path.excludeFromExport = true;
        }

        this.isPushing = false;
    }

    /**
     * In the absence of version, the browser offers a cached version of the content.
     * 
     */
    pull = async () => {
        const boardFileName = `Board_${this.currentTab}`;

        const ver = new Date().getTime();
        const url = `${assetHost}/boards/${this.props.sessionId}/${boardFileName}?nocache=${ver}`;
        try {
            const response = await this.props.appStore.apiProxy.getAsync(url);
            const data = await response.text();
            const jsonData = JSON.parse(data);
            this.ctx.clear();
            this.fabricObjectMap.clear();

            const fabricObjects = jsonData.objects;

            for (let i = 0; i < fabricObjects.length; i++) {
                const anObject = fabricObjects[i];
                if (anObject.type === "textbox") {
                    this.addText(anObject);
                }
                else {
                    this.addPath(anObject);
                }
            }

            this.ctx.renderAll();
        }
        catch (e) {
            this.ctx.clear();
        }
    }


    /** 
     * Save the current tab information as the user may switch to a different component.
     * We won't save the drawings made by non-coach user.
    */
    componentWillUnmount() {
        this.push();
    }

    freeDrawing = () => {
        this.mode = PEN;
        this.setState({ selectedButton: this.mode });
        this.ctx.isDrawingMode = true;
        this.ctx.freeDrawingBrush.color = COLOR;
    }

    selection = () => {
        this.mode = SELECTION;
        this.setState({ selectedButton: this.mode });
        this.ctx.isDrawingMode = false;
    }

    erase = () => {

        this.mode = ERASER;
        this.setState({ selectedButton: this.mode });
        this.ctx.isDrawingMode = false;

        const activeObject = this.ctx.getActiveObject();

        if (!activeObject) {
            return;
        }
        const id = activeObject.id;

        this.ctx.remove(activeObject);
        this.fabricObjectMap.delete(id);
    }

    /**
    * The coach shall answer the whichTab question made by a non-coach user.
    * @returns 
    */
    publishMyTab = () => {
        if (!this.props.isCoach) {
            return;
        }

        socket.emit(UPSTREAM_PAINT, {
            type: TAB_CHANGED_EVENT,
            activeKey: this.currentTab,
            isCoach: this.props.isCoach,
            userId: this.props.userId,
            sessionId: this.props.sessionId
        });
    }

    /**
    * The coach shall answer the whichTab question made by a non-coach user.
    * @returns 
    */
    publishNewTab = (activeKey) => {
        if (!this.props.isCoach) {
            return;
        }

        socket.emit(UPSTREAM_PAINT, {
            type: TAB_CREATION_EVENT,
            activeKey: activeKey,
            isCoach: this.props.isCoach,
            userId: this.props.userId,
            sessionId: this.props.sessionId
        });
    }

    /**
     * When the User clicks on a Tab.
     * 
     * If we allow the coach and members to work on different tabs, it may cause mayhem.
     * At the same time we can allow a member to refer a different tab during a session.
     * 
     * Important : Tab Handling should be revisited
     *  
     * @param {*} activeKey 
     * @param {*} mouseEvent 
     * @returns 
     */
    onTabClick = async (activeKey, mouseEvent) => {

        if (this.currentTab === activeKey) {
            return;
        }

        await this.push();
        this.currentTab = activeKey;
        this.setState({ activeKey });
        await this.pull();

        this.publishMyTab();

        this.freeDrawing();
    }

    /**
     * Learnt from AntD, this interesting javascript technique. 
     * Treaing a local method as value in the current instance.
     * 
     * The action is add which is a method name in the current instance.
     * 
     * @param {*} targetKey 
     * @param {*} action 
     */
    onEdit = (targetKey, action) => {
        this[action](targetKey);
    };

    /**
     * When the coach creates a new tab, we provision a new pane
     * and should notify all the connected peers to provision a new tab
     * @returns 
     */
    add = async () => {

        if (!this.props.isCoach) {
            return;
        }

        const activeKey = `${this.newTabIndex}`;
        const { panes } = this.state;
        panes.push({ title: `Board-${this.newTabIndex}`, key: activeKey, closable: false, isLoaded: true });
        this.setState({ panes: panes, activeKey });

        this.publishNewTab(activeKey);

        this.newTabIndex++;
    };

    /**
     * When we receive an event from the upstream to provision a new tab.
     * @param {*} activeKey 
     */
    onNewTab = (activeKey) => {

        if (this.props.isCoach) {
            return;
        }

        const { panes } = this.state;
        panes.push({ title: `Board-${activeKey}`, key: activeKey, closable: false, isLoaded: true });
        this.setState({ panes: panes, activeKey });
    }

    getStyle = (compKey) => {
        if (this.mode === compKey) {
            return selected;
        }
        return unselected;
    }

    renderControls = (isLoading) => {

        const { panes, activeKey } = this.state;

        return (
            <Row>
                <Col span={12}>
                    <Tabs type="editable-card"
                        activeKey={activeKey}
                        tabPosition="top" style={{ height: 30 }}
                        onTabClick={this.onTabClick}
                        onEdit={this.onEdit}>
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
                                <Button onClick={this.createTextBox} id="textBox" style={this.getStyle(TEXTBOX)} type="primary" icon={<ItalicOutlined />} shape={"circle"} />
                            </Tooltip>
                            <Tooltip title="Select">
                                <Button onClick={this.selection} id="selection" style={this.getStyle(SELECTION)} type="primary" icon={<SelectOutlined />} shape={"circle"} />
                            </Tooltip>
                            <Tooltip title="Erase; Select an object and then click erase!">
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
                        <canvas height={CANVAS_HEIGHT} width={CANVAS_WIDTH} className="activeBoard" key={CANVAS} ref={ref => (this.canvas = ref)} />
                    </div>
                </div>
            </div>
        )
    }
}
export default Board;
