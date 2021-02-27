import * as THREE from 'three';

import DragControls from 'three-dragcontrols';

import { ClickControls } from './ClickControls';
import { LineObserver } from './LineObserver';
import TaskLinkFactory from './TaskLinkFactory';

import { buildCircularTextMaterial, buildRectTextMaterial, buildSquareTextMaterial, buildStartStopTextMaterial } from './Shapes';
import { barWidth, barHeight, barDepth, squareBarWidth, squareBarHeight, connectorRadius } from './Shapes';

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

class FlowComposer {

    constructor(container) {

        this.container = container;

        this.taskBarGeo = new THREE.BoxBufferGeometry(barWidth, barHeight, barDepth);
        this.taskBarSquareGeo = new THREE.BoxBufferGeometry(squareBarWidth, squareBarHeight, barDepth);
        this.connectorGeo = new THREE.SphereGeometry(connectorRadius);

        this.gridLineMaterial = new THREE.LineBasicMaterial({ color: gridColor });

        this.taskBars = [];
        this.dots = [];
        this.lineContainer = []

        this.taskGroupMap = new Map();
        this.connectorMap = {};

        this.selectedTaskBar = null;
        this.selectedLine = null;

        // Use for the canvas id
        this.taskKey = 0;

        this.init();

        this.addListeners();
    }

    addListeners = () => {

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

    handleWindowResize = () => {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;

        this.camera.updateProjectionMatrix();
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
            this.camera.position.y -= 0.2
        }
        else {
            if (this.camera.position.y < 0.1) {
                this.camera.position.y += 0.2
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
        this.animate();
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

    animate = () => {
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
    }

    // The Public APIs

    populateTasks = (tasks) => {

        for (var index = 0; index < tasks.length; index++) {
            const task = tasks[index];
            this.acceptTask(task);
        }

    }

    acceptTask = (task) => {

        const taskId = task.id;
        const shape = task.taskType;
        const name = task.name;
        const role = task.roleId;
        const line1 = `Demand (Unit): ${task.demand}`;
        const line2 = `Duration (sec): ${task.min} to ${task.max}`;
        const task_pos = this.parseCoordinates(task.coordinates);

        const taskBar = this.buildTaskBarMesh(shape, name, role, line1, line2);

        this.arrangeTaskBar(taskBar, taskId, task_pos, shape);
    }

    populateLinks = async () => {
        //this.taskLinkFactory.buildFrom(sourcePort, targetPort, points);
    }

    /**
     * A Simple Connection where Bottom Port of the Source is Connected with
     * the Top Port of the Target;
     * @param {*} sourceTaskId 
     * @param {*} targetTaskId 
     */
    linkBottomTop = (sourceTaskId, targetTaskId) => {
        const sourcePort = this.connectorMap[sourceTaskId].connectorBottom;
        const targetPort = this.connectorMap[targetTaskId].connectorTop;
        const points = [];
        const point1 = sourcePort.position.clone();
        const point2 = targetPort.position.clone();
        points.push(point1);
        points.push(point2);
        this.taskLinkFactory.buildFrom(sourcePort,targetPort,points);
    }

    buildTaskBarMesh = (shape, taskName, role, line1, line2) => {

        this.taskKey++;

        if (shape === "activity") {
            const taskMaterial = buildRectTextMaterial(this.taskKey, taskName, role, line1, line2);
            return new THREE.Mesh(this.taskBarGeo, taskMaterial);
        }

        if (shape === "DECISION_BOX") {
            const taskMaterial = buildSquareTextMaterial(this.taskKey, taskName, role, line1, line2);
            return new THREE.Mesh(this.taskBarSquareGeo, taskMaterial);
        }

        if (shape === "CIRCLE") {
            const taskMaterial = buildCircularTextMaterial(this.taskKey, taskName, role, line1, line2);
            return new THREE.Mesh(this.taskBarGeo, taskMaterial);
        }

        if (shape === "START_STOP_BOX") {
            const taskMaterial = buildStartStopTextMaterial(this.taskKey, taskName, role, line1, line2);
            return new THREE.Mesh(this.taskBarGeo, taskMaterial);
        }

        const taskMaterial = buildRectTextMaterial(this.taskKey, taskName, role, line1, line2);
        return new THREE.Mesh(this.taskBarGeo, taskMaterial);
    }

    parseCoordinates = (coordinates) => {
        var task_pos;

        try {
            task_pos = JSON.parse(coordinates);
        }
        catch (e) {
            task_pos = { x: 0, y: 0, z: 0 };
        }

        return task_pos;
    }

    arrangeTaskBar = (taskBar, taskId, task_pos, shape) => {

        const x = task_pos.x;
        const y = task_pos.y;
        const z = task_pos.z;

        // we need task_id and task_name
        taskBar.userData = { id: taskId, type: 'taskBar', shape: shape };
        taskBar.position.set(x, y, z);
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


    deleteSelectedLine = () => {
        if (this.selectedLine) {
            this.taskLinkFactory.deleteByLine(this.selectedLine)
            this.selectedLine = null;
            this.hoveredLine = null;
        }
    }

    deleteSelectedTask = () => {
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

    getTaskPositions() {
        const task_positions = [];

        for (let [taskId, value] of this.taskGroupMap) {
            if (value.taskBar) {
                var pos = value.taskBar.position;
                task_positions.push({id: taskId, coordinates:{ x: pos.x, y: pos.y, z: pos.z }});
            }
        }
        return task_positions;
    }

    getTaskLinks() {

    }
}

export default FlowComposer;
