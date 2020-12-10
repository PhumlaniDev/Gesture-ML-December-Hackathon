// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel
window.addEventListener("DOMContentLoaded",function(){

//    const bell = new Audio('audio/bell.mp3');
    //const jinglebells = new Audio('audio/jinglebells.mp3');
//    const error = new Audio('audio/error.mp3');


    const URL = "https://teachablemachine.withgoogle.com/models/Ybj48BAov/";
    let model, webcam, ctx, labelContainer, maxPredictions;

    const correctElement = document.getElementById("correct-toggle");
    const incorrectElement = document.getElementById("incorrect-toggle");

    const alignTextElem = document.getElementById("position-yourself");


    const startBtn = document.getElementById("start-button");
    const stopBtn = document.getElementById("stop");
    const questionElem = document.getElementById("question");
    const restartBtn = document.getElementById("restart");


    async function init() {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        // load the model and metadata
        // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
        // Note: the pose library adds a tmPose object to your window (window.tmPose)
        model = await tmPose.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // Convenience function to setup a webcam
        const size = 250;
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

        canvas.width = size; canvas.height = size;
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
        const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
        // Prediction 2: run input through teachable machine classification model
        const prediction = await model.predict(posenetOutput);

        for (let i = 0; i < maxPredictions; i++) {
            const classPrediction =
                prediction[i].className + ": " + prediction[i].probability.toFixed(2);
            labelContainer.childNodes[i].innerHTML = classPrediction;
        }

        // finally draw the poses
        drawPose(pose);
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



    setTimeout(function(){
        const showMeList = ["Hungry", "I see you", "Quiet down", "Get Busy"]
         let lookingForIndex = 2
         questionElem.innerHTML = "Make the gesture for " + showMeList[lookingForIndex];
    }, 10000);

    setTimeout(function(){
       alignTextElem.innerHTML = "";
    }, 3000);

    window.addEventListener("load",function(){

       correctElement.style.display = "none";
       incorrectElement.style.display = "none";

       restartBtn.style.display = "none";
       stopBtn.style.display = "none";

       setTimeout(function(){
           alignTextElem.innerHTML = "";
       }, 3000);
    })

    restartBtn.addEventListener("click", function () {
        lookingForIndex = -1;
        toggleVisibility(restartButton);
        showChocolateQuestion();
    });

    startBtn.addEventListener("click", function () {
       init();
       startBtn.style.display = "none";
       stopBtn.style.display = "block";
    });

    stopBtn.addEventListener("click", function () {

        startBtn.style.display = "block";
        stopBtn.style.display = "none";
        stop();

    });







    function GestureGame() {

        const showMeList = ["Hungry", "I see you", "Quiet down", "Get Busy"]
        let lookingForIndex = 0;

        function getQuestion() {
            return "Please show me a " + showMeList[lookingForIndex];
        }

    }

    function checkForGesture(gesture) {
        if (gesture !== "Nothing") {
            const lookingFor = currentlyLookingFor();
            if (lookingFor !== "" && gesture === lookingFor) {
                console.log("=================================================");
                webcam.pause();
                gestureElem.innerHTML = "Perfect, you made the correct gesture for "+lookingFor;
                bell.play();
                gesture = "Nothing";

                setTimeout(function () {
                    showChocolateQuestion()
                    gestureElem.innerHTML = ""
                    webcam.play();
                }, 2500);
            } else {
                error.play();
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

    function showGestureQuestion() {

        lookingForIndex++;
        if (lookingForIndex < showMeList.length) {
            questionElem.innerHTML = "Please make a gesture for" + currentlyLookingFor();
        } else {
            questionElem.innerHTML = "You know your gestures!";
    //        jinglebells.play();
    // do something
            toggleVisibility(restartButton)
        }
    }

    const checkForGestureThrottled = _.throttle(checkForGesture, 4000);

});
