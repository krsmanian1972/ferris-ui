import {EventDispatcher,Raycaster,Vector2} from 'three';


var ClickControls = function (_objects, _camera, _domElement) {
    var _raycaster = new Raycaster();

    var _mouse = new Vector2();
    var _intersections = [];
    var _selected = null;

    var scope = this;

    function activate() {
        _domElement.addEventListener('mousedown', onDocumentMouseDown, false);
    }

    function getObjects() {
        return _objects;
    }

    function onDocumentMouseDown(event) {

        event.preventDefault();

        var rect = _domElement.getBoundingClientRect();
        _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        _mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;

        _intersections.length = 0;

        _raycaster.setFromCamera(_mouse, _camera);
        _raycaster.intersectObjects(_objects, true, _intersections);

        if (_intersections.length > 0) {
            _selected = _intersections[0].object;
            _domElement.style.cursor = 'pointer';
            scope.dispatchEvent({ type: 'onSelect', object: _selected });
        }
    }

    activate();

    this.activate = activate;
    this.getObjects = getObjects;
}

ClickControls.prototype = Object.create(EventDispatcher.prototype);
ClickControls.prototype.constructor = ClickControls;

export { ClickControls }