import React, { Component } from 'react';

import { inject } from 'mobx-react';
import * as THREE from 'three';


const containerStyle = {
    height: window.innerHeight,
    width: window.innerWidth
};

const canvasStyle = {
    display: 'none'
}

const fov = 70;
const near = 0.1;
const far = 1000;

const pointLightColor = 0xffffff;
const pointLightPosition = 0.5;

const lineMaterial = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 2 } );

@inject("appStore")
class ConnectorUI extends Component {

    constructor(props) {
        super(props);

        this.isDrawing = false;
    }

    componentDidMount() {
        this.init();
        window.addEventListener("resize", this.handleWindowResize);

    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleWindowResize);

    }

    init = () => {
        this.setupScene();
        this.renderer.domElement.addEventListener("dblclick", this.toggleDrawMode);
        this.renderer.domElement.addEventListener("mousemove", this.drawConnector);
    }

    drawConnector = (event) => {
        event.preventDefault();
        if (!this.isDrawing) {
            return;
        }

        const point = this.getClickPoint(event);
        const positions = this.connector.geometry.attributes.position.array;

        positions[3] = point.x;
        positions[4] = point.y;
        positions[5] = point.z;
  
        this.connector.geometry.attributes.position.needsUpdate = true;
        
        this.renderer.render(this.scene, this.camera);
    }

    toggleDrawMode = (event) => {
        this.isDrawing = !this.isDrawing;
        if (!this.isDrawing) {
            return;
        }

        const point = this.getClickPoint(event);
        const positions = this.connector.geometry.attributes.position.array;

        positions[0] = point.x;
        positions[1] = point.y;
        positions[2] = point.z;
        
        positions[3] = point.x;
        positions[4] = point.y;
        positions[5] = point.z;
    
        this.connector.geometry.setDrawRange( 0, 2 );
        this.connector.geometry.attributes.position.needsUpdate = true;

        this.renderer.render(this.scene, this.camera);
        
    }

    getClickPoint = (event) => {

        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
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

    movingTheBox = (event) => {
        event.preventDefault();
        if (!this.isDrawing) {
            return;
        }

        aBox.position.copy(this.getClickPoint(event));

        this.renderer.render(this.scene, this.camera);
    }

    

    setupScene = () => {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.map = {};

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(fov, width / height, near, far);

        this.camera.position.x = 0;
        this.camera.position.y = 0;
        this.camera.position.z = 10;

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.container.appendChild(this.renderer.domElement);

        const light = new THREE.PointLight(pointLightColor, pointLightPosition);
        light.position.set(1, 1, 1).normalize();
        this.scene.add(light);

        this.box1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.25), new THREE.MeshBasicMaterial({ color: "yellow" }));
        this.box2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.25), new THREE.MeshBasicMaterial({ color: "yellow" }));
        this.box3 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.25), new THREE.MeshBasicMaterial({ color: "yellow" }));

        this.box1.position.set(-2, 0, 4);
        this.box2.position.set(0, 0, 4);
        this.box3.position.set(2, 0, 4);

        this.scene.add(this.box1);
        this.scene.add(this.box2);
        this.scene.add(this.box3);

        

        const lineGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(20*3);
        lineGeometry.addAttribute('position',new THREE.BufferAttribute(positions,3));
       
        this.connector = new THREE.Line(lineGeometry, lineMaterial);
      
        this.scene.add(this.connector);
     
        this.renderer.render(this.scene, this.camera);
    };

    newLine = () => {

    }


    handleWindowResize = () => {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;

        this.camera.updateProjectionMatrix();
    }

    render() {
        return (
            <div style={containerStyle} ref={ref => (this.container = ref)}>
                <canvas style={canvasStyle} ref={ref => (this.textCanvas = ref)}></canvas>
            </div>
        )
    }



}

export default ConnectorUI;