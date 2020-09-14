import TaskLink from "./TaskLink";
const IDLE = "idle"
const DRAWING = "drawing";
const SOURCE = "source";
const TARGET = "target";
export default class TaskLinkFactory {

    //The Key is the Task_id and the direction
    taskLinks = new Map();

    state = IDLE;

    constructor(scene,lineContainer) {
        this.scene = scene;
        this.lineContainer = lineContainer;
    }

    onConnectorSelect = (connector) => {
        if (this.state === IDLE) {
            this.start(connector);
        }
        else {
            this.finish(connector);
        }
    }

    start = (connector) => {

        if (!connector.userData) {
            return
        }

        const key = this.getKey(connector);
        if (this.taskLinks.has(key)) {
            this.currentLink = this.taskLinks.get(key);
        }
        else {
            const taskLink = new TaskLink(connector);
            connector.userData.taskLink = taskLink;
            connector.userData.taskLinkDirection = SOURCE;

            this.taskLinks.set(key, taskLink);
            this.currentLink = taskLink;

            const theLine = taskLink.getLine();
            this.scene.add(theLine);
        }

        this.state = DRAWING
        return this.currentLink;
    }

    snapLineAtPoint = (line, point) => {
         if(!this.snapLink) {
             //console.log(line);
             this.snapLink = this.taskLinks.get(line.userData.id);
             var result = this.snapPointIndex =  this.findSnapPointIndex(this.snapLink, point);
         }
    }


    findSnapPointIndex = (snapLink, point) =>{
        for(var i = 0; i < snapLink.points.length-1; i++){
            console.log(i);
            var result = this.findDistanceSumMatches(snapLink.points[i],snapLink.points[i+1],point);
            if(result.status === true){
              console.log("Match at Index", i);
              return i;
            }
      }
    }

    findDistanceSumMatches =  (source, dest, point) => {
        var result = { status: false, existingVertex: null };
        var distanceSourceToPoint = Math.sqrt((Math.pow((source.x - point.x), 2)) + Math.pow((source.y - point.y), 2));
        var distanceDestToPoint = Math.sqrt((Math.pow((dest.x - point.x), 2)) + Math.pow((dest.y - point.y), 2));
        var distanceSourceToDest = Math.sqrt((Math.pow((dest.x - source.x), 2)) + Math.pow((dest.y - source.y), 2));
        var sumOfDistance = Math.abs(distanceSourceToPoint) + Math.abs(distanceDestToPoint);
        var diff = sumOfDistance - distanceSourceToDest;

        if (diff <= 0.003) {
            result.status = true;
        }
        return result;
    }

    finish = (connector) => {

        if (this.currentLink) {
            this.currentLink.finish(connector);
            connector.userData.taskLink = this.currentLink;
            connector.userData.taskLinkDirection = TARGET;
            this.state = IDLE;

            const theLine = this.currentLink.getLine();
            this.scene.remove(theLine);
            this.scene.add(theLine);
            
            this.lineContainer.push(theLine);
        }
    }

    canDraw = () => {
        return this.state === DRAWING;
    }

    addVertex = (point) => {
        if (this.canDraw()) {
            this.currentLink.addVertex(point);
            const theLine = this.currentLink.getLine();
            this.scene.remove(theLine);
            this.scene.add(theLine);
        }
    }

    updatePoint = (point) => {
        if (this.canDraw()) {
            this.currentLink.updatePoint(point);
            const theLine = this.currentLink.getLine();
            this.scene.remove(theLine);
            this.scene.add(theLine);
        }
    }

    getKey = (connector) => {
        return connector.userData.id + "~" + connector.userData.direction;
    }

}