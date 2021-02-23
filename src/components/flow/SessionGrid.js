import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import TextFactory from './TextFactory';
import moment from 'moment';

const fov = 28;
const near = 1;
const far = 2000;

const sceneColor = "rgb(216,213,221)";
const cyan = "#00b7eb";

const gapX = 0.01;

const unitSize = 6;

const unitLength = 2.50;
const unitHeight = 1.40;
const unitDepth = 0.5;

const boardWidth = 4 * unitLength;

const numberOfDays = 7;

/**
 * The structure of event matrix
 */

export default class SessionGrid {

    dateGroup = [];
    monthGroup = [];
    dayGroup = [];
    timeGroup = [];

    dates = [];
    times = [];

    eventMaterialMatrix = new Map();

    renderRequested = false;

    constructor(container, requestDataCallBack) {
        this.container = container;

        this.requestDataCallBack = requestDataCallBack


        this.textFactory = new TextFactory();

        this.setupScene();

        this.setLight();

        this.setBoundary();

        this.setCalendarBoard();

        this.render();
    }

    setupScene = () => {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(fov, width / height, near, far);

        this.camera.position.set(0, 0, 20);

        this.scene.background = new THREE.Color(sceneColor);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.maxPolarAngle = Math.PI * 0.5;
        this.orbitControls.screenSpacePanning = true;

        this.orbitControls.addEventListener('change', this.renderAgain);
    }

    renderAgain = () => {
        if (!this.renderRequested) {
            this.renderRequested = true;
            requestAnimationFrame(this.render);
        }
    }

    render = () => {
        this.renderRequested = undefined;
        this.orbitControls.update();
        this.renderer.render(this.scene, this.camera);
    }


    setBoundary = () => {

        var rect = this.renderer.domElement.getBoundingClientRect();

        const x = - 1;
        const y = - 1;

        var vector = new THREE.Vector3(x, y, 0);
        vector.unproject(this.camera);

        var direction = vector.sub(this.camera.position).normalize();
        var distance = this.camera.position.z / direction.z;
        direction.multiplyScalar(-distance);

        var point = this.camera.position.clone().add(direction);

        this.leftX = point.x;
        this.bottomY = point.y;
        this.maxY = this.bottomY + (unitSize * unitHeight);

        const material = new THREE.MeshStandardMaterial({ color: "black" });
        const geometry = new THREE.BoxBufferGeometry(1, 1, 0.1);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(point.x, point.y, 0);

        //  this.scene.add(mesh);
    }

    setGround = (texture) => {

        const material = new THREE.MeshStandardMaterial({ map: texture });
        const geometry = new THREE.BoxBufferGeometry(unitLength * 29, unitHeight * 29, 0.1);

        var ground = new THREE.Mesh(geometry, material);
        ground.position.set(this.leftX, this.bottomY - 0.75, 0);
        ground.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
        ground.translateX(unitLength * 4);
        this.scene.add(ground);

        this.scene.translateZ(-unitLength * 2);
    }


    handleWindowResize = () => {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;

        this.camera.updateProjectionMatrix();
        this.render();
    }

    setCalendarBoard = () => {
        new THREE.TextureLoader().load('./piano.png', this.onPillarTexture);
        new THREE.TextureLoader().load('./piano.png', this.buildTopSlab);
        new THREE.TextureLoader().load('./silver_sheet.jpg', this.buildRoller);
        new THREE.TextureLoader().load("./black_top.png", this.setGround);

        this.buildCabins();
        this.buildSessionDetailBoard();
    }


    onPillarTexture = (texture) => {

        // The next pillar is at week length + 1 from the 1st Pillar
        const next_x_left = this.leftX + (unitLength * 8);

        this.buildTimePillars(this.leftX, texture);
        this.buildTimePillars(next_x_left, texture)

        this.render();
    }

