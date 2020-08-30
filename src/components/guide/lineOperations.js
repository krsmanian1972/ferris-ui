import * as THREE from 'three';

const drawLineWithPrevPoint = function(lineSegmentArray, scene, arrayIndex, pathIndex, lineIndex) {
   console.log(lineIndex);
   if(lineIndex !== ""){
      //console.log("Line getting removed");
      //console.log(lineSegmentArray[arrayIndex].line[lineIndex]);
      scene.remove(lineSegmentArray[arrayIndex].line[lineIndex]);
   }
   var currentPoint = {x:lineSegmentArray[arrayIndex].path[pathIndex].x, 
                       y:lineSegmentArray[arrayIndex].path[pathIndex].y};
   var prevPoint = {x:lineSegmentArray[arrayIndex].path[pathIndex-1].x, 
                       y:lineSegmentArray[arrayIndex].path[pathIndex-1].y};
                       
   var points = [];
   var material = new THREE.LineBasicMaterial( { color: 0xFFFFFF, linewidth: 2 } );
   points.push( new THREE.Vector3(currentPoint.x , currentPoint.y, 0 ) );
   points.push( new THREE.Vector3( prevPoint.x, prevPoint.y, 0 ) );
   var geometry = new THREE.BufferGeometry().setFromPoints( points );
   if(lineIndex === ""){
       lineSegmentArray[arrayIndex].line.push(new THREE.Line( geometry, material ));
       scene.add(lineSegmentArray[arrayIndex].line[lineSegmentArray[arrayIndex].line.length-1]);
   }
   else{
      lineSegmentArray[arrayIndex].line[lineIndex] = (new THREE.Line( geometry, material ));
       scene.add(lineSegmentArray[arrayIndex].line[lineIndex]);
   }
}

const snapAtClickPoint = function (lineSegmentArray, point, scene){
     var result = {status: "FAILURE"};
     var indexOfClick = checkPointIsOnLineSegmentArray(lineSegmentArray, point);
     //console.log("logging IndexOfClick");
     //console.log(indexOfClick);
     if (indexOfClick.arrayIndex !== "Nan"){
         //insert new vertex point into path Index
         if(indexOfClick.existingVertex === null){
             lineSegmentArray[indexOfClick.arrayIndex].path.splice((indexOfClick.pathIndex)+1, 0, point);
         }
         if(indexOfClick.existingVertex === "DEST"){
             //indexOfClick.pathIndex = indexOfClick.pathIndex + 1;
             point = lineSegmentArray[indexOfClick.arrayIndex].path[indexOfClick.pathIndex+1];
         }

         splitLineToTwoAtVertex(lineSegmentArray, indexOfClick.arrayIndex, indexOfClick.pathIndex, point, indexOfClick.existingVertex, scene);
         result.status = "SUCCESS";
         result.arrayIndex = indexOfClick.arrayIndex;
         result.pathIndex = indexOfClick.pathIndex;
         return result;
     }
     return result;
}

const splitLineToTwoAtVertex = function (lineSegmentArray, arrayIndex, pathIndex,vertex, existingVertex, scene){
    scene.remove(lineSegmentArray[arrayIndex].line[pathIndex]);    
    var source = {};
    var dest = {};
    source.x = lineSegmentArray[arrayIndex].path[pathIndex].x;
    source.y = lineSegmentArray[arrayIndex].path[pathIndex].y;
    dest.x = lineSegmentArray[arrayIndex].path[pathIndex+1].x;
    dest.y = lineSegmentArray[arrayIndex].path[pathIndex+1].y;

    var points = [];
    var material = new THREE.LineBasicMaterial( { color: 0xFFFFFF, linewidth: 2 } );
    points.push( new THREE.Vector3(source.x , source.y, 0 ) );
    points.push( new THREE.Vector3(vertex.x, vertex.y, 0 ) );
    var geometry = new THREE.BufferGeometry().setFromPoints( points );
    lineSegmentArray[arrayIndex].line[pathIndex] = (new THREE.Line( geometry, material ));

    var points = [];
    var material = new THREE.LineBasicMaterial( { color: 0xFFFFFF,linewidth: 2 } );
    points.push( new THREE.Vector3(vertex.x, vertex.y, 0 ) );
    points.push( new THREE.Vector3(dest.x , dest.y, 0 ) );
    
    var geometry = new THREE.BufferGeometry().setFromPoints( points );
    if(existingVertex === null){
        lineSegmentArray[arrayIndex].line.splice(pathIndex+1, 0, (new THREE.Line( geometry, material )));
    }        
    scene.add(lineSegmentArray[arrayIndex].line[pathIndex]);    
    scene.add(lineSegmentArray[arrayIndex].line[pathIndex+1]);    
    
}

