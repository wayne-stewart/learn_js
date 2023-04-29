
App = (function(){

    let _canvas = null;
    let _canvas_cx = 0;
    let _canvas_cy = 0;
    let _2d_context = null;
    let _draw_objects = [];
    let _pixel_per_inch = 0.0;
    let _zoom_feet = 0.0;
    let _zoom_zero_feet = 0.0;
    const _zoom_smallest_feet = 5.0;
    const WALL = 1;
    const WINDOW = 2;
    const SEAT = 3;
    const WALL_WIDTH = 6.0;

    const _max = (array, callback) => { 
        let max = null; 
        for (let i = 0; i < array.length; i++) { 
            let value = callback(array[i]); 
            if (max == null || value > max) { 
                max = value; 
            } 
        } 
        return max; 
    };

    const _min = (array, callback) => { 
        let max = null; 
        for (let i = 0; i < array.length; i++) { 
            let value = callback(array[i]); 
            if (max == null || value < max) { 
                max = value; 
            } 
        } 
        return max; 
    };

    const _init = function() {
        _init_canvas();
        _init_room();
        _resize_canvas();
        _draw();
    };

    const _init_canvas = function() {
        _canvas = document.createElement("canvas");
        document.body.appendChild(_canvas);
        _2d_context = _canvas.getContext("2d");
        _canvas.style.position = "absolute";
    };

    const _resize_canvas = function() {
        _canvas.width = window.innerWidth;
        _canvas.height = window.innerHeight;
        _canvas_cx = _canvas.width / 2;
        _canvas_cy = _canvas.height / 2;
        let smallest_dimension = Math.min(_canvas.width, _canvas.height);
        let smallest_dimension_feet = Math.max(_zoom_smallest_feet, _zoom_zero_feet + _zoom_feet);
        _pixel_per_inch = smallest_dimension / (smallest_dimension_feet * 12.0);
    };

    const _on_window_resize = function() {
        _resize_canvas();
        _draw();
    };

    const _draw = function() {
        _2d_context.clearRect(0, 0, _canvas.width, _canvas.height);
        _2d_context.fillStyle = "#000000";
        for (let i = 0; i < _draw_objects.length; i++) {
            let draw_object = _draw_objects[i];
            let bounding_box = _get_bounding_box_pixels(draw_object);
            if (draw_object.t == WALL) { 
                _draw_wall(_2d_context, draw_object);
            }
            else if (draw_object.t == WINDOW) {
                _draw_window(_2d_context, draw_object);
            }
            else if (draw_object.t == SEAT) {

            }
        }
    };

    const _get_bounding_box_inches = function(draw_object) { 
        return {
            left: draw_object.x - (draw_object.w / 2),
            top: draw_object.y - (draw_object.h / 2),
            width: draw_object.w,
            height: draw_object.h,
            right: draw_object.x + (draw_object.w / 2),
            bottom: draw_object.y + (draw_object.h / 2)
        }
    };

    const _get_bounding_box_pixels = function(draw_object) { 
        return {
            left: _canvas_cx + (draw_object.x - (draw_object.w / 2)) * _pixel_per_inch,
            top: _canvas_cy + (draw_object.y - (draw_object.h / 2)) * _pixel_per_inch,
            width: (draw_object.w) * _pixel_per_inch,
            height: (draw_object.h) * _pixel_per_inch,
            right: _canvas_cx + (draw_object.x + (draw_object.w / 2)) * _pixel_per_inch,
            bottom: _canvas_cy + (draw_object.y + (draw_object.h / 2)) * _pixel_per_inch
        }
    };

    const _draw_wall = function(context, draw_object) { 
        let bounding_box = _get_bounding_box_pixels(draw_object);
        context.fillRect(bounding_box.left, bounding_box.top, bounding_box.width, bounding_box.height);
    };

    const _draw_window = function(context, draw_object) {
        let bounding_box = _get_bounding_box_pixels(draw_object);
        _2d_context.fillStyle = "#FFFFFF";
        context.fillRect(bounding_box.left, bounding_box.top, bounding_box.width, bounding_box.height);
        _2d_context.fillStyle = "#000000";
        if (draw_object.w > draw_object.h) {
            context.fillRect(bounding_box.left, bounding_box.top + WALL_WIDTH * _pixel_per_inch / 3, bounding_box.width, bounding_box.height/3);
        }
        else {
            context.fillRect(bounding_box.left + WALL_WIDTH * _pixel_per_inch / 3, bounding_box.top, bounding_box.width / 3, bounding_box.height);
        }
    };

    /**
     * @param {number} x - x coordinate of center of wall
     * @param {number} y - y coordinate of center of wall
     * @param {number} l - length of wall in inches
     * @param {number} o - orientation of wall in degrees
     */
    const _make_wall = (x, y, l, o) => {
        return {
            t: WALL, 
            x, 
            y, 
            w: (o == 0 || o == 180) ? l : WALL_WIDTH, 
            h: (o == 90 || o == 270) ? l : WALL_WIDTH
        };
    };
    const _make_window = (x, y, l, o) => {
        return {
            t: WINDOW, 
            x, 
            y, 
            w: (o == 0 || o == 180) ? l : WALL_WIDTH, 
            h: (o == 90 || o == 270) ? l : WALL_WIDTH
        };
    };
    const _make_seat = (x, y, w, h) => { t = SEAT, x, y, w, h };

    const _init_room = function() {
        // 231 by 142 / 72 - 33 - 37 / 40.75 - 61.5 - 86
        // 50.5 - 46.75 - 51.5
        const half_wall_width = WALL_WIDTH / 2;
        // top wall
        _draw_objects.push(_make_wall(0, -142/2 - half_wall_width, 231, 0));

        // left wall
        _draw_objects.push(_make_wall(-231/2 - half_wall_width, -142/2 + 72/2, 72, 270));
        _draw_objects.push(_make_wall(-231/2 - half_wall_width, 142/2 - 37/2, 37, 270));

        // right wall
        _draw_objects.push(_make_wall(231/2 + half_wall_width, 0, 142, 90));

        // bottom wall
        _draw_objects.push(_make_wall(231/2 - 40.75/2, 142/2 + half_wall_width, 40.75, 0));
        _draw_objects.push(_make_wall(231/2 - 86/2 - 40.75 - 61.5, 142/2 + half_wall_width, 86, 0));

        // windows
        _draw_objects.push(_make_window(231/2 - 51.5, -142/2 - half_wall_width, 50.5, 0));
        _draw_objects.push(_make_window(-231/2 + 46.75, -142/2 - half_wall_width, 50.5, 0));

        let right = _max(_draw_objects, a => _get_bounding_box_inches(a).right);
        let left = _min(_draw_objects, a => _get_bounding_box_inches(a).left);
        let top = _max(_draw_objects, a => _get_bounding_box_inches(a).top);
        let bottom = _max(_draw_objects, a => _get_bounding_box_inches(a).bottom);
        _zoom_zero_feet = Math.max(right - left, bottom - top);
        _zoom_zero_feet = Math.ceil(_zoom_zero_feet / 12) + 1;
    };

    const _app = {
        start: function() {
            _init();
            window.addEventListener("resize", _on_window_resize);
        },
    };

    return function() {
        return _app;
    };
})();