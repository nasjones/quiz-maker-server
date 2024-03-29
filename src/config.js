module.exports = {
	PORT: process.env.PORT || 8000,
	NODE_ENV: process.env.NODE_ENV || "development",
	DATABASE_URL:
		process.env.DATABASE_URL || "postgresql://grape@localhost/quiztest",
	API_KEY: process.env.API_KEY,
	dialectOptions: {
		ssl: {
			rejectUnauthorized: false,
		},
	},
};