const checkPointIsOnLineSegmentArray = function(lineSegmentArray, point){
    var hitLineAndPath = {arrayIndex:"Nan", pathIndex:"Nan", existingVertex: null };
    for(var i = 0; i < lineSegmentArray.length; i++){
        for(var j = 0; j < lineSegmentArray[i].path.length -1; j++){
            //check if point is already a vertex on the path

            //if not find if it lies on any line
            var hitOnLine = findDistanceSumMatches(lineSegmentArray[i].path[j],lineSegmentArray[i].path[j+1], point); 
            if(hitOnLine.status === true){
                 //console.log("Found a point on line");
                 hitLineAndPath.arrayIndex =i;
                 hitLineAndPath.pathIndex = j;
                 hitLineAndPath.existingVertex = hitOnLine.existingVertex;
                 //console.log("HitLineAndPath");
                 //console.log(hitLineAndPath);
                 return hitLineAndPath;
            }

            }
        }
    return hitLineAndPath;
}

const updateVertexMovement = function(lineSegmentArray, arrayIndex, pathIndex, vertex, scene){

    scene.remove(lineSegmentArray[arrayIndex].line[pathIndex]);    
    scene.remove(lineSegmentArray[arrayIndex].line[pathIndex+1]);    
    var source = {};
    var dest = {};
    source.x = lineSegmentArray[arrayIndex].path[pathIndex].x;
    source.y = lineSegmentArray[arrayIndex].path[pathIndex].y;
    dest.x = lineSegmentArray[arrayIndex].path[pathIndex+2].x;
    dest.y = lineSegmentArray[arrayIndex].path[pathIndex+2].y;
    //snap to grid
    vertex.y = Math.round(vertex.y*2)/2;
    vertex.x = Math.round(vertex.x*2)/2;

    //update path array
    
    // update Line Array
    
    // update scene

    lineSegmentArray[arrayIndex].path[pathIndex+1].x = vertex.x;
    lineSegmentArray[arrayIndex].path[pathIndex+1].y = vertex.y;

    var points = [];
    var material = new THREE.LineBasicMaterial( { color: 0xFFFFFF, linewidth: 2 } );
    points.push( new THREE.Vector3(source.x , source.y, 0 ) );
    points.push( new THREE.Vector3(vertex.x, vertex.y, 0 ) );
    var geometry = new THREE.BufferGeometry().setFromPoints( points );
    lineSegmentArray[arrayIndex].line[pathIndex] = (new THREE.Line( geometry, material ));

    var points = [];
    var material = new THREE.LineBasicMaterial( { color: 0xFFFFFF, linewidth: 2 } );
    points.push( new THREE.Vector3(vertex.x, vertex.y, 0 ) );
    points.push( new THREE.Vector3(dest.x , dest.y, 0 ) );
    
    var geometry = new THREE.BufferGeometry().setFromPoints( points );
    lineSegmentArray[arrayIndex].line[pathIndex+1]= (new THREE.Line( geometry, material ));
    scene.add(lineSegmentArray[arrayIndex].line[pathIndex]);    
    scene.add(lineSegmentArray[arrayIndex].line[pathIndex+1]);    

}
const findDistanceSumMatches = function (source, dest, point){
    var result = {status: false, existingVertex: null};
    var distanceSourceToPoint = Math.sqrt((Math.pow((source.x - point.x), 2)) + Math.pow((source.y - point.y),2));
    var distanceDestToPoint = Math.sqrt((Math.pow((dest.x - point.x), 2)) + Math.pow((dest.y - point.y),2));    
    var distanceSourceToDest = Math.sqrt((Math.pow((dest.x - source.x), 2)) + Math.pow((dest.y - source.y),2));    
    var sumOfDistance = Math.abs(distanceSourceToPoint) + Math.abs(distanceDestToPoint);
    var diff = sumOfDistance - distanceSourceToDest;
    //console.log(source.x, source.y, dest.x, dest.y, point.x, point.y, diff, distanceSourceToPoint, distanceDestToPoint, distanceSourceToDest);
    
    if(diff <= 0.003){
       result.status = true;
    }
    if(distanceSourceToPoint <= 0.06){
       result.status = true;
       result.existingVertex = "SOURCE";
    }
    if(distanceDestToPoint <= 0.06){
        result.status = true;
        result.existingVertex = "DEST";
   }
    return result;
}

