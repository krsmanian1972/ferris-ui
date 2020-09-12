import TaskLink from "./TaskLink";

const IDLE = "idle"
const DRAWING = "drawing";

export default class TaskLinkFactory {

    //The Key is the Task_id and the direction
    taskLinks = new Map();

    state = IDLE;

    constructor() {

    }

    onConnectorSelect = (connector,scene) => {
        if(this.state === IDLE) {
            this.start(connector,scene);
        }
        else {
            this.finish(connector);
        }
    }

    start = (connector, scene) => {

        if (!connector.userData) {
            return
        }

        const key = this.getKey(connector);
        if (this.taskLinks.has(key)) {
            this.currentLink = this.taskLinks.get(key);
        }
        else {
            const taskLink = new TaskLink(connector);
            scene.add(taskLink.getLine());
            this.taskLinks.set(key, taskLink);
            this.currentLink = taskLink;
        }

        this.state = DRAWING
        return this.currentLink;
    }

    finish = (connector) => {

        if (this.currentLink) {
            this.currentLink.finish(connector);
            this.state = IDLE;
        }
    }

    canDraw = () => {
        return this.state === DRAWING;
    }

    addVertex = (point) => {
    
        if(this.canDraw()) {
            this.currentLink.addVertex(point);
        }
    }

    updatePoint = (point) => {
    
        if(this.canDraw()) {
            this.currentLink.updatePoint(point);
        }
    }

    getKey = (connector) => {
        return connector.userData.id + "~" + connector.userData.direction;
    }



    /**
     * The connector can be either a source or a target of a taskLink
     * @param {*} connector 
     */
    onConnectorMove = (connector) => {
        const key = this.getKey(connector);
    }
}