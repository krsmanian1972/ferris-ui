import React, { Component } from 'react';
import { Button, Row, Col, Tabs, Tooltip, Space } from 'antd';
import { EditOutlined, ItalicOutlined, UndoOutlined, RedoOutlined, ScissorOutlined } from '@ant-design/icons';

import Moment from 'react-moment';
import moment from 'moment';
import 'moment-timezone';

import ObjectiveList from './ObjectiveList';
import ObjectiveStore from '../stores/ObjectiveStore';
import ObjectiveDrawer from './ObjectiveDrawer';

import { inject, observer } from 'mobx-react';
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
@observer
class WorkflowUI extends Component {

    constructor(props) {
        super(props);
        this.objectiveStore = new ObjectiveStore({ apiProxy: props.appStore.apiProxy, enrollmentId: "4c7f668d-0a55-42d5-89d5-3efe73e41db7" });
        this.objectiveStore.fetchObjectives();

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
        this.lineSegment = [];
        this.line = [];
        this.lineSegmentArray = [];
        this.lineSegmentArrayIndex = 0;
    }

    componentDidMount() {
        this.init();
        this.getObjectivesList();
        window.addEventListener("resize", this.handleWindowResize);

        this.dragControls.addEventListener('dragstart', this.dragStartCallback);
        this.dragControls.addEventListener('dragend', this.dragEndCallback);

        this.renderer.domElement.addEventListener("mousemove", this.mouseMove);
        this.renderer.domElement.addEventListener("wheel", this.scroll);

        this.container.addEventListener("dblclick", this.toggleDrawMode);
        this.container.addEventListener("click", this.mouseClick);
        
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

    mouseClick = (event) => {
        if(this.mode === "TASK_CONNECTOR"){
            if(this.internalState === "FOUND_SOURCE_PORT"){
               //draw projection of the line the previous points axis
              var point = this.getClickPoint(event);
              var clickX = point.x;
              var clickY = point.y;
              var index = this.lineSegmentArray[this.lineSegmentArrayIndex].path.length - 1;
              var prevPoint = this.lineSegmentArray[this.lineSegmentArrayIndex].path[index];
              var projectionX = Math.abs(point.x - prevPoint.x);
              var projectionY = Math.abs(point.y - prevPoint.y);
              
              if(projectionX <= projectionY){
                  clickX = prevPoint.x;
              }
              else{
                 clickY = prevPoint.y;
              }
  
              var points = [];
              var material = new THREE.LineBasicMaterial( { color: 0xFFFFFF } );
              points.push( new THREE.Vector3(prevPoint.x , prevPoint.y, 0 ) );
              points.push( new THREE.Vector3( clickX, clickY, 0 ) );
                       
 	      var geometry = new THREE.BufferGeometry().setFromPoints( points );
 	      this.lineSegmentArray[this.lineSegmentArrayIndex].path.push({x: clickX, y:clickY});
              this.lineSegmentArray[this.lineSegmentArrayIndex].line.push(new THREE.Line( geometry, material ));
                  this.scene.add(this.lineSegmentArray[this.lineSegmentArrayIndex].line[this.lineSegmentArray[this.lineSegmentArrayIndex].line.length-1]);
        
    	    }
	}
    }
    process = (task, point) => {
        let sourceX, sourceY, clickX, clickY;
        clickX = point.x;
        clickY = point.y;

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

    }     
    
    findDistanceAndSetPort = (task, direction, sourceX, sourceY, clickX, clickY) => {
        let xDiff, yDiff;
        xDiff = sourceX - clickX;
        yDiff = sourceY - clickY;
        if (Math.abs(xDiff) <= 0.5 && Math.abs(yDiff) <= 0.5){
           if(this.internalState === ""){
                console.log("SOURCE PORT");
                console.log(task);
                console.log(direction);
                this.sourceConnectorPort[0] = {x: sourceX ,
                                               y :sourceY,
                                               task: task,
                                               direction:direction};
                var line = {};
                line.x = sourceX;
                line.y = sourceY;
                this.lineSegmentArray[this.lineSegmentArrayIndex] = {sourceDescription: this.sourceConnectorPort[0], path:[], destDescription:"", line : []};
                this.lineSegmentArray[this.lineSegmentArrayIndex].path.push(line);
                                                               
                this.internalState = "FOUND_SOURCE_PORT";
           }
           else if(this.internalState === "FOUND_SOURCE_PORT"){
                console.log("DEST PORT");
                console.log(task);
                console.log(direction);
                this.destConnectorPort[0] = {x: sourceX ,
                                  	      y :sourceY,
                                  	      task:task,
                                  	      direction:direction};
                this.lineSegmentArray[this.lineSegmentArrayIndex].destDescription=this.destConnectorPort[0];
                var lineSegMap = {sourceTask:this.sourceConnectorPort[0].task, sourceDirection:this.sourceConnectorPort[0].direction,
                                  sourceX:this.sourceConnectorPort[0].x, sourceY:this.sourceConnectorPort[0].y,
	                          destTask:task, destDirection:direction,
	                          destX:sourceX, destY: sourceY};
                //this.lineSegement.push(lineSegMap);
                
                this.drawConnectingLine(lineSegMap);
        	 this.internalState = "";
                
           }
        }
        else {
           if(this.internalState === "FOUND_SOURCE_PORT"){

               
           }
        }
    
    } 

    
    drawConnectingLine = (lineSegMap) => {
        var material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
        var points = [];
        points.push( new THREE.Vector3( lineSegMap.sourceX, lineSegMap.sourceY, 0 ) );
        points.push( new THREE.Vector3( lineSegMap.destX, lineSegMap.destY, 0 ) );
        //points.push( new THREE.Vector3( 2, 0, 0 ) );
        
        var geometry = new THREE.BufferGeometry().setFromPoints( points );
        lineSegMap.line = new THREE.Line( geometry, material );
        
        this.lineSegment.push(lineSegMap);
        console.log(this.lineSegment);
        this.scene.add(this.lineSegment[this.lineSegment.length-1].line);
    }
    
    updateConnectingLine = (index) => {
        this.scene.remove(this.lineSegment[index].line);
        var material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
        var points = [];
        points.push( new THREE.Vector3( this.lineSegment[index].sourceX, this.lineSegment[index].sourceY, 0 ) );
        points.push( new THREE.Vector3( this.lineSegment[index].destX, this.lineSegment[index].destY, 0 ) );
        //points.push( new THREE.Vector3( 2, 0, 0 ) );

        var geometry = new THREE.BufferGeometry().setFromPoints( points );
        this.lineSegment[index].line = new THREE.Line( geometry, material );
        console.log(this.lineSegment);
        this.scene.add(this.lineSegment[index].line);
    
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
            if(this.internalState === "FOUND_SOURCE_PORT"){
               //draw projection of the line the previous points axis
               var point = this.getClickPoint(event);
              this.scene.remove(this.line[0]);
              var clickX = point.x;
              var clickY = point.y;
              var index = (this.lineSegmentArray[this.lineSegmentArrayIndex].path.length)-1;
              var prevPoint = this.lineSegmentArray[this.lineSegmentArrayIndex].path[index];
              console.log(this.lineSegmentArray);
              var projectionX = Math.abs(point.x - prevPoint.x);
              var projectionY = Math.abs(point.y - prevPoint.y);
              
              if(projectionX <= projectionY){
                  clickX = prevPoint.x;
              }
              else{
                 clickY = prevPoint.y;
              }
  
              var points = [];
              var material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
              points.push( new THREE.Vector3(prevPoint.x , prevPoint.y, 0 ) );
              points.push( new THREE.Vector3( clickX, clickY, 0 ) );
        
 	      var geometry = new THREE.BufferGeometry().setFromPoints( points );
              this.line[0] = new THREE.Line( geometry, material );
              this.scene.add(this.line[0]);
                              
               
           }

        
        }
    }

