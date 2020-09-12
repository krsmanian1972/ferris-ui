import {EventDispatcher,Raycaster,Vector2} from 'three';


var LineObserver = function (_camera, _domElement, _lineContainer) {
    var _raycaster = new Raycaster();
    _raycaster.params.Line.threshold = 0.1;
    var _mouse = new Vector2();
    var _intersections = [];
    var _selected = null;
    var scope = this;

    function activate() {
        _domElement.addEventListener('dblclick', onDoubleClick, false);
        _domElement.addEventListener('mousemove', onMouseMove, false);
    }

    function onMouseMove(event){
        if(_selected){
              var rect = _domElement.getBoundingClientRect();
              _mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
              _mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;
              var clickPoint = {x:_mouse.x, y:_mouse.y}
              scope.dispatchEvent({ type: 'onSnapProgress', object: {selected: _selected, clickPoint: clickPoint }});
        }
    }

    function onDoubleClick(event){
          event.preventDefault();
          if(_selected){
              onSnapEnd(event);
          }
          else{
              onSnapStart(event);
          }
    }
    function onSnapStart(event) {

        event.preventDefault();
        var rect = _domElement.getBoundingClientRect();
        _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        _mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;

        _intersections.length = 0;

        _raycaster.setFromCamera(_mouse, _camera);

        _raycaster.intersectObjects(_lineContainer.children, true, _intersections);

        if (_intersections.length > 0) {
            _selected = _intersections[0].object;
            _domElement.style.cursor = 'pointer';
            scope.dispatchEvent({ type: 'onSnapStart', object: _selected });
        }
    }

    function onSnapEnd(event){
        scope.dispatchEvent({ type: 'onSnapEnd', object: _selected });
        _selected = null;
        _domElement.style.cursor = 'auto';

    }

    activate();

    this.activate = activate;
}

LineObserver.prototype = Object.create(EventDispatcher.prototype);
LineObserver.prototype.constructor = LineObserver;

export { LineObserver }