    /**
     * Let us build two set of pillers (front and back)
     * @param {*} x_left
     * @param {*} texture
     */
    buildTimePillars = (x_left, texture) => {

        const geometry = new THREE.BoxBufferGeometry(unitLength, unitHeight, unitDepth);

        const transparent = new THREE.MeshStandardMaterial({ transparent: true, opacity: 1, color: "black", side: THREE.FrontSide });
        const material = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide });

        const materials = [material, material, transparent, material, material, material];

        for (var i = 0; i < unitSize; i++) {

            var front = new THREE.Mesh(geometry, materials);
            var back = new THREE.Mesh(geometry, materials);


            const y = this.bottomY + (i * unitHeight);

            front.position.set(x_left, y, 0);
            back.position.set(x_left, y, -1);

            var time = this.textFactory.build("11:00PM", 0.3, 0.1, "#fae78f");
            var group = new THREE.Group();
            group.add(time);
            group.position.copy(front.position.clone());
            group.position.x = group.position.x - 0.8;
            group.position.y = group.position.y - 0.3;
            group.position.z = group.position.z + 0.2;

            this.timeGroup.push(group);

            this.scene.add(group);
            this.scene.add(front);
            this.scene.add(back);
        }
    }

    buildRoller = (texture) => {

        const material = new THREE.MeshLambertMaterial({ map: texture });
        const geometry = new THREE.CylinderBufferGeometry(1 / 2, 1 / 2, 0.25 / 2);

        const roller = new THREE.Mesh(geometry, material);

        roller.position.set(this.leftX, this.maxY, -0.50);
        roller.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.PI / 2);

        this.scene.add(roller);

        // The distance between the two pillars
        const dist = 1 + 0.25 + 0.25 + 0.25 + 0.25

        const v1 = new THREE.Vector3(0, 0, 0);
        const v2 = new THREE.Vector3(dist, 0, 0);
        const v3 = new THREE.Vector3(dist / 2, dist / 2, 0);

        const triangle = new THREE.Triangle(v1, v2, v3);

        const triGeo = new THREE.Geometry();

        triGeo.vertices.push(triangle.a);
        triGeo.vertices.push(triangle.b);
        triGeo.vertices.push(triangle.c);

        triGeo.faces.push(new THREE.Face3(0, 1, 2));

        const mesh = new THREE.Mesh(triGeo, material);

        const y = this.maxY - unitHeight / 2
        const x = this.leftX - unitLength / 2;
        mesh.position.set(x, y, 0);
        mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        mesh.position.z = mesh.position.z - (dist - 0.25 - 0.25);
        mesh.position.x = mesh.position.x + 0.25;
        this.scene.add(mesh);

        this.render();
    }

    buildCabins = () => {

        const geometry = new THREE.BoxBufferGeometry(unitLength, unitHeight, unitDepth);

        var x = this.leftX;

        for (var i = 0; i < numberOfDays; i++) {
            x = x + (unitLength + gapX);

            for (var j = 0; j < unitSize; j++) {
                var y = this.bottomY + (j * unitHeight);

                var textureKey = "fgrid_" + i + "_" + j;
                var canvasTexture = this.buildSessionTexture(textureKey, ["", "", "", ""], i);
                var material = this.buildCanvasMaterial(canvasTexture);

                this.eventMaterialMatrix.set(textureKey, material);

                var cell = new THREE.Mesh(geometry, material);
                cell.position.set(x, y, -1 / 2);
                this.scene.add(cell);
            }
        }

        this.render();
    }

    buildSessionDetailBoard = () => {

        const texture = this.buildSessionTexture("sessionBoard", ["", "", "", ""], 6);

        const boardMaterial = new THREE.MeshStandardMaterial({ map: texture });

        const boardX = this.leftX + (9 * (unitLength + gapX)) + (boardWidth - unitLength) / 2;
        const boardY = this.bottomY + unitHeight / 2 - 0.5;

        const boardGeo = new THREE.BoxBufferGeometry(boardWidth, unitHeight, unitDepth);

        var y = boardY;

        for (var i = 0; i < unitSize; i++) {
            var board = new THREE.Mesh(boardGeo, boardMaterial);

            board.position.set(boardX, y, -1 / 2);
            board.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2);
            board.position.x = board.position.x - boardWidth / 2
            board.position.z = board.position.z + (boardWidth / 2) + (0.75);

            this.scene.add(board);

            y = y + unitHeight;
        }

        this.render();
    }

    buildTopSlab = (texture) => {

        this.dateGroup.length = 0;
        this.monthGroup.length = 0;
        this.dayGroup.length = 0;

        const material = new THREE.MeshStandardMaterial({ map: texture });
        const geometry = new THREE.BoxBufferGeometry(unitLength, unitHeight, 0.1);

        var x = this.leftX;

        for (var i = 0; i < 9; i++) {

            var tilted = new THREE.Mesh(geometry, material);
            tilted.position.set(x, this.maxY, 0);
            tilted.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 4);
            tilted.translateZ(-1 / 4);
            this.scene.add(tilted);

            var day = this.textFactory.build("", 0.3, 0.1, "#fae78f");
            var group = new THREE.Group();
            group.add(day);
            group.position.set(x - 0.3, this.maxY, 0);
            group.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 4);
            group.translateZ(-1 / 4);
            group.translateY(-0.3);
            this.scene.add(group);
            this.dayGroup.push(group);

            var backTilted = new THREE.Mesh(geometry, material);
            backTilted.position.set(x, this.maxY, 0);
            backTilted.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 4);
            backTilted.translateZ(1 / 4);
            backTilted.position.z -= 1;
            this.scene.add(backTilted);

            var vertical = new THREE.Mesh(geometry, material);
            vertical.position.copy(tilted.position.clone());
            vertical.position.y = vertical.position.y + unitHeight - 0.25;
            vertical.position.z = vertical.position.z - 0.50;
            this.scene.add(vertical);

            var date = this.textFactory.build("", 0.3, 0.1, "#fae78f");
            var group = new THREE.Group();
            group.add(date);
            group.position.copy(vertical.position.clone());
            group.position.x = group.position.x - 0.1
            group.position.y = group.position.y - 0.4;
            this.scene.add(group);
            this.dateGroup.push(group);

            var month = this.textFactory.build("", 0.2, 0.1, "white");
            var group = new THREE.Group();
            group.add(month);
            group.position.copy(vertical.position.clone());
            group.position.x = group.position.x - 0.1
            group.position.y = group.position.y + 0.2;
            this.scene.add(group);
            this.monthGroup.push(group);

            x = x + unitLength;
        }

        this.setEventMatrix();
        this.setTime();

        this.render();
    }
    
    setTime = () => {
        time = moment();
        var timeInHrs = parseInt(time.format('HH'));
        if (timeInHrs >= 19) {
            var diff = timeInHrs - 19;
            time.subtract(diff, 'hours');
        }
    }

    updateTime = (timeStart) => {
        this.times.length = 0;
        var time;
        if (timeStart) {
            time = moment(timeStart);
        }
        else {
            time = moment();
        }
       
        var timeInHrs = parseInt(time.format('HH'));
        if (timeInHrs >= 19) {
            var diff = timeInHrs - 19;
            time.subtract(diff, 'hours');
        }

        for (var i = 0; i < 6; i++) {

            var newTime = moment(time).add(i + 1, 'hours')
            this.times[i] = (newTime.format('hh') + ":00" + newTime.format('A'));
        }

        for (var i = 0; i < 6; i++) {
            var timeText = this.times[i];
            var time = this.textFactory.build(timeText, 0.3, 0.1, "#fae78f");
            var groupIndex = i;

            var group = this.timeGroup[groupIndex];
            group.remove(...group.children);
            group.add(time);
        }

        //update the other side of the pillar
        for (var i = 6; i < 12; i++) {
            var timeText = this.times[i - 6];
            var time = this.textFactory.build(timeText, 0.3, 0.1, "#fae78f");
            var groupIndex = i;

            var group = this.timeGroup[groupIndex];
            group.remove(...group.children);
            group.add(time);
        }

    }

    /**
     * Remember that the dateGroup, monthGroup and dayGroup has a head and tail.
     *
     * We have 9 UI elements, but will always receive 7 days.
     *
     */
    setEventMatrix = () => {

        var startValue = -1;
        for (var i = 0; i < 7; i++) {
            this.dates[i] = (moment().add(startValue + i, 'days'));
        }

        for (var i = 0; i < this.dates.length; i++) {
            var dateText = this.dates[i].format('D');
            var date = this.textFactory.build(dateText, 0.4, 0.1, "#fae78f");
            var monthText = this.dates[i].format('MMM');
            var month = this.textFactory.build(monthText, 0.25, 0.1, "white");
            var dayText = this.dates[i].format('ddd');
            var day = this.textFactory.build(dayText, 0.4, 0.1, "#fae78f");

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

        for (var i = 0; i < numberOfDays; i++) {
            for (var j = 0; j < unitSize; j++) {
                var textureKey = "fgrid_" + i + "_" + j;
                var texture = this.buildSessionTexture(textureKey, ["", "", "", ""], i);
                var material = this.eventMaterialMatrix.get(textureKey);
                if(material) {
                    material.map = texture;
                }
            }
        }

        this.render();
    }

    updateEventMatrixWithDate = (result, dateStart, timeStart) => {

        var startValue = -1;
        for (var i = 0; i < 7; i++) {
            this.dates[i] = (moment(dateStart).add(startValue + i, 'days'));
        }

        this.updateTime(timeStart);

        var timeOffset = parseInt(timeStart.format("HH"));
        if (timeOffset >= 18) {
            timeOffset = 18;
        }
        for (var i = 0; i < this.dates.length; i++) {
            var dateText = this.dates[i].format('D');
            var date = this.textFactory.build(dateText, 0.4, 0.1, "#fae78f");
            var monthText = this.dates[i].format('MMM');
            var month = this.textFactory.build(monthText, 0.25, 0.1, "white");
            var dayText = this.dates[i].format('ddd');
            var day = this.textFactory.build(dayText, 0.4, 0.1, "#fae78f");

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


        for (var i = 0; i < numberOfDays; i++) {
            var day = moment(dateStart).add(startValue + i, 'days').format("YYYY-MM-DD");
            for (var j = 0; j < 6; j++) {
                var textureKey = "fgrid_" + i + "_" + j;
                var text0Text = "", text1Text = "", text2Text = "", text3Text = "";

                var text0 = result.roster.get(j + 1 + timeOffset).get(day).get(0);
                var text1 = result.roster.get(j + 1 + timeOffset).get(day).get(15);
                var text2 = result.roster.get(j + 1 + timeOffset).get(day).get(30);
                var text3 = result.roster.get(j + 1 + timeOffset).get(day).get(45);

                var text0Keys = text0.keys();
                var text1Keys = text1.keys();
                var text2Keys = text2.keys();
                var text3Keys = text3.keys();
                //prepare text for 1st row
                for (var i0 = 0; i0 < text0.size; i0++) {
                    var textDisplay = text0.get(text0Keys.next().value).name;
                    text0Text = text0Text + " :::" + textDisplay;
                }
                //prepare text for 2nd row
                for (var i1 = 0; i1 < text1.size; i1++) {
                    var textDisplay = text1.get(text1Keys.next().value).name;
                    text1Text = text1Text + " :::" + textDisplay;
                }

                //prepare text for 3rd row
                for (var i2 = 0; i2 < text2.size; i2++) {
                    var textDisplay = text2.get(text2Keys.next().value).name;
                    text2Text = text2Text + " :::" + textDisplay;
                }
                //prepare text for 4th row
                for (var i3 = 0; i3 < text3.size; i3++) {
                    var textDisplay = text3.get(text3Keys.next().value).name;
                    text3Text = text3Text + " :::" + textDisplay;
                }

                var texture = this.buildSessionTexture(textureKey, [text0Text, text1Text, text2Text, text3Text], i);
                var material = this.eventMaterialMatrix.get(textureKey);
                material.map = texture;
            }
        }

        this.render();
    }


    buildSessionTexture = (id, lines, rowIndex) => {

        const oldCanvas = document.getElementById(id);
        if (oldCanvas) {
            oldCanvas.remove();
        }

        const vGap = 46;
        const width = 300;
        const height = 200;
        const borderGap = 1;
        const fontSize = 34;

        const canvas = document.createElement('canvas');
        canvas.id = id;
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        context.font = `normal ${fontSize}px sans-serif`;

        context.fillStyle = "white";
        context.fillRect(0, 0, width, height);

        if (rowIndex <= 1) {
            context.fillStyle = "rgb(37,56,74)";
            context.fillRect(borderGap / 2, borderGap / 2, width - borderGap, height - borderGap);
            context.fillStyle = "white";
        }
        else if (rowIndex >= 2 && rowIndex <= 3) {
            context.fillStyle = "rgb(29,34,39)";
            context.fillRect(borderGap / 2, borderGap / 2, width - borderGap, height - borderGap);
            context.fillStyle = "#fae78f";
        }
        else if (rowIndex >= 4 && rowIndex <= 5) {
            context.fillStyle = "black";
            context.fillRect(borderGap / 2, borderGap / 2, width - borderGap, height - borderGap);
            context.fillStyle = "#fae78f";
        }
        else {
            context.fillStyle = "rgb(29,34,39)";
            context.fillRect(borderGap / 2, borderGap / 2, width - borderGap, height - borderGap);
            context.fillStyle = "white";
        }

        var y = vGap;
        for (var i = 0; i < lines.length; i++) {
            context.fillText(lines[i], 20, y);
            y = y + vGap;
        }

        return new THREE.CanvasTexture(canvas)
    }

    buildCanvasMaterial = (texture) => {

        const material = new THREE.MeshStandardMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: false,
            opacity: 0,
        });

        return material;
    }

    setLight = () => {
        const color = "0xFFFFFF";
        const intensity = 2;
        const light = new THREE.AmbientLight(color, intensity);
        this.scene.add(light);
    }
}
