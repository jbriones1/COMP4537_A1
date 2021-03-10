'use strict';

import { SERVER_URL } from '../serverUrl.js';

const CLASS_HIDDEN = 'hidden';
const CLASS_CHOICE = 'choice';
const CLASS_MAKER = 'maker';
const CLASS_CHOICES = 'choices';
const CLASS_QUESTION_BACKGROUND = 'question-background';

const ID_MAKER_CHOICES = 'maker-choices';
const ID_BTN_MAKER_VISIBILITY = 'btn-maker-visibility';
const ID_QUESTION_MAKER = 'question-maker';
const ID_BTN_REMOVE = 'btn-remove';
const ID_BTN_ADD = 'btn-add';
const ID_BTN_SUBMIT = 'btn-submit';
const ID_BTN_CLEAR = 'btn-clear';
const ID_QUESTION_BODY = 'question-body';
const ID_QUESTION_AREA = 'question-area';
const ID_NO_QUESTIONS ='no-questions'
const ID_QUIZ_NAME = 'quiz-name';

const NAME_ANSWER_RADIO = 'answer-radio';

const UPDATE_TEXT = 'Update';
const HIDE_BTN_TEXT = 'Hide';
const SHOW_BTN_TEXT = 'Show question maker';
const WARN_EMPTY_CHOICE = 'None of the choices can be blank';
const WARN_EMPTY_BODY = 'Question body can not be blank';
const WARN_NO_ANSWER = 'Correct answer must be chosen';

const CHOICES_MAX = 4; // maximum amount of choices
const CHOICES_MIN = 2; // minimum amount of choices

const BTN = 'btn';
const BTN_PRIMARY = 'btn-primary';
const BTN_WARNING = 'btn-warning';
const TEXT_FORM_CONTROL = 'form-control';

// Designates the letter for each answer
const CHOICES_ARR = ['A', 'B', 'C', 'D'];

let QUESTION_MAKER_VISIBLE = false;

/**
 * Toggles the question maker visibility.
 * 
 */
const toggleQuestionMaker = () => {

	const questionMakerChildren = document.getElementById(ID_QUESTION_MAKER).children;
	const toggleButton = document.getElementById(ID_BTN_MAKER_VISIBILITY);

	// Show question maker
	if (QUESTION_MAKER_VISIBLE) {
		toggleButton.innerHTML = HIDE_BTN_TEXT;
		for (let i = 1; i < questionMakerChildren.length; ++i) {
			questionMakerChildren[i].classList.remove(CLASS_HIDDEN);
		}
	}
	// Hide question maker
	else {
		for (let i = 1; i < questionMakerChildren.length; ++i) {
			questionMakerChildren[i].classList.add(CLASS_HIDDEN);
		}
		toggleButton.innerHTML = SHOW_BTN_TEXT;
	}

	QUESTION_MAKER_VISIBLE = !QUESTION_MAKER_VISIBLE;
}

/**
 * Adds another choice to the choice maker.
 */
const addChoice = () => {
	let choicesContainer = document.getElementById(ID_MAKER_CHOICES);
	let numberOfChoices = choicesContainer.children.length;

	if (numberOfChoices < CHOICES_MAX) {
		let radio = document.createElement('INPUT');
		radio.id = CHOICES_ARR[numberOfChoices];
		radio.type = 'radio';
		radio.name = NAME_ANSWER_RADIO;

		let text = document.createElement('INPUT');
		text.type = 'text';
		text.placeholder = CHOICES_ARR[numberOfChoices];
		text.classList.add(CLASS_CHOICE, CLASS_MAKER, TEXT_FORM_CONTROL);

		let choiceBox = document.createElement('DIV');
		choiceBox.append(radio, text);

		choicesContainer.appendChild(choiceBox);

		renderChoiceButtons();
	}
}

/**
 * Removes the last choice in the choice maker.
 */
const removeChoice = () => {
	let choicesContainer = document.getElementById(ID_MAKER_CHOICES);

	choicesContainer.children[choicesContainer.children.length - 1].remove();

	renderChoiceButtons();
}

/**
 * Checks if the add or remove choice buttons should be disabled.
 */
const renderChoiceButtons = () => {

	// Disables the add button when the max number of choices are shown
	if (document.getElementById(ID_MAKER_CHOICES).children.length >= CHOICES_MAX) {
		document.getElementById(ID_BTN_ADD).disabled = true;
	}
	else {
		document.getElementById(ID_BTN_ADD).disabled = false;
	}

	// Disables the remove button when the minimum number of choices are shown
	if (document.getElementById(ID_MAKER_CHOICES).children.length <= CHOICES_MIN) {
		document.getElementById(ID_BTN_REMOVE).disabled = true;
	}
	else {
		document.getElementById(ID_BTN_REMOVE).disabled = false;
	}
}