    moveDots = () => {
        const taskName = this.selectedTaskBar.userData.id;
        const left = this.connectorMap[taskName].connectorLeft;
        const right = this.connectorMap[taskName].connectorRight;
        const top = this.connectorMap[taskName].connectorTop;
        const bottom = this.connectorMap[taskName].connectorBottom;
        const leftX = this.selectedTaskBar.position.x - barWidth / 2;
        const leftY = this.selectedTaskBar.position.y;
        const rightX = this.selectedTaskBar.position.x + barWidth / 2;
        const rightY = this.selectedTaskBar.position.y;
        const topX = this.selectedTaskBar.position.x;
        const topY = this.selectedTaskBar.position.y + barHeight / 2;
        const bottomX = this.selectedTaskBar.position.x;
        const bottomY = this.selectedTaskBar.position.y - barHeight / 2;
        left.position.set(leftX, leftY , 0);
        right.position.set(rightX, rightY , 0);
        top.position.set(topX, topY , 0);
        bottom.position.set(bottomX, bottomY , 0);

        //move the lines start point or end point as well
        for (var i = 0; i < this.lineSegment.length; i++){
            console.log(this.lineSegment);
            console.log(taskName);
            if(this.lineSegment[i].sourceTask === taskName){
                console.log("Found out a moving line segment");
                if(this.lineSegment[i].sourceDirection == 1){
                   //left connector has a line
                   this.lineSegment[i].sourceX = leftX;
                   this.lineSegment[i].sourceY = leftY;
                   this.updateConnectingLine(i);
                }
                if(this.lineSegment[i].sourceDirection == 2){
                   //right connector has a line
                   this.lineSegment[i].sourceX = rightX;
                   this.lineSegment[i].sourceY = rightY;
                   this.updateConnectingLine(i);
                }
                if(this.lineSegment[i].sourceDirection == 3){
                   //Top connector has a line
                   this.lineSegment[i].sourceX = topX;
                   this.lineSegment[i].sourceY = topY;
                   this.updateConnectingLine(i);
                }
                if(this.lineSegment[i].sourceDirection == 4){
                   //bottom connector has a line
                   console.log("Bottom moved");
                   this.lineSegment[i].sourceX = bottomX;
                   this.lineSegment[i].sourceY = bottomY;
                   this.updateConnectingLine(i);
                }
            }
            if(this.lineSegment[i].destTask === taskName){
                console.log("Found out a moving line segment");
                if(this.lineSegment[i].destDirection == 1){
                   //left connector has a line
                   this.lineSegment[i].destX = leftX;
                   this.lineSegment[i].destY = leftY;
                   this.updateConnectingLine(i);
                }
                if(this.lineSegment[i].destDirection == 2){
                   //right connector has a line
                   this.lineSegment[i].destX = rightX;
                   this.lineSegment[i].destY = rightY;
                   this.updateConnectingLine(i);
                }
                if(this.lineSegment[i].destDirection == 3){
                   //Top connector has a line
                   this.lineSegment[i].destX = topX;
                   this.lineSegment[i].destY = topY;
                   this.updateConnectingLine(i);
                }
                if(this.lineSegment[i].destDirection == 4){
                   //bottom connector has a line
                   console.log("Bottom moved");
                   this.lineSegment[i].destX = bottomX;
                   this.lineSegment[i].destY = bottomY;
                   this.updateConnectingLine(i);
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
        //this.addTasks();
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
        canvas.width = 350;//256
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
    getObjectivesList = () => {

        var moment = require('moment-timezone');
moment().tz("America/Los_Angeles").format();    
//        while(this.objectiveStore.isDone === false);
        
        if(this.objectiveStore.isLoading){
           console.log("Isloading");
        }
        if(this.objectiveStore.isError){
           console.log("Error!!");
        }
        
        if(this.objectiveStore.isDone){
           console.log("Done");
           // fetch all the objectives and add as task
           var objectiveList = this.objectiveStore.objectives;
           var count = this.objectiveStore.rowCount;
           var counter = 2;
           for (var i = 0; i < count; i++){
               const localeStart = moment(objectiveList[i].scheduleStart * 1000);
               const localeEnd = moment(objectiveList[i].scheduleEnd * 1000);
	       const startEl = moment(localeStart).format('YYYY-MM-DD HH:mm');
	       const endEl = moment(localeEnd).format('YYYY-MM-DD HH:mm');
               
               this.addTask(objectiveList[i].description,objectiveList[i].description,startEl, endEl, 0, 6 - counter*i);

           }

           
        }
           
    }
    
    createObjective = () => {
	this.objectiveStore.showDrawer = true;
    }

    render() {
        return (
            <div style={containerStyle} id="paper" ref={ref => (this.container = ref)}>
            <Button onClick={this.connectTasks} id="connector" type="primary" icon={<EditOutlined />} shape={"circle"} />
            <Button onClick={this.getObjectivesList} id="dummy" type="primary" icon={<EditOutlined />} shape={"square"} />
            <Button onClick={this.createObjective} id="createobjective" type="primary" icon={<ItalicOutlined />} shape={"square"} />
            <div style={canvasStyle} id="workflowContainer" ref={ref => (this.workflowContainer = ref)} />
            <ObjectiveDrawer objectiveStore={this.objectiveStore} />
            </div>
        )
    }

}

export default WorkflowUI;
