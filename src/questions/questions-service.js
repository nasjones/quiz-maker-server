const questionService = {
    getAllQuestions(knex) {
        return knex.select('*').from('questions')
    },
    getById(knex, id) {
        return knex.select('*').from('questions').where('id', id)
    },
    getByQuizId(knex, id) {
        return knex.select('*').from('questions').where('quiz_id', id)
    },
    insertQuestion(knex, newQuestion) {
        return knex.insert(newQuestion)
            .into('questions')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    }
}

module.exports = questionService