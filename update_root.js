const fs = require('fs');
const content = fs.readFileSync('src/components/RootDealerLanding.tsx', 'utf8');

const replacement = `          {/* Hero Video */}
          <div className="w-full max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,180,216,0.3)] border border-[#00b4d8]/40 bg-[#0a1128] relative aspect-video mt-8 mb-8 group">
            <iframe 
              className="absolute top-0 left-0 w-full h-full" 
              src="https://www.youtube.com/embed/E4veMe2yOOo?autoplay=1&mute=1&loop=1&playlist=E4veMe2yOOo&controls=1&rel=0" 
              title="Presentación DealerAmigo" 
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>

          {/* CTAs */}`;

const newContent = content.replace('{/* CTAs */}', replacement);
fs.writeFileSync('src/components/RootDealerLanding.tsx', newContent);
