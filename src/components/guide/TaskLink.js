import { BufferAttribute,Line,LineBasicMaterial,BufferGeometry } from 'three';

const taskBarColor = "#2A4B7C";
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

    material = new LineBasicMaterial({ color: 0x0000ff, linewidth: 2 });
    geometry = new BufferGeometry();
    positions = new Float32Array(MAX_VERTICES * 3); // 3 vertices per point

    index = 0;

    constructor(connector) {

        this.source = connector;
        this.source.material.color.set(sourceColor);

        this.geometry.setAttribute( 'position', new BufferAttribute( this.positions, 3 ) );

        this.addInitialPoint(this.source.position.clone());

        this.line = new Line( this.geometry,  this.material );
        this.line.userData = this.getKey(connector);
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
        return this.line;
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

        this.index=0;

        this.positions[ this.index ++ ] = point.x;
        this.positions[ this.index ++ ] = point.y;
        this.positions[ this.index ++ ] = point.z;

        this.positions[ this.index ++ ] = point.x;
        this.positions[ this.index ++ ] = point.y;
        this.positions[ this.index ++ ] = point.z;

        this.geometry.setDrawRange( 0, this.index/3 );
        this.geometry.attributes.position.needsUpdate = true;
    }

    /**
     * When the User moves the mouse along the current direction.
     * Typically during mouse Move Operation
     *
     * @param {*} point
     */
    updatePoint = (point) => {

        this.positions[this.index-3] = point.x;
        this.positions[this.index-2] = point.y;
        this.positions[this.index-1] = point.z;

        this.geometry.attributes.position.needsUpdate = true;
    }

    onMove = (point, type) => {
      if(type === SOURCE){

        this.positions[ 0 ] = point.x;
        this.positions[ 1 ] = point.y;
        this.positions[ 2 ] = 0;
        this.geometry.attributes.position.needsUpdate = true;
      }
      else if(type === TARGET){

        this.updatePoint(point);
      }
    }


    addVertex = (point) => {

        this.points.push(point);

        this.positions[ this.index ++ ] = point.x;
        this.positions[ this.index ++ ] = point.y;
        this.positions[ this.index ++ ] = 0

        this.geometry.setDrawRange( 0, this.index/3 );

        this.geometry.attributes.position.needsUpdate = true;
    }
}
