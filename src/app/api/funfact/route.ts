// app/api/funfact/route.ts
export async function POST(req: Request) {
    const { country } = await req.json();

    try {
      
      const response = await fetch(
        "https://api-inference.huggingface.co/models/google/flan-t5-base",
        {
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            inputs: `Generate a short interesting but random fact about beer or brewing traditions in ${country}. Keep it to one or two sentences.`
          }),
        }
      );
  
      const result = await response.json();
      console.log('Fun fact generated:', result);

      return Response.json({ funFact: result[0].generated_text });
    } catch (error) {
      console.error('Fun fact generation error:', error);
      
      // Fallback to predefined facts if API fails
      const fallbackFacts = {
        "Germany": "Germany's Beer Purity Law (Reinheitsgebot) from 1516 is one of the oldest food regulations still in use today.",
        "Belgium": "Belgium has over 1,000 different beer varieties and beer culture is on UNESCO's cultural heritage list.",
        "Czech Republic": "The Czech Republic has the highest beer consumption per capita in the world.",
        "Ireland": "The dark ruby color in Guinness comes from roasted unmalted barley.",
        "default": "This country has its own unique brewing traditions that contribute to global beer culture."
      };
  
      return Response.json({ 
        funFact: fallbackFacts[country as keyof typeof fallbackFacts] || fallbackFacts.default 
      });
    }
  }