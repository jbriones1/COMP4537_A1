'use strict';

import { SERVER_URL } from './serverUrl.js';

const ID_QUIZ_LIST = 'quiz-list';
const ID_LEADERBOARD = 'leaderboard';

const CLASS_LIST_GROUP_ITEM = 'list-group-item';
const CLASS_SCORE = 'score';

/**
 * Fetches all the quizes
 */
 const fetchQuizzes = () => {
	const req = new XMLHttpRequest();

	req.open('GET', SERVER_URL + '/quizzes', true);
	req.send();
	req.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			buildQuizList(JSON.parse(this.responseText));
		}
	}
}

/**
 * Fetches all scores for the quiz specified in the dropdown.
 */
const fetchScores = () => {
	
	const quizId = document.getElementById(ID_QUIZ_LIST).value;

	const req = new XMLHttpRequest();

	req.open('GET', SERVER_URL + `/quizzes/${quizId}/scores`, true);
	req.send();
	req.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			buildScoreList(JSON.parse(this.responseText));
		}
	}
}

/**
 * Renders the list of quizzes in a dropdown menu.
 * 
 * @param {Object} quizArray the array of quizzes 
 */
 const buildQuizList = (quizArray) => {
	const quizList = document.getElementById(ID_QUIZ_LIST);

	while(quizList.children.length > 1) {
		quizList.removeChild(quizList.lastChild);
	}

	quizArray.forEach(quiz => {

		const option = document.createElement('OPTION');
		option.textContent = quiz.name;
		option.value = quiz.quizId;

		quizList.appendChild(option);
	});
}

/**
 * Renders the users and their scores for the particular quiz
 * 
 * @param {Object} scoresArray array of users and their scores
 */
const buildScoreList = (scoresArray) => {

	const leaderboard = document.getElementById(ID_LEADERBOARD);

	while(leaderboard.hasChildNodes()) {
		leaderboard.removeChild(leaderboard.lastChild);
	}
	
	scoresArray.forEach(s => {
		
		const li = document.createElement('LI');
		li.classList.add(CLASS_LIST_GROUP_ITEM);

		const user = document.createElement('SPAN');
		user.innerText = s.studentName;

		const score = document.createElement('SPAN');
		score.classList.add(CLASS_SCORE);
		score.innerText = s.score + '%';

		li.append(user, score);
		leaderboard.appendChild(li);
	});
}

const init = () => {

	document.getElementById(ID_QUIZ_LIST).onchange = fetchScores;

	fetchQuizzes();
}

init();