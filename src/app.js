require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const app = express();
const QuizRouter = require("./quiz/quiz-router");
const QuestionRouter = require("./questions/questions-router");
const validate = require("./validate-bearer-token");

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(cors());
app.use(morgan(morganOption));
app.use(helmet());
app.use(validate);
app.use("/api/quiz", QuizRouter);
app.use("/api/questions", QuestionRouter);

app.use(function errorHandler(error, req, res, next) {
	let response;
	if (NODE_ENV === "production") {
		response = { error: { message: "server error" } };
	} else {
		console.error(error);
		response = { message: error.message, error };
	}
	res.status(500).json(response);
});

app.use(cors());

module.exports = app;
