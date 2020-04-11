import {Client} from '@elastic/elasticsearch';

export default new Client({node: `http://${process.env.ELASTICSEARCH_HOST}:9200`});
