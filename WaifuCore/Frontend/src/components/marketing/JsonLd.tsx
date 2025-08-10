import { useEffect } from "react";

const JsonLd = () => {
  useEffect(() => {
    const data = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Girlfriendie",
      applicationCategory: "AI Companion",
      operatingSystem: "Web",
      description:
        "Girlfriendie is an AI companion with chat, voice, and 3D presence, powered by WaifuCore.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(data);
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);
  return null;
};

export default JsonLd;
