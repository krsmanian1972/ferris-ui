import { BufferAttribute,  BufferGeometry, Vector3,CatmullRomCurve3,TubeGeometry,MeshBasicMaterial,Mesh } from 'three';

const lineColor = 0x0000ff;
const sourceColor = 0xff0000;
const targetColor = 0x00ff00;

const SOURCE = "source";
const TARGET = "target";

const MAX_VERTICES = 20;

export default class TaskLink {

    // The Source Connector
    source = {};

    // The Target Connector
    target = {};

    // The vertex points - vertices
    points = [];

    geometry = new BufferGeometry();
    positions = new Float32Array(MAX_VERTICES * 3); // 3 vertices per point
  
    index = 0;

    constructor(connector) {

        this.source = connector;
        this.source.material.color.set(sourceColor);

        this.geometry.setAttribute('position', new BufferAttribute(this.positions, 3));

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
        const tubePoints = [];

        for(var i=0;i<this.index;) {
            
            var x = this.positions[i]
            var y = this.positions[i+1]
            var z = this.positions[i+2]
            
            var point = new Vector3(x,y,z);
            tubePoints.push(point);

            i=i+3;
        }

        const path = new CatmullRomCurve3(tubePoints,false,'catmullrom',0.05);
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
        this.points.length = 0;
        this.points.push(point);
        this.points.push(point);

        this.index = 0;

        this.positions[this.index++] = point.x;
        this.positions[this.index++] = point.y;
        this.positions[this.index++] = point.z;

        this.positions[this.index++] = point.x+0.01;
        this.positions[this.index++] = point.y;
        this.positions[this.index++] = point.z;

        this.geometry.setDrawRange(0, this.index / 3);
        this.geometry.attributes.position.needsUpdate = true;

        this.buildTube();
    }

    /**
     * When the User moves the mouse along the current direction.
     * Typically during mouse Move Operation
     *
     * @param {*} point
     */
    updatePoint = (point) => {

        this.positions[this.index - 3] = point.x;
        this.positions[this.index - 2] = point.y;
        this.positions[this.index - 1] = point.z;

        this.geometry.attributes.position.needsUpdate = true;

        this.buildTube();
    }

    onMove = (type) => {
        if (type === SOURCE) {
            const point = this.source.position.clone();

            this.positions[0] = point.x;
            this.positions[1] = point.y;
            this.positions[2] = 0;

            this.geometry.attributes.position.needsUpdate = true;
            this.buildTube();
        }
        else if (type === TARGET) {
            const point = this.target.position.clone();

            this.updatePoint(point);
        }
    }

    addVertex = (point) => {

        this.points.push(point);

        this.positions[this.index++] = point.x;
        this.positions[this.index++] = point.y;
        this.positions[this.index++] = 0

        this.geometry.setDrawRange(0, this.index / 3);

        this.geometry.attributes.position.needsUpdate = true;

        this.buildTube();
    }
}
