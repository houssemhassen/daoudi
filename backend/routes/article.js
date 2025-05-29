const express = require('express');

const router = express.Router();

const Article = require('../models/article');

const multer = require('multer');

filename = '';
const mystorage = multer.diskStorage({
    destination: './uploads',
    filename: (req , file , redirect )=>{
        let date = Date.now();

        let fl = date + '.' + file.mimetype.split('/')[1];

        redirect(null, fl);
        filename= fl;
    }
})

const upload = multer({storage: mystorage})

//post
router.post('/ajout',upload.any('image'),  (req, res)=>{
    let data = req.body; 
    let article = new Article(data) ; 
    article.date = new Date();
    article.image = filename ; 
    article.tags = data.tags.split(',');


    article.save()
       .then(
            (saved)=>{
                filename= '';
                res.status(200).send(saved);
            }
       )
       .catch(
             err=>{
                res.status(400).send(err)
             }

       )
})


//get


router.get('/all', (req, res)=>{
    Article.find({})
        .then (
            (articles)=>{
                res.status(200).send(articles);
            }
        )
        .catch (
            (err)=>{
                res.status(400).send(err);
            }
        )
    
})

router.get('/getbyid/:id', (req, res)=>{
    let id = req.params.id 
    Article.findOne({ _id: id })
    .then (
        (articles)=>{
            res.status(200).send(articles);
        }
    )
    .catch (
        (err)=>{
            res.status(400).send(err);
        }
    )
    
})

router.get('/getbyidarchitect/:id', (req, res)=>{

    let id = req.params.id 
    Article.find({ idArchitect: id })
    .then (
        (articles)=>{
            res.status(200).send(articles);
        }
    )
    .catch (
        (err)=>{
            res.status(400).send(err);
        }
    )
    
})

router.get('/search', (req, res) => {
    const { query } = req.query;
    const searchRegex = new RegExp(query, 'i');
    Article.find({
        $or: [
            { title: searchRegex },
            { content: searchRegex },
            { description: searchRegex },
            { tags: searchRegex }
        ]
    })
    .then(articles => {
        res.status(200).send(articles);
    })
    .catch(err => {
        res.status(400).send(err);
    });
})

//delete


router.delete('/supprimer/:id', (req, res)=>{
    let id = req.params.id
    Article.findByIdAndDelete({ _id: id })
    .then (
        (article)=>{
            res.status(200).send(article);
        }
    )
    .catch (
        (err)=>{
            res.status(400).send(err);
        }
    )

    
})


//update

router.put('/update/:id',upload.any('image'), (req, res)=>{
    let id = req.params.id
     let data = req.body;

     if (filename.length > 0 ){
        data.image = filename ; 
     }
     if (data.tags) {
        data.tags = data.tags.split(',');
    }

     Article.findByIdAndUpdate({ _id: id } , data) 
        .then (
            (articles)=>{
                filename= '';
                res.status(200).send(articles);
            }
        )
        .catch (
            (err)=>{
                res.status(400).send(err);
            }
        )
})

// seed route for creating initial articles
router.post('/seed', async (req, res) => {
    // First get the architects to link articles to them
    try {
        const architects = await require('../models/architect').find({});
        if (architects.length === 0) {
            return res.status(400).send('Please seed architects first');
        }

        const articles = [
            {
                title: 'Sustainable Urban Futures: The Role of Green Architecture',
                description: 'Exploring how sustainable architecture is reshaping our cities and creating a more environmentally conscious future.',
                content: `In the ever-evolving landscape of urban development, sustainable architecture stands as a beacon of innovation and environmental responsibility. This article explores how green building practices are transforming our cities and creating spaces that harmonize with nature while meeting the demands of modern life.

                The integration of renewable energy systems, green spaces, and eco-friendly materials is not just a trend but a necessary evolution in architectural design. From solar-powered buildings to living walls, we'll examine the cutting-edge technologies and approaches that are making our buildings more sustainable.

                Case studies from around the world demonstrate that sustainable architecture isn't just environmentally friendly – it's also economically viable and socially responsible. Join us as we explore the future of urban development through the lens of green architecture.`,
                tags: ['Sustainability', 'Urban Design', 'Green Building', 'Innovation'],
                image: '1718109495616.jpeg',
                date: new Date('2025-05-20'),
                idArchitect: architects[0]._id
            },
            {
                title: 'The Evolution of Modern Workspace Design',
                description: 'How contemporary office architecture is adapting to new ways of working and fostering collaboration.',
                content: `The modern workplace is undergoing a dramatic transformation, driven by changing work patterns and technological advancement. This article examines how architectural design is evolving to meet these new demands while creating spaces that inspire creativity and productivity.

                From open-plan layouts to biophilic design elements, we explore the key trends shaping office architecture today. The focus is on creating flexible spaces that can adapt to different work styles while promoting well-being and collaboration.

                We'll look at successful examples of modern workplace design and discuss how these spaces are helping companies attract talent and boost innovation.`,
                tags: ['Workplace Design', 'Innovation', 'Modern Architecture', 'Collaboration'],
                image: '1718109587844.jpeg',
                date: new Date('2025-05-15'),
                idArchitect: architects[1]._id
            },
            {
                title: 'Preserving Heritage: Modern Approaches to Historical Architecture',
                description: 'Balancing preservation with modern needs in historical building restoration.',
                content: `In an age of rapid urban development, the preservation of historical architecture presents unique challenges and opportunities. This article explores how architects are using innovative techniques to preserve historical buildings while adapting them for contemporary use.

                We'll examine case studies of successful restoration projects that demonstrate how modern technology and traditional craftsmanship can work together. The focus is on maintaining the cultural and historical significance of buildings while ensuring they remain functional and relevant in the modern world.

                From digital scanning technology to traditional restoration techniques, discover how architects are keeping our architectural heritage alive for future generations.`,
                tags: ['Historical Preservation', 'Restoration', 'Cultural Heritage', 'Innovation'],
                image: '1718068558189.jpeg',
                date: new Date('2025-05-10'),
                idArchitect: architects[2]._id
            },
            {
                title: 'Biophilic Design: Bringing Nature into Architecture',
                description: 'How incorporating natural elements into building design improves well-being and sustainability.',
                content: `Biophilic design represents a powerful approach to architecture that seeks to strengthen our connection with nature. This article explores how architects are incorporating natural elements and patterns into their designs to create healthier and more inspiring spaces.

                From living walls to natural lighting solutions, we'll examine the various ways that biophilic design is being implemented in modern architecture. The article will also discuss the scientific research supporting the benefits of nature-inspired design on human health and well-being.

                Through case studies and expert insights, learn how biophilic design is transforming our built environment and creating spaces that nurture both people and the planet.`,
                tags: ['Biophilic Design', 'Sustainability', 'Well-being', 'Innovation'],
                image: '1718102013093.jpeg',
                date: new Date('2025-05-05'),
                idArchitect: architects[0]._id
            }
        ];

        await Article.deleteMany({}); // Clear existing articles
        const savedArticles = await Article.insertMany(articles);
        res.status(200).json(savedArticles);
    } catch (err) {
        res.status(400).json(err);
    }
});

module.exports= router;