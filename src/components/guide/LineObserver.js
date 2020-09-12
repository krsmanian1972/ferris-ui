import {EventDispatcher,Raycaster,Vector2} from 'three';


var LineObserver = function (_camera, _domElement, _lineContainer) {
    var _raycaster = new Raycaster();

    var _mouse = new Vector2();
    var _intersections = [];
    var _selected = null;
    var scope = this;

    function activate() {
        _domElement.addEventListener('mousedown', onDocumentMouseDown, false);
    }


    function onDocumentMouseDown(event) {

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
            scope.dispatchEvent({ type: 'onSelect', object: _selected });
        }
    }

    activate();

    this.activate = activate;
}

LineObserver.prototype = Object.create(EventDispatcher.prototype);
LineObserver.prototype.constructor = LineObserver;

export { LineObserver }
