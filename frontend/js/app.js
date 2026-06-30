document.addEventListener('DOMContentLoaded', () => {
    
    // --- 画面切り替えロジック ---
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.view-section');

    function switchView(targetId) {
        sections.forEach(section => {
            section.classList.remove('active');
        });
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // サイドバーのアクティブ表示連動
        navItems.forEach(item => {
            if (item.getAttribute('data-target') === targetId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            switchView(target);
        });
    });

    // --- 各種インタラクションの擬似実装 ---

    // 1. タスク分解実行ボタン
    const btnDecompose = document.getElementById('btn-decompose');
    const taskInput = document.getElementById('task-input');
    const currentParentTask = document.getElementById('current-parent-task');

    if (btnDecompose && taskInput) {
        btnDecompose.addEventListener('click', () => {
            if (!taskInput.value.trim()) {
                alert('タスクを入力してください');
                return;
            }
            currentParentTask.textContent = taskInput.value;
            switchView('decomposition-result');
        });
    }

    // 2. 分解結果の確定ボタン
    const btnSaveSteps = document.getElementById('btn-save-steps');
    if (btnSaveSteps) {
        btnSaveSteps.addEventListener('click', () => {
            switchView('execution-proposal');
        });
    }

    // 3. 実行開始ボタン & タイマー制御
    const btnStartExecution = document.getElementById('btn-start-execution');
    const timerOutput = document.getElementById('timer-output');
    let timerInterval = null;

    if (btnStartExecution) {
        btnStartExecution.addEventListener('click', () => {
            switchView('execution-running');
            startTimer(15 * 60); // 15分ダミー
        });
    }

    function startTimer(durationSeconds) {
        clearInterval(timerInterval);
        let timeRemaining = durationSeconds;

        function updateTimerDisplay() {
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            timerOutput.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }

        updateTimerDisplay();

        timerInterval = setInterval(() => {
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                switchView('execution-complete');
                return;
            }
            timeRemaining--;
            updateTimerDisplay();
        }, 1000);
    }

    // 4. タスク完了ボタン
    const btnCompleteTask = document.getElementById('btn-complete-task');
    if (btnCompleteTask) {
        btnCompleteTask.addEventListener('click', () => {
            clearInterval(timerInterval);
            switchView('execution-complete');
        });
    }

    // 中断
    const btnPauseTask = document.getElementById('btn-pause-task');
    if (btnPauseTask) {
        btnPauseTask.addEventListener('click', () => {
            clearInterval(timerInterval);
            switchView('main-menu');
        });
    }

    // 完了後の次のステップ・ホームへ戻るボタン
    document.getElementById('btn-continue-next')?.addEventListener('click', () => {
        switchView('execution-proposal');
    });
    document.getElementById('btn-go-home')?.addEventListener('click', () => {
        switchView('main-menu');
    });

    // 5. タスク一覧から詳細への遷移
    const rows = document.querySelectorAll('.clickable-row');
    rows.forEach(row => {
        row.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') return; // 削除ボタンは除外
            const taskTitle = row.querySelector('strong').textContent;
            document.getElementById('detail-task-title').textContent = taskTitle;
            switchView('task-detail');
        });
    });

    document.getElementById('btn-back-to-list')?.addEventListener('click', () => {
        switchView('task-list');
    });
});