/**
 * Creates an object of the question and sends it to the server for storage.
 * 
 * @returns if something is not valid
 */
const submitQuestion = () => {

	const questionBody = getQuestionBody(ID_QUESTION_BODY);
	if (!questionBody) {
		alert(WARN_EMPTY_BODY);
		return;
	}

	const maker_choice = `.${CLASS_MAKER}.${CLASS_CHOICE}`;
	const choices = document.querySelectorAll(maker_choice);

	// Exit early if a choice isn't filled in
	const choiceArr = getChoices(maker_choice);
	if (choiceArr.length !== choices.length) {
		alert(WARN_EMPTY_CHOICE);
		return;
	}

	// Finds the correct radio choice
	const answer = getCorrectAnswer(NAME_ANSWER_RADIO);
	if (!answer) {
		alert(WARN_NO_ANSWER);
		return;
	}

	// Builds the question
	const question = {
		questionBody: questionBody,
		choices: choiceArr,
		answer: answer
	}

	// Send question to the database
	const clientUrl = new URL(window.location);
	const req = new XMLHttpRequest();
	req.open('POST', SERVER_URL + `/admin/quizzes/${clientUrl.searchParams.get('quizId')}`);
	req.setRequestHeader('Content-Type', 'application/json');


	req.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			clearQuestionMaker();
			alert(this.responseText);
			fetchQuizzes();
		}
	}

	req.send(JSON.stringify(question));
}

// Gets the body of the question, without whitespace
const getQuestionBody = (bodyId) => {
	return document.getElementById(bodyId).value.trim();
}

// Finds the correct answer from the radio boxes ticked
const getCorrectAnswer = (radioName) => {
	const radios = document.getElementsByName(radioName);

	let correctAnswer;

	for (let i = 0; i < radios.length; ++i) {
		if (radios[i].checked) {
			correctAnswer = CHOICES_ARR[i];
			break;
		}
	}

	return correctAnswer;
}

/**
 * Gets all the choices with the choice they are
 * 
 * @returns choices in an array of objects
 */
const getChoices = (choiceClass) => {
	const choices = document.querySelectorAll(`.${CLASS_MAKER}.${CLASS_CHOICE}`);

	const choiceArr = [];

	// Loop through and get every choice into an array
	// for (const choice of choices) {
	for (let i = 0; i < choices.length; ++i) {
		const c = choices[i].value.trim();
		if (!c) {
			break;
		}
		else {
			choiceArr.push({
				choice: CHOICES_ARR[i],
				choiceBody: c
			});
		}
	}

	return choiceArr;
}

/**
 * Clears the question marker
 */
const clearQuestionMaker = () => {

	// Clear question body
	document.getElementById(ID_QUESTION_BODY).value = '';

	// Clear choice inputs
	const choices = document.querySelectorAll(`.${CLASS_MAKER}.${CLASS_CHOICE}`);
	for (const choice of choices) {
		choice.value = '';
	}

	// Clear radio buttons
	const radios = document.getElementsByName(NAME_ANSWER_RADIO);
	for (const radio of radios) {
		if (radio.checked) {
			radio.checked = false;
			break;
		}
	}
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
				}
				else if (this.status == 400) {
					alert(this.responseText);
				}
			}
		}
	}
}

/**
 * Builds the page based on the quiz question and choices.
 * 
 * @param {String} quizName name of the quiz
 * @param {Object} questionList array list of quiz questions
 * @param {Object} choiceArr array of question choices 
 */
const buildPage = (quizName, questionList, choiceArr) => {
	const quizNameText = document.getElementById(ID_QUIZ_NAME);
	const questionArea = document.getElementById(ID_QUESTION_AREA);
	const noQuestions = document.getElementById(ID_NO_QUESTIONS);


	if (questionList.length > 0) {
		noQuestions.classList.add(CLASS_HIDDEN);
	}

	setQuizName(quizName);

	const groupedChoiceList = groupBy(choiceArr, 'questionId');
	
	while(questionArea.hasChildNodes()) {
		questionArea.removeChild(questionArea.lastChild);
	}

	questionList.forEach(q => {
		questionArea.append(buildQuestion(q, groupedChoiceList[q.questionId]));
	});
}

/**
 * Sets the name of the quiz if not already set.
 * 
 * @param {String} quizName name of the quiz
 */
