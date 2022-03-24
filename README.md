# Text Generation Hand Pose

[Live project](https://text-gen-handpose.vercel.app/)

#### Instructions:

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
