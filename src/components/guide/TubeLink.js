import { MeshBasicMaterial,CatmullRomCurve3,Vector3,TubeGeometry,Mesh } from 'three';

const taskBarColor = "#2A4B7C";
const sourceColor = 0xff0000;
const targetColor = 0x00ff00;

const SOURCE = "source";
const TARGET = "target";
const barWidth = 2.5;

export default class TubeLink {

    // The Source Connector
    source = {};

    // The Target Connector
    target = {};

    // The vertex points - vertices
    points = [];

    material = new MeshBasicMaterial( { color: 0x0000ff } );
   
    index = 0;

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
        return this.line;
    }


    /**
     * When the User clicks a Connector and see the connector in Red Color
     * Create a zero length line
     *
     * @param {*} point
     */
    addInitialPoint = (point) => {

        var nextPoint = point.clone();
        nextPoint.x = nextPoint.x+0.1;

        this.points.length = 0;
        this.points.push(point);
        this.points.push(nextPoint);
       
        this.path = new CatmullRomCurve3(this.points,false,'catmullrom',0.05);
        this.geometry = new TubeGeometry(this.path, 150, 0.02, 20, false );

        this.line = new Mesh(this.geometry,this.material);
    }

    /**
     * When the User moves the mouse along the current direction.
     * Typically during mouse Move Operation
     *
     * @param {*} point
     */
    updatePoint = (point) => {
        this.points.push(point);
        this.line = new Mesh(this.geometry,this.material);
    }

    onMove = (type) => {
        if (type === SOURCE) {
           
        }
        else if (type === TARGET) {
         
        }
    }

    addVertex = (point) => {

       
    }
}
