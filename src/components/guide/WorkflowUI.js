import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import * as THREE from 'three';
import DragControls from 'three-dragcontrols';

import { Button } from 'antd';
import { EditOutlined, ScissorOutlined, NodeIndexOutlined } from '@ant-design/icons';

import Moment from 'react-moment';
import moment from 'moment';
import 'moment-timezone';

import { drawLineWithPrevPoint, snapAtClickPoint } from './lineOperations';
import { updateVertexMovement, removeRecurringPointOnLineSegment, removeLineSegmentOnCickPoint } from './lineOperations';

import { buildCircularTextMaterial, buildRectTextMaterial, buildSquareTextMaterial, buildStartStopTextMaterial } from './Shapes';
import { taskBarColor, barWidth, barHeight, barDepth, squareBarWidth, squareBarHeight, connectorRadius } from './Shapes';

const containerStyle = {
    height: window.innerHeight,
    width: window.innerWidth
};

const canvasStyle = {
    display: 'none'
}

const fov = 30;
const near = 0.1;
const far = 1000;

const pointLightColor = 0xffffff;
const pointLightPosition = 1;

const gridSize = 50;
const gridStep = 0.25;

@inject("appStore")
@observer
class WorkflowUI extends Component {

    constructor(props) {
        super(props);

        this.taskBarGeo = new THREE.PlaneGeometry(barWidth, barHeight, barDepth);
        this.taskBarSquareGeo = new THREE.PlaneGeometry(squareBarWidth, squareBarHeight, barDepth);
        this.connectorGeo = new THREE.SphereGeometry(connectorRadius);

        this.gridLineMaterial = new THREE.LineDashedMaterial({ color: 0xD3D3D3, dashSize: 2, gapSize: 8, scale: 1 });
        this.connectorMaterial = new THREE.MeshBasicMaterial({ color: taskBarColor })

        this.taskBars = [];
        this.dots = [];
        this.hoveredPort = {};
        

        this.connectorMap = {};

        this.lastEvent = null;
        this.sourceConnectorPort = {};
        this.destConnectorPort = {};

        this.mode = "";
        this.internalState = "";

        this.lineSegmentArray = [];
        this.lineSegmentArrayIndex = 0;
        this.line = [];

        this.clickCounter = 0;
        this.dragMode = {};
    }

    componentDidMount() {
        this.init();

        window.addEventListener("resize", this.handleWindowResize);

        this.dragControls.addEventListener('dragstart', this.dragStartCallback);
        this.dragControls.addEventListener('dragend', this.dragEndCallback);

        this.dotControls.addEventListener('hoveron', this.capturePort);
        this.dotControls.addEventListener('hoveroff', this.clearCapturedPort);

        this.renderer.domElement.addEventListener("mousemove", this.mouseMove);
        this.renderer.domElement.addEventListener("wheel", this.scroll);

        this.container.addEventListener("dblclick", this.toggleDrawMode);
        this.container.addEventListener("click", this.mouseClick);
        this.container.addEventListener("keydown", this.keyDown);
    }

    capturePort = (event) => {
        this.hoveredPort = event.object.userData;
    }

    clearCapturedPort = (event) => {
        this.hoveredPort = {};
    }

    keyDown = (event) => {
        if (event.keyCode === 27) {
        }
    }

    getPortDescription = (selectedPort) => {

        var sourceX, sourceY;

        const taskId = selectedPort.id;
        const direction = selectedPort.direction;
        const task = this.connectorMap[taskId]

        if (direction === "bottom") {
            sourceX = task.connectorBottom.position.x;
            sourceY = task.connectorBottom.position.y;
        }
        else if (direction === "top") {
            sourceX = task.connectorTop.position.x;
            sourceY = task.connectorTop.position.y;
        }
        else if (direction === "left") {
            sourceX = task.connectorLeft.position.x;
            sourceY = task.connectorLeft.position.y;
        }
        else if (direction === "right") {
            sourceX = task.connectorRight.position.x;
            sourceY = task.connectorRight.position.y;
        }

        return { x: sourceX, y: sourceY, taskId: taskId, direction: direction};
    }

