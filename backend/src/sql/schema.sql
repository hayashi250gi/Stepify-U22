CREATE TABLE users (

    user_id SERIAL PRIMARY KEY,

    google_sub VARCHAR(255) UNIQUE,

    email VARCHAR(255) UNIQUE NOT NULL,

    display_name VARCHAR(100) NOT NULL,

    icon_url TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    last_login_at TIMESTAMP

);

CREATE TABLE IF NOT EXISTS tasks (

    task_id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,

    description TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'todo',

    client_uuid UUID NOT NULL UNIQUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

CREATE TABLE IF NOT EXISTS subtasks (

    subtask_id SERIAL PRIMARY KEY,

    client_uuid UUID NOT NULL UNIQUE,

    task_id INTEGER NOT NULL
        REFERENCES tasks(task_id)
        ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,

    description TEXT,

    order_no INTEGER NOT NULL,

    estimated_minutes INTEGER,

    status VARCHAR(20)
        NOT NULL DEFAULT 'todo',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);