import * as THREE from 'three';

const fov = 30;
const near = 1;
const far = 100;

const barWidth = 3;
const barHeight = 1;
const barDepth = 0;

const hLine = 26;
const vLine = 9;
const gridStep = 1;

const sceneColor = 0xffffff;
const gridColor = "rgb(216,213,221)";

export default class SessionGrid {

    constructor(container) {
        this.container = container;

        this.taskBarGeo = new THREE.PlaneGeometry(barWidth, barHeight, barDepth);
        this.gridLineMaterial = new THREE.LineBasicMaterial({ color: gridColor });

        this.taskBars = [];

        this.init();
        this.addListeners();
    }

    init = () => {
        this.setupScene();
        //this.setGraphPaper();
        this.setBoard();
        this.animate();
    }

    setupScene = () => {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(fov, width / height, near, far);

        this.camera.position.x = 0;
        this.camera.position.y = 0;
        this.camera.position.z = 15;

        this.scene.background = new THREE.Color(sceneColor);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.container.appendChild(this.renderer.domElement);
    }

    buildTimePillers = (texture) => {
        const x_left = -6.0;
        const y_lower = -1.75;
        const yGap = 1.02;

        const material = new THREE.MeshBasicMaterial( { map: texture } );
        const geometry = new THREE.BoxBufferGeometry(1.618, 1, 0.1 );

        var y = 0;
        for (var i=0;i<5;i++) {
            var mesh = new THREE.Mesh( geometry, material );
            
            y = y_lower+(i*yGap);
            mesh.position.set(x_left,y,0);

            this.scene.add(mesh)
        }
    }

    buildTopSlab = (texture) => {
        const x_left = -6.0;
        const y_top = 2.33+1.02;

        const material = new THREE.MeshBasicMaterial( { map: texture } );
        const geometry = new THREE.PlaneBufferGeometry(1.618, 1, 0.1 );

        var tilted = new THREE.Mesh( geometry, material );
        tilted.position.set(x_left,y_top,0);
        this.scene.add(tilted);

        tilted.rotateX(-Math.PI/4);
        tilted.translateX(1-1.618/2);
        tilted.translateY(-0.25);
        tilted.translateZ(-0.1/2);
    }

    onTextureError = (error) => {
        console.log(error);
    }

    /**
     * plate_material.png, stair.png
     */
    setBoard = () => {
        new THREE.TextureLoader().load( './rusted_iron.jpg',this.buildTimePillers,null,this.onTextureError);
        new THREE.TextureLoader().load( './rusted_iron.jpg',this.buildTopSlab,null,this.onTextureError);
    }

    setGraphPaper = () => {

        const geometry = new THREE.Geometry();

        for (var i = -hLine; i <= hLine; i += gridStep) {
            geometry.vertices.push(new THREE.Vector3(-hLine, i, 0));
            geometry.vertices.push(new THREE.Vector3(hLine, i, 0));
        }

        for (var i = -vLine; i <= vLine; i += gridStep) {
            geometry.vertices.push(new THREE.Vector3(i, -vLine, 0));
            geometry.vertices.push(new THREE.Vector3(i, vLine, 0));
        }

        const grid = new THREE.LineSegments(geometry, this.gridLineMaterial);

        this.scene.add(grid);
    }

    animate = () => {
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
    }

    addListeners = () => {
        this.renderer.domElement.addEventListener("wheel", this.scroll);
        window.addEventListener("resize", this.handleWindowResize);
    }

    handleWindowResize = () => {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;

        this.camera.updateProjectionMatrix();
    }

    getClickPoint = (event) => {

        var rect = this.renderer.domElement.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;

        var vector = new THREE.Vector3(x, y, 0);
        vector.unproject(this.camera);

        var direction = vector.sub(this.camera.position).normalize();
        var distance = this.camera.position.z / direction.z;
        direction.multiplyScalar(-distance);

        var point = this.camera.position.clone().add(direction);

        return point;
    }

    scroll = (event) => {

        if (event.shiftKey && event.ctrlKey) {
            if (event.deltaX > 0) {
                this.camera.position.x -= 0.1;
            }
            else {
                this.camera.position.x += 0.1;
            }
            return;
        }

        if (event.shiftKey) {
            if (event.deltaY < 0) {
                this.camera.fov -= 1;
                this.camera.updateProjectionMatrix();
            }
            else {
                this.camera.fov += 1;
                this.camera.updateProjectionMatrix();
            }
            return;
        }

        if (event.deltaY > 0) {
            this.camera.position.y -= 0.2
        }
        else {
            if (this.camera.position.y < 0.1) {
                this.camera.position.y += 0.2
            }
        }

    }

}