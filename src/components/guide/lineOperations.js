import * as THREE from 'three';

const drawLineWithPrevPoint = function(lineSegmentArray, scene, arrayIndex, pathIndex, lineIndex) {

   if(lineIndex != ""){
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
   if(lineIndex == ""){
       lineSegmentArray[arrayIndex].line.push(new THREE.Line( geometry, material ));
       scene.add(lineSegmentArray[arrayIndex].line[lineSegmentArray[arrayIndex].line.length-1]);
   }
   else{
       scene.add(lineSegmentArray[arrayIndex].line[lineIndex]);
   }



}


export default drawLineWithPrevPoint;
