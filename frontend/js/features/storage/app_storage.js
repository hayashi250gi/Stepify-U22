// ゲストユーザー向けのローカル保存機能を提供するモジュール。
export class AppStorage {
    static dbName = "stepify-db";
    static dbVersion = 2;
    static storeName = "guest_data";
    static db = null;
    static initPromise = null;

    /**
     * IndexedDB を初期化する。
     * 既に接続済みなら再利用する。
     */
    static async initialize() {
        if (this.db) {
            return this.db;
        }

        if (this.initPromise) {
            return this.initPromise;
        }

        if (!window.indexedDB) {
            throw new Error("このブラウザでは IndexedDB を使用できません。別の保存方法へ切り替えてください。");
        }

        this.initPromise = new Promise((resolve, reject) => {
            const request = window.indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = (event) => {
                const database = event.target.result;
                const oldVersion = event.oldVersion;

                // v1: 初期スキーマ作成
                if (oldVersion < 1) {
                    if (!database.objectStoreNames.contains(this.storeName)) {
                        const store = database.createObjectStore(this.storeName, { keyPath: "id" });
                        store.createIndex("updatedAt", "updatedAt", { unique: false });
                    }
                }

                // v2: updatedAt インデックスを追加（v1 で作成済みの場合はスキップ）
                if (oldVersion < 2 && oldVersion >= 1) {
                    const store = event.currentTarget.transaction.objectStore(this.storeName);
                    if (!store.indexNames.contains("updatedAt")) {
                        store.createIndex("updatedAt", "updatedAt", { unique: false });
                    }
                }
            };

            request.onsuccess = () => {
                this.db = request.result;

                // バージョン変更時の後方互換性: close して開き直す必要はない
                this.db.onversionchange = () => {
                    this.db.close();
                    console.warn("[AppStorage] DB のバージョンが更新されました。再接続が必要です。");
                    this.db = null;
                };

                resolve(this.db);
            };

            request.onerror = () => {
                reject(new Error("IndexedDB の初期化に失敗しました。"));
            };
        }).finally(() => {
            this.initPromise = null;
        });

        return this.initPromise;
    }

