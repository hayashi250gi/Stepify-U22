import { AuthState } from "../auth/auth_state.js";

export function initLogoutModal() {
    const modal = document.getElementById("logout-modal");
    const confirmBtn = document.getElementById("confirm-logout-btn");
    const cancelBtn = document.getElementById("cancel-logout-btn");

    if (!modal) return;

    confirmBtn.addEventListener("click", () => {
        AuthState.clearAuthState();
        window.location.href = "/pages/login.html";
    });

    cancelBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });
}

export function showLogoutModal() {
    const modal = document.getElementById("logout-modal");
    if (modal) modal.style.display = "flex";
}
