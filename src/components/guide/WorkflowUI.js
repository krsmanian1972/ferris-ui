import React, { Component } from 'react';
import { Button, Row, Col, Tabs, Tooltip, Space } from 'antd';
import { EditOutlined, ItalicOutlined, UndoOutlined, RedoOutlined, ScissorOutlined, NodeIndexOutlined } from '@ant-design/icons';

import Moment from 'react-moment';
import moment from 'moment';
import 'moment-timezone';

import ObjectiveList from './ObjectiveList';
import ObjectiveStore from '../stores/ObjectiveStore';
import ObjectiveDrawer from './ObjectiveDrawer';
import {drawLineWithPrevPoint, checkPointIsOnLineSegmentArray, snapAtClickPoint} from './lineOperations';
import {updateVertexMovement, removeRecurringPointOnLineSegment, removeLineSegmentOnCickPoint} from './lineOperations';
import {buildTaskCanvas, buildCircularTextMaterial, buildRectTextMaterial, buildSquareTextMaterial, buildStartStopTextMaterial} from './Shapes';
import {taskBarColor, barWidth, barHeight, barDepth, squareBarWidth, squareBarHeight, connectorRadius, vGap, borderGap, boldFont, regularFont} from './Shapes';
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

const fov = 30;
const near = 0.1;
const far = 1000;

const pointLightColor = 0xffffff;
const pointLightPosition = 1;

const gridSize = 50;
const gridStep = 0.25;

const mouse = new THREE.Vector2();
const DEBUG = false;
var drawMode = false;

@inject("appStore")
@observer
class WorkflowUI extends Component {

    constructor(props) {
        super(props);
        this.objectiveStore = new ObjectiveStore({ apiProxy: props.appStore.apiProxy, enrollmentId: "4c7f668d-0a55-42d5-89d5-3efe73e41db7" });
        this.objectiveStore.fetchObjectives();

        this.taskBarGeo = new THREE.PlaneGeometry(barWidth, barHeight, barDepth);
        this.taskBarSquareGeo = new THREE.PlaneGeometry(squareBarWidth, squareBarHeight, barDepth);

        this.gridLineMaterial = new THREE.LineDashedMaterial({ color: 0xD3D3D3,
 							       dashSize:3,
							       gapSize:10,
                                                               scale:1,						
                                                             });

        this.connectorGeo = new THREE.SphereGeometry(connectorRadius);

        this.connectorMaterial = new THREE.MeshBasicMaterial({ color: taskBarColor })

        this.taskBars = [];
        this.connectorMap = {};

        this.lastEvent = null;

        this.connectorLine = null;
        this.mode = "";
        this.internalState = "";
        this.sourceConnectorPort = {};
        this.destConnectorPort = {};
        this.lineSegmentArray = [];
        this.lineSegmentArrayIndex = 0;
        this.line = [];
        this.lineSegment = [];
        this.foundAConnector = "";
        this.clickCounter = 0;
        this.dragMode = {};
        this.dummyArray = [1,2,3,4,5,6];
        
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
        this.container.addEventListener("keydown", this.keyDown);
        
    }


    keyDown = (event) => {
      if(event.keyCode === 27){
         console.log("Esc key pressed");
      }
      
    }
    toggleDrawMode = (event) => {
        console.log("Double Click");
        drawMode = !drawMode;
        if(drawMode)
        {

        }
        var xDiff = 0;
        var yDiff = 0;
        if(this.mode === "TASK_CONNECTOR" || this.mode === "FREE_LINE_CONNECTOR"){
            const point = this.getClickPoint(event);

            this.taskBars.map((item) =>
                this.checkForConnectorPort(item.userData.id, point));

        }
    }

