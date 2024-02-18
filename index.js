// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
 
// process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

// const express = require('express');
// const app = express();
// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
//   });  

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }
  
  function matchFoodCart(foodType, location) {
    // Define your food cart data
    const foodCarts = [
        {name: 'Pizza Schmizza', type: 'Pizza', location: 'Portland'},
        {name: 'Thai Sunflowers', type: 'Thai', location: 'Portland'},
        {name: 'Hydhub', type: 'Indian', location: 'Seattle'},
        {name: 'Fuego ALL DAY', type: 'Mexican', location: 'Portland'},
        {name: 'Chinese Lucky Dragon', type: 'Chinese', location: 'Portland'},
        {name: 'Wasabi Sushi PDX', type: 'Sushi', location: 'Portland'}
    ];

    // Filter the food carts based on the food type and location
    const matchingCarts = foodCarts.filter(cart => cart.type.toLowerCase() === foodType.toLowerCase() && cart.location.toLowerCase() === location.toLowerCase());

    return matchingCarts;
}

function findFoodCart(agent) {
    const contextForFindFoodCart = "findfoodcart-followup";
    // Get the response values
    // let foodType = agent.context.get(contextForFindFoodCart).parameters.TypeOfFood;
    // let location = agent.context.get(contextForFindFoodCart).parameters.Location;
    let foodType = agent.contexts[0].parameters.TypeOfFood;
    let location = agent.contexts[0].parameters.Location;


    console.log(`foodType = ${foodType}`);
    console.log(`location = ${location}`);

    agent.add(`foodType = ${foodType}`);
    agent.add(`location = ${location}`);

    // Reprompt for missing information
    if (foodType == null || foodType == "") {
        console.log('Missing foodType');
        agent.add('Could you please specify the type of food you are looking for?');
        return;
    }

    if (location == null || location == "") {
        console.log('Missing location');
        agent.add('Could you please specify the location?');
        return;
    }

    // Match the food type and location to a cart
    let matchingCarts = matchFoodCart(foodType, location);
    console.log(`matchingCarts = ${JSON.stringify(matchingCarts)}`);

    // Check if any matching carts were found
    if (matchingCarts == null || matchingCarts.length === 0) {
        console.log('No matching carts found');
        agent.add(`Sorry, I couldn't find any carts that serve ${foodType} in ${location}.`);
    } else {
        if (matchingCarts.length === 1) {
        agent.add(`Great news! I found a cart that serves ${foodType} in ${location}. It's called ${matchingCarts[0].name}.`);
        } else if (matchingCarts.length === 2) {
            agent.add(`I found 2 carts that serve ${foodType} in ${location}. They are ${matchingCarts[0].name} and ${matchingCarts[1].name}.`);
        } else {
            let response = `I found several carts that serve ${foodType} in ${location}: `;
            for (let cart of matchingCarts) {
                response += `${cart.name}, `;
            }
            // Remove the trailing comma and space
            response = response.slice(0, -2);
            agent.add(response);
        }
    }

    agent.add(`Have successfully made it to the end`);
}
  
function findFoodCartInfo(agent) {
    // Get the response values
    let foodCartName = agent.parameters.foodCartName;

    // Retrieve the information about the food cart
    let foodCartInfo = retrieveFoodCartInfo(foodCartName);

    // Add the retrieved information to the agent's response
    agent.add(foodCartInfo);
}

const foodCarts = [
    {name: 'Thai Sunflowers', type: 'Thai'},
    {name: 'Wolf Head Burgerhouse', type: 'American'},
    {name: 'Hydhub', type: 'Indian'},
    {name: 'Sakura Noodles', type: 'Japanese'},
    {name: 'Chinese Lucky Dragon', type: 'Chinese'},
    {name: 'K-bop!', type: 'Korean'},
    {name: 'Wasabi Sushi PDX', type: 'Sushi'},
    {name: 'Fuego ALL DAY', type: 'Mexican'}
];

function retrieveFoodCartInfo(foodCartName) {
    const foodCart = foodCarts.find(cart => cart.name.toLowerCase() === foodCartName.toLowerCase());

    if (foodCart) {
        return generateFoodCartInfoString(foodCart.type, foodCart.name);
    } else {
        return `Sorry, I couldn't find any information about the ${foodCartName} food cart.`;
    }
}


function generateFoodCartInfoString(typeOfFood, foodCartName) {
    const timeOpen = `The cart is open from 9am to 5pm. `;
    const cartServesTypeOfFood = `The cart serves ${typeOfFood} food. `;
    const nameOfFoodCart = `The name of this food cart is ${foodCartName}. `;

    return nameOfFoodCart + cartServesTypeOfFood + timeOpen;
}



  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/fulfillment-actions-library-nodejs
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  // intentMap.set('your intent name here', yourFunctionHandler);
  intentMap.set('Find Food Cart', findFoodCart);
  intentMap.set('Find Food Cart Info', findFoodCartInfo);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});
