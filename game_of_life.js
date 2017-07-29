/* Conway's Game of Life. A generation is represented by a 2-dimensional array of booleans. */

/* Create a canvas with the maximum width and height. */
const create_canvas = () => {
    let canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    /* Insert it into the body element. */
    let body = document.getElementsByTagName('body')[0];
    body.appendChild(canvas);

    return canvas;
};

/* Draw a generation on the canvas. */
const draw = (canvas, cell_size, generation) => {
    let canvas_ctxt = canvas.getContext('2d');

    canvas_ctxt.clearRect(0, 0, canvas.width, canvas.height);

    for (row = 0; row < generation.length; ++row) {
        for (col = 0; col < generation[0].length; ++col) {
            if (generation[row][col])
                canvas_ctxt.fillRect(col * cell_size, row * cell_size, cell_size, cell_size);
        }
    }
};

/* Returns a function to create a generation. A generation is a 2-dimensional array of booleans. */
const create_generation = (cell_generator) => {
    return (rows, cols) =>
        (Array.from(Array(rows), () => Array.from(Array(cols), () => cell_generator())));
};

const get_num_alive_neighbours = (row, col, generation) => {
    const n_offsets = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

    const add_alive_neighbour = (num_alive_neighbours, n_offset) => {
        let n_row = row + n_offset[0];
        let n_col = col + n_offset[1];

        if (n_row >= 0 && n_row < generation.length && n_col >= 0 && n_col < generation[0].length)
            if (generation[n_row][n_col])
                num_alive_neighbours += 1;

        return num_alive_neighbours;
    };

    return n_offsets.reduce(add_alive_neighbour, 0);
};

const get_next_generation = (generation) => {

    const row_will_live = (row_cells, row) => {
        const cell_will_live = (alive, col) => {
            const num_alive_neighbours = get_num_alive_neighbours(row, col, generation);

            return num_alive_neighbours === 3 || (num_alive_neighbours === 2 && alive);
        };

        return row_cells.map(cell_will_live);
    };

    return generation.map(row_will_live);
};

const game_of_life = (cell_size = 5) => {
    let canvas = create_canvas();
    const num_rows = Math.floor(canvas.height / cell_size);
    const num_cols = Math.floor(canvas.width / cell_size);
    let running = false;
    let create_random_generation = create_generation(() => Math.random() >= 0.5);
    let create_empty_generation = create_generation(() => false);
    let current_generation = create_random_generation(num_rows, num_cols);

    /* Handle key events. */
    document.addEventListener('keydown', (event) => {
        if (event.key == 'c') {
            current_generation = create_empty_generation(num_rows, num_cols);
        } else if (event.key == 'r') {
            current_generation = create_random_generation(num_rows, num_cols);
        } else {
            running = !running;
            if (running)
                run();
        }
        draw(canvas, cell_size, current_generation);
    });

    /* Handle a mouse click. A cell state can be toggled with a mouse click. */
    const handle_click = event => {
        let col = Math.floor(event.pageX / cell_size);
        let row = Math.floor(event.pageY / cell_size);

        current_generation[row][col] = !current_generation[row][col];

        draw(canvas, cell_size, current_generation);
    };

    /* This makes it possible to click the mouse and move an toggle cells. */
    canvas.addEventListener('mousedown', event => {
        handle_click(event);
        canvas.addEventListener('mousemove', handle_click);
    });

    canvas.addEventListener('mouseup', () => {
        canvas.removeEventListener('mousemove', handle_click);
    });

    const run = () => {
        if (running) {
            current_generation = get_next_generation(current_generation);
            draw(canvas, cell_size, current_generation);
            window.requestAnimationFrame(run);
        }
    };

    draw(canvas, cell_size, current_generation);
};

game_of_life();
