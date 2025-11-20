// pages/index.js
import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Nav from "../components/Nav.js";
import Filter from "../components/Filter.js";
import Title from "../components/Title.js";
import MetaTags from "../components/Metatags.js";
import Analytics from "../components/Analytics.js";
import FilterSVG from "../components/Icons/FilterSVG.js";

export default function Home() {
  const [designers, setDesigners] = useState([]);
  const [designersList, setDesignersList] = useState([]);
  const [filterIsOpen, setFilterIsOpen] = useState(false);
  const [filterList, setFilterList] = useState([]);
  const [filterCategory, setFilterCategory] = useState(null);

  // ✅ Cargar datos desde /api/designers
  useEffect(() => {
    async function loadDesigners() {
      try {
        const res = await fetch("/api/designers");
        const data = await res.json();

        // Añadimos expertiseList (array) a cada persona
        const withExpertiseList = data.map((d) => {
          const raw = d.expertise || "";
          const expertiseList = raw
            .split(",")
            .map((e) => e.trim())
            .filter(Boolean);

          return {
            ...d,
            expertiseList,
          };
        });

        setDesigners(withExpertiseList);

        // Construir filtros únicos (expertise + location)
        const uniqueExpertise = new Set();
        const uniqueLocation = new Set();

        withExpertiseList.forEach((d) => {
          d.expertiseList.forEach((e) => uniqueExpertise.add(e));
          if (d.location) uniqueLocation.add(d.location);
        });

        const expertises = Array.from(uniqueExpertise).map((e) => ({
          label: e,
          active: false,
          category: "expertise",
        }));

        const locations = Array.from(uniqueLocation)
          .sort()
          .map((e) => ({
            label: e,
            active: false,
            category: "location",
          }));

        setFilterList([...expertises, ...locations]);

        // Lista inicial: orden alfabético por nombre
        const sorted = [...withExpertiseList].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setDesignersList(sorted);
      } catch (err) {
        console.error("Error cargando designers:", err);
      }
    }

    loadDesigners();
  }, []);

  // ------- FILTROS -------

  const handleCloseFilter = (e) => {
    setFilterIsOpen(false);
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    return false;
  };

  const handleOpenFilter = (category) => {
    setFilterCategory(category);
    setFilterIsOpen(true);
  };

  const clearFilter = () => {
    const newFilter = filterList.map(({ label, category }) => ({
      label,
      category,
      active: false,
    }));

    setFilterList(newFilter);
    const sorted = [...designers].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    setDesignersList(sorted);
  };

  const handleFilterClick = (item) => {
    const newFilterList = [...filterList];
    const indexof = newFilterList.indexOf(item);
    newFilterList[indexof].active = !newFilterList[indexof].active;
    setFilterList(newFilterList);

    const filterExpert = newFilterList
      .filter((f) => f.category === "expertise")
      .map((d) => d.label);

    const filterLocation = newFilterList
      .filter((f) => f.category === "location")
      .map((d) => d.label);

    let activeFilters = newFilterList
      .filter((d) => d.active === true)
      .map((d) => d.label);

    if (filterExpert.filter((f) => activeFilters.includes(f)).length <= 0)
      activeFilters = activeFilters.concat(filterExpert);

    if (filterLocation.filter((f) => activeFilters.includes(f)).length <= 0)
      activeFilters = activeFilters.concat(filterLocation);

    if (activeFilters.length > 0) {
      const filtered = designers.filter((d) => {
        const expertiseMatch =
          d.expertiseList.length > 0
            ? d.expertiseList.some((e) => activeFilters.includes(e))
            : activeFilters.includes(d.expertise);

        const locationMatch =
          !d.location || activeFilters.includes(d.location);

        return expertiseMatch && locationMatch;
      });

      // Orden alfabético dentro del filtro
      const sortedFiltered = filtered.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setDesignersList(sortedFiltered);
    } else {
      clearFilter();
    }
  };

  return (
    <div className="container">
      <Head>
        <title>People who design</title>
        <link id="favicon" rel="alternate icon" href="/favicon.ico" />
        <MetaTags />
      </Head>

      <Content
        designers={designersList}
        handleOpenFilter={handleOpenFilter}
      />

      <AnimatePresence>
        {filterIsOpen ? (
          <Filter
            items={filterList.filter((f) => f.category === filterCategory)}
            handleFilterClick={handleFilterClick}
            handleCloseFilter={handleCloseFilter}
            categoryName={filterCategory}
          />
        ) : null}
      </AnimatePresence>

      <style global jsx>{`
        html,
        body {
          overflow: ${filterIsOpen ? "hidden" : "auto"};
        }
      `}</style>

      <Analytics />
    </div>
  );
}

