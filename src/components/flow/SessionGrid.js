import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols';
import TextFactory from './TextFactory';

const fov = 28;
const near = 1;
const far = 100;

const sceneColor = "rgb(216,213,221)";

const leftX = -6.50;
const bottomY = -1.75;
const gapX = 0.01;

const unitSize = 5;

const unitLength = 1.618;
const unitHeight = 1;
const unitDepth = 0.5;

const boardWidth = 4 * unitLength;
const maxY = bottomY + (unitSize * unitHeight);

export default class SessionGrid {

    dateGroup = [];
    monthGroup = [];
    dayGroup = [];

    constructor(container) {
        this.container = container;

        this.textFactory = new TextFactory();

        this.setupScene();

        //this.setBoard();

        this.animate();

        this.addListeners();

        this.setTest();
    }

    setupScene = () => {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(fov, width / height, near, far);

        this.camera.position.x = 0;
        this.camera.position.y = 0;
        this.camera.position.z = 20;

        this.scene.background = new THREE.Color(sceneColor);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.container.appendChild(this.renderer.domElement);

        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    }

    setTest = () => {
        const material = new THREE.MeshBasicMaterial({ color:"black" });
        const geometry = new THREE.BoxBufferGeometry(1, 1, 0.1);
        const mesh  = new THREE.Mesh(geometry,material);

        var rect = this.renderer.domElement.getBoundingClientRect();
        const x = ((25 - rect.left) / rect.width) * 2 - 1;
        const y = - ((25 - rect.top) / rect.height) * 2 + 1;

        var vector = new THREE.Vector3(x, y, 0);
        vector.unproject(this.camera);

        var direction = vector.sub(this.camera.position).normalize();
        var distance = this.camera.position.z / direction.z;
        direction.multiplyScalar(-distance);

        var point = this.camera.position.clone().add(direction);

        mesh.position.set(point.x,point.y,0);

        this.scene.add(mesh);
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
        new THREE.TextureLoader().load("./black_top.png", this.setGround);
    }


    onPillarTexture = (texture) => {

        // The next pillar is at week length + 1 from the 1st Pillar
        const next_x_left = leftX + (unitLength * 8);

        this.buildTimePillars(leftX, texture);
        this.buildTimePillars(next_x_left, texture)
    }

