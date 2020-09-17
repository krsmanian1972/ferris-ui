import { Vector3, CatmullRomCurve3,TubeGeometry,MeshBasicMaterial,Mesh,ArrowHelper,Group} from 'three';
import { taskBarColor } from './Shapes';

const lineColor = 0x0000ff;
const sourceColor = 0xff0000;
const arrowColor = "#4e8d07"

const SOURCE = "source";
const TARGET = "target";


export default class TaskLink {

    // The Source Connector
    source = null;

    // The Target Connector
    target = null;

    // The vertex points - vertices
    points = [];

    
    group = new Group();
 
    constructor(connector) {

        this.source = connector;
        this.source.material.color.set(sourceColor);

        this.addInitialPoint(this.source.position.clone());

     }

    /**
     * Toggle between the Source and Target Connector
     *
     * The Connector that was selected by the User.
     * @param connector
     */
    finish = (connector) => {

        if (!this.target) {
            this.target = connector;
            this.buildTube();

            this.source.material.color.set(taskBarColor);
                  
            const key = this.getKey();

            this.group.userData = {id:key};
            this.tube.userData = {id: key};
            this.arrow.userData = {id: key};
            

            return true;
        }

        return false;
    }

    getKey = () => {
        if(this.target) {
            return this.source.userData.id + "~" + this.target.userData.id;
        }
        return this.source.userData.id;
    }

    getLine = () => {
        return this.group;
    }


    buildTube = () => {

        const path = new CatmullRomCurve3(this.points,false,'catmullrom',0.05);
        const tubeGeometry = new TubeGeometry(path, 200, 0.02, 30, false );
        const tubeMaterial = new MeshBasicMaterial( { color: lineColor } );
        
        if(!this.tube) {
            this.tube = new Mesh(tubeGeometry,tubeMaterial);
            this.group.add(this.tube);
        }
        else {
            this.tube.geometry = tubeGeometry;
        }

        if(this.target) {
            this.buildArrow();
        }
    }


    /**
     * When the User clicks a Connector and see the connector in Red Color
     * Create a zero length line
     *
     * @param {*} point
     */
    addInitialPoint = (point) => {

        const nextPoint = point.clone();
        nextPoint.x=nextPoint.x+0.01;

        this.points.length = 0;
        this.points.push(point);
        this.points.push(nextPoint);

        this.buildTube();
    }

    /**
     * When the User moves the mouse along the current direction.
     * Typically during mouse Move Operation
     *
     * @param {*} point
     */
    updatePoint = (point) => {

        const index = this.points.length-1;
        this.points[index] = point
       
        this.buildTube();
    }

    onMove = (type) => {
        if (type === SOURCE) {
            const point = this.source.position.clone();
            this.points[0] = point;
            this.buildTube();
        }
        else if (type === TARGET) {
            const point = this.target.position.clone();
            this.updatePoint(point);
        }
    }

    addVertex = (point) => {
        this.points.push(point);
        this.buildTube();
    }


    buildArrow =  () => {

        if(this.points.length < 2) {
            return;
        }

        if(!this.target) {
            return;
        }

        const origin = this.points[this.points.length-2];
        const currentPoint = this.points[this.points.length-1];

        const direction = currentPoint.clone().sub(origin).normalize();
    
        const deltaX = currentPoint.x - origin.x;
        const deltaY = currentPoint.y - origin.y;

        const length = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
        
        if(!this.arrow) {
            this.arrow = new ArrowHelper(direction, origin, length, arrowColor, 0.15, 0.15);
            this.group.add(this.arrow);
        }
        else {
            this.arrow.setDirection(direction);
            this.arrow.setLength(length,0.15,0.15);
        }
    }
    
}
