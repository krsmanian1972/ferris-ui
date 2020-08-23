import * as THREE from 'three';

const drawLineWithPrevPoint = function(lineSegmentArray, scene, arrayIndex, pathIndex, lineIndex) {
   console.log(lineIndex);
   if(lineIndex !== ""){
      console.log("Line getting removed");
      console.log(lineSegmentArray[arrayIndex].line[lineIndex]);
      scene.remove(lineSegmentArray[arrayIndex].line[lineIndex]);
   }
   var currentPoint = {x:lineSegmentArray[arrayIndex].path[pathIndex].x, 
                       y:lineSegmentArray[arrayIndex].path[pathIndex].y};
   var prevPoint = {x:lineSegmentArray[arrayIndex].path[pathIndex-1].x, 
                       y:lineSegmentArray[arrayIndex].path[pathIndex-1].y};
                       
   var points = [];
   var material = new THREE.LineBasicMaterial( { color: 0xFFFFFF } );
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

const checkPointIsOnLineSegmentArray = function(lineSegmentArray, point){

    for(var i = 0; i < lineSegmentArray.length; i++){
        for(var j = 0; j < lineSegmentArray[i].path.length; j++){
        
            this.findDistanceSumMatches(lineSegmentArray[i].path[j],lineSegmentArray[i].path[j+1], point); 
        }
    }

}

const findDistanceSumMatches = function (source, dest, point){
    var distanceSourceToPoint = Math.sqrt((Math.pow((source.x - point.x), 2)) + Math.pow((source.y - point.y),2));
    var distanceDestToPoint = Math.sqrt((Math.pow((dest.x - point.x), 2)) + Math.pow((dest.y - point.y),2));    
    var distanceSourceToDest = Math.sqrt((Math.pow((dest.x - source.x), 2)) + Math.pow((dest.y - source.y),2));    
   var sumOfDistance = Math.abs(distanceSourceToPoint) + Math.abs(distanceDestToPoint);
   var diff = sumOfDistance - distanceSourceToDest;
   console.log(diff);
    
}
export {drawLineWithPrevPoint, checkPointIsOnLineSegmentArray};

