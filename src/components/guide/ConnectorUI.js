import React, { Component } from 'react';
import { Button, Row, Col, Tabs, Tooltip, Space } from 'antd';
import { EditOutlined, ItalicOutlined, UndoOutlined, RedoOutlined, ScissorOutlined } from '@ant-design/icons';

import { inject } from 'mobx-react';
import * as THREE from 'three';

const containerStyle = {
    height: window.innerHeight,
    width: window.innerWidth
};

const canvasStyle = {
    display: 'none'
}

const fov = 45;
const near = 1;
const far = 10000;

const pointLightColor = 0xffffff;
const pointLightPosition = 0.5;

const lineMaterial = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 2 } );

@inject("appStore")
class ConnectorUI extends Component {

    constructor(props) {
        super(props);
        this.mode = '';
        this.isDrawing = false;
        this.tasks = [];
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
        //this.renderer.domElement.addEventListener("dblclick", this.toggleDrawMode);
        //this.renderer.domElement.addEventListener("mousemove", this.drawConnector);
        this.renderer.domElement.addEventListener("click", this.placeBox);
    }



    placeBox = (event) => {
        const canvas = {};
        canvas.width = 256;
        canvas.height = 128;

        const point = this.getClickPoint(event);

        var canvas1 = document.createElement('canvas');
        var context1 = canvas1.getContext('2d');
        context1.font = "Bold 25px Arial";
        context1.fillStyle = "white";        
        context1.fillRect(0,0, canvas.width, canvas.height);
//        context1.fillStyle = "black";
//        context1.fillText('   A ', canvas.width , canvas.height);
        // canvas contents will be used for a texture
        var texture1 = new THREE.Texture(canvas1);
        texture1.needsUpdate = true;

        var material1 = new THREE.MeshBasicMaterial({ map: texture1,});
        material1.transparent = false;
        var mesh1 = new THREE.Mesh(
                        new THREE.BoxGeometry(0, 0, 0),
                         material1
                    );

        mesh1.position.set(point.x, point.y, 0);
        this.tasks.push(mesh1);
        this.tasks.map((item) => 
              this.scene.add(item));
        this.renderer.render(this.scene, this.camera);
        
    
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
        this.scene.background = new THREE.Color( 0xf0f0f0 );
        
        this.camera = new THREE.PerspectiveCamera(fov, width / height, near, far);

        this.camera.position.x = 0;
        this.camera.position.y = -400;
        this.camera.position.z = 600;

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize(width, height);
        this.container.appendChild(this.renderer.domElement);

        const light = new THREE.PointLight(pointLightColor, pointLightPosition);
        light.position.set(1, 1, 0).normalize();
        this.scene.add(light);
//        var loader = new THREE.FontLoader();
//        
//		loader.load( 'fonts/test.json', 
//		
//		function ( font ) {
//		    console.log("loaded");
//		},
//		// onProgress callback
//	function ( xhr ) {
//		console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
//	},
//
//	// onError callback
//	function ( err ) {
//		console.log( 'An error happened' );
//		console.log(err);
//	}
//		);
//			var xMid;
//			var text;
//			var color = 0x006699;
//			var matDark = new THREE.LineBasicMaterial( {
//		  	    color: color,
//				side:THREE.DoubleSide
//				} );
///			var matLite = new THREE.MeshBasicMaterial( {
//			   color: color,
//			   transparent: true,
//			   opacity: 0.4,
//			   side: THREE.DoubleSide
//			   } );

//			var message = "   Three.js\nSimple text.";
//			var shapes = font.generateShapes( message, 100 );
//			var geometry = new THREE.ShapeBufferGeometry( shapes );
//			geometry.computeBoundingBox();
//			xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
//			geometry.translate( xMid, 0, 0 );
//			text = new THREE.Mesh( geometry, matLite );
//			text.position.z = - 150;
//			this.scene.add( text );
//		};
        this.box1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.25), new THREE.MeshBasicMaterial({ color: "yellow" }));
        this.box2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.25), new THREE.MeshBasicMaterial({ color: "yellow" }));
        this.box3 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.25), new THREE.MeshBasicMaterial({ color: "yellow" }));
        this.box4 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.25), new THREE.MeshBasicMaterial({ color: "yellow" }));
        this.box1.position.set(-2, 0, 4);
        this.box2.position.set(0, 0, 4);
        this.box3.position.set(2, 0, 4);
        this.box4.position.set(4, 0, 4);
        this.scene.add(this.box1);
        this.scene.add(this.box2);
        this.scene.add(this.box3);
        this.scene.add(this.box4);

        const task = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 0), new THREE.MeshBasicMaterial({ color: "yellow" }));         
        task.position.set(-2, 0, 0);
        this.tasks.push(task);
        
        this.tasks.map((item) => 
              this.scene.add(item));

        //const lineGeometry = new THREE.BufferGeometry();
        //const positions = new Float32Array(20*3);
        //lineGeometry.addAttribute('position',new THREE.BufferAttribute(positions,3));
       
        //this.connector = new THREE.Line(lineGeometry, lineMaterial);
      
        //this.scene.add(this.connector);
     
        this.renderer.render(this.scene, this.camera);
    };

    newLine = () => {

    }
    placeTask = () => {
       this.mode = "PLACE_TASK";
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
                <Button onClick={this.placeTask} id="pen" type="primary" icon={<EditOutlined />} shape={"circle"} />
                <canvas style={canvasStyle} ref={ref => (this.textCanvas = ref)}></canvas>
            </div>
        )
    }



}

export default ConnectorUI;
