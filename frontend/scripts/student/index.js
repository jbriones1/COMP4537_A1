'use strict';

import { SERVER_URL } from '../serverUrl.js';
const PATH_QUIZ = '/COMP4537/assignments/1/quiz/html/student/quiz.html';

const ID_QUIZ_LIST = 'quiz-list';

const BTN = 'btn';
const BTN_PRIMARY = 'btn-primary';
const BTN_QUIZ = 'btn-quiz'

const PROMPT_USERNAME = 'Enter a username';

const WARN_NO_USERNAME = 'User name cannot be blank';

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

			const user = prompt(PROMPT_USERNAME);

			if (!user || user.trim().length < 1) {
				alert(WARN_NO_USERNAME);
			}
			else {
				const url = new URL(window.location);
				url.pathname = PATH_QUIZ;
				url.search = `quizId=${quiz.quizId}&user=${user}`;
				window.location.href = url;
			}
		});

		quizList.appendChild(button);
	});
}

/**
 * Initializes the page.
 */
const init = () => {
	fetchQuizzes();
}

init();