import * as THREE from 'three';

import TextFactory from './TextFactory';
import moment from 'moment';
import { LineObserver } from './LineObserver';

const fov = 28;
const near = 1;
const far = 2000;

const cyan = "#00b7eb";
const green = "#38BC1C";
const yellow = "#fae78f";
const violet = "#CCCCFF";

const sceneColor = "rgb(37,56,74)";

const gapX = 0.01;

const unitSize = 5;

const unitLength = 2.00;
const unitHeight = 1.20;
const unitDepth = 0.5;

const numberOfSlots = 3; //(Input -> Process -> Output)

const legendLabels = ["START", "IN", "EASE", "WIP", "PUSH"];

const infoLabels = ["Name", "Local Clock", "Activity", "Batch Size", ""];
const infoValues = ["", "", "", "0", ""];

export default class CoinFlipGame {

    legendGroup = [];
    infoValueGroup = [];

    renderRequested = false;

    isStarted = false;
    startTime = null;

    isDone = false;
    endTime = null;

    // seconds
    duration = 0;

    gameBootEvent = {
        text:false,
        frame:false,
        cabin:false,
    };

    levers = [];

    setBootEvent(event) {
        this.gameBootEvent[event] = true;

        if(this.gameBootEvent.text && this.gameBootEvent.frame && this.gameBootEvent.cabin) {
            this.render();
            this.onGameMounted();
        }
    }

    constructor(container,onGameMounted,onGameError,onLeverSelected) {
        this.container = container;
        this.onGameMounted = onGameMounted;
        this.onGameError = onGameError;
        this.onLeverSelected = onLeverSelected;

        this.textFactory = new TextFactory();

        this.setBootEvent("text");
        
        this.setupScene();

        this.setLight();

        this.setBoundary();

        this.setGameBoard();

        this.render();
    }

    setupScene = () => {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(fov, width / height, near, far);

        this.camera.position.set(8, 4, 20);

        this.scene.background = new THREE.Color(sceneColor);
        this.scene.fog = new THREE.Fog(sceneColor, 500, 10000);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        window.addEventListener("resize", this.handleWindowResize);
    }

    render = () => {
        this.renderRequested = undefined;
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
        this.rightX = this.leftX + (unitLength * (numberOfSlots + 1));
    }

    handleWindowResize = () => {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;

        this.camera.updateProjectionMatrix();
        this.render();
    }

    setGameBoard = () => {
        new THREE.TextureLoader().load('./piano.png', this.buildFrames);
        new THREE.TextureLoader().load('./silver_sheet.png', this.buildCabins);
    }


    buildFrames = (texture) => {

        // The first vertical Pillar
        this.buildPillars(this.leftX, texture);

        // The second vertical Pillar
        this.buildPillars(this.rightX, texture)

        // The Top Panel to hold the levers and info panel
        this.buildTopSlab(texture);

        this.render();

        this.setBootEvent("frame");
    }

