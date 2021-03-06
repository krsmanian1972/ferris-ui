import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import moment from 'moment';

import TextFactory from '../flow/TextFactory';
import { LineObserver } from '../flow/LineObserver';

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
const MAX_ITEM_PER_BIN = 4;

const unitLength = 2.00;
const unitHeight = 1.20;
const unitDepth = 0.5;

const numberOfSlots = 3; //(Input -> Process -> Output)

const legendLabels = ["START", "IN", "EASE", "WIP", "PUSH"];

const paramLabels = ["Name", "Inventory", "Activity", "Batch Size", ""];
const paramValues = ["", "", "", "0", ""];

const clockLabels = ["Local Clock", "", "Idle Time", "Settings", "Advice"];
const clockValues = ["", "", "", "", ""];


export default class DoughMaker {

    isReady = false;

    legendGroup = [];
    paramValueGroup = [];
    clockValueGroup = [];

    renderRequested = false;

    isStarted = false;
    startTime = null;

    isDone = false;
    endTime = null;

    levers = [];
    inventoryGroup = [];
    wipGroup = [];

    selectedItem = null;
    isPressed = true;
    isItemPlaced = false;
    isItemProcessed = false;

    currentBin = 0;
    currentBinCount = 0;

    // seconds
    duration = 0;

    gameBootEvent = {
        text: false,
        frame: false,
        cabin: false,
    };

    fireBootEvent(event) {
        this.gameBootEvent[event] = true;

        if (this.gameBootEvent.text && this.gameBootEvent.frame && this.gameBootEvent.cabin) {
            this.render();
            this.onGameMounted();
        }
    }

    constructor(container, onGameMounted, onGameEvent) {
        this.container = container;
        this.onGameMounted = onGameMounted;
        this.onGameEvent = onGameEvent;

        this.textFactory = new TextFactory();

        this.discGeometry = new THREE.CylinderBufferGeometry(0.6, 0.6, 0.5 / 4);
        this.discMaterial = new THREE.MeshNormalMaterial();

        this.fireBootEvent("text");

        this.setupScene();

        this.setLight();

        this.setBoundary();

        this.setGameBoard();

        this.leverControls = new LineObserver(this.levers, this.camera, this.renderer.domElement, true);
        this.leverControls.addEventListener('onSelect', this.onLeverSelected);

        this.inventorySelector = new LineObserver(this.inventoryGroup, this.camera, this.renderer.domElement, true);
        this.inventorySelector.addEventListener('onSelect', this.onInventorySelect);

        this.wipSelector = new LineObserver(this.wipGroup, this.camera, this.renderer.domElement, true);
        this.wipSelector.addEventListener('onSelect', this.onWipSelect);


        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        this.orbitControls.dampingFactor = 0.05;
        this.orbitControls.maxPolarAngle = Math.PI / 2;
        this.orbitControls.minPolarAngle = Math.PI / 2;
        this.orbitControls.screenSpacePanning = false;
        this.orbitControls.minDistance = 22;
        this.orbitControls.maxDistance = 30;


        this.orbitControls.addEventListener('change', this.renderAgain);

        window.addEventListener("resize", this.handleWindowResize);


        this.render();
    }

    getGameCanvas = () => {
        return this.renderer.getContext().canvas;
    }

    setupScene = () => {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(fov, width / height, near, far);

        this.camera.position.set(-40, -26, 20);

        this.scene.background = new THREE.Color(sceneColor);
        this.scene.fog = new THREE.Fog(sceneColor, 500, 10000);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);
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

        // The Top Panel to hold the levers, param panel and clock panel
        this.buildTopPanels(texture);

        this.render();

        this.fireBootEvent("frame");
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
            group.position.y = group.position.y - unitHeight / 4;
            group.position.z = group.position.z + 0.2;
            group.position.x = group.position.x - unitLength / 4;

