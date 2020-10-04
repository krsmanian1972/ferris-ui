import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols';

const fov = 29;//29
const near = 1;//1
const far = 100;

const barWidth = 1;
const barHeight = 0.4;
const barDepth = 4;

const borderGap = 10;
const vGap = 20;
var topLeftX = -10;
var topLeftY = 5.5;
const hLine = 26;
const vLine = 9;
const gridStep = 1;

const xGap = 0;
const yGap = 0;

const boldFont = "bold 26px sans-serif";
const regularFont = "18px sans-serif";

const taskBarColor = "gray";
const sceneColor = 0xffffff;
const gridColor = "rgb(216,213,221)";
const weekDayArray = ["","Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export default class SessionGrid {

    constructor(container) {
        this.container = container;

        this.taskBarGeo = new THREE.BoxGeometry(barWidth, barHeight, barDepth);
        this.gridLineMaterial = new THREE.LineBasicMaterial({ color: gridColor });

        this.taskBars = [];

        this.init();
        this.addListeners();
    }

    init = () => {
        this.setupScene();
        //this.setGraphPaper();
        //this.createTimePlane();
        this.createWeekDays();
        this.animate();
    }

    setupScene = () => {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        console.log(width, height);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(fov, width / height, near, far);

        this.camera.position.x = 0;//0
        this.camera.position.y = 0.1;//0,1
        this.camera.position.z = 9;//10

        this.scene.background = new THREE.Color(sceneColor);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.container.appendChild(this.renderer.domElement);
        this.orbitControls = new OrbitControls( this.camera, this.renderer.domElement );
    }

    buildTaskCanvas =  (id, width, height) => {
        const canvas = document.createElement('canvas');
        canvas.id = 'calendar' + id;

        if (width === undefined) {
            canvas.width = 256;//256
            canvas.height = 128;//128
        }
        else {
            canvas.width = width;//256
            canvas.height = height;//128
        }
        canvas.style.width = canvas.width + "px";
        canvas.style.height = canvas.height + "px";

        return canvas;
    }

     buildRectTextMaterial = (id, text) => {

        const canvas = this.buildTaskCanvas(id);

        const context = canvas.getContext('2d');

        // Prepare the font to be able to measure
        let fontSize = 96;
        context.font = `${fontSize}px monospace`;
        const textMetrics = context.measureText(text);
        let width = textMetrics.width;
        let height = fontSize * 7;

        // Re-apply font since canvas is resized.
        context.font = `${fontSize}px monospace`;
        context.textAlign = "center";
        context.textBaseline = "middle";

        // Make the canvas transparent for simplicity
        context.fillStyle = "transparent";
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        context.fillStyle = taskBarColor;

        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = "white";
        context.fillRect(borderGap / 2, borderGap / 2, canvas.width - borderGap, canvas.height - borderGap);

        context.fillStyle = "black";
        context.textAlign = "center";

        var y = 20;
        y = y + vGap;
        context.font = boldFont;
        context.fillText(text, canvas.width / 2, y);

        const texture = new THREE.CanvasTexture(canvas)
        texture.minFilter = THREE.LinearFilter;
        texture.needsUpdate = true;

        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true
        });

        return material;
    }

    createWeekDays = () => {
      var rect = this.renderer.domElement.getBoundingClientRect();
      console.log(rect);
      var data = {clientX:0, clientY:0};
      var point = this.getClickPoint(data);
      console.log(point);
      topLeftX = point.x+1.3;
      topLeftY = point.y-1.6;

      for(var i = 0; i <= 7; i++ ){
          for(var j = 0; j <= 24; j++){
              if(i === 0 && j === 0){
                const timeMaterial = this.buildRectTextMaterial(i, "SET CONTEXT");
                const timeMesh = new THREE.Mesh(this.taskBarGeo, timeMaterial);
                timeMesh.position.set(topLeftX + (barWidth/2) + i*(barWidth) + xGap, topLeftY-(barHeight)+yGap, 2);
                this.scene.add(timeMesh);

              }

              if(j === 1) {
                const timeMaterial = this.buildRectTextMaterial(i, weekDayArray[i]);
                const timeMesh = new THREE.Mesh(this.taskBarGeo, timeMaterial);
                timeMesh.position.set(topLeftX+ (barWidth/2) + i*(barWidth) + xGap, topLeftY-(barHeight)+yGap, 2);
                this.scene.add(timeMesh);

              }

              if(i === 0){
                const timeMaterial = this.buildRectTextMaterial(j, j-1);
                const timeMesh = new THREE.Mesh(this.taskBarGeo, timeMaterial);
                timeMesh.position.set(topLeftX+ (barWidth/2) + i*(barWidth), topLeftY-(barHeight)-j*barHeight, 2);
                this.scene.add(timeMesh);

              }

          }
      }

    }
    createTimePlane = () => {
         var timeMaterial = this.buildRectTextMaterial("1", "Monday");
         var timeMesh = new THREE.Mesh(this.taskBarGeo, timeMaterial);
         timeMesh.position.set(0,0, 0);
         this.scene.add(timeMesh);

         var timeMaterial = this.buildRectTextMaterial("2", "Tuesday");
         var timeMesh = new THREE.Mesh(this.taskBarGeo, timeMaterial);
         timeMesh.position.set(-7, 3.5, 0);
         this.scene.add(timeMesh);

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
        this.orbitControls.update();
    }

    addListeners = () => {
        this.renderer.domElement.addEventListener("wheel", this.scroll);
        this.renderer.domElement.addEventListener("click", this.mouseClick);

        window.addEventListener("resize", this.handleWindowResize);
    }

    handleWindowResize = () => {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;

        this.camera.updateProjectionMatrix();
    }
    mouseClick = (event) => {
      var point = this.getClickPoint(event);
      console.log(point);
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
