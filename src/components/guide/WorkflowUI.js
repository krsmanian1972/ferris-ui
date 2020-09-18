import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import Moment from 'react-moment';
import moment from 'moment';
import 'moment-timezone';

import { Button, Row, Col, Typography, Tooltip, Space, Spin } from 'antd';
import { ScissorOutlined, CloseOutlined } from '@ant-design/icons';

import * as THREE from 'three';
import DragControls from 'three-dragcontrols';

import { ClickControls } from './ClickControls';
import TaskLinkFactory from './TaskLinkFactory';
import { LineObserver } from './LineObserver';

import { buildCircularTextMaterial, buildRectTextMaterial, buildSquareTextMaterial, buildStartStopTextMaterial } from './Shapes';
import { barWidth, barHeight, barDepth, squareBarWidth, squareBarHeight, connectorRadius } from './Shapes';

const { Title } = Typography;

const containerStyle = {
    height: window.innerHeight,
    width: window.innerWidth
};

const graphPaperStyle = {
    border: "1px solid black",
    borderRadius: "12px",
    maxHeight: window.innerHeight * .82,
    overflowY: "auto"
}

const fov = 33;
const near = 0.1;
const far = 1000;

const gridSize = 4 * 10;
const gridStep = 0.20;

const sceneColor = 0xffffff;
const gridColor = "#f2f2f2";

const blueLine = "#4169E1";
const greenLine = "#4e8d07"
const redLine = "#d1454d"

const dotColor = "#646464";
const yellow = "#fae78f"

@inject("appStore")
@observer
class WorkflowUI extends Component {

    constructor(props) {
        super(props);

        this.taskBarGeo = new THREE.PlaneGeometry(barWidth, barHeight, barDepth);
        this.taskBarSquareGeo = new THREE.PlaneGeometry(squareBarWidth, squareBarHeight, barDepth);
        this.connectorGeo = new THREE.SphereGeometry(connectorRadius);

        this.gridLineMaterial = new THREE.LineBasicMaterial({ color: gridColor });

        this.taskBars = [];
        this.dots = [];
        this.lineContainer = []

        this.taskGroupMap = new Map();
        this.connectorMap = {};

        this.selectedTaskBar = null;
        this.selectedLine = null;
    }

