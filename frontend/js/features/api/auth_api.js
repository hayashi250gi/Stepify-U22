

export class AuthApi {

    /**
     * Googleでログインする
     */
    static async loginWithGoogle(idToken) {

        const response = await fetch("/api/auth/google", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id_token: idToken
            })
        });

        if (!response.ok) {

            const error = await response.json();

            throw new Error(error.message);

        }

        return await response.json();

    }

}