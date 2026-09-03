import { conference } from "@/data/conference";

/**
 * Explore Hyderabad — the host city. Kept factual: each entry is a real,
 * well-known landmark, with no opening times, ticket prices or distances,
 * none of which the committee has published.
 */
const PLACES = [
  {
    name: "Golconda Fort",
    tag: "16th century",
    image: "/hyderabad/golconda.jpg",
    blurb: "The granite citadel of the Qutb Shahi kings, famous for acoustics that carry a handclap from the gateway to the summit.",
  },
  {
    name: "Salar Jung Museum",
    tag: "Collection",
    image: "/hyderabad/salar-jung.jpg",
    blurb: "One of the largest one-man collections in the world — sculpture, manuscripts and textiles gathered across continents.",
  },
  {
    name: "Hussain Sagar",
    tag: "Heart of the city",
    image: "/hyderabad/hussain-sagar.jpg",
    blurb: "The lake separating Hyderabad from Secunderabad, with the monolithic Buddha statue standing at its centre.",
  },
  {
    name: "Birla Mandir",
    tag: "Naubath Pahad",
    image: "/hyderabad/birla-mandir.jpg",
    blurb: "A white marble temple on the hill above Hussain Sagar, with one of the widest views over the city.",
  },
  {
    name: "Ramoji Film City",
    tag: "Day trip",
    image: "/hyderabad/ramoji.jpg",
    blurb: "The world's largest integrated film studio complex, on the eastern edge of the city.",
  },
  {
    name: "HITEC City",
    tag: "Modern Hyderabad",
    image: "/hyderabad/hitec-city.jpg",
    blurb: "The technology and biotech corridor that made Hyderabad a centre for research, pharma and medical innovation.",
  },
] as const;

export default function Hyderabad() {
  return (
    <section id="hyderabad" className="relative">
      <div className="u-shell py-[clamp(2rem,5vh,3.5rem)]">
        <p className="u-eyebrow flex items-center gap-3" data-r>
          <span aria-hidden className="h-px w-8 bg-[#b3122a]" /> The host city
        </p>
        <h2 className="mt-5 max-w-3xl text-[clamp(1.8rem,4.2vw,3.2rem)] font-extrabold leading-[1.04] tracking-[-0.025em]" data-r>
          Explore <span className="u-serif">Hyderabad</span>
        </h2>
        <p className="mt-4 max-w-[58ch] text-[clamp(.9rem,1.05vw,1.05rem)] leading-[1.72] text-muted-foreground" data-r>
          {conference.city} joins a 400-year-old walled city to one of India&rsquo;s largest technology and pharmaceutical
          corridors. Both conference venues sit within it, so there is time either side of the sessions.
        </p>

        <ul className="mt-[clamp(2rem,4vh,3rem)] grid list-none grid-cols-1 gap-[clamp(1.25rem,2.5vw,2rem)] p-0 sm:grid-cols-2 lg:grid-cols-3">
          {PLACES.map((place) => (
            <li key={place.name} data-r className="group">
              <div className="overflow-hidden rounded-sm border border-[var(--hair)] bg-white">
                <img
                  src={place.image}
                  alt={place.name}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                />
              </div>
              <p className="mt-3 font-mono text-[8px] uppercase tracking-[.18em] text-[#b3122a]">{place.tag}</p>
              <h3 className="mt-1.5 text-[1.05rem] font-bold tracking-[-0.015em]">{place.name}</h3>
              <p className="mt-1.5 text-[0.85rem] leading-[1.65] text-muted-foreground">{place.blurb}</p>
            </li>
          ))}
        </ul>

        <p className="mt-8 border-t border-[var(--hair)] pt-5 font-mono text-[0.66rem] uppercase leading-[1.8] tracking-[0.14em] text-[#7d656c]" data-r>
          Rajiv Gandhi International Airport serves both venues · City transport guidance to be published
        </p>
      </div>
    </section>
  );
}
