// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel
window.addEventListener("DOMContentLoaded", function () {

    const bell = new Audio('audio/bell.mp3');
    const jinglebells = new Audio('audio/jinglebells.mp3');
    const error = new Audio('audio/error.mp3');

 const URL ="https://teachablemachine.withgoogle.com/models/C8EwO48qN/"

//    const URL = "https://teachablemachine.withgoogle.com/models/Ybj48BAov/";
    let model, webcam, ctx, labelContainer, maxPredictions;

    const correctElement = document.getElementById("correct-toggle");
    const incorrectElement = document.getElementById("incorrect-toggle");
    const correctHeaderElement = document.getElementById("correct-toggle-header");
    const incorrectHeaderElement = document.getElementById("incorrect-toggle-header");

    const alignTextElem = document.getElementById("position-yourself");


    const startBtn = document.getElementById("start-button");
    const stopBtn = document.getElementById("stop");
    const questionElem = document.getElementById("question");
    const restartBtn = document.getElementById("restart");


    const showMeList = ["Hungry", "I See You", "Quiet Down", "Get Busy"]
    let lookingForIndex = 0


    async function init() {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        // load the model and metadata
        // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
        // Note: the pose library adds a tmPose object to your window (window.tmPose)
        model = await tmPose.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // Convenience function to setup a webcam
        const size = 300;
        const flip = true; // whether to flip the webcam
        webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
        await webcam.setup(); // request access to the webcam
        await webcam.play();
        window.requestAnimationFrame(loop);

        // append/get elements to the DOM
        const canvas = document.getElementById("canvas");
        const box = document.getElementById("box");
        canvas.style.display = "block";
        canvas.classList.add("mx-auto")

        canvas.width = size;
        canvas.height = size;
        ctx = canvas.getContext("2d");
        labelContainer = document.getElementById("webcam-container");

        for (let i = 0; i < maxPredictions; i++) { // and class labels
            labelContainer.appendChild(document.createElement("div"));
        }
        startBtn.style.display = "none";
        stopBtn.style.display = "block";

    }



    async function loop(timestamp) {
        webcam.update(); // update the webcam frame
        await predict();
        window.requestAnimationFrame(loop);
    }

    async function predict() {
        // Prediction #1: run input through posenet
        // estimatePose can take in an image, video or canvas html element
        const {
            pose,
            posenetOutput
        } = await model.estimatePose(webcam.canvas);
        // Prediction 2: run input through teachable machine classification model
        const prediction = await model.predict(posenetOutput);

        let highestProbability = 0;
        let gestureName = "";


        // finally draw the poses
        drawPose(pose);

        for (let i = 0; i < maxPredictions; i++) {
            //            const classPrediction = prediction[i].className + ": " + prediction[i].probability.toFixed(2);
            //            labelContainer.childNodes[i].innerHTML = classPrediction;

            if (prediction[i].probability > highestProbability) {
                highestProbability = prediction[i].probability;
                gestureName = prediction[i].className;
            }
        }

        if (highestProbability < 1.00) {
            return;
        }
        checkForGestureThrottled(gestureName);
    }

    function drawPose(pose) {
        if (webcam.canvas) {
            ctx.drawImage(webcam.canvas, 0, 0);
            // draw the keypoints and skeleton
            if (pose) {
                const minPartConfidence = 0.5;
                tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
                tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
            }
        }
    }

    async function stop() {
        await webcam.stop();
        document.getElementById("canvas").style.display = "none";
        startBtn.style.display = "block";
        stopBtn.style.display = "none";
    }

    setTimeout(async function () {
        const showMeList = ["Hungry", "I See You", "Quiet Down", "Get Busy"]
        let lookingForIndex = 0
        questionElem.innerHTML = "Make the gesture for " + showMeList[lookingForIndex];
    }, 8000);

    setTimeout(function () {
        alignTextElem.innerHTML = "";
    }, 3000);

    window.addEventListener("load", function () {

        correctElement.style.display = "none";
        incorrectElement.style.display = "none";

        restartBtn.style.display = "none";
        stopBtn.style.display = "none";

        setTimeout(function () {
            alignTextElem.innerHTML = "";
        }, 3000);
    })

    restartBtn.addEventListener("click", async function () {
        await stop()
        lookingForIndex = 0;
        restartBtn.style.display = "none";
        await init()
    });

    startBtn.addEventListener("click", async function () {
        await init();
        startBtn.style.display = "none";
        stopBtn.style.display = "block";
    });

    stopBtn.addEventListener("click", async function () {

        startBtn.style.display = "block";
        correctElement.style.display = "none"
        incorrectElement.style.display = "none"
        questionElem.style.display = "none";
        stopBtn.style.display = "none";
        await stop();
    });


    function GestureGame() {

        const showMeList = ["Hungry", "I See You", "Quiet Down", "Get Busy"]
        let lookingForIndex = 0;

        function getQuestion() {
            return "Please show me a " + showMeList[lookingForIndex];
        }

    }

    function getModelName(gestureName){
        switch(gestureName){
            case "ISeeYou":
                return "I See You"
                break;
            case "GetBusy":
                return "Get Busy"
                break;
            case "QuietDown":
                return "Quiet Down"
                break;
            default:
                return gestureName
        }
    }

    async function checkForGesture(gesture) {

        if (gesture !== "Nothing") {
            const lookingFor = currentlyLookingFor();
            if (lookingFor !== "" && getModelName(gesture) === lookingFor) {
                await webcam.pause();
                bell.play();

                incorrectElement.style.display = "none"
                correctElement.style.display = "block"
                correctHeaderElement.innerHTML = "Perfect, you made the correct gesture for " + lookingFor;

                gesture = "Nothing";

                setTimeout(function () {
                  correctElement.style.display = "none";
                  incorrectElement.style.display = "none"
                }, 4000);

                setTimeout(function () {
                  alignTextElem.style.display = "block";
                }, 4300);

//                setTimeout(async function () {
//                alignTextElem.style.display = "none";
////                    await webcam.play();
//                }, 5000);

                    await showGestureQuestion()


            } else {

                    if(lookingForIndex<4){
                        incorrectElement.style.display = "block"
                        incorrectHeaderElement.innerHTML = "Try making a gesture for " + lookingFor;
                        error.play();
                    }

            }
        }
    }

    function toggleVisibility(element) {
        element.classList.toggle("hidden");

    }

    function currentlyLookingFor() {
        if (lookingForIndex < showMeList.length) {
            return showMeList[lookingForIndex]
        }
        return "";
    }

    async function showGestureQuestion()  {
        lookingForIndex++;
        if (lookingForIndex < showMeList.length) {
            questionElem.innerHTML = "Try making a gesture for showing " + currentlyLookingFor();
            await webcam.play()
        } else {
            questionElem.innerHTML = "Congratulations! You know your gestures!"
            await stop();
            restartBtn.style.display = "none";
            startBtn.style.display = "none";
            //        jinglebells.play();
        }
    }

    const checkForGestureThrottled = _.throttle(checkForGesture, 4000);

});