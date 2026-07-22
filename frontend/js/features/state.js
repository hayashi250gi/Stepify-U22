export const appState = {
    currentTaskTitle: "",
    currentTaskDetail: "",
    decompositionResult: [],

    reset() {
        this.currentTaskTitle = "";
        this.currentTaskDetail = "";
        this.decompositionResult = [];
    }
};
