const create_canvas = () => {
    /* Create canvas with the maximum width and height. */
    let canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    /* Insert it into the body element. */
    let body = document.getElementsByTagName('body')[0];
    body.appendChild(canvas);

    return canvas;
};

const draw = (canvas_ctxt, cell_size, generation, num_cols) => {
    const horizontal_margin = (canvas_ctxt.canvas.width % cell_size) / 2;
    const vertical_margin = (canvas_ctxt.canvas.height % cell_size) / 2;

    /* Clear canvas. */
    canvas_ctxt.clearRect(0, 0, canvas_ctxt.canvas.width, canvas_ctxt.canvas.height);

    /* Draw vertical lines. */
    for (let x = horizontal_margin; x < canvas_ctxt.canvas.width; x += cell_size) {
        canvas_ctxt.beginPath();
        canvas_ctxt.moveTo(x, vertical_margin);
        canvas_ctxt.lineTo(x, canvas_ctxt.canvas.height - vertical_margin);
        canvas_ctxt.stroke();
    }

    /* Draw horizontal lines. */
    for (let y = vertical_margin; y < canvas_ctxt.canvas.height; y += cell_size) {
        canvas_ctxt.beginPath();
        canvas_ctxt.moveTo(horizontal_margin, y);
        canvas_ctxt.lineTo(canvas_ctxt.canvas.width - horizontal_margin, y);
        canvas_ctxt.stroke();
    }

    /* Draw generation. */
    const draw_cell = (alive, index) => {
        if (alive) {
            let row = index_to_row(index, num_cols);
            let col = index_to_col(index, num_cols);

            canvas_ctxt.fillRect(horizontal_margin + col * cell_size,
                                 vertical_margin + row * cell_size,
                                 cell_size,
                                 cell_size);
        }
    };

    generation.forEach(draw_cell);
};

const row_col_to_index = (row, col, max_cols) => col + (row * max_cols);
const index_to_row = (index, max_cols) => Math.floor(index / max_cols);
const index_to_col = (index, max_cols) => index % max_cols;

const create_generation = (cell_generator) => {
    return (rows, cols) => Array.from(Array(rows * cols), () => cell_generator());
};

const get_num_alive_neighbours = (row, col, generation, num_cols) => {
    const offset = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

    const add_alive_neighbour = (num_alive_neighbours, offset) => {
        let neighbour_row = row + offset[0];
        let neighbour_col = col + offset[1];
        let index = row_col_to_index(neighbour_row, neighbour_col, num_cols);

        if (index >= 0 && index < (generation.length * num_cols)) {
            if (generation[index]) {
                num_alive_neighbours += 1;
            }
        }

        return num_alive_neighbours;
    };

    return offset.reduce(add_alive_neighbour, 0);
};

const get_next_generation = (generation, num_cols) => {

    const cell_will_live = (alive, index) => {
        let row = index_to_row(index, num_cols);
        let col = index_to_col(index, num_cols);
        const num_alive_neighbours = get_num_alive_neighbours(row, col, generation, num_cols);

        if (alive) {
            return num_alive_neighbours >= 2 && num_alive_neighbours <= 3;
        } else {
            return num_alive_neighbours === 3;
        }
    };

    return generation.map(cell_will_live);
};

const game_of_life = (cell_size = 5) => {
    let canvas = create_canvas();
    let canvas_ctxt = canvas.getContext('2d');
    const num_rows = Math.floor(canvas.height / cell_size);
    const num_cols = Math.floor(canvas.width / cell_size);
    let running = false;
    let create_random_generation = create_generation(() => Math.random() >= 0.5);
    let create_empty_generation = create_generation(() => false);
    let current_generation = create_random_generation(num_rows, num_cols);

    document.addEventListener('keydown', (event) => {
        if (event.key == 'c') {
            current_generation = create_empty_generation(num_rows, num_cols);
        } else if (event.key == 'r') {
            current_generation = create_random_generation(num_rows, num_cols);
        } else {
            running = !running;
            if (running) {
                run();
            }
        }
        draw(canvas_ctxt, cell_size, current_generation, num_cols);
    });

    const handle_click = event => {
        const horizontal_margin = (canvas_ctxt.canvas.width % cell_size) / 2;
        const vertical_margin = (canvas_ctxt.canvas.height % cell_size) / 2;

        let col = Math.floor((event.pageX - horizontal_margin) / cell_size);
        let row = Math.floor((event.pageY - vertical_margin) / cell_size);
        let index = row_col_to_index(row, col, num_cols);

        current_generation[index] = !current_generation[index];

        draw(canvas_ctxt, cell_size, current_generation, num_cols);
    };

    canvas.addEventListener('mousedown', event => {
        handle_click(event);
        canvas.addEventListener('mousemove', handle_click);
    });

    canvas.addEventListener('mouseup', () => {
        canvas.removeEventListener('mousemove', handle_click);
    });

    const run = () => {
        if (running) {
            current_generation = get_next_generation(current_generation, num_cols);
            draw(canvas_ctxt, cell_size, current_generation, num_cols);
            window.requestAnimationFrame(run);
        }
    };

    draw(canvas_ctxt, cell_size, current_generation, num_cols);
};

game_of_life();
