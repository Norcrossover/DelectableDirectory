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



    // ----------- Find Food Cart Intent ---------------
    const thaiSunflowersInfo = 'Serves some fresh Thai cuisine that enhances the umami flavors with hints of sweet and spicy. Try our famous Pineapple fried rice!';
    const hydhubInfo = 'Offers a variety of Indian dishes with rich spices and flavors. Don\'t miss our Butter Chicken!';
    const fuegoInfo = 'Home of authentic Mexican street food. Our Tacos Al Pastor are a must-try!';
    const chineseLuckyDragonInfo = 'Specializes in traditional Chinese cuisine. Our Kung Pao Chicken is a crowd favorite!';
    const wasabiSushiInfo = 'Offers a wide range of sushi and other Japanese dishes. Be sure to try our Salmon Nigiri!';
    const sakuraNoodlesInfo = 'Known for our delicious ramen with rich, flavorful broth. Don\'t forget to try our Gyoza!';
    const kBopInfo = 'Serves Korean classics like Bibimbap and Kimchi Fried Rice. Our Bulgogi is a must-try!';
    const victoricosInfo = 'Victoricos offers a taste of Mexico in Gresham. Our Carne Asada and Chiles Rellenos are local favorites.';
    const laCasitaInfo = 'La Casita is known for its authentic Mexican cuisine. Don\'t miss our Enchiladas and Tamales.';

    const foodCarts = [
        {name: 'Thai Sunflowers', type: 'Thai', location: 'Portland', info: thaiSunflowersInfo},
        {name: 'Hydhub', type: 'Indian', location: 'Portland', info: hydhubInfo},
        {name: 'Fuego ALL DAY', type: 'Mexican', location: 'Portland', info: fuegoInfo},
        {name: 'Chinese Lucky Dragon', type: 'Chinese', location: 'Portland', info: chineseLuckyDragonInfo},
        {name: 'Wasabi Sushi PDX', type: 'Sushi', location: 'Portland', info: wasabiSushiInfo},
        {name: 'Sakura Noodles', type: 'Japanese', location: 'Portland', info: sakuraNoodlesInfo},
        {name: 'K-bop!', type: 'Korean', location: 'Portland', info: kBopInfo},

        {name: 'Thai Sunflowers', type: 'Thai', location: 'Seattle', info: thaiSunflowersInfo},
        {name: 'Hydhub', type: 'Indian', location: 'Seattle', info: hydhubInfo},
        {name: 'Fuego ALL DAY', type: 'Mexican', location: 'Seattle', info: fuegoInfo},
        {name: 'Chinese Lucky Dragon', type: 'Chinese', location: 'Seattle', info: chineseLuckyDragonInfo},
        {name: 'Wasabi Sushi PDX', type: 'Sushi', location: 'Seattle', info: wasabiSushiInfo},
        {name: 'Sakura Noodles', type: 'Japanese', location: 'Seattle', info: sakuraNoodlesInfo},
        {name: 'K-bop!', type: 'Korean', location: 'Seattle', info: kBopInfo},
        // additional Mexican restaurants to test
        {name: 'Victoricos', type: 'Mexican', location: 'Seattle', info: victoricosInfo},

        {name: 'Thai Sunflowers', type: 'Thai', location: 'Gresham', info: thaiSunflowersInfo},
        {name: 'Hydhub', type: 'Indian', location: 'Gresham', info: hydhubInfo},
        {name: 'Fuego ALL DAY', type: 'Mexican', location: 'Gresham', info: fuegoInfo},
        {name: 'Chinese Lucky Dragon', type: 'Chinese', location: 'Gresham', info: chineseLuckyDragonInfo},
        {name: 'Wasabi Sushi PDX', type: 'Sushi', location: 'Gresham', info: wasabiSushiInfo},
        {name: 'Sakura Noodles', type: 'Japanese', location: 'Gresham', info: sakuraNoodlesInfo},
        {name: 'K-bop!', type: 'Korean', location: 'Gresham', info: kBopInfo},
        // additional Mexican restaurants to test
        {name: 'Victoricos', type: 'Mexican', location: 'Gresham', info: victoricosInfo},
        {name: 'La Casita', type: 'Mexican', location: 'Gresham', info: laCasitaInfo}
    ];

    const matchingCartsContextName = 'matchingcarts';

    function matchFoodCart(foodType, location) {
        return foodCarts.filter(cart => 
            cart.type.toLowerCase() === foodType.toLowerCase() && 
            cart.location.toLowerCase() === location.toLowerCase()
        );
    }

    function findFoodCartIntent(agent) {
        const { TypeOfFood: foodType, Location: location } = agent.parameters;
        const originalFoodType = agent.getContext('findfoodcart-followup').parameters['TypeOfFood.original'];
    
        if (!foodType || !location) return;
        
        let matchingCarts = matchFoodCart(foodType.toLowerCase(), location.toLowerCase());
        let response = '';
        if (matchingCarts.length > 0) {
            response = `I found ${matchingCarts.length} cart(s) that serve ${originalFoodType} in ${location}: `;
            response += matchingCarts.map(cart => cart.name).join(', ');
            response += '. Would you like more information on any food cart that matches your criteria?';
    
            agent.setContext({
                name: matchingCartsContextName,
                lifespan: 5,
                parameters: {matchingCarts: matchingCarts}
            });
        } else {
            response = `Sorry, I couldn't find any carts that serve ${originalFoodType} in ${location}.`;
        }
        agent.add(response);
    }
    



    // ----------- Get Food Cart Information  ---------------
    function getFoodCartInformationIntent(agent) {
        const matchingCartsContext = agent.contexts.find(context => context.name.endsWith(matchingCartsContextName));
        if (!matchingCartsContext) {
            console.log(`No context found with name ${matchingCartsContextName}`);
            return;
        }
        const matchingCarts = matchingCartsContext.parameters.matchingCarts;
        let foodCartName = agent.parameters.FoodCartName;
        let foodCartInfo = retrieveFoodCartInfo(foodCartName, matchingCarts);
        agent.add(foodCartInfo);
    }

    function retrieveFoodCartInfo(foodCartName, matchingCarts) {
        const foodCart = matchingCarts.find(cart => cart.name.toLowerCase() === foodCartName.toLowerCase());

        if (foodCart) {
            return generateFoodCartInfoString(foodCart.type, foodCart.name, foodCart.info);
        } else {
            return `Sorry, I couldn't find any information about the ${foodCartName} food cart in the matching list.`;
        }
    }

    function generateFoodCartInfoString(typeOfFood, foodCartName, info) {
        const timeOpen = `The cart is open from 9am to 5pm. `;
        const cartServesTypeOfFood = `The cart serves ${typeOfFood} food. `;
        const nameOfFoodCart = `The name of this food cart is ${foodCartName}. `;
        return nameOfFoodCart + cartServesTypeOfFood + timeOpen + info;
    }



    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('Find Food Cart', findFoodCartIntent);
    intentMap.set('Get Food Cart Information', getFoodCartInformationIntent);
    agent.handleRequest(intentMap);
});
