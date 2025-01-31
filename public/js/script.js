const video = document.getElementById('video');
const status = document.getElementById('status');
const checkInTimeElem = document.getElementById('checkInTime');
const checkOutTimeElem = document.getElementById('checkOutTime');

let checkInTime = null;
let checkOutTime = null;



// async function fetchUserName() {
//     try {
//         console.log("798465");
        
//         const response = await fetch('/getUserName', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         const data = await response.json();
//         loggedInUserName = data.name;
//         console.log(loggedInUserName) // Store the logged-in user's name
//     } catch (error) {
//         console.error('Error fetching user name:', error);
//     }
// }

// // Call the function to fetch the user name
// fetchUserName();


async function faceRecognition() {
    console.log("1 - Face recognition started");

    const labeledFaceDescriptors = await getLabeledFaceDescription();
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);

    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video)
            .withFaceLandmarks()
            .withFaceDescriptors();

        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

        const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));

        results.forEach((result, i) => {
            const box = resizedDetections[i].detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() });
            drawBox.draw(canvas);
            console.log(result.label);
            

            // Only allow check-in/check-out if face is recognized
            if (result.label == loggedInUserName)
                 {
                console.log("Face recognized:", result.label);
                enableCheckInCheckOut();  // Enable check-in/check-out when face matches
            } else {
                console.log("Face not recognized or incorrect user");
                disableCheckInCheckOut(); // Disable check-in/check-out if face does not match
            }
        });
    }, 100);
}

// Function to enable check-in and check-out buttons
function enableCheckInCheckOut() {
    document.getElementById('checkInButton').disabled = false;
    document.getElementById('checkOutButton').disabled = false;
}

// Function to disable check-in and check-out buttons
function disableCheckInCheckOut() {
    document.getElementById('checkInButton').disabled = true;
    document.getElementById('checkOutButton').disabled = true;
}


// Function to enable check-in and check-out buttons
function enableCheckInCheckOut() {
    document.getElementById('checkInButton').disabled = false;
    document.getElementById('checkOutButton').disabled = false;
}

// Function to disable check-in and check-out buttons
function disableCheckInCheckOut() {
    document.getElementById('checkInButton').disabled = true;
    document.getElementById('checkOutButton').disabled = true;
}

async function loadModels() {
    const MODEL_URL = '/models';
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        console.log('Models loaded successfully.');
    } catch (error) {
        console.error('Error loading models:', error);
    }
}

async function startWebcam(video) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.play();

        // Wait for video to load its metadata
        await new Promise((resolve) => {
            video.addEventListener('loadedmetadata', resolve);
        });

        console.log("Webcam started successfully");
    } catch (error) {
        console.error('Error starting webcam:', error);
    }
}

async function getLabeledFaceDescription() {
    console.log(loggedInUserName)
    console.log("done")
    const labels = [loggedInUserName];
    const labeledFaceDescriptors = await Promise.all(
        labels.map(async (label) => {
            const descriptions = [];
            for (let i = 1; i <= 2; i++) {
                const imageUrl = `./labels/${label}/${i}.png`;
                const image = await faceapi.fetchImage(imageUrl);
                const detection = await faceapi.detectSingleFace(image)
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                if (detection) {
                    descriptions.push(detection.descriptor);
                } else {
                    console.warn(`No face detected for label ${label}, image ${i}.`);
                }
            }
            return new faceapi.LabeledFaceDescriptors(label, descriptions);
        })
    );
    return labeledFaceDescriptors;
}

document.addEventListener('DOMContentLoaded', async () => {
    if (typeof faceapi !== 'undefined') {
        console.log('Face API loaded successfully');
        await loadModels();

        const video = document.getElementById('video');

        // Add the event listener here
        video.addEventListener('play', () => {
            console.log("2 - Video is playing, setting up face detection");
            faceRecognition(); // Start face recognition when video is playing
        });

        await startWebcam(video);
    } else {
        console.error('Face API is not defined');
    }
});








// Check-In and Check-Out Handlers
// Check-in function
// Check-in function
function handleCheckIn() {
  

    fetch('/checkIn', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userName: loggedInUserName })
    })
    .then(response => response.json())
    .then(data => {
        alert(`Checked In at ${data.checkInTime}`);
    })
    .catch(error => console.error('Error:', error));
}

// Check-out function
function handleCheckOut() {
    

    fetch('/checkOut', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userName: loggedInUserName })
    })
    .then(response => response.json())
    .then(data => {
        alert(`Checked Out at ${data.checkOutTime}`);
    })
    .catch(error => console.error('Error:', error));
}






