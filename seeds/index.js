const mongoose = require('mongoose');
// const {places, descriptors} = require('../seeds/seedHelpers');
const bulakanSpots = require('../seeds/bulakanSpots');
const Spotground = require('../models/spotground');

mongoose.connect('mongodb://127.0.0.1:27017/bulakan-spots');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected");
});


    const seedDB = async () => {
        await Spotground.deleteMany({});
        for (let i = 0; i < 30; i++) {
            const random = Math.floor(Math.random() * bulakanSpots.length); 
            const spot = new Spotground({
                author: '676d5f8d6752af11ae1d2cfc',
                title: `${bulakanSpots[random].title}`,
                location: bulakanSpots[random].location,
                time1: bulakanSpots[random].time1,
                time2: bulakanSpots[random].time2,
                price: bulakanSpots[random].price,
                geometry: {
                    type: "Point",
                    coordinates: [
                        bulakanSpots[random].longitude,
                        bulakanSpots[random].latitude,
                    ]
                },
                images: [
                    {
                        url: 'https://res.cloudinary.com/dem3eevon/image/upload/v1735458688/BulakanSpot/vfqx2blbtu8lk81yjh4j.png',
                        filename: 'BulakanSpot/vfqx2blbtu8lk81yjh4j'
                    },
                    {
                        url: 'https://res.cloudinary.com/dem3eevon/image/upload/v1735458689/BulakanSpot/vquflieqlemkvlaywk9i.png',
                        filename: 'BulakanSpot/vquflieqlemkvlaywk9i'
                    }
                ],
                description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil iusto magnam doloremque odio amet.',
            });
            await spot.save();
        }
    }


seedDB().then(() => {
    mongoose.connection.close();
})