    /**
     * Let us build two set of pillers (front and back)
     * @param {*} x_left 
     * @param {*} texture 
     */
    buildTimePillars = (x_left, texture) => {

        const geometry = new THREE.BoxBufferGeometry(unitLength, unitHeight, unitDepth);

        const transparent = new THREE.MeshBasicMaterial({ transparent: true, opacity: 1, color: "black", side: THREE.FrontSide });
        const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });

        const materials = [material, material, transparent, material, material, material];

        for (var i = 0; i < unitSize; i++) {

            var front = new THREE.Mesh(geometry, materials);
            var back = new THREE.Mesh(geometry, materials);

            const y = bottomY + (i * unitHeight);

            front.position.set(x_left, y, 0);
            back.position.set(x_left, y, -1);

            this.scene.add(front);
            this.scene.add(back);
        }
    }

    buildRoller = (texture) => {

        const material = new THREE.MeshBasicMaterial({ map: texture });
        const geometry = new THREE.CylinderBufferGeometry(1 / 2, 1 / 2, 0.25 / 2);

        const roller = new THREE.Mesh(geometry, material);

        roller.position.set(leftX, maxY, -0.50);
        roller.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.PI / 2);

        this.scene.add(roller);

        const v1 = new THREE.Vector3(0, 0, 0);
        const v2 = new THREE.Vector3(1.5, 0, 0);
        const v3 = new THREE.Vector3(0.75, 0.75, 0);

        const triangle = new THREE.Triangle(v1, v2, v3);

        const triGeo = new THREE.Geometry();

        triGeo.vertices.push(triangle.a);
        triGeo.vertices.push(triangle.b);
        triGeo.vertices.push(triangle.c);

        triGeo.faces.push(new THREE.Face3(0, 1, 2));

        const mesh = new THREE.Mesh(triGeo, material);

        mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        mesh.position.set(leftX - 0.5, maxY - 0.5, -1.25);

        this.scene.add(mesh);
    }

    buildCabins = (texture) => {

        //const material = new THREE.MeshBasicMaterial({ map: texture });

        const geometry = new THREE.BoxBufferGeometry(unitLength, unitHeight, unitDepth);

        var x = leftX;

        for (var i = 0; i < 7; i++) {
            x = x + (unitLength + gapX);

            for (var j = 0; j < unitSize; j++) {
                var y = bottomY + (j * unitHeight);

                var material = this.buildSessionText(i + "-" + j, ["Line-12-00", "Line-23-00", "Line-34-00", "Line-45-00"]);

                var cell = new THREE.Mesh(geometry, material);
                cell.position.set(x, y, -1 / 2);
                this.scene.add(cell);
            }
        }


        const boardX = leftX + (9 * (unitLength + gapX)) + (boardWidth - unitLength) / 2;
        const boardY = bottomY + unitHeight / 2 - 0.5;

        const boardGeo = new THREE.BoxBufferGeometry(boardWidth, unitHeight, unitDepth);

        var y = boardY;

        for (var i = 0; i < unitSize; i++) {
            var board = new THREE.Mesh(boardGeo, material);

            board.position.set(boardX, y, -1 / 2);
            board.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2);
            board.position.x = board.position.x - boardWidth / 2
            board.position.z = board.position.z + (boardWidth / 2) + (0.75);

            this.scene.add(board);

            y = y + unitHeight;
        }
    }

    buildTopSlab = (texture) => {

        this.dateGroup.length = 0;
        this.monthGroup.length = 0;
        this.dayGroup.length = 0;

        const material = new THREE.MeshBasicMaterial({ map: texture });
        const geometry = new THREE.BoxBufferGeometry(unitLength, unitHeight, 0.1);

        var x = leftX;

        for (var i = 0; i < 9; i++) {

            var tilted = new THREE.Mesh(geometry, material);
            tilted.position.set(x, maxY, 0);
            tilted.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 4);
            tilted.translateZ(-1 / 4);
            this.scene.add(tilted);

            var day = this.textFactory.build("", 0.3, 0.1, "#fae78f");
            var group = new THREE.Group();
            group.add(day);
            group.position.set(x - 0.3, maxY, 0);
            group.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 4);
            group.translateZ(-1 / 4);
            group.translateY(-0.3);
            this.scene.add(group);
            this.dayGroup.push(group);

            var backTilted = new THREE.Mesh(geometry, material);
            backTilted.position.set(x, maxY, 0);
            backTilted.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 4);
            backTilted.translateZ(1 / 4);
            backTilted.position.z -= 1;
            this.scene.add(backTilted);

            var vertical = new THREE.Mesh(geometry, material);
            vertical.position.copy(tilted.position.clone());
            vertical.position.y = vertical.position.y + unitHeight - 0.25;
            vertical.position.z = vertical.position.z - 0.25;
            this.scene.add(vertical);

            var date = this.textFactory.build("", 0.3, 0.1, "#fae78f");
            var group = new THREE.Group();
            group.add(date);
            group.position.copy(vertical.position.clone());
            group.position.y = group.position.y - 0.4;
            group.position.x = group.position.x - 0.1
            this.scene.add(group);
            this.dateGroup.push(group);

            var month = this.textFactory.build("", 0.2, 0.1, "white");
            var group = new THREE.Group();
            group.add(month);
            group.position.copy(vertical.position.clone());
            group.position.x = group.position.x - 0.1
            this.scene.add(group);
            this.monthGroup.push(group);

            x = x + unitLength;
        }
    }

    setGround = (texture) => {

        const material = new THREE.MeshBasicMaterial({ map: texture });
        const geometry = new THREE.BoxBufferGeometry(unitLength * 29, unitHeight * 29, 0.1);

        var ground = new THREE.Mesh(geometry, material);
        ground.position.set(leftX, bottomY - 0.5, 0);
        ground.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
        ground.translateX(unitLength * 4);
        this.scene.add(ground);
    }

    /**
     * Remember that the dateGroup, monthGroup and dayGroup has a head and tail.
     * 
     * We have 9 UI elements, but will always receive 7 days.
     * 
     */
    changeDates = () => {

        const dates = ["6", "7", "8", "9", "10", "11", "12"];
        const months = ["Oct", "Oct", "Oct", "Oct", "Oct", "Oct", "Oct"];
        const days = ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"];

        for (var i = 0; i < dates.length; i++) {

            var date = this.textFactory.build(dates[i], 0.3, 0.1, "#fae78f");
            var month = this.textFactory.build(months[i], 0.2, 0.1, "white");
            var day = this.textFactory.build(days[i], 0.3, 0.1, "#fae78f");

            var groupIndex = i + 1;

            var group = this.dateGroup[groupIndex];
            group.remove(...group.children);
            group.add(date);

            var group = this.monthGroup[groupIndex];
            group.remove(...group.children);
            group.add(month);

            var group = this.dayGroup[groupIndex];
            group.remove(...group.children);
            group.add(day);
        }
    }


    buildSessionText = function (id, lines) {
        const canvas = document.createElement('canvas');

        canvas.id = id;
        canvas.width = 128;
        canvas.height = 64;
    
        const context = canvas.getContext('2d');

        context.fillStyle = "white";
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);

        context.font = "bold 18px sans-serif";
        context.fillStyle = "black";

        var y = 20;
        var vGap = 20;

        for (var i = 0; i < lines.length; i++) {
            context.fillText(lines[i], canvas.width / 8, y);
            y = y + vGap;
        }

        const texture = new THREE.CanvasTexture(canvas)
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.FrontSide,
            transparent: false,
        });

        return material;
    }
}
