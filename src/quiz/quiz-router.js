const path = require('path')
const express = require('express')
const xss = require('xss')
const logger = require('../logger')
const QuizService = require('./quiz-service')

const quizRouter = express.Router()
const bodyParser = express.json()

const serializeQuiz = quiz => ({
    id: quiz.id,
    unique_key: xss(quiz.unique_key),
    title: xss(quiz.title),
    description: xss(quiz.description),
    private: quiz.private
})

quizRouter.route('/')
    .get((req, res, next) => {
        QuizService.getAllPublicQuizzes(req.app.get('db'))
            .then(quiz => {
                res.json(quiz.map(serializeQuiz))
            })
            .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        const { title, description, private } = req.body
        const newQuiz = {
            title,
            description,
            private
        }

        for (const field of ['title', 'description']) {
            if (!newQuiz[field]) {
                logger.error(`'${field}' is required`)
                return res.status(400).send({
                    error: { message: `'${field}' is required` }
                })
            }
        }

        QuizService.insertQuiz(req.app.get('db'), newQuiz)
            .then(quiz => {
                logger.info(`quiz with id ${quiz.id} created`)
                res.status(201)
                    .location(path.posix.join(req.originalUrl, `${quiz.id}`))
                    .json(serializeQuiz(quiz))
            })
            .catch(next)
    })

quizRouter.route('/key/:unique_key')
    .all((req, res, next) => {
        const { unique_key } = req.params

        QuizService.getByUniqueId(req.app.get('db'), unique_key)
            .then(quiz => {
                if (!quiz) {
                    logger.error(`quiz with key ${unique_key} does not exist`)
                    return res.status(400).send({
                        error: { message: `quiz with key ${unique_key} does not exist` }
                    })
                }
                res.quiz = quiz
                next()
            })
            .catch(next)
    })
    .get((req, res) => {
        res.json(serializeQuiz(res.quiz))
    })

module.exports = quizRouter