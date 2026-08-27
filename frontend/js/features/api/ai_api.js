// ===================================================
// ファイル名: ai_api.js
// 最終更新日: 2026/08/27
// 作成者: 林健太
// 概要: AI関連APIへのリクエストを提供するモジュール
// ===================================================

import { ApiClient } from "./api_client.js";

export class AiApi {

    /**
     * タスクをAIで分解する
     *
     * @param {string} taskTitle
     * @param {string} taskDetail
     * @returns {Promise<Object>}
     */
    static async decomposeTask(taskTitle, taskDetail = "") {
        return ApiClient.post("/api/ai/decompose", {
            task_title: taskTitle,
            task_detail: taskDetail,
        });
    }

}