            this.scene.add(group);
            this.scene.add(front);
            this.scene.add(back);
        }
    }

    buildCabins = (texture) => {

        this.buildRack(this.leftX + unitLength, texture);

        this.buildRack(this.rightX - unitLength, texture);

        this.buildLevers(texture);

        this.setMachine(texture);

        this.setGround(texture);

        this.render();

        this.fireBootEvent("cabin");
    }

    /**
     * Pi/4 is Up and is the off state for Start and Done
     * 
     * Pi/2 is the Horizontal with the Z-Axis
     */
    buildLevers = (texture) => {

        const rollerMaterial = new THREE.MeshNormalMaterial();
        const geometry = new THREE.CylinderBufferGeometry(1 / 6, 1 / 6, 2);


        this.startRoller = new THREE.Mesh(geometry, rollerMaterial);
        this.startRoller.userData = { id: "ignition", state: "off" };
        this.startRoller.position.set(this.leftX, this.maxY, 0);
        this.startRoller.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 4);
        this.scene.add(this.startRoller);

        this.machineLever = new THREE.Mesh(geometry, rollerMaterial);
        this.machineLever.userData = { id: "machine", state: "off" };
        this.machineLever.position.set(this.leftX + (unitLength * 2), this.maxY, 0);
        this.machineLever.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
        this.scene.add(this.machineLever);

        this.doneRoller = new THREE.Mesh(geometry, rollerMaterial);
        this.doneRoller.userData = { id: "done", state: "off" };
        this.doneRoller.position.set(this.rightX, this.maxY, 0);
        this.doneRoller.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 4);
        this.scene.add(this.doneRoller);

        const flowMaterial = new THREE.MeshLambertMaterial({ map: texture, color: green });
        const flowGeometry = new THREE.CylinderBufferGeometry(1 / 6, 1 / 4, 1);
        this.flowLever = new THREE.Mesh(flowGeometry, flowMaterial);
        this.flowLever.userData = { id: "flow", state: "off" };
        this.flowLever.position.set(this.rightX - unitLength, this.maxY + unitHeight + unitHeight / 2, -0.5);
        this.flowLever.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
        this.scene.add(this.flowLever);


        this.levers.length = 0;

        this.levers.push(this.startRoller);
        this.levers.push(this.doneRoller);
        this.levers.push(this.machineLever);
        this.levers.push(this.flowLever);
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
        const geometry = new THREE.CylinderBufferGeometry(0.75, 0.75, 1);
        this.machine = new THREE.Mesh(geometry, material);
        this.machine.scale.y = 5;
        this.machine.position.set(x, machineY, -1);
        this.scene.add(this.machine);
    }


    buildRack = (x_left, texture) => {

        const geometry = new THREE.BoxBufferGeometry(unitLength, unitLength, unitDepth / 4);
        const material = new THREE.MeshStandardMaterial({ map: texture });

        for (var j = 0; j < unitSize; j++) {

            const y = this.bottomY + (unitHeight * j) - unitHeight / 2;

            const bin = new THREE.Mesh(geometry, material);
            bin.position.set(x_left, y, -0.25 / 2);
            bin.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
            this.scene.add(bin);
        }
    }

    buildTopPanels = (texture) => {

        this.paramValueGroup.length = 0;
        this.clockValueGroup.length = 0;
        this.legendGroup.length = 0;

        const material = new THREE.MeshStandardMaterial({ map: texture });
        const geometry = new THREE.BoxBufferGeometry(unitLength, unitHeight, 0.1);

        var x = this.leftX;

        var group = null;
        var label = null;
        var value = null;

        const totalSlabs = numberOfSlots + 2;

        for (var i = 0; i < totalSlabs; i++) {

            const tilted = new THREE.Mesh(geometry, material);
            tilted.position.set(x, this.maxY, 0);
            tilted.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 4);
            tilted.translateZ(-1 / 4);
            this.scene.add(tilted);

            // The Legends to hint the State to the User
            group = new THREE.Group();
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

            const paramBoard = new THREE.Mesh(geometry, material);
            paramBoard.position.copy(tilted.position.clone());
            paramBoard.position.y = paramBoard.position.y + unitHeight - 0.25;
            paramBoard.position.z = paramBoard.position.z - 0.50;
            this.scene.add(paramBoard);

            value = this.textFactory.build(paramValues[i], 0.3, 0.1, yellow);
            group = new THREE.Group();
            group.add(value);
            group.position.copy(paramBoard.position.clone());
            group.position.x = group.position.x - 0.6;
            group.position.y = group.position.y - 0.4;
            this.scene.add(group);
            this.paramValueGroup.push(group);

            label = this.textFactory.build(paramLabels[i], 0.2, 0.1, "white");
            group = new THREE.Group();
            group.add(label);
            group.position.copy(paramBoard.position.clone());
            group.position.x = group.position.x - 0.6;
            group.position.y = group.position.y + 0.2;
            this.scene.add(group);

            const clockBoard = new THREE.Mesh(geometry, material);
            clockBoard.position.copy(paramBoard.position.clone());
            clockBoard.position.y = clockBoard.position.y + unitHeight;
            this.scene.add(clockBoard);

            value = this.textFactory.build(clockValues[i], 0.3, 0.1, yellow);
            group = new THREE.Group();
            group.add(value);
            group.position.copy(clockBoard.position.clone());
            group.position.x = group.position.x - 0.6;
            group.position.y = group.position.y - 0.4;
            this.scene.add(group);
            this.clockValueGroup.push(group);

            label = this.textFactory.build(clockLabels[i], 0.2, 0.1, "white");
            group = new THREE.Group();
            group.add(label);
            group.position.copy(clockBoard.position.clone());
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
        const geometry = new THREE.BoxBufferGeometry(unitLength * 8, unitHeight * 8, 0.1);

        var ground = new THREE.Mesh(geometry, material);
        ground.position.set(this.leftX, this.bottomY - 0.75, 0);
        ground.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
        ground.translateX(unitLength * 2);
        this.scene.add(ground);
    }

    updateLegendAt = (value, index) => {
        legendLabels[index] = value;
        const text = this.textFactory.build(legendLabels[index], 0.3, 0.1, cyan);
        const group = this.legendGroup[index];
        group.remove(...group.children);
        group.add(text);
    }

    updateParamValueAt = (value, index) => {
        paramValues[index] = value;
        const text = this.textFactory.build(paramValues[index], 0.3, 0.1, yellow);
        const group = this.paramValueGroup[index];
        group.remove(...group.children);
        group.add(text);
    }

    updateClockValueAt = (value, index) => {
        clockValues[index] = value;
        const text = this.textFactory.build(clockValues[index], 0.3, 0.1, yellow);
        const group = this.clockValueGroup[index];
        group.remove(...group.children);
        group.add(text);
    }

    // The Raw Material in-front-of the machine
    // The Shape of the Inventory is Sphere
    placeInventory = () => {

        var i = 0;

        // Before we place the inventory ensure to remove any previous materials
        for (i = 0; i < this.inventoryGroup.length; i++) {
            this.scene.remove(this.inventoryGroup[i]);
        }

        for (i = 0; i < this.wipGroup.length; i++) {
            this.scene.remove(this.wipGroup[i]);
        }

        this.inventoryGroup.length = 0;
        this.wipGroup.length = 0;
        this.currentBin = 0;
        this.currentBinCount = 0;

        const radius = 0.30;
        const geometry = new THREE.SphereGeometry(radius, 50, 50);
        const material = new THREE.MeshNormalMaterial();

        var z = -1 / 2;

        var bin = 0;
        var count = 0;
        const size = this.getInventorySize();
        for (i = 0; i < size; i++) {
            if (count === MAX_ITEM_PER_BIN) {
                bin += 1;
                count = 0;
            }
            const y = this.bottomY + (bin * unitHeight) - radius - 0.1;

            var x = this.leftX + (unitLength + gapX);
            if (count === 0) {
                x = x - 0.5; z = -1 / 2;
            }
            if (count === 1) {
                x = x - 0.5; z = 1 / 2;
            }
            if (count === 2) {
                x = x + 0.5; z = -1 / 2;
            }
            if (count === 3) {
                x = x + 0.5; z = 1 / 2;
            }
            this.setSphere(x, y, z, geometry, material);
            count += 1;
        }

        this.render();
    }

    setSphere = (x, y, z, geometry, material) => {
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(x, y, z);
        sphere.userData = { index: this.inventoryGroup.length };
        this.inventoryGroup.push(sphere);
        this.scene.add(sphere);
    }

    /****
     * The Set of Public Interfaces to change the state of the Game
     */

    setName = (name) => {
        name = !name ? "Gopal" : name;
        name = name.substring(0, 5);
        this.updateParamValueAt(name, 0);
        this.render();
    }

    getName = () => {
        return paramValues[0];
    }

    setInventorySize = (size) => {
        this.updateParamValueAt(size.toString(), 1);
        this.render();
    }

    getInventorySize = () => {
        return parseInt(paramValues[1], 10);
    }


    setActivity = (activity) => {
        this.updateParamValueAt(activity, 2);
    }

    getActivity = () => {
        return paramValues[2];
    }

    // The Fourth Item in the paramValue
    setBatchSize = (size) => {
        this.updateParamValueAt(size.toString(), 3);
        this.render();
    }

    getBatchSize = () => {
        return parseInt(paramValues[3], 10);
    }


    // The Fifth Item in the paramValue is for Notification
    setAdvice = (advice) => {
        this.isReady = (advice === "READY")
        this.scene.rotateOnAxis(new THREE.Vector3(0, 1, 0), -1.0);
        this.updateClockValueAt(advice, 4);
        this.render();
    }

    getAdvice = () => {
        return parseInt(paramValues[4], 10);
    }

    // Difference Between the start and the current time of the Game.
    calcTimeElapsed = () => {
        if (this.isDone && this.endTime) {
            return this.duration;
        }
        return moment().diff(this.startTime, 'seconds');
    }

    // Will be continuously updated when the game is started and until it is done
    // The Clock is the 2nd item in the paramValue Panel
    setClockText = () => {
        const timeTaken = moment.duration(this.calcTimeElapsed(), 'seconds').format("HH:mm:ss", { trim: false });
        this.updateClockValueAt(timeTaken, 0);
        this.render();
    }

    onLeverSelected = (event) => {

        if (!this.isReady) {
            return
        }

        const leverId = event.object.userData.id;

        if (leverId === "ignition") {
            this.toggleGame();
        }
        else if (leverId === "machine") {
            this.toggleMachine();
        }
        else if (leverId === "flow") {
            this.onGameEvent({ type: "lever", id: leverId });
        }
    }

    toggleGame = () => {
        if (!this.isStarted) {
            this.startGame();
            return;
        }
        if (!this.isDone) {
            this.endGame();
            return;
        }
    }

    startGame = () => {
        if (this.isStarted) {
            return;
        }

        this.resetMachine();
        this.placeInventory();

        this.startRoller.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 4);
        this.updateLegendAt("STOP", 0);

        this.isStarted = true;
        this.startTime = moment();

        this.isDone = false;
        this.endTime = null;
        this.duration = 0;

        this.tick();
    }

    tick = () => {
        if (!this.isStarted && !this.isDone) {
            return;
        }
        if (this.isStarted && this.isDone) {
            return;
        }
        this.setClockText();
        setTimeout(() => this.tick(), 1000);
    }

    endGame = () => {
        if (this.isDone) {
            return;
        }

        this.startRoller.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 4);
        this.updateLegendAt("START", 0);

        this.isDone = true;
        this.endTime = moment();
        this.duration = this.endTime.diff(this.startTime, 'seconds');

        this.setClockText();

        this.isStarted = false;
        this.isDone = false;
    }

    resetMachine = () => {
        this.selectedItem = null;
        this.isItemPlaced = false;
        this.isItemProcessed = false;

        if (this.isPressed) {
            return;
        }

        this.machineLever.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 4);
        this.updateLegendAt("EASE", 2);
        this.machine.scale.y = 5;
        const machineY = this.bottomY + unitHeight + unitHeight + (unitHeight / 2);
        this.machine.position.y = machineY;
        this.isPressed = true;
    }

    toggleMachine = () => {
        if (!this.isStarted) {
            return;
        }

        if (this.isPressed) {
            this.machineLever.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 4);
            this.updateLegendAt("PRESS", 2);
            this.machine.scale.y = 3;
            const machineY = this.bottomY + unitHeight + unitHeight + unitHeight + (unitHeight / 2);
            this.machine.position.y = machineY;
        }
        else {
            this.machineLever.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 4);
            this.updateLegendAt("EASE", 2);
            this.machine.scale.y = 5;
            const machineY = this.bottomY + unitHeight + unitHeight + (unitHeight / 2);
            this.machine.position.y = machineY;
        }
        this.render();

        this.isPressed = !this.isPressed;

        if (this.isPressed && this.isItemPlaced && !this.isItemProcessed) {
            this.toDisc();
        }

        this.render();
    }

    toDisc = () => {
        const disc = new THREE.Mesh(this.discGeometry, this.discMaterial);
        disc.position.copy(this.selectedItem.position.clone());
        disc.userData = this.selectedItem.userData;

        this.scene.remove(this.selectedItem);
        this.wipGroup.push(disc);
        this.scene.add(disc);

        this.selectedItem = null;
        this.isItemProcessed = true;
    }

    onInventorySelect = (event) => {
        if (this.isPressed) {
            return;
        }

        if (this.isItemPlaced) {
            return;
        }

        const x = this.leftX + (unitLength * 2);
        const y = this.bottomY + unitHeight / 2;

        this.selectedItem = event.object;
        this.selectedItem.position.set(x, y, -1);
        this.isItemPlaced = true;
        this.isItemProcessed = false;

        this.render();
    }

    onWipSelect = (event) => {
        if (!this.isItemPlaced) {
            return;
        }

        var x = this.rightX - unitLength - 0.4;

        if (this.currentBinCount === MAX_ITEM_PER_BIN) {
            this.currentBin += 1;
            this.currentBinCount = 0;
        }
        else {
            x = x + (this.currentBinCount * 0.4);
        }
        const y = this.bottomY + (this.currentBin * unitHeight);

        const wipItem = event.object;
        wipItem.position.set(x, y, 1 / 2);
        wipItem.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2);

        this.currentBinCount += 1;

        this.isItemPlaced = false;
        this.isItemProcessed = false;

        this.render();
    }
}