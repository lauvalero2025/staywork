export async function getStaticProps() {
  const origin =
    process.env.NODE_ENV !== "production"
      ? "http://localhost:3000"
      : "https://staywork.digital"; // 👈 TU dominio

  const res = await fetch(`${origin}/api/designers`);
  const designers = await res.json();

  let uniqueExpertise = new Set();
  designers.map((d) => uniqueExpertise.add(d.expertise));

  let uniqueLocation = new Set();
  designers.map((d) => uniqueLocation.add(d.location));

  let expertises = Array.from(uniqueExpertise).map((e) => {
    return { label: e, active: false, category: "expertise" };
  });

  let locations = Array.from(uniqueLocation)
    .sort()
    .map((e) => {
      return { label: e, active: false, category: "location" };
    });

  let filters = expertises.concat(locations);

  return {
    props: {
      designers,
      filters,
    },
  };
}
