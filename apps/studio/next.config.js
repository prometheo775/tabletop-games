//@ts-check

const path = require('node:path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Il root del monorepo Nx: evita che Turbopack scelga un root sbagliato
  // quando trova altri lockfile nelle cartelle superiori.
  turbopack: {
    root: path.join(__dirname, '..', '..'),
  },
};

module.exports = nextConfig;
