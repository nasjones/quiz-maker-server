const path = require('path')
const express = require('express')
const xss = require('xss')
const logger = require('../logger')
const QuestionsService = require('./questions-service')


const questionsRouter = express.Router()
const bodyParser = express.json()

const serializeQuestion = question => ({
    id: question.id,
    quiz_id: question.quiz_id,
    question: xss(question.question),
    answers: arrayXSS(question.answers),
    correct: xss(question.correct)
})

arrayXSS = (arr) => {
    for (let i = 0; i < arr.length; i++)
        arr[i] = xss(arr[i])
    return arr
}

questionsRouter.route('/')
    .get((req, res, next) => {
        QuestionsService.getAllQuestions(req.app.get('db'))
            .then(questions => {
                res.json(questions.map(serializeQuestion))
            })
            .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        const { quiz_id, question, answers, correct } = req.body
        const newQuestion = {
            quiz_id,
            question,
            answers,
            correct
        }

        for (const field of ['quiz_id', 'question', 'answers', 'correct']) {
            if (!newQuestion[field]) {
                logger.error(`${field} is required`)
                return res.status(400).send({
                    error: { message: `'${field}' is required` }
                })

            }
        }

        QuestionsService.insertQuestion(req.app.get('db'), newQuestion)
            .then(question => {
                logger.info(`question with id ${question.id} created`)
                res.status(201)
                    .location(path.posix.join(req.originalUrl, `${question.id}`))
                    .json(serializeQuestion(question))
            })
            .catch(next)

    })

// questionsRouter.route('/:questionId')
//     .all((req, res, next) => {
//         const { questionId } = req.params
//         QuestionsService.getById(req.app.get('db'), questionId)
//             .then(question => {
//                 if (!question) {
//                     logger.error(`question with id ${questionId} not found.`)
//                     return res.status(400).send({
//                         error: { message: `question with id ${questionId} not found.` }
//                     })
//                 }
//                 res.question = question
//                 next()
//             })
//             .catch(next)
//     })
//     .get((req, res) => {
//         res.json(serializeQuestion(res.question))
//     })

questionsRouter.route('/quiz/:quiz_id')
    .all((req, res, next) => {
        const { quiz_id } = req.params
        QuestionsService.getByQuizId(req.app.get('db'), quiz_id)
            .then(question => {
                if (!question) {
                    logger.error(`question with quiz_id ${quiz_id} not found.`)
                    return res.status(400).send({
                        error: { message: `question with quiz_id ${quiz_id} not found.` }
                    })
                }
                for (let i = 0; i < question.length; i++)
                    question[i] = serializeQuestion(question[i])
                res.question = question
                next()
            })
            .catch(next)
    })
    .get((req, res) => {
        res.json(res.question)
    })

module.exports = questionsRouter