const removeRecurringPointOnLineSegment = function(lineSegmentArray, arrayIndex, scene, dummyArray){

    console.log(dummyArray);
    console.log(lineSegmentArray);
    dummyArray.splice(0,2);
    console.log(dummyArray);
   // return;

    
    for (var i = 0; i < lineSegmentArray[arrayIndex].path.length-2; i++){
         console.log("Inside Removing Line optimizer loop path index", i);
         console.log(lineSegmentArray[arrayIndex]);            
         //take points i and i+2
         var source = lineSegmentArray[arrayIndex].path[i];
         var dest = lineSegmentArray[arrayIndex].path[i+2];
         var point = lineSegmentArray[arrayIndex].path[i+1];
         console.log(source, point, dest);
         var result = {status: false};
         result = findDistanceSumMatches(source, dest, point);
         if(result.status === true){
             console.log("Found a repetitive point a line at index" , i);
             //remove index point i+1
             lineSegmentArray[arrayIndex].path.splice(i+1, 1);
             console.log(lineSegmentArray[arrayIndex].path);
             //remove line i and i+1
             scene.remove(lineSegmentArray[arrayIndex].line[i]);             
             scene.remove(lineSegmentArray[arrayIndex].line[i+1]); 
             
             console.log("Remove LIne 1");
             logPointsOnLine(lineSegmentArray[arrayIndex].line[i].geometry);
             console.log("Remove LIne 2");
             
             logPointsOnLine(lineSegmentArray[arrayIndex].line[i+1].geometry);
             lineSegmentArray[arrayIndex].line.splice(i+1, 1);

             var points = [];
             var material = new THREE.LineBasicMaterial( { color: 0xFFFFFF, linewidth: 2 } );
             points.push( new THREE.Vector3(source.x, source.y, 0 ) );
             points.push( new THREE.Vector3(dest.x , dest.y, 0 ) );
    
             var geometry = new THREE.BufferGeometry().setFromPoints( points );
             lineSegmentArray[arrayIndex].line[i]= (new THREE.Line( geometry, material ));
             scene.add(lineSegmentArray[arrayIndex].line[i]);
             console.log("Added new line");
             logPointsOnLine(lineSegmentArray[arrayIndex].line[i].geometry);         
             i = i -1;
             
         }                         
         
    }
         
        
}

const removeLineSegmentOnCickPoint = function(lineSegmentArray, point, scene){
    var status = "FAILURE";
    const hitPoint = checkPointIsOnLineSegmentArray(lineSegmentArray, point);
    if(hitPoint.arrayIndex !== "Nan"){
        //found a hit point, remove the lines from the scene. 
        for(var i = 0; i < lineSegmentArray[hitPoint.arrayIndex].line.length; i++){
            scene.remove(lineSegmentArray[hitPoint.arrayIndex].line[i]);
        }
        //remove the arrayIndex from the lineSegmentArray
        lineSegmentArray.splice(hitPoint.arrayIndex, 1);
        status = "SUCCESS";
    } 
    return status;
}


const logPointsOnLine = function(line){
   console.log("Source and Dest of Line");
   console.log(line);
   for(var i = 0; i < 6; i++){
//       console.log(line[i]);
   }
}

export {drawLineWithPrevPoint, checkPointIsOnLineSegmentArray, snapAtClickPoint, updateVertexMovement, removeRecurringPointOnLineSegment, removeLineSegmentOnCickPoint};