    /**
     * DB 接続を閉じて、次回 initialize() で再接続するようにする。
     */
    static close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }

    // ============================================================
    // 基本 CRUD
    // ============================================================

    /**
     * ゲストユーザーのデータを保存する。
     * 例: saveGuestData("tasks", { ... })
     */
    static async saveGuestData(key, value) {
        try {
            const database = await this.initialize();

            return new Promise((resolve, reject) => {
                const transaction = database.transaction(this.storeName, "readwrite");
                const store = transaction.objectStore(this.storeName);
                const payload = {
                    id: key,
                    data: value,
                    updatedAt: new Date().toISOString(),
                };

                const request = store.put(payload);

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(new Error("ローカルデータの保存に失敗しました。"));
            });
        } catch (error) {
            throw new Error(error.message || "ローカルデータの保存に失敗しました。");
        }
    }

    /**
     * 保存済みのゲストデータを取得する。
     */
    static async loadGuestData(key) {
        try {
            const database = await this.initialize();

            return new Promise((resolve, reject) => {
                const transaction = database.transaction(this.storeName, "readonly");
                const store = transaction.objectStore(this.storeName);
                const request = store.get(key);

                request.onsuccess = () => resolve(request.result ? request.result.data : null);
                request.onerror = () => reject(new Error("ローカルデータの読み込みに失敗しました。"));
            });
        } catch (error) {
            throw new Error(error.message || "ローカルデータの読み込みに失敗しました。");
        }
    }

    /**
     * 保存済みデータを削除する。
     */
    static async clearGuestData(key) {
        try {
            const database = await this.initialize();

            return new Promise((resolve, reject) => {
                const transaction = database.transaction(this.storeName, "readwrite");
                const store = transaction.objectStore(this.storeName);
                const request = store.delete(key);

                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(new Error("ローカルデータの削除に失敗しました。"));
            });
        } catch (error) {
            throw new Error(error.message || "ローカルデータの削除に失敗しました。");
        }
    }

    /**
     * 全ゲストデータを一括削除する。
     */
    static async clearAllGuestData() {
        try {
            const database = await this.initialize();

            return new Promise((resolve, reject) => {
                const transaction = database.transaction(this.storeName, "readwrite");
                const store = transaction.objectStore(this.storeName);
                const request = store.clear();

                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(new Error("全データの削除に失敗しました。"));
            });
        } catch (error) {
            throw new Error(error.message || "全データの削除に失敗しました。");
        }
    }

    // ============================================================
    // 一覧・検索系
    // ============================================================

    /**
     * 保存されている全データのキー一覧を取得する。
     * @returns {Promise<string[]>} キーの配列
     */
    static async getAllKeys() {
        try {
            const database = await this.initialize();

            return new Promise((resolve, reject) => {
                const transaction = database.transaction(this.storeName, "readonly");
                const store = transaction.objectStore(this.storeName);
                // "action_history" を除くすべてのキーを取得
                const request = store.getAllKeys();

                request.onsuccess = () => {
                    const allKeys = request.result || [];
                    resolve(allKeys.filter(key => key !== "action_history"));
                };
                request.onerror = () => reject(new Error("キー一覧の取得に失敗しました。"));
            });
        } catch (error) {
            throw new Error(error.message || "キー一覧の取得に失敗しました。");
        }
    }

    /**
     * 全データを { id, data, updatedAt } の配列で取得する。
     * @returns {Promise<Array<{id: string, data: any, updatedAt: string}>>}
     */
    static async getAllData() {
        try {
            const database = await this.initialize();

            return new Promise((resolve, reject) => {
                const transaction = database.transaction(this.storeName, "readonly");
                const store = transaction.objectStore(this.storeName);
                const request = store.getAll();

                request.onsuccess = () => {
                    const allData = request.result || [];
                    // "action_history" を除く
                    resolve(allData.filter(item => item.id !== "action_history"));
                };
                request.onerror = () => reject(new Error("全データの取得に失敗しました。"));
            });
        } catch (error) {
            throw new Error(error.message || "全データの取得に失敗しました。");
        }
    }

    /**
     * IndexedDB に保存されているアクション履歴を取得する。
     * @returns {Promise<Array<{taskId: string, subtaskId: string, action: string, timestamp: string}>>}
     */
    static async getHistory() {
        try {
            const database = await this.initialize();

            return new Promise((resolve, reject) => {
                const transaction = database.transaction(this.storeName, "readonly");
                const store = transaction.objectStore(this.storeName);
                const request = store.get("action_history");

                request.onsuccess = () => resolve(request.result?.data || []);
                request.onerror = () => reject(new Error("履歴の取得に失敗しました。"));
            });
        } catch (error) {
            throw new Error(error.message || "履歴の取得に失敗しました。");
        }
    }

    /**
     * 保存データの件数を取得する。
     * @returns {Promise<number>}
     */
    static async getDataCount() {
        try {
            const database = await this.initialize();

            return new Promise((resolve, reject) => {
                const transaction = database.transaction(this.storeName, "readonly");
                const store = transaction.objectStore(this.storeName);
                const request = store.count();

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(new Error("データ件数の取得に失敗しました。"));
            });
        } catch (error) {
            throw new Error(error.message || "データ件数の取得に失敗しました。");
        }
    }

    /**
     * 特定キーのデータが存在するか確認する。
     * @param {string} key
     * @returns {Promise<boolean>}
     */
    static async dataExists(key) {
        try {
            const keys = await this.getAllKeys();
            return keys.includes(key);
        } catch (error) {
            console.error("[AppStorage] dataExists failed:", error);
            return false;
        }
    }

    // ============================================================
    // 一括操作系
    // ============================================================

    /**
     * 複数データを一括保存する。
     * @param {Array<{key: string, value: any}>} items
     * @returns {Promise<void>}
     */
    static async saveMultipleGuestData(items) {
        if (!Array.isArray(items) || items.length === 0) {
            return;
        }

        try {
            const database = await this.initialize();

            return new Promise((resolve, reject) => {
                const transaction = database.transaction(this.storeName, "readwrite");
                const store = transaction.objectStore(this.storeName);

                let completed = 0;
                const total = items.length;

                for (const item of items) {
                    const payload = {
                        id: item.key,
                        data: item.value,
                        updatedAt: new Date().toISOString(),
                    };

                    const request = store.put(payload);

                    request.onsuccess = () => {
                        completed++;
                        if (completed >= total) {
                            resolve();
                        }
                    };

                    request.onerror = () => {
                        reject(new Error(`データの一括保存に失敗しました: ${item.key}`));
                    };
                }
            });
        } catch (error) {
            throw new Error(error.message || "データの一括保存に失敗しました。");
        }
    }

    /**
     * 複数データを一括削除する。
     * @param {string[]} keys - 削除するキーの配列
     * @returns {Promise<void>}
     */
    static async deleteMultipleGuestData(keys) {
        if (!Array.isArray(keys) || keys.length === 0) {
            return;
        }

        try {
            const database = await this.initialize();

            return new Promise((resolve, reject) => {
                const transaction = database.transaction(this.storeName, "readwrite");
                const store = transaction.objectStore(this.storeName);

                let completed = 0;
                const total = keys.length;

                for (const key of keys) {
                    const request = store.delete(key);

                    request.onsuccess = () => {
                        completed++;
                        if (completed >= total) {
                            resolve();
                        }
                    };

                    request.onerror = () => {
                        reject(new Error(`データの一括削除に失敗しました: ${key}`));
                    };
                }
            });
        } catch (error) {
            throw new Error(error.message || "データの一括削除に失敗しました。");
        }
    }

    // ============================================================
    // データ移行・管理系
    // ============================================================

    /**
     * 全データを JSON シリアライズしてエクスポートする。
     * ログイン後のサーバー同期準備に使用する。
     * @returns {Promise<string>} JSON 文字列
     */
    static async exportAllData() {
        try {
            const allData = await this.getAllData();
            return JSON.stringify(allData, null, 2);
        } catch (error) {
            throw new Error(error.message || "データのエクスポートに失敗しました。");
        }
    }

    /**
     * JSON 文字列からデータをインポートする。
     * サーバーから取得したデータをローカルに復元する場合などに使用する。
     * @param {string} jsonString - exportAllData() で出力された JSON 文字列
     * @returns {Promise<void>}
     */
    static async importData(jsonString) {
        try {
            const items = JSON.parse(jsonString);

            if (!Array.isArray(items)) {
                throw new Error("インポートデータの形式が正しくありません。配列が必要です。");
            }

            const database = await this.initialize();

            return new Promise((resolve, reject) => {
                const transaction = database.transaction(this.storeName, "readwrite");
                const store = transaction.objectStore(this.storeName);

                let completed = 0;
                const total = items.length;

                for (const item of items) {
                    // id と data は必須、updatedAt はなければ現在時刻
                    if (!item || !item.id) {
                        completed++;
                        if (completed >= total) resolve();
                        continue;
                    }

                    const payload = {
                        id: item.id,
                        data: item.data,
                        updatedAt: item.updatedAt || new Date().toISOString(),
                    };

                    const request = store.put(payload);

                    request.onsuccess = () => {
                        completed++;
                        if (completed >= total) resolve();
                    };

                    request.onerror = () => {
                        reject(new Error(`データのインポートに失敗しました: ${item.id}`));
                    };
                }
            });
        } catch (error) {
            throw new Error(error.message || "データのインポートに失敗しました。");
        }
    }

    /**
     * 保存データの概要情報を返す。
     * @returns {Promise<{count: number, keys: string[], latestUpdate: string|null}>}
     */
    static async getStorageInfo() {
        try {
            const allData = await this.getAllData();

            const keys = allData.map((item) => item.id);
            const timestamps = allData
                .map((item) => item.updatedAt)
                .filter(Boolean)
                .sort()
                .reverse();

            return {
                count: allData.length,
                keys,
                latestUpdate: timestamps.length > 0 ? timestamps[0] : null,
            };
        } catch (error) {
            console.error("[AppStorage] getStorageInfo failed:", error);
            return { count: 0, keys: [], latestUpdate: null };
        }
    }

    /**
     * アクション履歴を保存する。
     * @param {string} taskId
     * @param {string} subtaskId
     * @param {string} action
     */
    static async saveHistory(taskId, subtaskId, action) {
        try {
            const database = await this.initialize();
            return new Promise((resolve, reject) => {
                const transaction = database.transaction(this.storeName, "readwrite");
                const store = transaction.objectStore(this.storeName);

                // 既存の履歴を取得するか、新規作成
                const historyKey = "action_history";
                const request = store.get(historyKey);

                request.onsuccess = () => {
                    const data = request.result ? request.result.data : [];
                    data.push({ taskId, subtaskId, action, timestamp: new Date().toISOString() });

                    const updateRequest = store.put({ id: historyKey, data: data, updatedAt: new Date().toISOString() });
                    updateRequest.onsuccess = () => resolve();
                    updateRequest.onerror = () => reject(new Error("履歴の保存に失敗しました。"));
                };
                request.onerror = () => reject(new Error("履歴の取得に失敗しました。"));
            });
        } catch (error) {
            throw new Error(error.message || "履歴の保存に失敗しました。");
        }
    }
}

