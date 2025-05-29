const mongoose = require('mongoose');
const Architect = require('../models/architect');
require('../config/connect');

const architectUpdates = [
  {
    name: "Thomas",
    lastname: "Anderson",
    image: "architect/thomas.jpg",
    about: "Specializing in sustainable urban development and modern architectural design. With over 15 years of experience, Thomas brings innovative solutions to every project."
  },
  {
    name: "Taysir",
    lastname: "Harrabi",
    image: "architect/taysir.jpg",
    about: "An award-winning architect with expertise in contemporary residential and commercial architecture. Known for integrating traditional elements with modern design principles."
  }
];

async function updateArchitects() {
  try {
    // Get existing architects
    const architects = await Architect.find({});
    
    // Update each architect
    const updates = await Promise.all(
      architects.map(async (architect, index) => {
        if (index < architectUpdates.length) {
          const update = architectUpdates[index];
          const result = await Architect.findByIdAndUpdate(
            architect._id,
            { 
              $set: {
                image: update.image,
                about: update.about
              }
            },
            { new: true }
          );
          return result;
        }
        return architect;
      })
    );

    console.log('Successfully updated architects:', updates.map(a => `${a.name} ${a.lastname}`));
  } catch (error) {
    console.error('Error updating architects:', error);
  } finally {
    mongoose.disconnect();
  }
}

updateArchitects();
