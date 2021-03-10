'use strict';

const express = require('express');
const mysql = require('mysql');

const app = express();

const ERROR_CREATING_QUESTION = 'Error creating question';
const ERROR_GETTING_QUIZZES = 'Error fetching quizzes';
const ERROR_GETTING_QUESTIONS = 'Error fetching questions';
const ERROR_GETTING_CHOICES = 'Error fetching choices';
const ERROR_UPDATE = 'Error updating questions';
const ERROR_CREATING_QUIZ = 'Error making quiz';
const ERROR_POST_LEADERBOARD = 'Error posting to leaderboard';
const ERROR_GETTING_SCORES ='Error getting scores';

const SUCCESS_CREATING_QUESTION = 'Successfully created question!';
const SUCCESS_UPDATE = 'Successfully changed the question!'

/**
 * Sets the headers for all the quizzes
 */
app.all('*', (req, res, next) => {

	res.set('Access-Control-Allow-Origin', '*');
	res.set('Access-Control-Allow-Methods', 'GET,POST,PUT');
	res.set('Access-Control-Allow-Headers', 'Content-Type');

	if ('OPTIONS' == req.method) return res.sendStatus(200);

	next();
});

const PORT = process.env.PORT || 8000;

// Please don't spam my database :)
const pool = mysql.createPool({
	host: 'REMOVED',
	user: 'REMOVED',
	password: 'REMOVED',
	database: 'REMOVED',
	multipleStatements: true
});

/**
 * Used to create a new quiz
 */
 app.post('/admin/quizzes', (req, res) => {
	
	let quizName = '';

	// Get the data from the POST request
	req.on('data', data => {
		quizName += data;
	});

	req.on('end', () => {
		
		let quizQuery = 'INSERT INTO quiz (name) VALUES (?)'
		pool.query(quizQuery, [quizName], (err, results) => {
			if (err) {
				console.error(err);
				res.set(400).send(ERROR_CREATING_QUIZ);
				return;
			}

			res.end();
		});
	});

});

/**
 * Returns all quizzes
 */
app.get('/quizzes', (req, res) => {

	pool.query('SELECT * FROM quiz', (err, results) => {
		if (err) {
			console.error(err);
			res.set(400).send(ERROR_GETTING_QUIZZES);
			return;
		}

		const quizArr = [];
		results.forEach(e => {
			quizArr.push({
				quizId: e.quizId,
				name: e.name
			});
		});

		res.set('Content-Type', 'application/json');
		res.end(JSON.stringify(quizArr));
	});
});

/**
 * Used to get the questions for a specific quiz 
 */ 
app.get('/admin/quizzes/:quizId/questions', (req, res) => {

	const quizQuery = `SELECT name FROM quiz WHERE quizId=${req.params.quizId}`
	const questionsQuery = `SELECT questionId,questionBody,answer FROM question WHERE quizId=${req.params.quizId}`

	pool.query(quizQuery + ';' + questionsQuery, (err, results) => {
		if (err) {
			console.error(err);
			res.set(400).send(ERROR_GETTING_QUESTIONS);
			return;
		}
		
		const questionArr = [];

		results[1].forEach(e => {
			questionArr.push({
				questionId: e.questionId,
				questionBody: e.questionBody,
				answer: e.answer
			});
		});

		res.set('Content-Type', 'application/json');
		// Return quiz name and the questions for this quiz
		res.end(JSON.stringify({quizName: results[0][0].name, questionArr: questionArr}));
	});
});

/**
 * Used to get the choices for a specific quiz
 */
app.get('/admin/quizzes/:quizId/choices', (req, res) => {

	const q = `SELECT qu.questionId,c.choiceId,c.choiceBody,c.choice ` +
		`FROM quiz q JOIN question qu ON q.quizId=qu.quizId JOIN choice c ON qu.questionId=c.questionId ` +
		`WHERE q.quizId=${req.params.quizId} ORDER BY qu.questionId`;

	pool.query(q, (err, results) => {
		if (err) {
			console.error(err);
			res.set(400).send(ERROR_GETTING_CHOICES);
			return;
		}

		res.set('Content-Type', 'application/json');
		res.send(JSON.stringify(results));
	});
});

