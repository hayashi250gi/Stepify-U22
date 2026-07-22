-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (

    user_id SERIAL PRIMARY KEY,

    google_sub VARCHAR(255) UNIQUE,

    display_name VARCHAR(100) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    last_login_at TIMESTAMP

);

-- タスクテーブル
CREATE TABLE IF NOT EXISTS tasks (

    task_id SERIAL PRIMARY KEY,

    client_uuid UUID NOT NULL UNIQUE,

    user_id INTEGER NOT NULL
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,

    description TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'todo',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- サブタスクテーブル
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

-- 実行ログテーブル
CREATE TABLE IF NOT EXISTS execution_logs (

    execution_log_id SERIAL PRIMARY KEY,

    subtask_id INTEGER NOT NULL
        REFERENCES subtasks(subtask_id)
        ON DELETE CASCADE,

    started_at TIMESTAMP NOT NULL,

    finished_at TIMESTAMP,

    duration_seconds INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- 設定テーブル
CREATE TABLE IF NOT EXISTS settings (

    user_id INTEGER PRIMARY KEY
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    -- apperance.thema: system, light, dark
    -- notification.enabled: true, false
    -- notification.sound: true, false
    -- sync.auto_sync: true, false
    -- sync.sync_only_wifi: true, false
    settings JSONB NOT NULL DEFAULT '{
        "appearance": {
            "theme": "system"
        },
        "notification": {
            "enabled": true,
            "sound": true
        },
        "sync": {
            "auto_sync": true,
            "sync_only_wifi": false
        }
    }'::jsonb,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);