"use strict";
const Eleventy = require("@11ty/eleventy");
(async function () {
    let eleventy = new Eleventy();
    await eleventy.write();
})();