/**
 * Insert a new question to the database
 */
app.post('/admin/quizzes/:quizId', (req, res) => {

	let body = '';

	// Get the data from the POST request
	req.on('data', data => {
		body += data;
	});

	// Once body has been read, parse the JSON and send the SQL query
	req.on('end', () => {
		const question = JSON.parse(body);

		const questionQuery = `INSERT INTO question (quizId,questionBody,answer) VALUES (?, ?, ?)`

		pool.query(questionQuery, [req.params.quizId, question.questionBody, question.answer], (err, results) => {
			if (err) {
				console.error(err);
				res.set(400).send(ERROR_CREATING_QUESTION);
				return;
			}

			let choicesQuery = 'INSERT INTO choice (questionId,choiceBody,choice) VALUES ';

			// Build the choices query
			for (let i = 0; i < question.choices.length; i++) {
				choicesQuery += `(${results.insertId},'${question.choices[i].choiceBody}','${question.choices[i].choice}')`;
	
				if (i !== question.choices.length - 1) {
					choicesQuery += ',';
				}
			}

			pool.query(choicesQuery, (err, results) => {
				if (err) {
					console.error(err);
					res.set(400).send(ERROR_CREATING_QUESTION);
					return;
				}
				res.set('Content-Type', 'text/text');
				res.send('Success!');
			});
		});
	});
});

/**
 * Updates the question.
 */
app.put('/admin/question/:questionId', (req, res) => {

	let body = '';
	req.on('data', data => {
		body += data;
	});

	req.on('end', () => {
		const question = JSON.parse(body);

		const questionQuery = `UPDATE question SET questionBody=?,answer=? WHERE questionId=?`;

		// Updates the question body in the question table
		pool.query(questionQuery, [question.questionBody, question.answer, question.questionId], (err, results) => {
			if (err) {
				console.error(err);
				res.set(400).send(ERROR_UPDATE);
				return;
			}
			
			// Updates all the choices in the choice table
			for (let i = 0; i < question.choices.length; ++i) {
				const c = question.choices[i]; 
				const choiceQuery = `UPDATE choice SET choiceBody=?,choice=? WHERE choiceId=?`;
				pool.query(choiceQuery, [c.choiceBody, c.choice, c.choiceId], (err, results) => {
					if (err) {
						console.error(err);
						res.set(400).send(ERROR_UPDATE);
						return;
					}

					if (i === question.choices.length - 1) {
						res.send(SUCCESS_UPDATE);
					}
				});	
			}
		});
	});
});

/**
 * Stores a user's score in the database.
 */
app.post('/leaderboard/:quizId/:user', (req, res) => {
	
	let body = '';
	req.on('data', data => {
		body += data;
	});

	req.on('end', () => {

		pool.query(`INSERT INTO leaderboard (studentName,score,quizId) VALUES ('${req.params.user}',${body},${req.params.quizId})`, (err, results) => {
			if (err) {
				console.error(err);
				res.set(400).send(ERROR_POST_LEADERBOARD);
				return;
			}

			res.status(200).send();
		});
	});
});

/**
 * Fetches the top 10 scores from the database for a quiz.
 */
app.get('/quizzes/:quizId/scores', (req,res) => {

	const scoreQuery = 'SELECT l.studentName,l.score ' + 
	'FROM quiz q JOIN leaderboard l ON q.quizId=l.quizId ' + 
	`WHERE q.quizId=${req.params.quizId} ` +
	'ORDER BY l.score DESC ' +
	'LIMIT 10';

	pool.query(scoreQuery, (err, results) => {
		if (err) {
			console.error(err);
			res.set(400).send(ERROR_GETTING_SCORES);
			return;
		}

		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify(results));
	});
});

// Start the server
app.listen(PORT, () => {
	console.log("Listening on port " + PORT);
});