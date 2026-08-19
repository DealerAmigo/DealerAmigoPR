const fs = require('fs');
const content = fs.readFileSync('src/components/HomeHeroAndSearch.tsx', 'utf8');

const replacement = `          {/* Hero Video */}
          <div className="w-full max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,180,216,0.25)] border border-[#00b4d8]/30 bg-[#0a1128] relative aspect-video mt-4 mb-6 group">
            <iframe 
              className="absolute top-0 left-0 w-full h-full" 
              src="https://www.youtube.com/embed/E4veMe2yOOo?autoplay=1&mute=1&loop=1&playlist=E4veMe2yOOo&controls=1&rel=0" 
              title="Presentación DealerAmigo" 
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>

          {/* Hero CTAs */}`;

const newContent = content.replace('{/* Hero CTAs */}', replacement);
fs.writeFileSync('src/components/HomeHeroAndSearch.tsx', newContent);
