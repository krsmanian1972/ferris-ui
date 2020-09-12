import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import * as THREE from 'three';
import DragControls from 'three-dragcontrols';
import { ClickControls } from './ClickControls';
import TaskLinkFactory from './TaskLinkFactory';

import { Button } from 'antd';
import { EditOutlined, ScissorOutlined, NodeIndexOutlined } from '@ant-design/icons';

import Moment from 'react-moment';
import moment from 'moment';
import 'moment-timezone';

import { drawLineWithPrevPoint, snapAtClickPoint, SINGLE_BUFFER_GEO } from './lineOperations';
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

const MAX_POINTS = 500;
@inject("appStore")
@observer
class WorkflowUI extends Component {

    constructor(props) {
        super(props);

        this.taskBarGeo = new THREE.PlaneGeometry(barWidth, barHeight, barDepth);
        this.taskBarSquareGeo = new THREE.PlaneGeometry(squareBarWidth, squareBarHeight, barDepth);
        this.connectorGeo = new THREE.SphereGeometry(connectorRadius);

        this.gridLineMaterial = new THREE.LineDashedMaterial({ color: 0xD3D3D3, dashSize: 2, gapSize: 8, scale: 1 });

        this.taskBars = [];
        this.dots = [];
        this.selectedPort = {};

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

        this.taskLinkFactory = new TaskLinkFactory();
    }

    componentDidMount() {
        this.init();

        window.addEventListener("resize", this.handleWindowResize);

        this.dragControls.addEventListener('dragstart', this.dragStartCallback);
        this.dragControls.addEventListener('dragend', this.dragEndCallback);

        this.clickControls.addEventListener('onSelect', this.onConnectorSelect);

        this.renderer.domElement.addEventListener("mousemove", this.mouseMove);
        this.renderer.domElement.addEventListener("wheel", this.scroll);

        this.container.addEventListener("click", this.mouseClick);
        this.container.addEventListener("keydown", this.keyDown);
    }

    onConnectorSelect = (event) => {
        const connector = event.object;
        this.taskLinkFactory.onConnectorSelect(connector,this.scene);
    }


    keyDown = (event) => {
        if (event.keyCode === 27) {
        }
    }

    mouseClick = (event) => {
        var point = this.getClickPoint(event);

        if(this.taskLinkFactory.canDraw()) {
            this.taskLinkFactory.addVertex(point);
            return;
        }

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
    moveLinks = () =>{
      if(!this.selectedTaskBar ){
        return;
      }
      const taskId = this.selectedTaskBar.userData.id;

      var inboundLinks = this.getLinksByType(taskId, "target");
      for (var i = 0; i < inboundLinks.length; i++){
        inboundLinks[i] && inboundLinks[i].onMove("target");
      }

      var outboundLinks = this.getLinksByType(taskId, "source");
      for (var i = 0; i < outboundLinks.length; i++){
        outboundLinks[i] && outboundLinks[i].onMove("source");
      }

    }
    dragStartCallback = (event) => {
        this.selectedTaskBar = event.object;
        if (this.selectedTaskBar) {
            this.moveDots();
            this.moveLinks();

        }
    }

    dragEndCallback = (event) => {

        if (this.selectedTaskBar) {
            //align to X and Y to grid
            this.selectedTaskBar.position.y = Math.round(this.selectedTaskBar.position.y * 2) / 2;
            this.selectedTaskBar.position.x = Math.round(this.selectedTaskBar.position.x * 2) / 2;
            this.moveDots();
            this.moveLinks();
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
        this.clickControls = new ClickControls(this.dots, this.camera, this.renderer.domElement);
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

        const {connectorLeft,connectorRight,connectorTop, connectorBottom} = this.connectorMap[taskId];
        const links = [];
        if(connectorLeft.userData.taskLinkDirection === linkType){
          links.push(connectorLeft.userData.taskLink);
        }
        if(connectorRight.userData.taskLinkDirection === linkType){
          links.push(connectorRight.userData.taskLink);
        }
        if(connectorTop.userData.taskLinkDirection === linkType){
          links.push(connectorTop.userData.taskLink);
        }
        if(connectorBottom.userData.taskLinkDirection === linkType){
          links.push(connectorBottom.userData.taskLink);
        }
        return links;

    }

    populateTasks = () => {
        this.addTask(0, "START", "", "", "", 0, 3, "START_STOP_BOX");
        this.addTask(1, 'Task ', 'Completion Today', '2019-08-9', '2019-08-9', 0, 1, "DECISION_BOX");
        this.addTask(2, 'Work on it now', "", '2019-08-9', '2019-08-9', -2, -1, "");
        this.addTask(3, 'Look at it later', "", '2019-08-9', '2019-08-9', 2, -1, "");
        this.addTask(4, "STOP1", "", "", "", -2, -2.5, "CIRCLE");
        this.addTask(5, "STOP2", "", "", "", 2, -2.5, "CIRCLE");
    }

    addLink = (sourceTaskId,targetTaskId,sourcePort,targetPort,points) => {

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


        const connectorLeft = new THREE.Mesh(this.connectorGeo, new THREE.MeshBasicMaterial({ color: taskBarColor }));
        const connectorRight = new THREE.Mesh(this.connectorGeo, new THREE.MeshBasicMaterial({ color: taskBarColor }));
        const connectorTop = new THREE.Mesh(this.connectorGeo, new THREE.MeshBasicMaterial({ color: taskBarColor }));
        const connectorBottom = new THREE.Mesh(this.connectorGeo, new THREE.MeshBasicMaterial({ color: taskBarColor }));

        connectorLeft.position.set(x - xOffset / 2, y, 0);
        connectorLeft.userData = { id: taskId, direction: 'left',  };

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

        this.scene.add(group);

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
