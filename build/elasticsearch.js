"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const elasticsearch_1 = require("@elastic/elasticsearch");
exports.default = new elasticsearch_1.Client({ node: `http://${process.env.ELASTICSEARCH_HOST}:9200` });
