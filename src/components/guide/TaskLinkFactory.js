import TaskLink from "./TaskLink";

const IDLE = "idle"
const DRAWING = "drawing";
const SOURCE = "source";
const TARGET = "target";
export default class TaskLinkFactory {

    //The Key is the Task_id and the direction
    taskLinks = new Map();
    

    state = IDLE;

    constructor(lineObserver) {
        this.lineObserver = lineObserver;
    }

    onConnectorSelect = (connector, scene) => {
        if (this.state === IDLE) {
            this.start(connector, scene);
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
            connector.userData.taskLink = taskLink;
            connector.userData.taskLinkDirection = SOURCE;

            const theLine = taskLink.getLine();
            scene.add(theLine);
            this.lineObserver.add(theLine)

            this.taskLinks.set(key, taskLink);
            this.currentLink = taskLink;
        }

        this.state = DRAWING
        return this.currentLink;
    }

    finish = (connector) => {

        if (this.currentLink) {
            this.currentLink.finish(connector);
            connector.userData.taskLink = this.currentLink;
            connector.userData.taskLinkDirection = TARGET;
            this.state = IDLE;
        }
    }

    canDraw = () => {
        return this.state === DRAWING;
    }

    addVertex = (point) => {
        if (this.canDraw()) {
            this.currentLink.addVertex(point);
        }
    }

    updatePoint = (point) => {
        if (this.canDraw()) {
            this.currentLink.updatePoint(point);
        }
    }

    getKey = (connector) => {
        return connector.userData.id + "~" + connector.userData.direction;
    }
}