const setQuizName = (quizName) => {
	const quizNameText = document.getElementById(ID_QUIZ_NAME).innerText;

	if (!quizNameText) document.getElementById(ID_QUIZ_NAME).innerText = quizName;
}

/**
 * Creates the HTML element for a quiz question.
 * 
 * @param {Object} questionObj question object
 * @param {Object} choicesArr array of question choices
 * @returns HTML element of the question
 */
const buildQuestion = (questionObj, choicesArr) => {
	
	// Build the choice lines
	const choices = document.createElement('DIV');
	choices.id = 'c' + questionObj.questionId;
	choices.classList.add(CLASS_CHOICES);
	choicesArr.forEach(c => {

		// Radio button, correct answer is selected automatically
		const tRadio = document.createElement('INPUT');
		tRadio.type = 'radio';
		tRadio.name = questionObj.questionId;
		if (questionObj.answer === c.choice) tRadio.checked = true;

		// Input question
		const tText = document.createElement('INPUT');
		tText.classList.add(CLASS_CHOICE, TEXT_FORM_CONTROL, c.choiceId);
		tText.type = 'text';
		tText.value = c.choiceBody;

		const tDiv = document.createElement('DIV')
		tDiv.append(tRadio, tText);

		choices.appendChild(tDiv);
	});

	// Question body
	const questionBody = document.createElement('TEXTAREA');
	questionBody.classList.add(TEXT_FORM_CONTROL);
	questionBody.id = 'question' + questionObj.questionId;
	questionBody.value = questionObj.questionBody;

	// Question background
	const background = document.createElement('DIV');
	background.classList.add(CLASS_QUESTION_BACKGROUND);

	// Edit button TODO: Functional edit button
	const updateButton = document.createElement('BUTTON');
	updateButton.classList.add(BTN, BTN_WARNING, questionObj.questionId);
	updateButton.innerText = UPDATE_TEXT;
	updateButton.addEventListener('click', () => updateQuestion(questionObj, choicesArr));

	background.append(questionBody, choices, updateButton);

	return background;
}

/**
 * Sends a PUT request to update the data in the database.
 * 
 * @param {Object} questionObj the data about the question
 * @param {Object} choicesArr the choices of the question
 * @returns early if data is not valid
 */
const updateQuestion = (questionObj, choicesArr) => {

	const questionBody = getQuestionBody('question' + questionObj.questionId);
	if (!questionBody) {
		alert(WARN_EMPTY_BODY);
		return;
	}

	// Finds the correct radio choice
	const answer = getCorrectAnswer(questionObj.questionId);

	if (!answer) {
		alert(WARN_NO_ANSWER);
		return;
	}
	
	const choices = [];
	choicesArr.forEach((c, i) => {
		const textNode = document.getElementById('c' + questionObj.questionId).getElementsByClassName(c.choiceId);
		if (!textNode[0].value.trim()) {
			alert(WARN_EMPTY_CHOICE);
			return;
		}
		choices.push({
			choiceId: c.choiceId,
			choice: CHOICES_ARR[i],
			choiceBody: textNode[0].value});
	});

	const question = {
		questionId: questionObj.questionId,
		questionBody: questionBody,
		choices: choices,
		answer: answer
	}

	// Send question to the database
	const req = new XMLHttpRequest();
	req.open('PUT', SERVER_URL + `/admin/question/${questionObj.questionId}`);
	req.setRequestHeader('Content-Type', 'application/json');
	
	req.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			alert(this.responseText);
		}
		else if (this.status == 400) {
			alert(this.responseText);
		}
	}

	req.send(JSON.stringify(question));
}

/**
 * Groups an array of objects by the key specified
 * 
 * @param {Object} data array of objects to group
 * @param {String} key key to group them by
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
 * Initializes the page
 */
const init = () => {
	const showButton = document.getElementById(ID_BTN_MAKER_VISIBILITY);
	const addButton = document.getElementById(ID_BTN_ADD);
	const removeButton = document.getElementById(ID_BTN_REMOVE);
	const submitButton = document.getElementById(ID_BTN_SUBMIT);
	const clearButton = document.getElementById(ID_BTN_CLEAR);

	showButton.addEventListener('click', () => toggleQuestionMaker());
	addButton.addEventListener('click', () => addChoice());
	removeButton.addEventListener('click', () => removeChoice());
	submitButton.addEventListener('click', () => submitQuestion());
	clearButton.addEventListener('click', () => clearQuestionMaker());

	renderChoiceButtons();
	fetchQuizzes();
	toggleQuestionMaker();
}

init();