function Content({ designers, handleOpenFilter, className, onClick }) {
  const tableHeaderRef = useRef();

  useEffect(() => {
    const header = tableHeaderRef.current;
    if (!header) return;

    const sticky = header.getBoundingClientRect().top + 40;

    const scrollCallBack = () => {
      if (window.pageYOffset > sticky) {
        header.classList.add("sticky");
      } else {
        header.classList.remove("sticky");
      }
    };

    window.addEventListener("scroll", scrollCallBack);
    return () => {
      window.removeEventListener("scroll", scrollCallBack);
    };
  }, []);

  return (
    <div className={className} onClick={onClick}>
      <Nav />

      <Title className="title m0 p0" text="People who&nbsp;design" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <table className="large tableContent" cellSpacing="0">
          <thead id="tableHeader" ref={tableHeaderRef}>
            <tr>
              <td>Name</td>
              <td
                className="thsize-aux dn filterTable"
                onClick={(e) => {
                  handleOpenFilter("location");
                  e.preventDefault();
                }}
              >
                Location <FilterSVG />
              </td>
              <td
                className="thsize-aux filterTable"
                onClick={(e) => {
                  handleOpenFilter("expertise");
                  e.preventDefault();
                }}
              >
                Expertise <FilterSVG />
              </td>
              <td className="thsize-link"></td>
            </tr>
          </thead>
          {designers && designers.length > 0 ? (
            <tbody>
              {designers.map((d, i) => (
                <tr key={`${d.name}-${i}`}>
                  <td>
                    <a href={d.link} target="_blank" rel="noreferrer">
                      {d.name}
                    </a>
                  </td>
                  <td className="thsize-aux dn">
                    <a href={d.link} target="_blank" rel="noreferrer">
                      {d.location}
                    </a>
                  </td>
                  <td className="thsize-aux">
                    <a href={d.link} target="_blank" rel="noreferrer">
                      {d.expertise}
                    </a>
                  </td>
                  <td className="thsize-link">
                    <a href={d.link} target="_blank" rel="noreferrer">
                      →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          ) : null}
        </table>
      </motion.div>
      <style jsx>{`
        .tableContent {
          padding-top: 18vh;
        }

        .filterTable {
          cursor: pointer;
        }

        thead {
          height: 2.2rem;
        }

        /* MÁS ESPACIO PARA LOCATION Y EXPERTISE */
        .thsize-aux {
          width: 30%;
        }

        .thsize-link {
          width: 2rem;
          text-align: right;
        }

        @media (max-width: 480px) {
          .thsize-aux {
            width: 35%;
          }
        }

        tbody a {
          width: 100%;
          padding-bottom: 0.6em;
          padding-top: 0.6em;
          color: inherit;
          display: inline-block;
        }

        table tbody td {
          padding-top: 0;
          padding-bottom: 0;
        }
      `}</style>
    </div>
  );
}

// util: mezcla si algún día lo quieres usar
function shuffle(array) {
  let m = array.length;
  let temp;
  let i;

  while (m) {
    i = Math.floor(Math.random() * m--);
    temp = array[m];
    array[m] = array[i];
    array[i] = temp;
  }

  return array;
}
