import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit, OnDestroy {
  // Carousel images using blog folder
  carouselImages = [
    {
      src: 'assets/assets/images/blog/01.jpg',
      alt: 'Modern Architecture Design',
      caption: 'Modern Design Excellence'
    },
    {
      src: 'assets/assets/images/blog/02.jpg',
      alt: 'Contemporary Architecture',
      caption: 'Innovative Spaces'
    },
    {
      src: 'assets/assets/images/blog/03.jpg',
      alt: 'Sustainable Architecture',
      caption: 'Urban Development'
    },
    {
      src: 'assets/assets/images/blog/04.jpg',
      alt: 'Architectural Project',
      caption: 'Sustainable Living'
    },
    {
      src: 'assets/assets/images/blog/05.jpg',
      alt: 'Interior Design',
      caption: 'Contemporary Vision'
    },
    {
      src: 'assets/assets/images/blog/06.jpg',
      alt: 'Urban Planning',
      caption: 'Future of Architecture'
    }
  ];

  // Static display data with custom descriptions and asset images
  staticDisplayData = [
    {
      src: 'assets/assets/images/architect/john-smith.jpg',
      alt: 'John Smith Architect',
      name: 'John',
      lastname: 'Smith',
      about: 'Visionary architect transforming urban landscapes with sustainable and innovative design solutions.'
    },
    {
      src: 'assets/assets/images/architect/emily-jones.jpg',
      alt: 'Emily Jones Architect',
      name: 'Emily',
      lastname: 'Jones',
      about: 'Award-winning specialist in eco-friendly residential architecture and green building technologies.'
    },
    {
      src: 'assets/assets/images/architect/thomas.jpg',
      alt: 'Thomas Macaulay Architect',
      name: 'Thomas',
      lastname: 'Macaulay',
      about: 'Master of cultural architecture, blending heritage preservation with contemporary design excellence.'
    },
    {
      src: 'assets/assets/images/architect/jane-doe.jpg',
      alt: 'Jane Doe Architect',
      name: 'Sarah',
      lastname: 'Wilson',
      about: 'Commercial architecture expert creating iconic skyscrapers and revolutionary office spaces.'
    },
    {
      src: 'assets/assets/images/architect/5520958.jpg',
      alt: 'Michael Chen Architect',
      name: 'Michael',
      lastname: 'Chen',
      about: 'Luxury interior designer crafting sophisticated residential and hospitality environments.'
    },
    {
      src: 'assets/assets/images/architect/kayla.jpg',
      alt: 'Lisa Rodriguez Architect',
      name: 'Lisa',
      lastname: 'Rodriguez',
      about: 'Infrastructure innovator specializing in smart city development and urban planning solutions.'
    }
  ];

  // This will hold the final architects data (real IDs + static display)
  architects: any[] = [];
  currentSlide = 0;
  slideInterval: any;
  loading = true;

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    console.log('About component initialized');
    this.loadArchitects();
    this.startSlideshow();
  }

  ngOnDestroy(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  loadArchitects(): void {
    console.log('Loading architects from MongoDB...');
    this.loading = true;

    this.dataService.getAllArchitects().subscribe(
      (backendArchitects: any[]) => {
        console.log('Backend architects loaded:', backendArchitects);
        
        if (backendArchitects && backendArchitects.length > 0) {
          // Map backend data to static display data
          this.architects = backendArchitects.map((backendArch: any, index: number) => {
            const staticData = this.staticDisplayData[index % this.staticDisplayData.length];
            
            return {
              // Use REAL MongoDB ObjectId for routing
              _id: backendArch._id,
              
              // Use static asset images and custom descriptions for display
              src: staticData.src,
              alt: staticData.alt,
              name: staticData.name,
              lastname: staticData.lastname,
              about: staticData.about,
              
              // Keep original backend data available if needed
              originalName: backendArch.name,
              originalLastname: backendArch.lastname,
              originalEmail: backendArch.email
            };
          });
          
          console.log('Final architects with real IDs:', this.architects);
        } else {
          console.log('No backend data, using static fallback');
          this.createStaticFallback();
        }
        
        this.loading = false;
      },
      (error) => {
        console.error('Failed to load from backend, using static fallback:', error);
        this.createStaticFallback();
        this.loading = false;
      }
    );
  }

  createStaticFallback(): void {
    // If backend fails, create architects with fake IDs (for development)
    this.architects = this.staticDisplayData.map((data, index) => ({
      _id: `static_${index + 1}`, // Fallback IDs
      src: data.src,
      alt: data.alt,
      name: data.name,
      lastname: data.lastname,
      about: data.about
    }));
    
    console.log('Using static fallback data:', this.architects);
  }

  startSlideshow(): void {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 4000);
  }

  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.carouselImages.length) % this.carouselImages.length;
    this.resetAutoSlide();
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.carouselImages.length;
  }

  setCurrentSlide(index: number): void {
    this.currentSlide = index;
    this.resetAutoSlide();
  }

  private resetAutoSlide(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
      this.startSlideshow();
    }
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      console.log('Image failed to load:', img.src);
      
      // Progressive fallback to images that should exist
      const fallbacks = [
        'assets/assets/images/blog/01.jpg',
        'assets/assets/images/blog/02.jpg',
        'assets/assets/images/blog/03.jpg',
        'assets/assets/images/blog/04.jpg',
        'assets/assets/images/blog/05.jpg',
        'assets/assets/images/logo.png'
      ];
      
      let nextFallback = null;
      for (const fallback of fallbacks) {
        if (!img.src.includes(fallback)) {
          nextFallback = fallback;
          break;
        }
      }
      
      if (nextFallback) {
        console.log('Trying fallback:', nextFallback);
        img.src = nextFallback;
      }
    }
  }

 
}