    componentDidMount() {
        this.init();

        window.addEventListener("resize", this.handleWindowResize);

        this.dragControls.addEventListener('dragstart', this.dragStartCallback);
        this.dragControls.addEventListener('dragend', this.dragEndCallback);

        this.taskControls.addEventListener('onRightClick', this.onTaskSelect);
        this.dotControls.addEventListener('onClick', this.onConnectorSelect);


        this.lineObserver.addEventListener('onHover', this.onLineHovered);
        this.lineObserver.addEventListener('onSelect', this.onLineSelected);
        this.lineObserver.addEventListener('offSelect', this.offLineSelected);
        this.lineObserver.addEventListener('offHover', this.offLineHovered);

        this.renderer.domElement.addEventListener("mousemove", this.mouseMove);
        this.renderer.domElement.addEventListener("wheel", this.scroll);
        this.renderer.domElement.addEventListener("click", this.mouseClick);

        this.container.addEventListener("keydown", this.keyDown);
        this.container.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        });

    }


    onConnectorSelect = (event) => {
        const connector = event.object;
        this.taskLinkFactory.onConnectorSelect(connector);
    }

    onLineHovered = (event) => {
        var line = event.object;
        if (line.userData.id) {
            if (this.hoveredLine) {
                this.hoveredLine.material.color.set(blueLine);
            }
            line.material.color.set(greenLine);
            this.hoveredLine = line;
        }
    }

    offLineHovered = (event) => {
        const line = event.object;
        if (line.userData.id) {
            line.material.color.set(blueLine);
            this.hoveredLine = null;
        }
    }

    onLineSelected = (event) => {
        const line = event.object;
        if (line.userData.id) {
            if (this.hoveredLine) {
                this.hoveredLine.material.color.set(blueLine);
            }
            if (this.selectedLine) {
                this.selectedLine.material.color.set(blueLine);
            }
            this.hoveredLine = null;
            this.selectedLine = null;

            line.material.color.set(redLine);
            this.selectedLine = line;
        }
    }

    offLineSelected = (event) => {
        const line = event.object;
        if (line.userData.id) {
            line.material.color.set(blueLine);
            this.selectedLine = null;
            this.hoveredLine = null;
        }
    }


    keyDown = (event) => {
        if (event.keyCode === 27) {

        }
    }

    mouseClick = (event) => {
        var point = this.getClickPoint(event);
        if (this.taskLinkFactory.canDraw()) {
            this.taskLinkFactory.addVertex(point);
            return;
        }
    }

    getClickPoint = (event) => {

        var rect = this.renderer.domElement.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;

        var vector = new THREE.Vector3(x, y, 0);
        vector.unproject(this.camera);

        var direction = vector.sub(this.camera.position).normalize();
        var distance = this.camera.position.z / direction.z;
        direction.multiplyScalar(-distance);

        var point = this.camera.position.clone().add(direction);

        return point;
    }

    scroll = (event) => {

        if (event.shiftKey && event.ctrlKey) {
            if (event.deltaX > 0) {
                this.camera.position.x -= 0.1;
            }
            else {
                this.camera.position.x += 0.1;
            }
            return;
        }

        if (event.shiftKey) {
            if (event.deltaY < 0) {
                this.camera.fov -= 1;
                this.camera.updateProjectionMatrix();
            }
            else {
                this.camera.fov += 1;
                this.camera.updateProjectionMatrix();
            }
            return;
        }

        if (event.deltaY > 0) {
            this.camera.position.y -= 0.1
        }
        else {
            if (this.camera.position.y < 0.1) {
                this.camera.position.y += 0.1
            }
        }

    }

    moveLinks = () => {
        if (!this.selectedTaskBar) {
            return;
        }
        const taskId = this.selectedTaskBar.userData.id;

        var inboundLinks = this.getLinksByType(taskId, "target");
        for (var i = 0; i < inboundLinks.length; i++) {
            inboundLinks[i] && inboundLinks[i].onMove("target");
        }

        var outboundLinks = this.getLinksByType(taskId, "source");
        for (var i = 0; i < outboundLinks.length; i++) {
            outboundLinks[i] && outboundLinks[i].onMove("source");
        }
    }

    onTaskSelect = (event) => {
        if (this.lockedTaskBar) {
            this.lockedTaskBar.material.color.set(sceneColor);
            this.lockedTaskBar = null;
        }
        else {
            this.lockedTaskBar = event.object
            this.lockedTaskBar.material.color.set(yellow);
        }

    }

    dragStartCallback = (event) => {
        this.selectedTaskBar = event.object;

        if (this.selectedTaskBar) {
            this.selectedTaskBar.material.color.set(yellow);
            this.moveDots();
            this.moveLinks();
        }
    }

    dragEndCallback = (event) => {

        if (this.selectedTaskBar) {

            this.moveDots();
            this.moveLinks();

            if (this.lockedTaskBar !== this.selectedTaskBar) {
                this.selectedTaskBar.material.color.set(sceneColor);
            }
            this.selectedTaskBar = null;
        }
    }

    mouseMove = (event) => {
        var point = this.getClickPoint(event);

        if (this.selectedTaskBar) {
            this.moveDots();
            this.moveLinks();
            return;
        }

        if (this.taskLinkFactory.canDraw()) {
            this.taskLinkFactory.updatePoint(point);
            return;
        }
    }

    moveDots = () => {
        const taskId = this.selectedTaskBar.userData.id;
        const shape = this.selectedTaskBar.userData.shape;

        var xOffset = barWidth;
        var yOffset = barHeight;

        if (shape === "CIRCLE") {
            xOffset = barHeight + 0.5;
            yOffset = barHeight;
        }
        if (shape === "DECISION_BOX") {
            xOffset = squareBarWidth;
            yOffset = squareBarHeight;
        }

        const left = this.connectorMap[taskId].connectorLeft;
        const right = this.connectorMap[taskId].connectorRight;
        const top = this.connectorMap[taskId].connectorTop;
        const bottom = this.connectorMap[taskId].connectorBottom;

        const leftX = this.selectedTaskBar.position.x - xOffset / 2;
        const leftY = this.selectedTaskBar.position.y;

        const rightX = this.selectedTaskBar.position.x + xOffset / 2;
        const rightY = this.selectedTaskBar.position.y;

        const topX = this.selectedTaskBar.position.x;
        const topY = this.selectedTaskBar.position.y + yOffset / 2;

        const bottomX = this.selectedTaskBar.position.x;
        const bottomY = this.selectedTaskBar.position.y - yOffset / 2;

        left.position.set(leftX, leftY, 0);
        right.position.set(rightX, rightY, 0);
        top.position.set(topX, topY, 0);
        bottom.position.set(bottomX, bottomY, 0);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleWindowResize);
    }

    init = () => {
        this.setupScene();
        this.setGraphPaper();
        this.populateTasks();
        this.animate();
    }

    animate = () => {
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
    }

    setupScene = () => {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(fov, width / height, near, far);

        this.camera.position.x = 0;
        this.camera.position.y = 0.1;
        this.camera.position.z = 15;

        this.scene.background = new THREE.Color(sceneColor);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.container.appendChild(this.renderer.domElement);

        this.dragControls = new DragControls(this.taskBars, this.camera, this.renderer.domElement);
        this.dotControls = new ClickControls(this.dots, this.camera, this.renderer.domElement);
        this.taskControls = new ClickControls(this.taskBars, this.camera, this.renderer.domElement);

        this.lineObserver = new LineObserver(this.lineContainer, this.camera, this.renderer.domElement);
        this.taskLinkFactory = new TaskLinkFactory(this.scene, this.lineContainer);
    };


    setGraphPaper = () => {

        const geometry = new THREE.Geometry();

        for (var i = -gridSize; i <= gridSize; i += gridStep) {
            geometry.vertices.push(new THREE.Vector3(-gridSize, i, 0));
            geometry.vertices.push(new THREE.Vector3(gridSize, i, 0));
            geometry.vertices.push(new THREE.Vector3(i, -gridSize, 0));
            geometry.vertices.push(new THREE.Vector3(i, gridSize, 0));
        }

        const grid = new THREE.LineSegments(geometry, this.gridLineMaterial);

        this.scene.add(grid);
    }

    getLinksByType = (taskId, linkType) => {
        const { connectorLeft, connectorRight, connectorTop, connectorBottom } = this.connectorMap[taskId];
        const links = [];
        if (connectorLeft.userData.taskLinkDirection === linkType) {
            links.push(connectorLeft.userData.taskLink);
        }
        if (connectorRight.userData.taskLinkDirection === linkType) {
            links.push(connectorRight.userData.taskLink);
        }
        if (connectorTop.userData.taskLinkDirection === linkType) {
            links.push(connectorTop.userData.taskLink);
        }
        if (connectorBottom.userData.taskLinkDirection === linkType) {
            links.push(connectorBottom.userData.taskLink);
        }
        return links;
    }

    populateTasks = () => {
        this.addTask(0, "START", "", "", "", 0, 4, "START_STOP_BOX");
        this.addTask(1, 'Rule: ', 'When Completed ?', '2019-08-9', '2019-08-9', 0, 2, "DECISION_BOX");
        this.addTask(2, 'Work on it now', "", '2019-08-9', '2019-08-9', -2, 0, "");
        this.addTask(3, 'Look at it later', "", '2019-08-9', '2019-08-9', 2, 0, "");
        this.addTask(4, "STOP 1", "", "", "", -2, -2, "CIRCLE");
        this.addTask(5, "STOP 2", "", "", "", 2, -2, "CIRCLE");
    }


    addLink = (sourceTaskId, targetTaskId, sourcePort, targetPort, points) => {

    }

    addTask = (taskId, taskName, role, startDate, endDate, x, y, shape) => {

        const period = startDate + ' - ' + endDate;

        var taskMaterial = null;
        var taskBar = null;

        if (shape === "") {
            taskMaterial = buildRectTextMaterial(1, taskName, role, period, period, shape);
            taskBar = new THREE.Mesh(this.taskBarGeo, taskMaterial);
        }
        else if (shape === "DECISION_BOX") {
            taskMaterial = buildSquareTextMaterial(2, taskName, role, period, period, shape);
            taskBar = new THREE.Mesh(this.taskBarSquareGeo, taskMaterial);
        }
        else if (shape === "CIRCLE") {
            taskMaterial = buildCircularTextMaterial(3, taskName, role, period, period);
            taskBar = new THREE.Mesh(this.taskBarGeo, taskMaterial);
        }
        else if (shape === "START_STOP_BOX") {
            taskMaterial = buildStartStopTextMaterial(3, taskName, role, period, period);
            taskBar = new THREE.Mesh(this.taskBarGeo, taskMaterial);
        }

        // we need task_id and task_name
        taskBar.userData = { id: taskId, type: 'taskBar', shape: shape };
        taskBar.position.set(x, y, 0);
        this.taskBars.push(taskBar);

        var xOffset = barWidth;
        var yOffset = barHeight;

        if (shape === "CIRCLE") {
            xOffset = barHeight + 0.5;
            yOffset = barHeight;
        }
        if (shape === "DECISION_BOX") {
            xOffset = squareBarWidth;
            yOffset = squareBarHeight;
        }

        const connectorLeft = new THREE.Mesh(this.connectorGeo, new THREE.MeshBasicMaterial({ color: dotColor }));
        const connectorRight = new THREE.Mesh(this.connectorGeo, new THREE.MeshBasicMaterial({ color: dotColor }));
        const connectorTop = new THREE.Mesh(this.connectorGeo, new THREE.MeshBasicMaterial({ color: dotColor }));
        const connectorBottom = new THREE.Mesh(this.connectorGeo, new THREE.MeshBasicMaterial({ color: dotColor }));

        connectorLeft.position.set(x - xOffset / 2, y, 0);
        connectorLeft.userData = { id: taskId, direction: 'left', };

        connectorRight.position.set(x + xOffset / 2, y, 0);
        connectorRight.userData = { id: taskId, direction: 'right' };

        connectorTop.position.set(x, y + yOffset / 2, 0);
        connectorTop.userData = { id: taskId, direction: 'top' };

        connectorBottom.position.set(x, y - yOffset / 2, 0);
        connectorBottom.userData = { id: taskId, direction: 'bottom' };

        this.connectorMap[taskId] = { connectorLeft: connectorLeft, connectorRight: connectorRight, connectorTop: connectorTop, connectorBottom: connectorBottom };

        this.dots.push(connectorLeft);
        this.dots.push(connectorRight);
        this.dots.push(connectorTop);
        this.dots.push(connectorBottom);

        const group = new THREE.Group();

        group.add(taskBar);

        group.add(connectorLeft);
        group.add(connectorRight);
        group.add(connectorTop);
        group.add(connectorBottom);

        group.userData = { id: taskId }
        this.scene.add(group);

        this.taskGroupMap.set(taskId, group);
    }

    handleWindowResize = () => {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;

        this.camera.updateProjectionMatrix();
    }


    deleteByLine = () => {
        if (this.selectedLine) {
            this.taskLinkFactory.deleteByLine(this.selectedLine)
            this.selectedLine = null;
            this.hoveredLine = null;
        }
    }

    deleteTask = () => {
        if (this.lockedTaskBar) {
            const taskId = this.lockedTaskBar.userData.id
            this.deleteTaskLinks(taskId);

            const group = this.taskGroupMap.get(taskId);
            this.scene.remove(group);

            this.selectedTask = null;
            this.lockedTask = null;

            this.taskGroupMap.delete(taskId);
        }
    }

    deleteTaskLinks = (taskId) => {
    
        var inboundLinks = this.getLinksByType(taskId, "target");
        for (var i = 0; i < inboundLinks.length; i++) {
            this.taskLinkFactory.delete(inboundLinks[i]);
        }

        var outboundLinks = this.getLinksByType(taskId, "source");
        for (var i = 0; i < outboundLinks.length; i++) {
            this.taskLinkFactory.delete(outboundLinks[i]);
        }
    }

    renderControls = (isLoading) => {

        if (isLoading) {
            return <Spin />
        }

        return (
            <Row>
                <Col span={12}>
                    <Title level={4}>Planning</Title>
                </Col>
                <Col span={10}>
                    <div style={{ float: "right", textAlign: "left", paddingRight: "10px" }}>
                        <Space>
                            <Tooltip title="Delete Selected Link">
                                <Button key="deleteByLine" onClick={this.deleteByLine} type="primary" icon={<ScissorOutlined />} shape={"circle"} />
                            </Tooltip>

                            <Tooltip title="Delete Selected Task">
                                <Button key="deleteTask" danger onClick={this.deleteTask} type="primary" icon={<CloseOutlined />} shape={"circle"} />
                            </Tooltip>
                        </Space>
                    </div>
                </Col>
            </Row>
        )
    }

    render() {
        return (
            <div>
                {this.renderControls(false)}
                <div style={graphPaperStyle}>
                    <div style={containerStyle} id="container" ref={ref => (this.container = ref)} />
                </div>
            </div>
        )
    }

}

export default WorkflowUI;
