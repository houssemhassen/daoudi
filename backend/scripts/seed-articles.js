const mongoose = require('mongoose');
const Article = require('../models/article');
const Architect = require('../models/architect');
require('../config/connect');

const articles = [
  {
    title: "Modern Sustainable Architecture: A Blueprint for the Future",
    description: "Exploring how sustainable architecture is shaping our cities and communities",
    content: `<p>Sustainable architecture has become more than just a trend—it's a necessity for our future. This article explores innovative approaches to sustainable building design and their impact on urban development.</p>
    <h2>Key Principles of Sustainable Architecture</h2>
    <ul>
      <li>Energy efficiency and renewable energy integration</li>
      <li>Sustainable materials and waste reduction</li>
      <li>Water conservation and management</li>
      <li>Biophilic design elements</li>
    </ul>`,
    image: "blog/01.jpg",
    tags: ["sustainable", "modern", "green-building"]
  },
  {
    title: "The Art of Urban Planning: Creating Livable Cities",
    description: "How thoughtful urban planning transforms cities into vibrant, livable spaces",
    content: `<p>Urban planning is both an art and a science, requiring a delicate balance between functionality and aesthetics. This article delves into successful urban planning projects and their impact on community life.</p>
    <h2>Elements of Successful Urban Planning</h2>
    <p>From transportation infrastructure to public spaces, every element plays a crucial role in creating a harmonious urban environment.</p>`,
    image: "blog/02.jpg",
    tags: ["urban-planning", "cities", "community"]
  },
  {
    title: "Innovative Interior Design Trends for 2025",
    description: "Discover the latest trends shaping interior architecture and design",
    content: `<p>As we move through 2025, interior design continues to evolve with new technologies and changing lifestyle needs. This article explores the most impactful trends in interior architecture.</p>
    <h2>Emerging Design Trends</h2>
    <ul>
      <li>Biophilic integration</li>
      <li>Smart home technology</li>
      <li>Flexible spaces</li>
      <li>Sustainable materials</li>
    </ul>`,
    image: "blog/03.jpg",
    tags: ["interior-design", "trends", "innovation"]
  },
  {
    title: "Historic Preservation in Modern Architecture",
    description: "Balancing preservation with modern architectural needs",
    content: `<p>Historic preservation plays a crucial role in maintaining our architectural heritage while adapting to modern needs. This article examines successful preservation projects and their impact.</p>`,
    image: "blog/04.jpg",
    tags: ["preservation", "history", "renovation"]
  },
  {
    title: "Sustainable Materials in Modern Construction",
    description: "Exploring eco-friendly building materials and their applications",
    content: `<p>The choice of building materials significantly impacts both environmental sustainability and architectural design. This article explores innovative sustainable materials and their applications in modern construction.</p>`,
    image: "blog/05.jpg",
    tags: ["materials", "sustainable", "construction"]
  },
  {
    title: "The Future of Smart Buildings",
    description: "How technology is transforming architectural design and building management",
    content: `<p>Smart buildings represent the convergence of architecture and technology. This article explores how IoT, AI, and other technologies are shaping the future of building design and management.</p>`,
    image: "blog/06.jpg",
    tags: ["smart-buildings", "technology", "innovation"]
  },
  {
    title: "Architectural Photography: Capturing Space and Light",
    description: "The art of photographing architecture and its importance in design",
    content: `<p>Architectural photography plays a crucial role in documenting and presenting architectural works. This article explores techniques and considerations in capturing buildings and spaces.</p>`,
    image: "blog/07.jpg",
    tags: ["photography", "design", "visual-arts"]
  },
  {
    title: "Biophilic Design: Connecting Architecture with Nature",
    description: "Integrating natural elements into architectural design",
    content: `<p>Biophilic design seeks to connect people with nature through architecture. This article explores principles and applications of biophilic design in various contexts.</p>`,
    image: "blog/08.jpg",
    tags: ["biophilic", "nature", "design"]
  }
];

async function seedArticles() {
  try {
    // Get all architects
    const architects = await Architect.find({});
    if (architects.length === 0) {
      console.log('No architects found. Please create architects first.');
      return;
    }

    // Delete existing articles
    await Article.deleteMany({});
    console.log('Cleared existing articles');

    // Distribute articles among architects
    const seededArticles = await Promise.all(
      articles.map(async (article, index) => {
        const architect = architects[index % architects.length]; // Distribute evenly
        const newArticle = new Article({
          ...article,
          idArchitect: architect._id,
          date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Random date within last 30 days
        });
        return newArticle.save();
      })
    );

    console.log(`Successfully seeded ${seededArticles.length} articles`);
    console.log('Articles created:', seededArticles.map(a => a.title));
  } catch (error) {
    console.error('Error seeding articles:', error);
  } finally {
    mongoose.disconnect();
  }
}

seedArticles();
