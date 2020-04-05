const express = require('express');
const router = express.Router();
const { Client } = require('@elastic/elasticsearch');
const asyncHandler = require('express-async-handler');
const { query } = require('express-validator');
const client = new Client({ node: `http://${process.env.ELASTICSEARCH_HOST}:9200` });

router.get('/', [query('q').not().isEmpty().escape()], asyncHandler(async (req, res, next) => {

  const result = await client.search({
    index: 'coyote',
    body: {
      _source: ['model', 'subject', 'url', 'forum'],
      suggest: {
        all_suggestions: {
          prefix: req.query.q,
          completion: {
            field: 'suggest',
            skip_duplicates: true,
            size: 5,
            context: {
              model: ['Topic']
            }
          }
        }
      }
    }});

    console.log(`Response time for "${req.query.q}": ${result.body.took}`);

    res.json(result.body.suggest.all_suggestions[0].options);
}));

module.exports = router;
