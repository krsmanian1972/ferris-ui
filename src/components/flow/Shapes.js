import * as THREE from 'three';

const taskBarColor = "gray";
const barWidth = 3;
const barHeight = 1;
const barDepth = 0.01;
const squareBarWidth = 3;
const squareBarHeight = 1;
const connectorRadius = 0.06;

const vGap = 20;
const borderGap = 10;

const boldFont = "bold 18px sans-serif";
const regularFont = "18px sans-serif";

const buildTaskCanvas = function (id, width, height) {
    const canvas = document.createElement('canvas');
    canvas.id = 'task_' + id;

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


const buildCircularTextMaterial = function (taskId, taskName, role, plannedPeriod, actualPeriod) {
    const canvas = buildTaskCanvas(taskId);

    const context = canvas.getContext('2d');

    // Make the canvas transparent for simplicity
    context.beginPath();
    context.strokeStyle = taskBarColor;
    context.lineWidth = 10;
    context.fillStyle = "white"
    context.arc(canvas.width / 2, canvas.height / 2, (canvas.height / 2) - 5, 0, 2 * Math.PI);
    context.stroke();
    context.fill();

    // Re-apply font since canvas is resized.
    context.font = "56px monospace";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "black";
    context.textAlign = "center";

    context.font = boldFont;
    context.fillText(taskName, canvas.width / 2, canvas.height / 2);

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

const buildStartStopTextMaterial = function (taskId, taskName, role, plannedPeriod, actualPeriod) {
    const canvas = buildTaskCanvas(taskId);

    const context = canvas.getContext('2d');

    context.beginPath();
    context.lineWidth = 5;

    context.arc((canvas.width - canvas.height / 2), (canvas.height / 2), (canvas.height / 2), 1.5 * Math.PI, 0.5 * Math.PI);
    context.arc(canvas.height / 2, canvas.height / 2, (canvas.height / 2), 0.5 * Math.PI, 1.5 * Math.PI);

    context.fillStyle = "white"
    context.fill();

    context.moveTo((canvas.height / 2), 0);
    context.lineTo((canvas.width - canvas.height / 2), 0);
    context.strokeStyle = taskBarColor;
    context.stroke();

    // Re-apply font since canvas is resized.
    var y = 10;
    y = y + canvas.height / 2;
    context.font = "56px monospace";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "black";
    context.textAlign = "center";
    context.font = boldFont;
    context.fillText(taskName, canvas.width / 2, y);

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

const buildRectTextMaterial = function (id, taskName, role, line1, line2) {
    const canvas = buildTaskCanvas(id);

    const context = canvas.getContext('2d');

    // Prepare the font to be able to measure
    let fontSize = 56;
    context.font = `${fontSize}px monospace`;

    const textMetrics = context.measureText(role);
    let width = textMetrics.width;
    let height = fontSize * 7;

    // Re-apply font since canvas is resized.
    context.font = `${fontSize}px monospace`;
    context.textAlign = "center";
    context.textBaseline = "middle";

    // Make the canvas transparent for simplicity
    context.fillStyle = "transparent";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillStyle = "white";
    context.fillStyle = taskBarColor;

    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "white";
    context.fillRect(borderGap / 2, borderGap / 2, canvas.width - borderGap, canvas.height - borderGap);

    context.fillStyle = "black";
    context.textAlign = "center";

    var y = 10;
    y = y + vGap;
    context.font = boldFont;
    context.fillText(taskName, canvas.width / 2, y);

    y = y + vGap + 2;
    context.font = regularFont;
    context.fillText(role, (canvas.width) / 2, y);

    y = y + vGap + 5;
    context.fillText(line1, (canvas.width) / 2, y);

    y = y + vGap + 2;
    context.fillText(line2, (canvas.width) / 2, y);

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

const buildSquareTextMaterial = function (taskId, taskName, role, plannedPeriod, actualPeriod, shape) {

    const canvas = buildTaskCanvas(taskId, 256, 128);

    var y = 30;//10

    const context = canvas.getContext('2d');

    // Make the canvas transparent for simplicity
    context.fillStyle = "transparent";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);

    //define the colour of the line
    context.strokeStyle = taskBarColor;

    //define the starting point of line1 (x1,y1)
    context.moveTo(0, canvas.height / 2);
    context.lineWidth = 5;

    //define the end point of line1 (x2,y2)
    context.lineTo(canvas.width / 2, canvas.height);

    //define the end point of line2 (x3,y3)
    context.lineTo(canvas.width, canvas.height / 2);
    context.lineTo(canvas.width / 2, 0 * canvas.height);
    context.lineTo(0, canvas.height / 2);

    //draw the points that makeup the triangle - (x1,y1) to (x2,y2), (x2,y2) to (x3,y3),  and (x3,y3) to (x1,y1)
    context.stroke();
    context.fillStyle = "black";

    // Re-apply font since canvas is resized.
    context.font = boldFont;
    context.fillText(taskName, (canvas.width / 4) + 45, canvas.height / 2 - 10);
    context.fillText(role, (canvas.width / 4) - 15, canvas.height / 2 + 15);

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

export { buildTaskCanvas, buildCircularTextMaterial, buildRectTextMaterial, buildSquareTextMaterial, buildStartStopTextMaterial, taskBarColor, barWidth, barHeight, barDepth, squareBarWidth, squareBarHeight, connectorRadius, vGap, borderGap, boldFont, regularFont };
