import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols';
import TextFactory from './TextFactory';

const fov = 29;
const near = 1;
const far = 100;
const sceneColor = 0xffffff;


export default class SessionGrid {

    constructor(container) {
        this.container = container;

        this.textFactory = new TextFactory();

        this.init();
        this.addListeners();
    }

    init = () => {
        this.setupScene();
        this.setBoard();
        this.animate();
    }

    setupScene = () => {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(fov, width / height, near, far);

        this.camera.position.x = 0;//0
        this.camera.position.y = 0;//0,1
        this.camera.position.z = 15;//10

        this.scene.background = new THREE.Color(sceneColor);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.container.appendChild(this.renderer.domElement);
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    }


    animate = () => {
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
        this.orbitControls.update();
    }

    addListeners = () => {
        window.addEventListener("resize", this.handleWindowResize);
    }

    handleWindowResize = () => {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;

        this.camera.updateProjectionMatrix();
    }

    setBoard = () => {
        new THREE.TextureLoader().load('./piano.png', this.onPillarTexture);
        new THREE.TextureLoader().load('./piano.png', this.buildTopSlab);
        new THREE.TextureLoader().load('./silver_sheet.jpg', this.buildRoller);
        new THREE.TextureLoader().load('./cabin.png', this.buildCabins);
    }

    onPillarTexture = (texture) => {
        this.piller_texture = texture;

        const first_x_left = -6.0;
        const next_x_left = first_x_left + (1.618 * 8);

        this.buildTimePillars(first_x_left);
        this.buildTimePillars(next_x_left)
    }

    buildTimePillars = (x_left) => {

        const y_lower = -1.75;
        const yGap = 1.00;

        const transparent = new THREE.MeshBasicMaterial({ transparent: true, opacity: 1, color: "black", side: THREE.DoubleSide });
        const material = new THREE.MeshBasicMaterial({ map: this.piller_texture, side: THREE.DoubleSide });
        const geometry = new THREE.BoxBufferGeometry(1.618, 1, 0.5);

        var y = 0;
        for (var i = 0; i < 5; i++) {
            var front = new THREE.Mesh(geometry, [material, material, transparent, material, material, material]);
            var back = new THREE.Mesh(geometry, [material, material, transparent, material, material, material]);

            y = y_lower + (i * yGap);

            front.position.set(x_left, y, 0);
            back.position.set(x_left, y, -1);

            this.scene.add(front);
            this.scene.add(back);
        }
    }

    buildRoller = (texture) => {
        const first_x_left = -6.0;
        const y_lower = -1.75
        const y_gap = 1.00;
        const y_max = y_lower + (5 * y_gap);

        const material = new THREE.MeshBasicMaterial({ map: texture });
        const geometry = new THREE.CylinderBufferGeometry(0.25, 0.25, 0.25);

        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(first_x_left, y_max, -0.5);
        mesh.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.PI / 2);
        this.scene.add(mesh);

        var v1 = new THREE.Vector3(0, 0, 0);
        var v2 = new THREE.Vector3(1.5, 0, 0);
        var v3 = new THREE.Vector3(0.75, 0.75, 0);
        var triangle = new THREE.Triangle(v1, v2, v3);
        var normal = triangle.normal();

        var triGeo = new THREE.Geometry();
        triGeo.vertices.push(triangle.a);
        triGeo.vertices.push(triangle.b);
        triGeo.vertices.push(triangle.c);

        triGeo.faces.push(new THREE.Face3(0, 1, 2, normal));

        var mesh = new THREE.Mesh(triGeo, material);

        mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        mesh.position.set(first_x_left - 0.5, y_max - 0.6, -1.25);

        this.scene.add(mesh);
    }

    buildCabins = (texture) => {

        const first_x_left = -6.0;
        const y_lower = -1.75;
        const yGap = 1.00;
        const xGap = 0;

        const material = new THREE.MeshBasicMaterial({ map: texture });
        const geometry = new THREE.BoxBufferGeometry(1.618, 1, 0.5);

        var x = first_x_left + (1.618 + xGap);

        for (var i = 0; i < 7; i++) {
            for (var j = 0; j < 5; j++) {
                const y = y_lower + (j * yGap);

                var mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(x, y, -1/2);

                this.scene.add(mesh)
            }
            x = x + (1.618 + xGap);
        }
    }

    buildTopSlab = (texture) => {
        const days = ["<", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", ">"];
        const dates = ["","5","6","7","8","9","10","11",""]
        const months = ["", "Oct", "Oct", "Oct", "Oct", "Oct", "Oct", "Oct", ""];

        var x_left = -6.0;

        const y_lower = -1.75;
        const y_gap = 1.00;
        const y_top = y_lower + (5 * y_gap);

        const material = new THREE.MeshBasicMaterial({ map: texture });
        const geometry = new THREE.BoxBufferGeometry(1.618, 1, 0.1);

        for (var i = 0; i < 9; i++) {
            var tilted = new THREE.Mesh(geometry, material);
            tilted.position.set(x_left, y_top, 0);
            this.scene.add(tilted);
            tilted.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 4);
            tilted.translateZ(-1/4);
            
            var day = this.textFactory.build(days[i], 0.3, 0.1, "#fae78f");
            day.position.set(x_left-0.3,y_top,0);
            this.scene.add(day);
            day.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI/4);
            day.translateZ(-1/4);
            day.translateY(-0.3);

            var vertical = new THREE.Mesh(geometry, material);
            vertical.position.copy(tilted.position.clone());
            vertical.position.y = vertical.position.y + 1 - 0.25;
            vertical.position.z = vertical.position.z - 0.25;
            this.scene.add(vertical);

            var date = this.textFactory.build(dates[i], 0.3, 0.1, "#fae78f");
            date.position.copy(vertical.position.clone());
            date.position.y = date.position.y-0.4;
            date.position.x = date.position.x-0.1
            this.scene.add(date);

            var mon = this.textFactory.build(months[i], 0.2, 0.1, "white");
            mon.position.copy(vertical.position.clone());
            mon.position.x = mon.position.x-0.1
            this.scene.add(mon);

            var back_horizontal = new THREE.Mesh(geometry, material);
            back_horizontal.position.set(x_left, tilted.position.y + 0.5, -1);
            this.scene.add(back_horizontal);
            back_horizontal.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);

            var back_tilted = new THREE.Mesh(geometry, material);
            back_tilted.position.set(x_left, y_top, 0);
            this.scene.add(back_tilted);
            back_tilted.rotateOnAxis(new THREE.Vector3(-1, 0, 0), -Math.PI / 4);
            back_tilted.translateZ(1/4);
            back_tilted.position.z -= 1;

            x_left = x_left + (1.618);
        }

    }
}
