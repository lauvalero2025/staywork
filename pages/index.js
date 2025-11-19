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
        designers