    toggleDrawMode = (event) => {

        if (this.mode !== "FREE_LINE_CONNECTOR") {
            return;
        }

        const clickedPort = this.hoveredPort;
        this.hoveredPort = {};

        const portDescription = this.getPortDescription(clickedPort);
        const vertex = {x:portDescription.sourceX, y:portDescription.sourceY};
       
        if (this.internalState === "") {

            this.sourceConnectorPort[0] = portDescription;

            const segment = { sourceDescription: portDescription, destDescription: {}, path: [], line: [] };
            segment.path.push(vertex);
            
            this.lineSegmentArray[this.lineSegmentArrayIndex] = segment;

            this.internalState = "FOUND_SOURCE_PORT";
        }
        else if (this.internalState === "FOUND_SOURCE_PORT") {

            //since this is a double click event, 2 single clicks are logged, pop it out as a hack...
            this.lineSegmentArray[this.lineSegmentArrayIndex].path.pop();
            this.lineSegmentArray[this.lineSegmentArrayIndex].path.pop();

            var lineIndex = this.lineSegmentArray[this.lineSegmentArrayIndex].line.length - 1;
            this.scene.remove(this.lineSegmentArray[this.lineSegmentArrayIndex].line[lineIndex]);
            this.scene.remove(this.lineSegmentArray[this.lineSegmentArrayIndex].line[lineIndex - 1]);

            this.lineSegmentArray[this.lineSegmentArrayIndex].line.pop();
            this.lineSegmentArray[this.lineSegmentArrayIndex].line.pop();
            
            this.scene.remove(this.line[0]);

            this.destConnectorPort[0] = portDescription;
            this.lineSegmentArray[this.lineSegmentArrayIndex].path.push(vertex);

            var pathIndex = this.lineSegmentArray[this.lineSegmentArrayIndex].path.length - 1;
            this.lineSegmentArray[this.lineSegmentArrayIndex].destDescription = this.destConnectorPort[0];
            
            drawLineWithPrevPoint(this.lineSegmentArray, this.scene, this.lineSegmentArrayIndex, pathIndex, "");

            this.lineSegmentArrayIndex++;
            this.internalState = "";
        }
    }

    mouseClick = (event) => {
        var point = this.getClickPoint(event);

        if (this.mode === "VERTEX_DRAG_MODE") {
            removeRecurringPointOnLineSegment(this.lineSegmentArray, this.dragMode.arrayIndex, this.scene);
            this.mode = "";
            this.dragMode = {};
            return;
        }

        if (this.mode === "DELETE_CONNECTING_LINE") {
            var status = removeLineSegmentOnCickPoint(this.lineSegmentArray, point, this.scene);
            if (status === "SUCCESS") {
                this.lineSegmentArrayIndex--;
            }
            return;
        }

        if (this.mode === "") {
            var result = snapAtClickPoint(this.lineSegmentArray, point, this.scene);
            if (result.status === "SUCCESS") {
                this.dragMode.arrayIndex = result.arrayIndex;
                this.dragMode.pathIndex = result.pathIndex;
                this.mode = "VERTEX_DRAG_MODE";
            }
            return;
        }

        if (this.mode === "FREE_LINE_CONNECTOR") {
            if (this.internalState === "FOUND_SOURCE_PORT") {
                var clickX = point.x;
                var clickY = point.y;
                var index = this.lineSegmentArray[this.lineSegmentArrayIndex].path.length - 1;
                this.lineSegmentArray[this.lineSegmentArrayIndex].path.push({ x: clickX, y: clickY });
                drawLineWithPrevPoint(this.lineSegmentArray, this.scene, this.lineSegmentArrayIndex, index + 1, "");
            }
        }
    }


    updateConnectingLine = (index, port) => {
        var position = 0;
        var lineSource = {};
        var lineDest = {};

        if (port === "SOURCE") {
            position = 0;
            lineSource.x = this.lineSegmentArray[index].sourceDescription.x;
            lineSource.y = this.lineSegmentArray[index].sourceDescription.y;
            pathPosition = 1;
            this.lineSegmentArray[index].path[0].x = lineSource.x;
            this.lineSegmentArray[index].path[0].y = lineSource.y;
            drawLineWithPrevPoint(this.lineSegmentArray, this.scene, index, pathPosition, position);
        }
        else if (port === "DEST") {
            position = this.lineSegmentArray[index].line.length - 1;
            var pathPosition = this.lineSegmentArray[index].path.length - 1;
            lineSource.x = this.lineSegmentArray[index].path[pathPosition - 1].x;
            lineSource.y = this.lineSegmentArray[index].path[pathPosition - 1].y;
            lineDest.x = this.lineSegmentArray[index].destDescription.x;
            lineDest.y = this.lineSegmentArray[index].destDescription.y;
            this.lineSegmentArray[index].path[pathPosition].x = lineDest.x;
            this.lineSegmentArray[index].path[pathPosition].y = lineDest.y;
            drawLineWithPrevPoint(this.lineSegmentArray, this.scene, index, pathPosition, position);
        }
    }

    getClickPoint = (event) => {

        const width = this.container.clientWidth;
        const height = this.container.clientHeight
        const x = (event.offsetX / width) * 2 - 1;
        const y = -(event.offsetY / height) * 2 + 1;

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
            if (event.deltaY < 0) {
                this.camera.position.x -= 0.1;
            }
            else {
                this.camera.position.x += 0.1;
            }
            return;

        }

