import { EventDispatcher, Raycaster, Vector2 } from 'three';


var LineObserver = function (_lineContainer, _camera, _domElement) {
    var _raycaster = new Raycaster();
    var _mouse = new Vector2();
    var _intersections = [];
    var _selected = null;
    var _hovered = null;
    var scope = this;

    function activate() {
        _domElement.addEventListener('mousemove', onMouseMove, false);
        _domElement.addEventListener('mousedown', onMouseClicked, false );
    }

    function onMouseClicked(event) {
        event.preventDefault();
        
        if(!_hovered) {
            return;
        }
       
        if(!_selected) {
            _selected = _hovered;
            _domElement.style.cursor = 'move';
            scope.dispatchEvent({ type: 'onSelect', object: _selected });
        }
        else {
            _domElement.style.cursor = 'auto';
            scope.dispatchEvent({ type: 'offSelect', object: _selected });
            _selected = null;
            _hovered = null;
        }
    }

    function onMouseMove(event) {

        event.preventDefault();

        var rect = _domElement.getBoundingClientRect();
        _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        _mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;

        _intersections.length = 0;
        _raycaster.setFromCamera(_mouse, _camera);
        _raycaster.intersectObjects(_lineContainer, true, _intersections);

        if (_selected) {
            return
        }

        if (_intersections.length > 0) {

            var _filtered = applyFilter("Mesh");

            if (_filtered.length == 0) {
                return;
            }

            var object = _filtered[0].object;

            if (_hovered !== object) {
                _hovered = object
                _domElement.style.cursor = 'pointer';
                scope.dispatchEvent({ type: 'onHover', object: _hovered });
            }
        }
        else {
            if (_hovered != null) {
                _domElement.style.cursor = 'auto';
                scope.dispatchEvent({ type: 'offHover', object: _hovered });
                _hovered = null;
            }
        }
    }

    function applyFilter(type) {
        var filtered = [];

        for (var i = 0; i < _intersections.length; i++) {
            var object = _intersections[i];
            if (object.object.type === type) {
                filtered.push(object);
            }
        }

        return filtered;
    }

    activate();

    this.activate = activate;
}

LineObserver.prototype = Object.create(EventDispatcher.prototype);
LineObserver.prototype.constructor = LineObserver;

export { LineObserver }
