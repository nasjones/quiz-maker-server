const quizService = {
    getAllQuizzes(knex) {
        return knex.select('*').from('quiz')
    },
    getAllPublicQuizzes(knex) {
        return knex.select('*').from('quiz').where('private', false)
    },
    getByUniqueId(knex, key) {
        return knex.select('*').from('quiz').where('unique_key', key).first()
    },
    insertQuiz(knex, newQuiz) {
        return knex.insert(newQuiz)
            .into('quiz')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    }
}

module.exports = quizService