import TaskLink from "./TaskLink";

const IDLE = "idle"
const DRAWING = "drawing";

const SOURCE = "source";
const TARGET = "target";

export default class TaskLinkFactory {

    //The Key is the source task_id and target task_id
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

        this.currentLink = new TaskLink(connector);
        connector.userData.taskLink = this.currentLink;
        connector.userData.taskLinkDirection = SOURCE;

        const theLine = this.currentLink.getLine();
        this.scene.add(theLine);
        
        this.state = DRAWING
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
        if(!this.canDraw()) {
            return;
        }

        this.state = IDLE;
        const preFinishLine = this.currentLink.getLine();
        this.scene.remove(preFinishLine);

        // Ensure One connection between source and target
        const key = this.currentLink.source.userData.id + "~"+ connector.userData.id;
        if(this.taskLinks.has(key)) {
            this.currentLink.reset();
            this.currentLink = null;
            return;
        }

        if(this.currentLink.source.userData.id === connector.userData.id) {
            this.currentLink.reset();
            this.currentLink = null;
            return;
        }

        this.currentLink.finish(connector);
        this.taskLinks.set(this.currentLink.getKey(),this.currentLink);

        connector.userData.taskLink = this.currentLink;
        connector.userData.taskLinkDirection = TARGET;

        const theLine = this.currentLink.getLine();
        this.scene.add(theLine);
        this.lineContainer.push(theLine);

        this.currentLink = null;
    }

    findLineIndex = (key) => {
        for(var index=0;index<this.lineContainer.length;index++) {
            if(key === this.lineContainer[index].userData.id) {
                return index;
            } 
        }
        return -1;
    }

    deleteLink = (selectedLine) => {
        if(!selectedLine) {
            return;
        }

        const key = selectedLine.userData.id;
        const index = this.findLineIndex(key);
        if(index == -1) {
            return;
        }
        
        const taskLink = this.taskLinks.get(key);
        const theLine = taskLink.getLine();
        this.scene.remove(theLine);

        this.lineContainer.splice(index, 1);
        this.taskLinks.delete(key);
        
    }

    getLineById = (key) => {
        const index = this.findLineIndex(key);
        if(index == -1) {
            return null;
        }
        
        return this.lineContainer[index];
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

}
