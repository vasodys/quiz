/**
 * Created by vasilisodysseos on 1/26/17.
 */
var quiz;
var currentQuestionPos = 0;
var chosenAnswer=[];
var currentQuestion;
var multipleChoice=[];
var labelId;
var correctAnswer = [];
var score = 0;
var endResult;
var maxScore = 0;

function getData() {
    $.ajax({
        method: "GET",
        url: "http://proto.io/en/jobs/candidate-questions/quiz.json"
    }).done(onDataReceived);
    $.ajax({
        method: "GET",
        url: "https://proto.io/en/jobs/candidate-questions/result.json"
    }).done(onResultsReceived);
}
function onDataReceived(quizJson) {
    quiz = quizJson;
    console.log(quizJson);
    $("#quizTitle").text(quizJson.description);
    showQuestion(quizJson.questions[currentQuestionPos]);
    $("#buttons").append("<button id='Submit' onclick='questionCheck()'>Submit</button>");
}
function onResultsReceived(resultsJson) {
    endResult = resultsJson;
    console.log(resultsJson);
}
function showQuestion(questionObj) {
    $("#questionTitle").text(questionObj.title);
    $("#questionImg").attr("src", questionObj.img);
    $("#possibleAnswers").empty();
    currentQuestion = questionObj;

    if (questionObj.possible_answers != null) {
        switch (questionObj.question_type) {
            case "mutiplechoice-single":
                for (var i = 0; i < questionObj.possible_answers.length; i++) {
                    labelId = "q-" + questionObj.q_id + "_" + "a-" + questionObj.possible_answers[i].a_id;
                    $("#possibleAnswers").append("<label id='" + labelId + "'><li  class='list-group-item'><input type='radio' name='answer_value' value='" + questionObj.possible_answers[i].a_id + "'>" + questionObj.possible_answers[i].caption + "</li></label>");
                }
                break;

            case "mutiplechoice-multiple":
                for (var i = 0; i < questionObj.possible_answers.length; i++) {
                    labelId = "q-" + questionObj.q_id + "_" + "a-" + questionObj.possible_answers[i].a_id;
                    $("#possibleAnswers").append("<label id='" + labelId + "'><li  class='list-group-item'><input type='checkbox' name='answer_value'value='" + questionObj.possible_answers[i].a_id + "'>" + questionObj.possible_answers[i].caption + "</li></label>");
                }
                break;

        }

    } else {
        labelId = "q-" + questionObj.q_id + "_" + "a-";
        $("#possibleAnswers").append("<label id='" + labelId + "true'><li class='list-group-item'><input type='radio' name='answer_value' value='true'>True</li></label><label id='" + labelId + "false'><li  class='list-group-item'><input type='radio' name='answer_value' value='false'>False</li></label");
    }
    if( currentQuestion.question_type == "mutiplechoice-multiple") {
        for (var i = 0; i < currentQuestion.correct_answer.length; i++) {
            correctAnswer.push("q-" + questionObj.q_id + "_" + "a-" + currentQuestion.correct_answer[i]);
        }
    } else {
        correctAnswer.push("q-" + questionObj.q_id + "_" + "a-" + currentQuestion.correct_answer);
    }
}

function questionCheck() {
    $("#Submit").prop('disabled', true);
    if (currentQuestion.question_type == "mutiplechoice-multiple") {
        $('input[name="answer_value"]:checked').each(function (pos, checkbox) {
            multipleChoice.push(parseInt(checkbox.value));
        });
        if (multipleChoice.length == currentQuestion.correct_answer.length) {
            for (var i = 0; i < multipleChoice.length; i++) {
                if (currentQuestion.correct_answer.indexOf(multipleChoice[i]) == (-1)) {
                    break;
                }
            }

            if (i == multipleChoice.length) {
                score += currentQuestion.points;
                console.log(score);
            }
        }
        multipleChoice = [];

    }
    else {

        chosenAnswer = $('input[name="answer_value"]:checked').val();

        if (currentQuestion.question_type == "truefalse") {
            chosenAnswer = (chosenAnswer == "true");
        }

        if (chosenAnswer == currentQuestion.correct_answer) {
            score += currentQuestion.points;
            console.log(score);
        }


    }
    showCorrect();
}

function showCorrect(){
    $('label').each(function () {
        if(correctAnswer.indexOf(this.id) != -1){
            $("#" + this.id + " .list-group-item").addClass('backgroundAnimated');
        }
    });
    setTimeout(function() {
        $("label .backgroundAnimated").removeClass('backgroundAnimated');
        nextQuestion();
    }, 3000);
}

function nextQuestion() {
    $("#Submit").prop('disabled', false);
    if (currentQuestionPos < quiz.questions.length -1) {
        $("#questionImg").attr("src", "");
        currentQuestionPos++;
        showQuestion(quiz.questions[currentQuestionPos]);
    } else {
        $("#possibleAnswers").empty();
        $("#buttons").empty();
        $("#questionImg").attr("src", "");
        endQuiz();
    }
}
function prevQuestion() {
    if (currentQuestionPos > 0) {
        $("#quetion").empty();
        $("#questionImg").attr("src","");
        currentQuestionPos--;
        showQuestion(quiz.questions[currentQuestionPos]);
    }
}
function endQuiz() {
    for (j=0; j< quiz.questions.length; j++){
        maxScore += quiz.questions[j].points;
    }
    var percentage = (score/maxScore)*100;
    for (i = 0; i < endResult.results.length; i++){
        if (percentage >= endResult.results[i].minpoints && percentage <= endResult.results[i].maxpoints){
            $("#quizTitle").text(endResult.results[i].title);
            $("#scoreTitle").text("Your score is " + Math.round(percentage) + "%");
            $("#questionImg").attr("src", endResult.results[i].img);
            $("#questionTitle").text(endResult.results[i].message);

        }
    }
}
