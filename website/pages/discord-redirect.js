import Router from "next/router";
import { useEffect, useState } from "react";
import discordVerify from "../apix/discord/discordVerify";

export default function DiscordRedirect() {
    const [loading, setLoading] = useState();
    const [error, setError] = useState();

    useEffect(() => {
        const fragment = new URLSearchParams(window.location.hash.slice(1));
        const [accessToken, tokenType] = [fragment.get("access_token"), fragment.get("token_type")];

        if (!accessToken) {
            setError("Discord verification failed")
        }

        setLoading(true);

        discordVerify(tokenType, accessToken, (response) => {
            setLoading(false);
            if (response.submitError) {
                setError("Discord verification failed");
            } else {
                Router.push(`/`);
            }
        });
    }, []);

    return (
        <h1>
            {loading && <p className="discord-redirect-loading-message">Loading...</p>}
            {error && <p className="discord-redirect-error-message">Discord verification failed</p>}
        </h1>
    );
}
