const http = require('node:http');
var neo4j = require('neo4j-driver');
const formidable = require('formidable');
const { random } = require('lodash');
//const OpenAI = require("openai");
//const openai = new OpenAI({ apiKey:  });


const hostname = '127.0.0.1';
const port = 3000;
const USER = 'neo4j';
const PASSWORD = 'nbp55555';

var driver = neo4j.driver(
  'bolt://localhost',
  neo4j.auth.basic(USER, PASSWORD)
);



const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
  //res.setHeader('Access-Control-Allow-Credentials', 'true');
  //res.setHeader('Access-Control-Allow-Headers', 'sid');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE,PUT');
  //res.setHeader('withCredentials', 'true');
  console.log(req.url);
  res.statusCode = 200;
  //console.log(req.url.split('/')[1].slice(0,7));
  if (req.method == 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }
  // if (req.url == "/createNode" && req.method == 'POST') {
  //   const form = new formidable.IncomingForm();
  //   let fields;
  //   let files;
  //   [fields, files] = await form.parse(req);
  //   nodeName = fields.addNode[0];
  //   labels = fields.addNode[1];
  //   props = fields.addNode[2];
  //   properties = '';
  //   props.split(';').slice(0, -1).forEach(element => {
  //     properties += element + ', ';

  //   });
  //   properties = properties.substring(0, properties.length - 2);
  //   console.log(properties);
  //   session.run('CREATE (' + labels + ' {name: "' + nodeName + '",' + properties + '})').then((result) => {
  //     console.log(result);
  //   });
  //}
  // if (req.url == '/query' && req.method == 'POST') {
  //   const form = new formidable.IncomingForm();
  //   let fields;
  //   let files;
  //   [fields, files] = await form.parse(req);
  //   query = fields.queryInput[0];
  //   console.log(query);
  //   const completion = await openai.chat.completions.create({
  //     model: "gpt-4o-mini",
  //     messages: [
  //       {
  //         role: "user",
  //         content: query + ' .Return only the cypher query without code block and NOTHING else.'//+" without code block"
  //       }
  //     ],
  //   });

  //   console.log(completion.choices[0].message.content);
  //   session.run(completion.choices[0].message.content).then((result) => {
  //     console.log(result);
  //   });
  // }
  if (req.url == "/getSupplyChainNodes" && req.method == 'GET') {
    var session = driver.session({
      database: 'neo4j',
      defaultAccessMode: neo4j.session.WRITE
    });
    session.run('MATCH (n:supplier|wholesaler|warehouse|groceryStore) return n').then((result) => {
      session.close();
      console.log(result);
      res.end(JSON.stringify(result.records));
    });
  }
  if (req.url == "/getTrucks" && req.method == 'GET') {
    var session = driver.session({
      database: 'neo4j',
      defaultAccessMode: neo4j.session.WRITE
    });
    session.run('match (a)<-[x:TRANSPORTING_FROM]-(t:truck)-[y:TRANSPORTING_TO]->(b) return a,t,b').then((result) => {
      console.log(result);
      session.close();
      res.end(JSON.stringify(result.records));
    });
  }
  if (req.url == "/getStoresAndWarehouses" && req.method == 'GET') {
    var session = driver.session({
      database: 'neo4j',
      defaultAccessMode: neo4j.session.WRITE
    });
    session.run('MATCH (n:groceryStore|warehouse) return n').then((result) => {
      console.log(result);
      session.close();
      res.end(JSON.stringify(result.records));
    });
  }
  if (req.url.split('/')[1].slice(0, 7) == "delNode" && req.method == 'DELETE') {
    let s = req.url.split('/')[1].slice(7).substring(1);
    s = s.split('&');
    label = s[0].split('=')[1];
    nodeName = s[1].split('=')[1];
    console.log(label, nodeName);
    var session = driver.session({
      database: 'neo4j',
      defaultAccessMode: neo4j.session.WRITE
    });
    session.run('MATCH (n:' + label + ') where n.name="' + nodeName + '" detach delete n').then((result) => {
      console.log(result);
      session.close();
      res.end();
    });
  }
  if (req.url.split('/')[1].slice(0, 14) == "replenishStock" && req.method == 'PUT') {
    let s = req.url.split('/')[1].slice(14).substring(1);
    s = s.split('&');
    label = s[1].split('=')[1];
    nodeName = s[0].split('=')[1];
    stock = s[2].split('=')[1];
    let newStock = random(stock, 100, false);
    console.log(label, nodeName, stock, newStock);
    var session = driver.session({
      database: 'neo4j',
      defaultAccessMode: neo4j.session.WRITE
    });
    session.run('MATCH (n:' + label + ') where n.name="' + nodeName + '" set n.stock=toFloat(' + newStock + ')').then((result) => {
      console.log(result);
      session.run('match(p:truck) with count(p) as c MATCH (gs:' + label + ' where gs.name="' + nodeName + '") match(a:supplier|wholesaler) with c,a,gs  ORDER by rand() limit 1 with c,a,gs create (n:truck {name:"Truck"+c,lat:a.lat+'+random(0,0.001,true)+', lon:a.lon}), (n)-[:TRANSPORTING_FROM ]->(a), (n)-[:TRANSPORTING_TO]->(gs)').then((result) => {
        console.log(result);
        session.close();
        res.end();
      });
    });

  }
  if (req.url.split('/')[1] == "createNode" && req.method == 'POST') {
    let s = req.url.split('/')[2].substring(1);
    s = s.split('&');
    label = s[0].split('=')[1];
    nodeName = s[1].split('=')[1];
    lat = s[2].split('=')[1];
    lon = s[3].split('=')[1];
    var session = driver.session({
      database: 'neo4j',
      defaultAccessMode: neo4j.session.WRITE
    });
    // console.log(label, nodeName, lat, lon);
    if (label == 'groceryStore' || label == 'warehouse') {
      let newStock = random(0, 100, false);
      session.run('CREATE (n:' + label + ' {name:"' + nodeName + '" ,lat:' + lat + ', lon:' + lon + ',stock:toFloat(' + newStock + ') }' + ')').then((result) => {
        console.log(result);
        session.close();
        res.end();
      });
    } else {
      session.run('CREATE (n:' + label + ' {name:"' + nodeName + '" ,' + 'lat:' + lat + ',' + 'lon:' + lon + ' }' + ')').then((result) => {
        console.log(result);
        session.close();
        res.end();
      });
    }

  }
});
// async function prepareBot() {
//   const completion = await openai.chat.completions.create({
//     model: "gpt-4o-mini",
//     messages: [
//       {
//         role: "user",
//         content: "You are an assistant with an ability to generate Cypher queries from text.",
//       }
//     ],
//   });

//   console.log(completion.choices[0].message);
// }


server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

//prepareBot();