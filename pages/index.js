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
  const [isReady, setIsReady] = useState(false);
  const [designers, setDesigners] = useState([]);
  const [designersList, setDesignersList] = useState([]);
  const [filterIsOpen, setFilterIsOpen] = useState(false);
  const [filterList, setFilterList] = useState([]);
  const [filterCategory, setFilterCategory] = useState(null);

  // Cargar datos desde /api/designers en el navegador
  useEffect(() => {
    async function loadDesigners() {
      try {
        const res = await fetch("/api/designers");
        const data = await res.json();

        // data debe ser un array de objetos con:
        // { name, location, expertise, link, approved, featured }
        setDesigners(data);

        // Filtros
        const uniqueExpertise = [...new Set(data.map((d) => d.expertise))];
        const uniqueLocation = [...new Set(data.map((d) => d.location))].sort();

        const expertises = uniqueExpertise.map((e) => ({
          label: e,
          active: false,
          category: "expertise",
        }));

        const locations = uniqueLocation.map((e) => ({
          label: e,
          active: false,
          category: "location",
        }));

        setFilterList(expertises.concat(locations));

        // Lista inicial: mezclamos y ordenamos por featured (si existe)
        setDesignersList(
          shuffle(data).sort((a, b) => (b.featured || 0) - (a.featured || 0))
        );

        setIsReady(true);
      } catch (err) {
        console.error("Error cargando designers:", err);
      }
    }

    loadDesigners();
  }, []);

  // ---- FILTROS ----

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
    setDesignersList(
      shuffle(designers).sort((a, b) => (b.featured || 0) - (a.featured || 0))
    );
  };

  const handleFilterClick = (item) => {
    const newFilterList = [...filterList];
    const indexOf = newFilterList.indexOf(item);

    newFilterList[indexOf].active = !newFilterList[indexOf].active;
    setFilterList(newFilterList);

    // columnas
    const filterExpert = newFilterList
      .filter((f) => f.category === "expertise")
      .map((d) => d.label);

    const filterLocation = newFilterList
      .filter((f) => f.category === "location")
      .map((d) => d.label);

    // activos
    let activeFilters = newFilterList
      .filter((d) => d.active === true)
      .map((d) => d.label);

    // Si no hay ninguno activo en una categoría, se consideran todos
    if (filterExpert.filter((f) => activeFilters.includes(f)).length <= 0) {
      activeFilters = activeFilters.concat(filterExpert);
    }
    if (filterLocation.filter((f) => activeFilters.includes(f)).length <= 0) {
      activeFilters = activeFilters.concat(filterLocation);
    }

    if (activeFilters.length > 0) {
      setDesignersList(
        designers.filter(
          (d) =>
            activeFilters.includes(d.expertise) &&
            activeFilters.includes(d.location)
        )
      );
    } else {
      clearFilter();
    }
  };

  return (
    <div
      className="container"
      style={{
        overflow: isReady ? "hidden" : "visible",
      }}
    >
      <Head>
        <title>People who design</title>
        <link id="favicon" rel="alternate icon" href="/favicon.ico" />
        <MetaTags />
      </Head>

      {isReady ? (
        <Content
          designers={designersList}
          handleOpenFilter={handleOpenFilter}
          onClick={filterIsOpen ? handleCloseFilter : undefined}
          className={filterIsOpen ? "filterIsOpen" : ""}
        />
      ) : null}

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
    </div>
  );
}

function Content({ designers, handleOpenFilter, className, onClick }) {
  const tableHeaderRef = useRef();

  useEffect(() => {
    const header = tableHeaderRef.current;
    const sticky = header.getBoundingClientRect().top + 40;
    const scrollCallBack = window.addEventListener("scroll", () => {
      if (window.pageYOffset > sticky) {
        header.classList.add("sticky");
      } else {
        header.classList.remove("sticky");
      }
    });
    return () => {
      window.removeEventListener("scroll", scrollCallBack);
    };
  }, []);

  return (
    <div className={className} onClick={onClick}>
      <Nav />

      <Title className="title m0 p0" text="People&nbsp;who&nbsp;design" />

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

        .thsize-aux {
          width: 20%;
        }

        .thsize-link {
          width: 2rem;
          text-align: right;
        }

        @media (max-width: 480px) {
          .thsize-aux {
            width: 30%;
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

      <Analytics />
    </div>
  );
}

function shuffle(array) {
  const arr = [...array];
  let m = arr.length,
    temp,
    i;

  while (m) {
    i = Math.floor(Math.random() * m--);
    temp = arr[m];
    arr[m] = arr[i];
    arr[i] = temp;
  }

  return arr;
}
