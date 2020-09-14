import { BufferAttribute,  BufferGeometry, Vector3,CatmullRomCurve3,TubeGeometry,MeshBasicMaterial,Mesh } from 'three';

const lineColor = 0x0000ff;
const sourceColor = 0xff0000;
const targetColor = 0x00ff00;

const SOURCE = "source";
const TARGET = "target";

export default class TaskLink {

    // The Source Connector
    source = {};

    // The Target Connector
    target = {};

    // The vertex points - vertices
    points = [];
 
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

        if (!this.target.userData) {
            this.target = connector;
            this.target.material.color.set(targetColor);
            return true;
        }

        return false;
    }

    getKey = (connector) => {
        return connector.userData.id + "~" + connector.userData.direction;
    }

    getLine = () => {
        return this.tube;
    }

    buildTube = () => {

        const path = new CatmullRomCurve3(this.points,false,'catmullrom',0.05);
        const tubeGeometry = new TubeGeometry(path, 150, 0.02, 20, false );
        const tubeMaterial = new MeshBasicMaterial( { color: lineColor } );
        
        if(!this.tube) {
            this.tube = new Mesh(tubeGeometry,tubeMaterial);
            this.tube.userData = {id: this.getKey(this.source)};
        }
        else {
            this.tube.geometry = tubeGeometry;
        }


        return this.tube;
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
}
