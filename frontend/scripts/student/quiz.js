'use strict';

import { SERVER_URL } from '../serverUrl.js';
const PATH_LEADERBOARD = '/COMP4537/assignments/1/quiz/html/leaderboard.html'

const ID_QUESTION_LIST = 'question-list';
const ID_QUIZ_NAME = 'quiz-name';
const ID_NO_QUESTIONS = 'no-questions';
const ID_BTN_SUBMIT = 'btn-submit';

const CLASS_HIDDEN = 'hidden';
const CLASS_QUESTION_BACKGROUND = 'question-background';

const GOOD_LUCK = 'Good luck';

const DECIMAL_LIMIT = 2;

let USER;
let QUIZ_ID;

/**
 * Builds the page based on the quiz question and choices.
 * 
 * @param {String} quizName name of the quiz
 * @param {Object} questionList array list of quiz questions
 * @param {Object} choiceArr array of question choices 
 */
const buildPage = (quizName, questionArr, choiceArr) => {
	
	const quizNameText = document.getElementById(ID_QUIZ_NAME);
	const noQuestions = document.getElementById(ID_NO_QUESTIONS);
	const questionList = document.getElementById(ID_QUESTION_LIST);

	// Set the quiz name
	quizNameText.innerText = quizName;

	// Hide the class if there are questions
	if (questionArr.length > 0) {

		noQuestions.innerText = GOOD_LUCK + ', ' + USER;
	}

	const groupedChoiceArr = groupBy(choiceArr, 'questionId');

	// Questions
	questionArr.forEach(q => {
		const questionChoices = groupedChoiceArr[q.questionId];
		
		const questionBody = document.createElement('H4');
		questionBody.innerHTML = q.questionBody.replace(/(\r\n|\n|\r)/gm, "<br>");;

		const background = document.createElement('DIV');
		background.classList.add(CLASS_QUESTION_BACKGROUND);
		background.appendChild(questionBody);

		// Question choices
		questionChoices.forEach(c => {
			const radio = document.createElement('INPUT');
			radio.name = q.questionId;
			radio.type = 'radio';
			
			const label = document.createElement('LABEL');
			label.innerText = c.choiceBody;
			
			const wrapper = document.createElement('DIV');
			wrapper.append(radio, label);

			background.appendChild(wrapper);
		});

		questionList.appendChild(background);
	});
}

/**
 * Extracts the correct answers from the question array.
 * 
 * @param {Object} questionArr array of question objects
 * @returns an array of the correct answers, in order
 */
const getAnswers = (questionArr) => {

	const answers = [];

	questionArr.forEach(q => {
		answers.push({
			questionId: q.questionId,
			answer: q.answer
		});
	});

	return answers;
}

/**
 * Calculates the score of the user and send it to the database.
 * 
 * @param {Object} correctAnswers the array of correct answers, in order
 */
const submitAnswers = (correctAnswers) => {
	
	const score = calculateScore(correctAnswers);

	alert('Score: ' + score + '%');

	// Send score to the database
	const req = new XMLHttpRequest();
	req.open('POST', SERVER_URL + `/leaderboard/${QUIZ_ID}/${USER}`);
	req.setRequestHeader('Content-Type', 'text/text');

	req.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			const url = new URL(window.location);
			url.pathname = PATH_LEADERBOARD;
			url.search = '';
			window.location.href = url;
		}
	}

	req.send(score);
}

/**
 * Calculates the score based on the answers given. Blank answers do not give any score.
 * 
 * @param {Object} correctAnswers the array of correct answers
 * @returns score as a percentage to two decimal places
 */
const calculateScore = (correctAnswers) => {
	const choicesArr = ['A', 'B', 'C', 'D'];
	let score = 0;

	correctAnswers.forEach(a => {
		const radios = document.getElementsByName(a.questionId);
		
		for (let i = 0; i < radios.length; ++i) {
			if (radios[i].checked && choicesArr[i] === a.answer) {
				++score;
				break;
			}
		}
	});

	return (score / correctAnswers.length * 100).toFixed(DECIMAL_LIMIT);
}

/**
 * Groups an array of objects by the key specified
 * 
 * @param {Object} data: array of objects to group
 * @param {String} key: key to group them by
 * @returns 
 */
 const groupBy = (data, key) => {
	return data.reduce((accumulator, item) => {

		const group = item[key];
		
		// This version removes the key from the object
		delete item[key]
		accumulator[group] = accumulator[group] || [];
		accumulator[group].push(item);

		return accumulator;
	}, {});
}

/**
 * Fetches the quiz questions and choices from the server
 */
 const fetchQuizzes = () => {
	const clientUrl = new URL(window.location);
	
	const req = new XMLHttpRequest();
	// First request gets the questions
	req.open('GET', SERVER_URL + `/admin/quizzes/${clientUrl.searchParams.get('quizId')}/questions`, true);
	req.send();
	req.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			const questions = JSON.parse(this.responseText);

			// Second request gets the choices
			req.open('GET', SERVER_URL + `/admin/quizzes/${clientUrl.searchParams.get('quizId')}/choices`, true);
			req.send();
			req.onreadystatechange = function () {
				if (this.readyState == 4 && this.status == 200) {
					buildPage(questions.quizName, questions.questionArr, JSON.parse(this.responseText));
					const answers = getAnswers(questions.questionArr);
					document.getElementById(ID_BTN_SUBMIT).addEventListener('click', () => submitAnswers(answers));
				}
			}
		}
	}
}

/**
 * Initializes the page
 */
const init = () => {
	const clientUrl = new URL(window.location);
	USER = clientUrl.searchParams.get('user');
	QUIZ_ID = clientUrl.searchParams.get('quizId');
	fetchQuizzes();
}

init();