    mouseClick = (event) => {
        console.log("Single Click");
        console.log(this.lineSegmentArray);
        var point = this.getClickPoint(event);
        console.log(this.mode);
        if(this.mode === "VERTEX_DRAG_MODE"){

            //remove points which are inbetween lines
            removeRecurringPointOnLineSegment(this.lineSegmentArray, this.dragMode.arrayIndex, this.scene, this.dummyArray);
            console.log("Mode Nullified");            
            this.mode = "";
            this.dragMode = {};
            return;
        }
        if(this.mode === "DELETE_CONNECTING_LINE"){
             var status = removeLineSegmentOnCickPoint(this.lineSegmentArray, point, this.scene);
             if(status === "SUCCESS"){
                 this.lineSegmentArrayIndex--;
             }
             console.log(this.lineSegmentArray);
             console.log(this.lineSegmentArrayIndex);
             return;
        }
        if(this.mode === ""){
            console.log("check point is online");
            var result = snapAtClickPoint(this.lineSegmentArray, point, this.scene);
            console.log(result);
            if(result.status === "SUCCESS"){
                this.dragMode.arrayIndex = result.arrayIndex;
                this.dragMode.pathIndex = result.pathIndex;
                this.mode = "VERTEX_DRAG_MODE";
            }
            return;
        }

        if(this.mode === "TASK_CONNECTOR" || this.mode === "FREE_LINE_CONNECTOR"){
            if(this.internalState === "FOUND_SOURCE_PORT"){
               //draw projection of the line the previous points axis
              
              var clickX = point.x;
              var clickY = point.y;
              var index = this.lineSegmentArray[this.lineSegmentArrayIndex].path.length - 1;
              var prevPoint = this.lineSegmentArray[this.lineSegmentArrayIndex].path[index];
              
              if(this.mode === "TASK_CONNECTOR"){
  	          var projectionX = Math.abs(point.x - prevPoint.x);
		  var projectionY = Math.abs(point.y - prevPoint.y);
		  
		  if(projectionX <= projectionY){
		      clickX = Math.round(prevPoint.x*2)/2;
		      clickY = Math.round(clickY*2)/2;
		  }
		  else{
		     clickX = Math.round(clickX*2)/2;;
		     clickY = Math.round(prevPoint.y*2)/2;
		  }
	      }
 	      this.lineSegmentArray[this.lineSegmentArrayIndex].path.push({x: clickX, y:clickY});
              drawLineWithPrevPoint(this.lineSegmentArray, this.scene, this.lineSegmentArrayIndex, index+1, "" );
    	    }
	}
    }
    checkForConnectorPort = (task, point) => {
    
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
           this.foundAConnector = "YES";
           if(this.internalState === ""){
                if(DEBUG === true){
                    console.log("SOURCE PORT");
                    console.log(task);
                    console.log(direction);
                }
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
                //since this is a double click event, 2 single clicks are logged, pop it out as a hack...
                this.lineSegmentArray[this.lineSegmentArrayIndex].path.pop();
                this.lineSegmentArray[this.lineSegmentArrayIndex].path.pop();
                var lineIndex = this.lineSegmentArray[this.lineSegmentArrayIndex].line.length-1;
                this.scene.remove(this.lineSegmentArray[this.lineSegmentArrayIndex].line[lineIndex]);
                this.scene.remove(this.lineSegmentArray[this.lineSegmentArrayIndex].line[lineIndex-1]);
                this.lineSegmentArray[this.lineSegmentArrayIndex].line.pop();
                this.lineSegmentArray[this.lineSegmentArrayIndex].line.pop();
                if(DEBUG === true){
                    console.log("DEST PORT");
                    console.log(task);
                    console.log(direction);
                }
                this.destConnectorPort[0] = {x: sourceX ,
                                  	      y :sourceY,
                                  	      task:task,
                                  	      direction:direction};
                var line = {};
                line.x = sourceX;
                line.y = sourceY;
                this.scene.remove(this.line[0]);
                this.lineSegmentArray[this.lineSegmentArrayIndex].path.push(line);
                var pathIndex = this.lineSegmentArray[this.lineSegmentArrayIndex].path.length-1;
                this.lineSegmentArray[this.lineSegmentArrayIndex].destDescription=this.destConnectorPort[0];
                drawLineWithPrevPoint(this.lineSegmentArray, this.scene, this.lineSegmentArrayIndex, pathIndex, "");
                
                this.lineSegmentArrayIndex++;
         	this.internalState = "";
           }
        }
    } 

    updateConnectingLine = (index, port) => {
        //console.log(this.lineSegmentArray);
//        return;
        var position = 0;
        var lineSource = {};
        var lineDest = {};
        if(port === "SOURCE"){
             position = 0;
             lineSource.x = this.lineSegmentArray[index].sourceDescription.x;
             lineSource.y = this.lineSegmentArray[index].sourceDescription.y;
             pathPosition = 1;
             this.lineSegmentArray[index].path[0].x = lineSource.x ;        
             this.lineSegmentArray[index].path[0].y = lineSource.y; 
             drawLineWithPrevPoint(this.lineSegmentArray, this.scene, index, pathPosition, position);

        }
        else if (port === "DEST"){
            position =this.lineSegmentArray[index].line.length -1;
            var pathPosition = this.lineSegmentArray[index].path.length -1;
            lineSource.x = this.lineSegmentArray[index].path[pathPosition -1].x;
            lineSource.y = this.lineSegmentArray[index].path[pathPosition -1].y;
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
        if(event.shiftKey && event.ctrlKey){
             if(event.deltaY < 0){
                  this.camera.position.x -= 0.1;
             }
             else{
                  this.camera.position.x += 0.1;
             }
             return;

        }

        if(event.shiftKey){
             if(event.deltaY < 0){
                 this.camera.fov -=3;
                 this.camera.updateProjectionMatrix();
             }
             else{
                 this.camera.fov +=3;
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
        drawMode = false;
         console.log("Drag start");
        this.selectedTaskBar = event.object;
        if(this.selectedTaskBar){
        
            this.moveDots();
        }
//        if(this.mode === "VERTEX_DRAG_MODE"){
//              var point = this.getClickPoint(event);
//              console.log("VERTEX_DRAG_MODE");
//              updateVertexMovement(this.lineSegmentArray, this.dragMode.arrayIndex, this.dragMode.pathIndex, point, this.scene);
//        }

    }

    dragEndCallback = (event) => {
        drawMode = false;
        var point = this.getClickPoint(event);
        
        if(this.selectedTaskBar){
        //align to X and Y to grid
            this.selectedTaskBar.position.y = Math.round(this.selectedTaskBar.position.y*2)/2;
            this.selectedTaskBar.position.x = Math.round(this.selectedTaskBar.position.x*2)/2;
            this.moveDots();
            this.selectedTaskBar = null;
        }
        
        if(this.mode === "VERTEX_DRAG_MODE"){
            this.mode = "";
        }
    }

    mouseMove = (event) => {
        var point = this.getClickPoint(event);
        if (this.selectedTaskBar) {
            console.log("Mouse Move is triggered");

            this.moveDots();
            return;
        }
        if(this.mode === "VERTEX_DRAG_MODE"){
              console.log("VERTEX_DRAG_MODE");
              updateVertexMovement(this.lineSegmentArray, this.dragMode.arrayIndex, this.dragMode.pathIndex, point, this.scene);
        }
        if(this.mode === "TASK_CONNECTOR" || this.mode === "FREE_LINE_CONNECTOR"){
            if(this.internalState === "FOUND_SOURCE_PORT"){
               //draw projection of the line the previous points axis
               var point = this.getClickPoint(event);
               this.scene.remove(this.line[0]);
               var clickX = point.x;
               var clickY = point.y;
               var index = (this.lineSegmentArray[this.lineSegmentArrayIndex].path.length)-1;
               var prevPoint = this.lineSegmentArray[this.lineSegmentArrayIndex].path[index];
              
               if(this.mode === "TASK_CONNECTOR"){
                   var projectionX = Math.abs(point.x - prevPoint.x);
                   var projectionY = Math.abs(point.y - prevPoint.y);
              
                   if(projectionX <= projectionY){
                       clickX = prevPoint.x;
                   }
                   else{
                      clickY = prevPoint.y;
                   }
              }
  
              var points = [];
              var material = new THREE.LineBasicMaterial( { color: 0x0000ff, linewidth: 2 } );
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
        const shape = this.selectedTaskBar.userData.shape;
        var xOffset = barWidth;
        var yOffset = barHeight;
        if(shape === "CIRCLE"){
            xOffset = barHeight+0.5;
            yOffset = barHeight;
        }
        if(shape === "DECISION_BOX"){
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
        left.position.set(leftX, leftY , 0);
        right.position.set(rightX, rightY , 0);
        top.position.set(topX, topY , 0);
        bottom.position.set(bottomX, bottomY , 0);

        //move the lines start point or end point as well
        for (var i = 0; i < this.lineSegmentArray.length; i++){
            //console.log("Move dots");
            //console.log(i);
            if(this.lineSegmentArray[i].sourceDescription.task === taskName){
                //console.log("Found out a moving line segment");
                var direction = this.lineSegmentArray[i].sourceDescription.direction;
                if(direction == 1){
                   //left connector has a line
                   this.lineSegmentArray[i].sourceDescription.x = leftX;
                   this.lineSegmentArray[i].sourceDescription.y = leftY;
                   this.updateConnectingLine(i, "SOURCE");
                }
                if(direction== 2){
                   //right connector has a line
                   this.lineSegmentArray[i].sourceDescription.x = rightX;
                   this.lineSegmentArray[i].sourceDescription.y = rightY;
                   this.updateConnectingLine(i, "SOURCE");
                }
                if(direction == 3){
                   //Top connector has a line
                   this.lineSegmentArray[i].sourceDescription.x = topX;
                   this.lineSegmentArray[i].sourceDescription.y = topY;
                   this.updateConnectingLine(i, "SOURCE");
                }
                if(direction == 4){
                   //bottom connector has a line
                   //console.log("Bottom moved");
                   this.lineSegmentArray[i].sourceDescription.x = bottomX;
                   this.lineSegmentArray[i].sourceDescription.y = bottomY;
                   this.updateConnectingLine(i, "SOURCE");
                }
            }
            if(this.lineSegmentArray[i].destDescription.task === taskName){
                //console.log("Found out a moving line segment");
                var direction = this.lineSegmentArray[i].destDescription.direction;
                if(direction == 1){
                   //left connector has a line
                   this.lineSegmentArray[i].destDescription.x = leftX;
                   this.lineSegmentArray[i].destDescription.y = leftY;
                   this.updateConnectingLine(i, "DEST");
                }
                if(direction == 2){
                   //right connector has a line
                   this.lineSegmentArray[i].destDescription.x = rightX;
                   this.lineSegmentArray[i].destDescription.y = rightY;
                   this.updateConnectingLine(i, "DEST");
                }
                if(direction == 3){
                   //Top connector has a line
                   this.lineSegmentArray[i].destDescription.x = topX;
                   this.lineSegmentArray[i].destDescription.y = topY;
                   this.updateConnectingLine(i, "DEST");
                }
                if(direction == 4){
                   //bottom connector has a line
                   //console.log("Bottom moved");
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
        this.scene.background = new THREE.Color( 0xffffff );
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
            geometry.vertices.push(new THREE.Vector3(-gridSize, i, 0));
            geometry.vertices.push(new THREE.Vector3(gridSize, i, 0));
            geometry.vertices.push(new THREE.Vector3(i, -gridSize, 0));
            geometry.vertices.push(new THREE.Vector3(i, gridSize, 0));
        }

        const grid = new THREE.LineSegments(geometry, this.gridLineMaterial);

        this.scene.add(grid);
    }

    populateTasks = () => {
         this.addTask("START", "", "", "", 0, 3, "START_STOP_BOX");
         this.addTask('Task ', 'Completion Today', '2019-08-9','2019-08-9', 0, 1, "DECISION_BOX");
         this.addTask('Work on it now', "", '2019-08-9','2019-08-9', -2, -1, "");
         this.addTask('Look at it later', "", '2019-08-9','2019-08-9', 2, -1, "");
         this.addTask("STOP", "", "", "", -2, -2.5, "CIRCLE");
         this.addTask("STOP2", "", "", "", 2, -2.5, "CIRCLE");


//         this.addTask('Task3', 'Test', '2019-08-9','2019-08-9', 0, -2, "");
//         this.addTask('Task4', 'Test', '2019-08-9','2019-08-9', 0, -4, "CIRCLE");
    }

    addTask = (taskName, role, startDate, endDate, x, y, shape) => {

        const period = startDate + ' - ' + endDate;
        var taskMaterial = '';
        var taskBar = ''
        if(shape === ""){
             taskMaterial = buildRectTextMaterial(1, taskName, role, period, period, shape);
             taskBar = new THREE.Mesh(this.taskBarGeo, taskMaterial);
        }
        else if(shape === "DECISION_BOX"){
            taskMaterial = buildSquareTextMaterial(2, taskName, role, period, period, shape);
            taskBar = new THREE.Mesh(this.taskBarSquareGeo, taskMaterial);

        }

        else if(shape === "CIRCLE"){
            taskMaterial = buildCircularTextMaterial(3, taskName, role, period, period);
            taskBar = new THREE.Mesh(this.taskBarGeo, taskMaterial);

        }
        else if(shape === "START_STOP_BOX"){
            taskMaterial = buildStartStopTextMaterial(3, taskName, role, period, period);
            taskBar = new THREE.Mesh(this.taskBarGeo, taskMaterial);

        }
        //const taskMaterial = this.buildSingleText(1, taskName, role, period, period);


        const group = new THREE.Group();
        group.add(taskBar);

 
            const connectorLeft = new THREE.Mesh(this.connectorGeo, this.connectorMaterial);
            const connectorRight = new THREE.Mesh(this.connectorGeo, this.connectorMaterial);
            const connectorTop = new THREE.Mesh(this.connectorGeo, this.connectorMaterial);
            const connectorBottom = new THREE.Mesh(this.connectorGeo, this.connectorMaterial);


            taskBar.position.set(x, y, 0);
            var xOffset = barWidth;
            var yOffset = barHeight;
            if(shape === "CIRCLE"){
                xOffset = barHeight+0.5;
                yOffset = barHeight;
            }
            if(shape === "DECISION_BOX"){
                xOffset = squareBarWidth;
                yOffset = squareBarHeight;
             
            }
           connectorLeft.position.set(x - xOffset / 2, y, 0);
           connectorRight.position.set(x + xOffset / 2, y, 0);
           connectorTop.position.set(x, y + yOffset / 2, 0);
           connectorBottom.position.set(x, y - yOffset / 2, 0);

           group.add(connectorLeft);
           group.add(connectorRight);
           group.add(connectorTop);
           group.add(connectorBottom);
 
  

        taskBar.userData = { id: taskName, type: 'taskBar', shape:shape };


        this.scene.add(group);
        this.taskBars.push(taskBar);
        this.connectorMap[taskName] = { connectorLeft: connectorLeft, connectorRight: connectorRight, connectorTop: connectorTop, connectorBottom: connectorBottom };
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
    connectTasks = () => {
//        if(this.mode != "TASK_CONNECTOR"){
//            this.mode = "TASK_CONNECTOR";
 //       }
//        else if(this.mode == "TASK_CONNECTOR"){
            this.mode = "";
//        }
    }
    getObjectivesList = () => {

        var moment = require('moment-timezone');
        moment().tz("America/Los_Angeles").format();    

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
    
    
    alignLines = () => {
       this.mode = "";
    
    }
    createObjective = () => {
	this.objectiveStore.showDrawer = true;
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
            <Button onClick={this.alignLines} id="connector" type="primary" icon={<EditOutlined />} shape={"circle"} />
            <Button onClick={this.getObjectivesList} id="dummy" type="primary" icon={<EditOutlined />} shape={"square"} />
            <Button onClick={this.createObjective} id="createobjective" type="primary" icon={<ItalicOutlined />} shape={"square"} />
            <Button onClick={this.drawFreeLineConnector} id="createobjective" type="primary" icon={<NodeIndexOutlined />} shape={"circle"} />
            
            <Button onClick={this.deleteConnectingLine} id="deleteConnectingLine" type="primary" icon={<ScissorOutlined />} shape={"circle"} />

            <div style={canvasStyle} id="workflowContainer" ref={ref => (this.workflowContainer = ref)} />
            <ObjectiveDrawer objectiveStore={this.objectiveStore} />
            </div>
        )
    }

}

export default WorkflowUI;