    /**
     * Let us build two set of pillers (front and back)
     * @param {*} x_left
     * @param {*} texture
     */
    buildPillars = (x_left, texture) => {

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

            const tag = this.textFactory.build(`Bin-${i + 1}`, 0.25, 0.1, violet);
            const group = new THREE.Group();
            group.add(tag);
            group.position.copy(front.position.clone());
            group.position.y = group.position.y - unitHeight/4;
            group.position.z = group.position.z + 0.2;
            group.position.x = group.position.x - unitLength/4;

            this.scene.add(group);
            this.scene.add(front);
            this.scene.add(back);
        }
    }

    buildCabins = (texture) => {

        this.buildRack(this.leftX + unitLength, texture);

        this.buildRack(this.rightX - unitLength, texture);

        this.buildLevers();

        this.setMachine(texture);

        this.setGround(texture);

        this.render();

        this.setBootEvent("cabin");
    }

    /**
     * Pi/4 is Up and is the off state for Start and Done
     * 
     * Pi/2 is the Horizontal with the Z-Axis
     */
    buildLevers = () => {

        const rollerMaterial = new THREE.MeshNormalMaterial();
        const geometry = new THREE.CylinderBufferGeometry(1 / 6, 1 / 6, 2);

        this.startRoller = new THREE.Mesh(geometry, rollerMaterial);
        this.startRoller.userData = {id:"ignition",state:"off"};
        this.startRoller.position.set(this.leftX, this.maxY, 0);
        this.startRoller.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 4);
        this.scene.add(this.startRoller);
        
        this.machineLever = new THREE.Mesh(geometry, rollerMaterial);
        this.machineLever.userData = {id:"machine",state:"off"};
        this.machineLever.position.set(this.leftX + (unitLength * 2), this.maxY, 0);
        this.machineLever.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
        this.scene.add(this.machineLever);

        this.doneRoller = new THREE.Mesh(geometry, rollerMaterial);
        this.doneRoller.userData = {id:"done",state:"off"};
        this.doneRoller.position.set(this.rightX, this.maxY, 0);
        this.doneRoller.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 4);
        this.scene.add(this.doneRoller);
    
        this.levers.length = 0;

        this.levers.push(this.startRoller);
        this.levers.push(this.doneRoller);
        this.levers.push(this.machineLever);

        this.leverControls = new LineObserver(this.levers, this.camera, this.renderer.domElement,true);
        this.leverControls.addEventListener('onSelect', this.onLeverSelected);
    }

    setMachine = (texture) => {

        const x = this.leftX + (unitLength * 2);
        const y = this.bottomY - unitHeight / 2;

        const standMaterial = new THREE.MeshStandardMaterial({ map: texture, color: "white" });
        const standGeometry = new THREE.CylinderBufferGeometry(0.75, 0.75, 2);
        const stand = new THREE.Mesh(standGeometry, standMaterial);
        stand.position.set(x, y, -1);
        this.scene.add(stand);

        const machineY = this.bottomY + unitHeight + unitHeight + (unitHeight / 2);
        const material = new THREE.MeshStandardMaterial({ map: texture, color: violet });
        const geometry = new THREE.CylinderBufferGeometry(0.75, 0.75, 5);
        const machine = new THREE.Mesh(geometry, material);
        machine.position.set(x, machineY, -1);
        this.scene.add(machine);
    }


    buildRack = (x_left, texture) => {

        const geometry = new THREE.BoxBufferGeometry(unitLength, unitLength, unitDepth / 4);
        const material = new THREE.MeshStandardMaterial({ map: texture });

        for (var j = 0; j < unitSize; j++) {

            const y = this.bottomY + (unitHeight * j) - unitHeight/2;

            const bin = new THREE.Mesh(geometry, material);
            bin.position.set(x_left, y, -0.25 / 2);
            bin.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
            this.scene.add(bin);
        }
    }

    placeInventory = () => {

        const radius = 0.30;
        const geometry = new THREE.SphereGeometry(radius, 50, 50);
        const material = new THREE.MeshNormalMaterial();

        const x = this.leftX + (unitLength + gapX);

        for (var j = 0; j < unitSize; j++) {
            const y = this.bottomY + (j * unitHeight) - radius - 0.1;

            const sphere1 = new THREE.Mesh(geometry, material);
            sphere1.position.set(x - 0.5, y, -1 / 2);
            this.scene.add(sphere1);

            const sphere2 = new THREE.Mesh(geometry, material);
            sphere2.position.set(x + 0.5, y, -1 / 2);
            this.scene.add(sphere2);

            const sphere3 = new THREE.Mesh(geometry, material);
            sphere3.position.set(x - 0.5, y, 1 / 2);
            this.scene.add(sphere3);

            const sphere4 = new THREE.Mesh(geometry, material);
            sphere4.position.set(x + 0.5, y, 1 / 2);
            this.scene.add(sphere4);
        }

        this.render();
    }

    placeOutInventory = () => {

        const geometry = new THREE.CylinderBufferGeometry(0.6, 0.6, 0.5 / 4);
        const material = new THREE.MeshNormalMaterial();

        const x = this.rightX-unitLength;

        for (var j = 0; j < unitSize; j++) {

            var y = this.bottomY + (j * unitHeight);

            const sphere1 = new THREE.Mesh(geometry, material);
            sphere1.position.set(x + 0.4, y, 1 / 2);
            sphere1.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2);
            this.scene.add(sphere1);

            const sphere2 = new THREE.Mesh(geometry, material);
            sphere2.position.set(x + 0.8, y, 1 / 2);
            sphere2.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2);
            this.scene.add(sphere2);

            const sphere3 = new THREE.Mesh(geometry, material);
            sphere3.position.set(x, y, 1 / 2);
            sphere3.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2);
            this.scene.add(sphere3);

            const sphere4 = new THREE.Mesh(geometry, material);
            sphere4.position.set(x - 0.4, y, 1 / 2);
            sphere4.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2);
            this.scene.add(sphere4);
        }

        this.render();
    }

    buildTopSlab = (texture) => {

        this.infoValueGroup.length = 0;
        this.legendGroup.length = 0;

        const material = new THREE.MeshStandardMaterial({ map: texture });
        const geometry = new THREE.BoxBufferGeometry(unitLength, unitHeight, 0.1);

        var x = this.leftX;

        const totalSlabs = numberOfSlots+2;

        for (var i = 0; i < totalSlabs; i++) {

            const tilted = new THREE.Mesh(geometry, material);
            tilted.position.set(x, this.maxY, 0);
            tilted.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 4);
            tilted.translateZ(-1 / 4);
            this.scene.add(tilted);

            // The Legends to hint the State to the User
            var group = new THREE.Group();
            const legend = this.textFactory.build(legendLabels[i], 0.3, 0.1, cyan);
            group.add(legend);
            group.position.set(x, this.maxY, 0);
            group.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 4);
            group.translateZ(-1 / 4);
            group.translateY(-0.5);
            group.position.x = group.position.x - 0.6;
            this.legendGroup.push(group);
            this.scene.add(group);
      
            const backTilted = new THREE.Mesh(geometry, material);
            backTilted.position.set(x, this.maxY, 0);
            backTilted.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 4);
            backTilted.translateZ(1 / 4);
            backTilted.position.z -= 1;
            this.scene.add(backTilted);

            const vertical = new THREE.Mesh(geometry, material);
            vertical.position.copy(tilted.position.clone());
            vertical.position.y = vertical.position.y + unitHeight - 0.25;
            vertical.position.z = vertical.position.z - 0.50;
            this.scene.add(vertical);

            var value = this.textFactory.build(infoValues[i], 0.3, 0.1, yellow);
            var group = new THREE.Group();
            group.add(value);
            group.position.copy(vertical.position.clone());
            group.position.x = group.position.x - 0.6;
            group.position.y = group.position.y - 0.4;
            this.scene.add(group);
            this.infoValueGroup.push(group);

            var label = this.textFactory.build(infoLabels[i], 0.2, 0.1, "white");
            var group = new THREE.Group();
            group.add(label);
            group.position.copy(vertical.position.clone());
            group.position.x = group.position.x - 0.6;
            group.position.y = group.position.y + 0.2;
            this.scene.add(group);

            x = x + unitLength;
        }

        this.render();
    }

    setLight = () => {
        const color = "white";
        const intensity = 1;
        const light = new THREE.AmbientLight(color, intensity);
        this.scene.add(light);
    }

    setGround = (texture) => {

        const material = new THREE.MeshStandardMaterial({ map: texture, color: "gray" });
        const geometry = new THREE.BoxBufferGeometry(unitLength * 29, unitHeight * 29, 0.1);

        var ground = new THREE.Mesh(geometry, material);
        ground.position.set(this.leftX, this.bottomY - 0.75, 0);
        ground.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
        ground.translateX(unitLength * 4);
        this.scene.add(ground);

        this.scene.translateZ(-unitLength * 2);
    }

    updateLegendAt = (value,index) => {
        legendLabels[index] = value;
        const text = this.textFactory.build(legendLabels[index], 0.3, 0.1, cyan);
        const group = this.legendGroup[index];
        group.remove(...group.children);
        group.add(text);
    }

    updateInfoValueAt = (value,index) => {
        infoValues[index] = value;
        const text = this.textFactory.build(infoValues[index], 0.3, 0.1, yellow);
        const group = this.infoValueGroup[index];
        group.remove(...group.children);
        group.add(text);
    }


    /****
     * The Set of Public Interfaces to change the state of the Game
     */

    setName = (name) => {
        this.updateInfoValueAt(name,0);
        this.render();
    }

    getName = () => {
        return infoValues[0];
    }

    setActivity = (activity) => {
        this.updateInfoValueAt(activity,2);
    }

    getActivity = () => {
        return inforValues[2];
    }

    // The Fourth Item in the InfoValue
    setBatchSize = (size) => {
        this.updateInfoValueAt(size.toString(),3);
        this.render();
    }

    getBatchSize = () => {
        return parseInt(infoValues[3],10);
    }

    // The Fifth Item in the InfoValue is for Notification
    setAdvice = (advice) => {
        this.updateInfoValueAt(advice,4);
        this.render();
    }

    getAdvice = () => {
        return parseInt(infoValues[4],10);
    }
    
    // Difference Between the start and the current time of the Game.
    calcTimeElapsed = () => {
        if(this.isDone && this.endTime) {
            return this.duration;
        }
        return moment().diff(this.startTime,'seconds');
    }

    // Will be continuously updated when the game is started and until it is done
    // The Clock is the 2nd item in the infoValue Panel
    setClockText = () => {
        const timeTaken = moment.duration(this.calcTimeElapsed(),'seconds').format("hh:mm:ss");
        this.updateInfoValueAt(timeTaken,1);
        this.render();
    }

    toggleGame = () => {
        if(!this.isStarted) {
            this.startGame();
            return;
        }
        if(!this.isDone) {
            this.endGame();
            return;
        }
    }

    startGame = () => {
        if(this.isStarted) {
            return;
        }
        
        this.startRoller.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 4);
        this.updateLegendAt("STOP",0);

        this.isStarted = true;
        this.startTime = moment();

        this.isDone = false;
        this.endTime = null;
        this.duration = 0;

        this.setClockText();

    }

    endGame = () => {
        if(this.isDone) {
            return;
        }

        this.startRoller.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 4);
        this.updateLegendAt("START",0);

        this.isDone = true;
        this.endTime = moment();
        this.duration = this.endTime.diff(this.startTime,'seconds');

        this.setClockText();

        this.isStarted = false;
        this.isDone = false;
    }
    
}