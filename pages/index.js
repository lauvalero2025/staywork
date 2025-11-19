import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Nav from "../components/Nav.js";
import Filter from "../components/Filter.js";
import Title from "../components/Title.js";
import MetaTags from "../components/Metatags.js";
import Analytics from "../components/Analytics.js";
import FilterSVG from "../components/Icons/FilterSVG.js";

// ==============================
//  GET DATA FROM GOOGLE SHEETS
// ==============================
export async function getStaticProps() {
  const isProd = process.env.NODE_ENV === "production";

  // En producción usamos la URL del deploy real
  const origin = isProd
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  console.log("ORIGIN:", origin);

  try {
    const res = await fetch(`${origin}/api/designers`);
    const designers = await res.json();

    // Extraer categorías
    let uniqueExpertise = new Set();
    let uniqueLocation = new Set();

    designers.forEach((d) => {
      uniqueExpertise.add(d.expertise);
      uniqueLocation.add(d.location);
    });

    let expertises = Array.from(uniqueExpertise).map((e) => ({
      label: e,
      active: false,
      category: "expertise",
    }));

    let locations = Array.from(uniqueLocation)
      .sort()
      .map((e) => ({
        label: e,
        active: false,
        category: "location",
      }));

    let filters = expertises.concat(locations);

    return {
      props: {
        designers,
        filters,
      },
      revalidate: 30, // se actualiza cada 30 segundos
    };
  } catch (error) {
    console.error("Error getStaticProps:", error);

    return {
      props: {
        designers: [],
        filters: [],
      },
    };
  }
}

// =========================================
//  MAIN PAGE COMPONENT (TIENE EXPORT DEFAULT)
// =========================================
export default function Home({ designers, filters }) {
  const [designersList, setDesignersList] = useState([]);
  const [filterIsOpen, setFilterIsOpen] = useState(false);
  const [filterList, setFilterList] = useState(filters);
  const [filterCategory, setFilterCategory] = useState(null);

  // Cargar lista inicial
  useEffect(() => {
    if (designers && designers.length > 0) {
      setDesignersList(
        shuffle([...designers]).sort((a, b) => (a.featured ? -1 : 1))
      );
    }
  }, [designers]);

  const handleCloseFilter = (e) => {
    setFilterIsOpen(false);
    e?.preventDefault();
  };

  const handleOpenFilter = (category) => {
    setFilterCategory(category);
    setFilterIsOpen(true);
  };

  const clearFilter = () => {
    let newFilter = filters.map((f) => ({
      label: f.label,
      active: false,
      category: f.category,
    }));

    setFilterList(newFilter);
    setDesignersList(shuffle(designers));
  };

  const handleFilterClick = (item) => {
    let index = filterList.indexOf(item);
    filterList[index].active = !filterList[index].active;
    setFilterList([...filterList]);

    let active = filterList.filter((f) => f.active).map((f) => f.label);

    if (active.length === 0) {
      return clearFilter();
    }

    setDesignersList(
      designers.filter(
        (d) => active.includes(d.expertise) || active.includes(d.location)
      )
    );
  };

  return (
    <div className="container">
      <Head>
        <title>staywork — talent</title>
        <MetaTags />
      </Head>

      <Nav />
      <Title className="title m0 p0" text="People*who design" />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Table
          designers={designersList}
          handleOpenFilter={handleOpenFilter}
        />
      </motion.div>

      <AnimatePresence>
        {filterIsOpen ? (
          <Filter
            items={filterList.filter((f) => f.category === filterCategory)}
            categoryName={filterCategory}
            handleFilterClick={handleFilterClick}
            handleCloseFilter={handleCloseFilter}
          />
        ) : null}
      </AnimatePresence>

      <Analytics />
    </div>
  );
}

// ==============================
//  TABLE COMPONENT
// ==============================
function Table({ designers, handleOpenFilter }) {
  const tableHeaderRef = useRef();

  useEffect(() => {
    const header = tableHeaderRef.current;
    const sticky = header.getBoundingClientRect().top + 40;

    const scrollCallback = () => {
      if (window.pageYOffset > sticky) header.classList.add("sticky");
      else header.classList.remove("sticky");
    };

    window.addEventListener("scroll", scrollCallback);

    return () => window.removeEventListener("scroll", scrollCallback);
  }, []);

  return (
    <table className="large tableContent" cellSpacing="0">
      <thead id="tableHeader" ref={tableHeaderRef}>
        <tr>
          <td>Name</td>
          <td
            className="thsize-aux dn filterTable"
            onClick={() => handleOpenFilter("location")}
          >
            Location <FilterSVG />
          </td>
          <td
            className="thsize-aux filterTable"
            onClick={() => handleOpenFilter("expertise")}
          >
            Expertise <FilterSVG />
          </td>
          <td className="thsize-link"></td>
        </tr>
      </thead>

      {designers && designers.length ? (
        <tbody>
          {designers.map((d, i) => (
            <tr key={`${d.name}-${i}`}>
              <td>
                <a href={d.link}>{d.name}</a>
              </td>
              <td className="thsize-aux dn">
                <a href={d.link}>{d.location}</a>
              </td>
              <td className="thsize-aux">
                <a href={d.link}>{d.expertise}</a>
              </td>
              <td className="thsize-link">
                <a href={d.link}>→</a>
              </td>
            </tr>
          ))}
        </tbody>
      ) : null}
    </table>
  );
}

// ==============================
//  SHUFFLE
// ==============================
function shuffle(array) {
  let m = array.length,
    temp,
    i;

  while (m) {
    i = Math.floor(Math.random() * m--);
    temp = array[m];
    array[m] = array[i];
    array[i] = temp;
  }
  return array;
}
