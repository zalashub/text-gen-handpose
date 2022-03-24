/*
Data and machine learning for artistic practice

Weekkly assignment #7: Completion (Text generation)

Instructions:

- start the sketch and wait for the models to load (words will start to appear on the screen)
- point and touch your index finger to the word you wish to select to complete the sentence
- a new sentence will pop up with new words that you can chose from
- repeat

This sketch explores the theme of completion - an interaction between the user and the ML model.
The model receives the start of the sentence shown on the screen as an input and generates a new character
until it reaches the end of a word, which then pops up on the screen. Then the original seed text gets inputted
into the model again so that it generates another word. This is repeated 10 times, so we get 10 different words
to choose from. The user can then point their finger at a specific word to "choose" it to complete the sentence.
Then, a new seed sentence is generated and the process repeats. Currently, I only chose 3 different sentences to
start with, but this can of course be modified later on.


*/

let charRNN,
    generating = true,
    generated_text = "",
    predictions = [],
    seedTxt,
    mode = 0,
    maxWords = 10,
    touched = false,
    video,
    handpose,
    hands = []

let inputs = [
  "In that moment I felt very  ",
  "On a cold autumn day, the sky filled with a  ",
  "The meaning of life is  ",
  "There has not been a better time to  ",
  "I had a weird dream last night. I dreamed about  ",
  "My absolutely favourite word will forever be  "
]

function setup() {
  createCanvas(640, 480)
  
  // Setup video
  video = createCapture(VIDEO)
  video.size(width, height)
  video.hide()
  
  // Setup handpose, flipped horizontally so that it's easier to point to the words
  handpose = ml5.handpose(video, {flipHorizontal: true}, () => {
    console.log("Handpose ready!")
    
    handpose.on('predict', results => {
      // Store the hands in the array
      hands = results;
    }) 
    // Create the LSTM Generator passing it the model directory
    charRNN = ml5.charRNN('./models/bolano/', modelReady);
  })
  // Choose the initial seed text
  seedTxt = inputs[mode]
}

function draw() {

  noStroke();
  fill(255);  

  /* 
  
    Drawing of the video and the hands

  */
  if (video) {
     // Draw the camera input
     push() // Need the push and pop because we're stacking translations otherwise
     translate(video.width, 0);
     scale(-1, 1); // this flips the video so it's easier for us
     image(video, 0, 0, video.width, video.height);
     pop()

    // if we have any hands detected, draw them
    // but to not need to flip these, because we've already done so in handpose options
    if (hands && hands.length > 0) {
      // loop through all of the hands found and draw them
      for (let hand of hands) {
        let landmarks = hand.landmarks;
        for (let i = 0; i < landmarks.length; i++) {
          let [x, y, z] = landmarks[i];
          ellipse(x, y, 5);
          
        }
      }
    }
  }

  /* 
  
    Drawing of the text
    
  */
  // Seed text
  textSize(28)
  text(seedTxt, 10, 10, width, height);

  // Draw the predictions
  for(p of predictions)
  {
    // Draw the word in a bigger size if it's the 'chosen' one
    if(p.touched) {
      textSize(100)
      text(p.word, width/3, height/2)
    }
    else {
      textSize(18)
      text(p.word, p.pos.x + random(-2, 2), p.pos.y + random(-2, 2))
    }
  }

  /* 
  
    Choosing the words to complete
    Only do the checking if we see the hands, we haven't chosen a word yet,
    if we're not generating anymore and if the words are ready to be chosen
  */
  if(generating == false && 
    predictions.length >= 10 && 
    hands && 
    hands.length > 0 && 
    touched == false) checkTouching()

  /* 
  
    Control the generation
    Stop generating characters after max (here 10) words
    
  */
  if(predictions.length >= maxWords) {
    generating = false
  } 

}

async function modelReady() {
  console.log("charRNN ready!")
  charRNN.reset();
  await charRNN.feed(seedTxt);
  generate() //Start generating right away
}

function generate() {
  loopRNN()
}

async function loopRNN() {
  while (generating) {
    await predict();
  }
}

async function predict() {
  let temperature = 0.78
  let next = await charRNN.predict(temperature);

  // If we reach a space (end of a word) -> store it in the predictions array
  if (next.sample == " " || next.sample == '\n' || next.sample == '.' || next.sample == ',') {
    
    // Store the generated text only if it's not empty
    if(generated_text.length > 0 && generated_text != '') {
      // Create a prediction object with a random position, which we will use to draw the text
      let p = {
        pos: createVector(random(0, width-20), random(50, height-20)),
        word: generated_text,
        touched: false
      }
      predictions.push(p)
      //console.log(predictions)
    }

    // Reset the model's state and give it the original input
    // we do this so we can generate different words from the same seed
    charRNN.reset();
    await charRNN.feed(seedTxt);

    //Reset the generated text so we generate from scratch again
    generated_text = ''

  } else {
    // Generate the next character to complete the word
    await charRNN.feed(next.sample);
    generated_text += next.sample;
  }
  
}

// Check whether the index finger is 'touching' any of the words
const checkTouching = () => {
  let topIndexPoint = hands[0].annotations.indexFinger[3]

  for(p of predictions) {
    if(dist(topIndexPoint[0], topIndexPoint[1], p.pos.x, p.pos.y) < 20) {
      //console.log('TOUCH')
      p.touched = true
      fill(255, 255, 0)
      ellipse(topIndexPoint[0], topIndexPoint[1], 15);
      touched = true // Set touched to true to we prevent from calling this function again
      //Wait for a second before we reset everything
      setTimeout(newRound, 1000)
      break
    }
  }
}

// Reset everything
const newRound = () => {
   // Reset the model's state
   charRNN.reset();
   // Reset the predictions
   predictions = []
   // Move on to the next seed text
   mode += 1
   seedTxt = inputs[(mode)%inputs.length]
   // Feed it to the model
   charRNN.feed(seedTxt, () => {
     // Reset touched to false
     touched = false
     // Start generating again
     generating = true
     generate()
   });
}