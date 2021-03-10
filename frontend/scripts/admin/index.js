'use strict';

import { SERVER_URL } from '../serverUrl.js';
const PATH_EDIT = '/COMP4537/assignments/1/quiz/html/admin/edit.html';

const BTN = 'btn';
const BTN_PRIMARY = 'btn-primary';
const BTN_QUIZ = 'btn-quiz'

const ID_QUIZ_NAME = 'quiz-name';
const ID_BTN_CREATE_QUIZ = 'btn-create-quiz';
const ID_QUIZ_LIST = 'quiz-list';

const WARN_EMPTY_NAME = 'Quiz name cannot be blank';
const WARN_UNIQUE_NAME = 'Quiz name must be unique';

/**
 * Fetches all the quizes
 */
const fetchQuizzes = () => {
	const req = new XMLHttpRequest();

	req.open('GET', SERVER_URL + '/quizzes', true);
	req.send();
	req.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			buildQuizList(JSON.parse(this.response));
		}
	}
}

/**
 * Renders the list of quizzes as buttons that lead to their edit page.
 * 
 * @param {Object} quizArray the array of quizzes 
 */
const buildQuizList = (quizArray) => {
	const quizList = document.getElementById(ID_QUIZ_LIST);

	while(quizList.hasChildNodes()) {
		quizList.removeChild(quizList.lastChild);
	}

	quizArray.forEach(quiz => {

		const button = document.createElement('BUTTON');
		button.id = quiz.quizId;
		button.textContent = quiz.name;
		button.classList.add(BTN, BTN_PRIMARY, BTN_QUIZ);

		// Changes the URL
		button.addEventListener('click', () => {
			const url = new URL(window.location);
			url.pathname = PATH_EDIT;
			url.search = `quizId=${quiz.quizId}`;
			window.location.href = url;
		});

		quizList.appendChild(button);
	});
}

/**
 * Creates a new quiz with the name given.
 * Quiz name must be unique and not blank.
 * 
 * @returns early if something does not validate
 */
const makeNewQuiz = () => {

	const quizName = document.getElementById(ID_QUIZ_NAME).value.trim();

	if (!quizName) {
		alert(WARN_EMPTY_NAME);
		return;
	}
	else if (!checkUniqueQuizName(quizName)) {
		alert(WARN_UNIQUE_NAME);
		return;
	}
	else {
		const req = new XMLHttpRequest();

		req.open('POST', SERVER_URL + '/admin/quizzes', true);
		req.setRequestHeader('Content-Type', 'text/text');
		req.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				fetchQuizzes();
				document.getElementById(ID_QUIZ_NAME).value = '';
			}
			else if (this.status == 400) {
				alert(this.statusText);
			}
		}
	
		req.send(quizName);
	}
}

/**
 * Checks if a quiz already has the same name within the page.
 * 
 * @param {String} quizName 
 * @returns true if name is unique, otherwise false
 */
const checkUniqueQuizName = (quizName) => {
	const quizzes = document.getElementById(ID_QUIZ_LIST).children;

	for (const i of quizzes) {
		if (i.innerText.trim() === quizName) return false;
	}
	return true;
}

/**
 * Initializes the page.
 */
const init = () => {
	document.getElementById(ID_BTN_CREATE_QUIZ).addEventListener('click', () => makeNewQuiz());

	fetchQuizzes();
}

init();