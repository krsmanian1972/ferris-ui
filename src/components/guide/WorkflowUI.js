import React, { Component } from 'react';
import { Button, Row, Col, Tabs, Tooltip, Space } from 'antd';
import { EditOutlined, ItalicOutlined, UndoOutlined, RedoOutlined, ScissorOutlined } from '@ant-design/icons';

import { inject } from 'mobx-react';
import * as THREE from 'three';
import DragControls from 'three-dragcontrols';

const containerStyle = {
    height: window.innerHeight,
    width: window.innerWidth
};

const canvasStyle = {
    display: 'none'
}

const fov = 35;
const near = 0.1;
const far = 1000;

const pointLightColor = 0xffffff;
const pointLightPosition = 1;

const taskBarColor = "#2A4B7C";
//const taskBarColor = "0x000000";

const barWidth = 3;
const barHeight = 1;
const barDepth = 0.20;
const connectorRadius = 0.10;//0.06

const vGap = 20;

const boldFont = "bold 18px sans-serif";
const regularFont = "18px sans-serif";

const gridSize = 50;
const gridStep = 0.5;

const mouse = new THREE.Vector2();

var drawMode = false;

@inject("appStore")
class WorkflowUI extends Component {

    constructor(props) {
        super(props);
        this.taskBarGeo = new THREE.BoxGeometry(barWidth, barHeight, barDepth);

        this.gridLineMaterial = new THREE.LineBasicMaterial({ color: 0x1d1d1d });

        this.connectorGeo = new THREE.SphereGeometry(connectorRadius);

        this.connectorMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })

        this.taskBars = [];
        this.connectorMap = {};

        this.lastEvent = null;

        this.connectorLine = null;
        this.mode = "";
        this.internalState = "";
        this.sourceConnectorPort = {};
        this.destConnectorPort = {};
    }

    componentDidMount() {
        this.init();

        window.addEventListener("resize", this.handleWindowResize);

        this.dragControls.addEventListener('dragstart', this.dragStartCallback);
        this.dragControls.addEventListener('dragend', this.dragEndCallback);

        this.renderer.domElement.addEventListener("mousemove", this.mouseMove);
        this.renderer.domElement.addEventListener("wheel", this.scroll);

        this.container.addEventListener("dblclick", this.toggleDrawMode);
        
    }

    toggleDrawMode = (event) => {
        drawMode = !drawMode;
        if(drawMode)
        {

        }
        var xDiff = 0;
        var yDiff = 0;
        if(this.mode === "TASK_CONNECTOR"){
            const point = this.getClickPoint(event);

            this.taskBars.map((item) =>
                this.process(item.userData.id, point));

        }
    }

    
    process = (task, point) => {
        let sourceX, sourceY, clickX, clickY;
        clickX = point.x;
        clickY = point.y;
//        console.log(task);      
        sourceX = this.connectorMap[task].connectorLeft.position.x;
        sourceY = this.connectorMap[task].connectorLeft.position.y;

        this.findDistanceAndSetPort(task, 1,sourceX, sourceY, clickX, clickY);                 
        
        sourceX = this.connectorMap[task].connectorRight.position.x ;
        sourceY = this.connectorMap[task].connectorRight.position.y;
        this.findDistanceAndSetPort(task, 2, sourceX, sourceY, clickX, clickY);                 
                
        sourceX = this.connectorMap[task].connectorTop.position.x;
        sourceY = this.connectorMap[task].connectorTop.position.y;
        this.findDistanceAndSetPort(task, 3, sourceX, sourceY, clickX, clickY);                 

        sourceX = this.connectorMap[task].connectorBottom.position.x;
        sourceY = this.connectorMap[task].connectorBottom.position.y;
        this.findDistanceAndSetPort(task, 4, sourceX, sourceY, clickX, clickY);                 

        
  //      console.log(this.sourceConnectorPort);
    }     
    
    findDistanceAndSetPort = (task, direction, sourceX, sourceY, clickX, clickY) => {
        let xDiff, yDiff;
        xDiff = sourceX - clickX;
        yDiff = sourceY - clickY;
//        console.log(task);
//        console.log(direction);
//        console.log(xDiff);
//        console.log(yDiff);
        if (Math.abs(xDiff) <= 0.5 && Math.abs(yDiff) <= 0.5){
//           console.log("Found one");
           if(this.internalState === ""){
                console.log("SOURCE PORT");
                console.log(task);
                console.log(direction);
                this.sourceConnectorPort[0] = {x: sourceX ,
                                               y :sourceY};
                this.internalState = "FOUND_SOURCE_PORT";
           }
           else if(this.internalState === "FOUND_SOURCE_PORT"){
                console.log("DEST PORT");
                console.log(task);
                console.log(direction);
                this.destConnectorPort[0] = {x: sourceX ,
                                  	      y :sourceY};
                this.drawLine(this.sourceConnectorPort[0].x, this.sourceConnectorPort[0].y, this.destConnectorPort[0].x, this.destConnectorPort[0].y);
                this.internalState = "";
                
           }
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
        if (event.deltaY > 0) {
            this.camera.position.y -= 0.1
        }
        else {
            this.camera.position.y += 0.1
        }
    }

    dragStartCallback = (event) => {
        drawMode = false;
        this.selectedTaskBar = event.object;
        this.moveDots();
    }

    dragEndCallback = (event) => {
        drawMode = false;
        this.moveDots();
        this.selectedTaskBar = null;
    }

    mouseMove = (event) => {
        if (this.selectedTaskBar) {
            this.moveDots();
            return;
        }
        if(drawMode)
        {

        }
        if(this.mode === "TASK_CONNECTOR"){
        
        }
    }

    moveDots = () => {
        const taskName = this.selectedTaskBar.userData.id;
        const left = this.connectorMap[taskName].connectorLeft;
        const right = this.connectorMap[taskName].connectorRight;
        const top = this.connectorMap[taskName].connectorTop;
        const bottom = this.connectorMap[taskName].connectorBottom;

        left.position.set(this.selectedTaskBar.position.x - barWidth / 2, this.selectedTaskBar.position.y, 0);
        right.position.set(this.selectedTaskBar.position.x + barWidth / 2, this.selectedTaskBar.position.y, 0);
        top.position.set(this.selectedTaskBar.position.x, this.selectedTaskBar.position.y + barHeight / 2, 0);
        bottom.position.set(this.selectedTaskBar.position.x, this.selectedTaskBar.position.y - barHeight / 2, 0);

    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleWindowResize);
    }

    init = () => {
        this.setupScene();
        this.setGraphPaper();
        this.addTasks();
        this.animate();
//        this.drawLine();
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

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.container.appendChild(this.renderer.domElement);

        const light = new THREE.PointLight(pointLightColor, pointLightPosition);
        light.position.set(1, 1, 1).normalize();
        this.scene.add(light);

        this.dragControls = new DragControls(this.taskBars, this.camera, this.renderer.domElement);

    };

    newConnectorLine = () => {
        const geometry = new THREE.LineSegments();
    }

    setGraphPaper = () => {

        const geometry = new THREE.Geometry();

        for (var i = -gridSize; i <= gridSize; i += gridStep) {
            geometry.vertices.push(new THREE.Vector3(-gridSize, i, -5));
            geometry.vertices.push(new THREE.Vector3(gridSize, i, -5));
            geometry.vertices.push(new THREE.Vector3(i, -gridSize, -5));
            geometry.vertices.push(new THREE.Vector3(i, gridSize, -5));
        }

        const grid = new THREE.LineSegments(geometry, this.gridLineMaterial);

        this.scene.add(grid);
    }

    buildTaskCanvas = (id) => {
        const canvas = document.createElement('canvas');
        canvas.id = 'task_' + id;
        canvas.style = { canvasStyle };
        canvas.width = 300;//256
        canvas.height = 128;

        document.getElementById("workflowContainer").appendChild(canvas);

        return canvas;
    }

    buildTextMaterial = (taskId, taskName, role, plannedPeriod, actualPeriod) => {
        const canvas = this.buildTaskCanvas(taskId);

        var y = 10;//10

        const context = canvas.getContext('2d');
        context.fillStyle = taskBarColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "white";
        context.fillRect(vGap / 2, vGap / 2, canvas.width - vGap, canvas.height - vGap);

        context.fillStyle = "black";
        context.textAlign = "center";

        y = y + vGap;
        context.font = boldFont;
        context.fillText(taskName, canvas.width / 2, y);

        y = y + vGap + 2;
        context.font = regularFont;
        context.fillText(role, (canvas.width) / 2, y);

        y = y + vGap + 5;
        context.fillText(plannedPeriod, (canvas.width) / 2, y);

        y = y + vGap + 2;
        context.fillText(actualPeriod, (canvas.width) / 2, y);

        const texture = new THREE.CanvasTexture(canvas)
        texture.needsUpdate = true;

        const material = new THREE.MeshBasicMaterial({ map: texture });
        return material;
    }

    addTask = (taskName, role, startDate, endDate, x, y) => {

        const period = startDate + ' - ' + endDate;

        const taskMaterial = this.buildTextMaterial(1, taskName, role, period, period);

        const taskBar = new THREE.Mesh(this.taskBarGeo, taskMaterial);

        const connectorLeft = new THREE.Mesh(this.connectorGeo, this.connectorMaterial);
        const connectorRight = new THREE.Mesh(this.connectorGeo, this.connectorMaterial);
        const connectorTop = new THREE.Mesh(this.connectorGeo, this.connectorMaterial);
        const connectorBottom = new THREE.Mesh(this.connectorGeo, this.connectorMaterial);


        taskBar.position.set(x, y, 0);

        connectorLeft.position.set(x - barWidth / 2, y, 0);
        connectorRight.position.set(x + barWidth / 2, y, 0);
        connectorTop.position.set(x, y + barHeight / 2, 0);
        connectorBottom.position.set(x, y - barHeight / 2, 0);


        const group = new THREE.Group();
        group.add(taskBar);
        group.add(connectorLeft);
        group.add(connectorRight);
        group.add(connectorTop);
        group.add(connectorBottom);

        taskBar.userData = { id: taskName, type: 'taskBar' };

        this.scene.add(group);
        this.taskBars.push(taskBar);
        this.connectorMap[taskName] = { connectorLeft: connectorLeft, connectorRight: connectorRight, connectorTop: connectorTop, connectorBottom: connectorBottom };
    }

    addTasks = () => {
        this.addTask('Start', 'System', '01-Oct-2020', '01-Oct-2020', 0, 6);
        this.addTask('Login', 'Project Manager', '01-Oct-2020', '01-Oct-2020', 0, 4);
        this.addTask("Pre-editing", "Editor", '02-Oct-2020', '05-Oct-2020', 0, 2);
        this.addTask("Copyediting", "Copyeditor", '06-Oct-2020', '10-Oct-2020', 0, 0);
        this.addTask("Review", "Author", '11-Oct-2020', '12-Oct-2020', 0, -2);
        this.addTask("Finalize", "Project Manager", '13-Oct-2020', '13-Oct-2020', 0, -4);
        this.addTask("End", "", '13-Oct-2020', '13-Oct-2020', 0, -6);
    }

    handleWindowResize = () => {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;

        this.camera.updateProjectionMatrix();
    }


    drawLine = (x1,y1,x2,y2) => {
        var material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
        var points = [];
        points.push( new THREE.Vector3( x1, y1, 0 ) );
        points.push( new THREE.Vector3( x2, y2, 0 ) );
        //points.push( new THREE.Vector3( 2, 0, 0 ) );
        
        var geometry = new THREE.BufferGeometry().setFromPoints( points );
        var line = new THREE.Line( geometry, material );
        this.scene.add(line);
    }
    
    connectTasks = () => {
        if(this.mode != "TASK_CONNECTOR"){
            this.mode = "TASK_CONNECTOR";
        }
        else if(this.mode == "TASK_CONNECTOR"){
            this.mode = "";
        }
    }

    render() {
        return (
            <div style={containerStyle} id="paper" ref={ref => (this.container = ref)}>
            <Button onClick={this.connectTasks} id="connector" type="primary" icon={<EditOutlined />} shape={"circle"} />

            <div style={canvasStyle} id="workflowContainer" ref={ref => (this.workflowContainer = ref)} />
            
            </div>
        )
    }

}

export default WorkflowUI;
