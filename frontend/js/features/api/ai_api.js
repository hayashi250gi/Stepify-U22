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