        if (event.shiftKey) {
            if (event.deltaY < 0) {
                this.camera.fov -= 3;
                this.camera.updateProjectionMatrix();
            }
            else {
                this.camera.fov += 3;
                this.camera.updateProjectionMatrix();

            }
            return;

        }

        if (event.deltaY > 0) {
            this.camera.position.y -= 0.1
        }
        else {
            this.camera.position.y += 0.1
        }
    }

    dragStartCallback = (event) => {
        this.selectedTaskBar = event.object;
        if (this.selectedTaskBar) {
            this.moveDots();
        }
    }

    dragEndCallback = (event) => {

        if (this.selectedTaskBar) {
            //align to X and Y to grid
            this.selectedTaskBar.position.y = Math.round(this.selectedTaskBar.position.y * 2) / 2;
            this.selectedTaskBar.position.x = Math.round(this.selectedTaskBar.position.x * 2) / 2;
            this.moveDots();
            this.selectedTaskBar = null;
        }

        if (this.mode === "VERTEX_DRAG_MODE") {
            this.mode = "";
        }
    }

    mouseMove = (event) => {
        var point = this.getClickPoint(event);
        if (this.selectedTaskBar) {
            this.moveDots();
            return;
        }
        if (this.mode === "VERTEX_DRAG_MODE") {
            updateVertexMovement(this.lineSegmentArray, this.dragMode.arrayIndex, this.dragMode.pathIndex, point, this.scene);
        }
        if (this.mode === "FREE_LINE_CONNECTOR") {
            if (this.internalState === "FOUND_SOURCE_PORT") {
                //draw projection of the line the previous points axis
                this.scene.remove(this.line[0]);
                var clickX = point.x;
                var clickY = point.y;
                var index = (this.lineSegmentArray[this.lineSegmentArrayIndex].path.length) - 1;
                var prevPoint = this.lineSegmentArray[this.lineSegmentArrayIndex].path[index];

                var points = [];
                var material = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 2 });
                points.push(new THREE.Vector3(prevPoint.x, prevPoint.y, 0));
                points.push(new THREE.Vector3(clickX, clickY, 0));

                var geometry = new THREE.BufferGeometry().setFromPoints(points);
                this.line[0] = new THREE.Line(geometry, material);
                this.scene.add(this.line[0]);
            }
        }
    }

    moveDots = () => {
        const taskName = this.selectedTaskBar.userData.id;
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

        const left = this.connectorMap[taskName].connectorLeft;
        const right = this.connectorMap[taskName].connectorRight;
        const top = this.connectorMap[taskName].connectorTop;
        const bottom = this.connectorMap[taskName].connectorBottom;

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

        //move the lines start point or end point as well
        for (var i = 0; i < this.lineSegmentArray.length; i++) {
            if (this.lineSegmentArray[i].sourceDescription.taskId === taskName) {
                var direction = this.lineSegmentArray[i].sourceDescription.direction;

                if (direction == "left") {
                    //left connector has a line
                    this.lineSegmentArray[i].sourceDescription.x = leftX;
                    this.lineSegmentArray[i].sourceDescription.y = leftY;
                    this.updateConnectingLine(i, "SOURCE");
                }
                if (direction == "right") {
                    //right connector has a line
                    this.lineSegmentArray[i].sourceDescription.x = rightX;
                    this.lineSegmentArray[i].sourceDescription.y = rightY;
                    this.updateConnectingLine(i, "SOURCE");
                }
                if (direction == "top") {
                    //Top connector has a line
                    this.lineSegmentArray[i].sourceDescription.x = topX;
                    this.lineSegmentArray[i].sourceDescription.y = topY;
                    this.updateConnectingLine(i, "SOURCE");
                }
                if (direction == "bottom") {
                    //bottom connector has a line
                    this.lineSegmentArray[i].sourceDescription.x = bottomX;
                    this.lineSegmentArray[i].sourceDescription.y = bottomY;
                    this.updateConnectingLine(i, "SOURCE");
                }
            }

            if (this.lineSegmentArray[i].destDescription.taskId === taskName) {
                var direction = this.lineSegmentArray[i].destDescription.direction;
                if (direction == "left") {
                    //left connector has a line
                    this.lineSegmentArray[i].destDescription.x = leftX;
                    this.lineSegmentArray[i].destDescription.y = leftY;
                    this.updateConnectingLine(i, "DEST");
                }
                if (direction == "right") {
                    //right connector has a line
                    this.lineSegmentArray[i].destDescription.x = rightX;
                    this.lineSegmentArray[i].destDescription.y = rightY;
                    this.updateConnectingLine(i, "DEST");
                }
                if (direction == "top") {
                    //Top connector has a line
                    this.lineSegmentArray[i].destDescription.x = topX;
                    this.lineSegmentArray[i].destDescription.y = topY;
                    this.updateConnectingLine(i, "DEST");
                }
                if (direction == "bottom") {
                    //bottom connector has a line
                    this.lineSegmentArray[i].destDescription.x = bottomX;
                    this.lineSegmentArray[i].destDescription.y = bottomY;
                    this.updateConnectingLine(i, "DEST");
                }
            }
        }
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

        this.camera.position.x = 1;
        this.camera.position.y = 0;
        this.camera.position.z = 15;

        this.scene.background = new THREE.Color(0xffffff);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.container.appendChild(this.renderer.domElement);

        const light = new THREE.PointLight(pointLightColor, pointLightPosition);
        light.position.set(1, 1, 1).normalize();
        this.scene.add(light);

        this.dragControls = new DragControls(this.taskBars, this.camera, this.renderer.domElement);
        this.dotControls = new DragControls(this.dots, this.camera, this.renderer.domElement);
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


    populateTasks = () => {
        this.addTask(1, "START", "", "", "", 0, 3, "START_STOP_BOX");
        this.addTask(2, 'Task ', 'Completion Today', '2019-08-9', '2019-08-9', 0, 1, "DECISION_BOX");
        this.addTask(3, 'Work on it now', "", '2019-08-9', '2019-08-9', -2, -1, "");
        this.addTask(4, 'Look at it later', "", '2019-08-9', '2019-08-9', 2, -1, "");
        this.addTask(5, "STOP", "", "", "", -2, -2.5, "CIRCLE");
        this.addTask(6, "STOP2", "", "", "", 2, -2.5, "CIRCLE");
    }

    addTask = (taskId, taskName, role, startDate, endDate, x, y, shape) => {

        const period = startDate + ' - ' + endDate;
        var taskMaterial = '';
        var taskBar = ''
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

        const group = new THREE.Group();
        group.add(taskBar);


        const connectorLeft = new THREE.Mesh(this.connectorGeo, this.connectorMaterial);
        const connectorRight = new THREE.Mesh(this.connectorGeo, this.connectorMaterial);
        const connectorTop = new THREE.Mesh(this.connectorGeo, this.connectorMaterial);
        const connectorBottom = new THREE.Mesh(this.connectorGeo, this.connectorMaterial);


        taskBar.position.set(x, y, 0);
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

        connectorLeft.position.set(x - xOffset / 2, y, 0);
        connectorLeft.userData = { id: taskId, direction: 'left' };

        connectorRight.position.set(x + xOffset / 2, y, 0);
        connectorRight.userData = { id: taskId, direction: 'right' };

        connectorTop.position.set(x, y + yOffset / 2, 0);
        connectorTop.userData = { id: taskId, direction: 'top' };

        connectorBottom.position.set(x, y - yOffset / 2, 0);
        connectorBottom.userData = { id: taskId, direction: 'bottom' };

        group.add(connectorLeft);
        group.add(connectorRight);
        group.add(connectorTop);
        group.add(connectorBottom);

        // we need task_id and task_name
        taskBar.userData = { id: taskId, type: 'taskBar', shape: shape };

        this.connectorMap[taskId] = { connectorLeft: connectorLeft, connectorRight: connectorRight, connectorTop: connectorTop, connectorBottom: connectorBottom };


        this.scene.add(group);

        this.taskBars.push(taskBar);
        this.dots.push(connectorLeft);
        this.dots.push(connectorRight);
        this.dots.push(connectorTop);
        this.dots.push(connectorBottom);

        this.camera.updateProjectionMatrix();
        this.renderer.render(this.scene, this.camera);
    }

    handleWindowResize = () => {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;

        this.camera.updateProjectionMatrix();
    }


    resetStateMachine = () => {
        this.mode = "";
    }

    drawFreeLineConnector = () => {
        this.mode = "FREE_LINE_CONNECTOR";
    }
    deleteConnectingLine = () => {
        this.mode = "DELETE_CONNECTING_LINE";
    }

    render() {
        return (
            <div style={containerStyle} id="paper" ref={ref => (this.container = ref)}>
                <Button onClick={this.resetStateMachine} id="connector" type="primary" icon={<EditOutlined />} shape={"circle"} />
                <Button onClick={this.drawFreeLineConnector} id="createobjective" type="primary" icon={<NodeIndexOutlined />} shape={"circle"} />
                <Button onClick={this.deleteConnectingLine} id="deleteConnectingLine" type="primary" icon={<ScissorOutlined />} shape={"circle"} />

                <div style={canvasStyle} id="workflowContainer" ref={ref => (this.workflowContainer = ref)} />
            </div>
        )
    }

}

export default WorkflowUI;
