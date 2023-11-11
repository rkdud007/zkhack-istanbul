module.exports = {
    env: {
        DEVELOPMENT_API_URL: "http://localhost:5001",
        PRODUCTION_API_URL: "https://admin@zonke.rs:5001",
        ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID,
        ALGOLIA_PUBLIC_API_KEY: process.env.ALGOLIA_PUBLIC_API_KEY,
    },
};
