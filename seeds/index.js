const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');



mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })


const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '65d8611341fb506fd6669c4e',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
             description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            geometry: {
              type: "Point",
              coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
              ]
          },
            images:[
                {
                  url: 'https://res.cloudinary.com/dnilu1drd/image/upload/v1716758175/YelpCamp/hhylej7cbxuhohtstxgu.webp',
                  filename: 'YelpCamp/hhylej7cbxuhohtstxgu',
                  
                },
                {
                  url: 'https://res.cloudinary.com/dnilu1drd/image/upload/v1716758176/YelpCamp/eyspnb9qk6btqrn3mwjj.jpg',
                  filename: 'YelpCamp/eyspnb9qk6btqrn3mwjj',
                  
                }
              ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
