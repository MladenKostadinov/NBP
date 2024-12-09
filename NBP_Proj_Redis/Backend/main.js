
const http = require('node:http');
const redis = require('redis');
const { dirname } = require('path');
//const sqlite = require('node:sqlite');
const formidable = require('formidable');
const sqlite3 = require('sqlite3');
const fs = require('node:fs');
const { createHash } = require('crypto');
const { URL } = require('node:url');
const { url } = require('node:inspector');
const hostname = '127.0.0.1';
const port = 3000;

const db = new sqlite3.Database("./test.db", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);
db.run("CREATE TABLE IF NOT EXISTS Users (id integer primary key, email varchar(100)," +
  " password varchar(100), description varchar(255), picture varchar(255));");
db.run("CREATE TABLE IF NOT EXISTS Auctions (id integer primary key, name varchar(50)," +
  "description varchar(255), picture varchar(255),"
  + " owner varchar(100), currentBid INT, endDate DATETIME, CONSTRAINT nameUNQ UNIQUE(name) );");
db.run("CREATE VIRTUAL TABLE IF NOT EXISTS fts_Auctions_table USING fts5 (name,description)");
const redisClient = redis.createClient({
  url: 'redis://' + hostname + ':6379'
});
redisClient.connect();

//console.log(dirname(require.main.filename));

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'sid');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE,PUT');
  res.setHeader('withCredentials', 'true');

  if (req.method == 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }
  if (req.url == "/signin" && req.method == 'POST') {
    req.on('data', (body) => {
      email = body.toString().split(" ")[0];
      pass = body.toString().split(" ")[1];
      //console.log(email, pass);
      const hash = createHash('sha256').update(pass).digest('hex');
      redisClient.HGET(email, "password").then((result) => {
        if (result == null) {
          db.get("SELECT * FROM Users WHERE email = '" + email + "' ", (err, row) => {
            if (row) {
              if (row.password == hash) {
                redisClient.HSET(email, {
                  password: hash,
                  picture: row.picture, description: row.description
                });
                redisClient.EXPIRE(email, 900);
                const sid = crypto.randomUUID();
                createSession(email, sid);
                res.setHeader('set-cookie', 'sid=' + sid);
                //console.log(res.getHeaders());
                res.statusCode = 200;
                res.end("success");
              }
              else {
                res.statusCode = 401;
                res.end("wrong password");
              }
            } else {
              res.statusCode = 401;
              res.end("email doesnt exist");
            }
          });
        }
        else if (result == hash) {
          console.log("login successful");
          res.statusCode = 200;
          const sid = crypto.randomUUID();
          createSession(email, sid);
          res.setHeader('set-cookie', 'sid=' + sid);
          res.end("success");
        } else {
          res.statusCode = 401;
          res.end("wrong password");
        }
      });
      //const hash = createHash('sha256').update(body.toString().split(" ")[1]).digest('hex');

    });
  }
  else if (req.url == "/register" && req.method == 'POST') {

    const form = new formidable.IncomingForm();
    let fields;
    let files;
    [fields, files] = await form.parse(req);
    email = fields.email[0];
    pass = fields.pass[0];
    desc = fields.desc[0];
    fs.rename(files.picture[0].filepath, './img/' + email + 'Profile.jpeg', () => { });
    //path = resolve.resolve('./img/' + email + 'Profile.jpeg');
    path = './img/' + email + 'Profile.jpeg';

    db.get("SELECT * FROM Users WHERE email = '" + email + "' ", (err, row) => {
      if (row) {
        res.statusCode = 401;
        res.end("email already exists");
      } else {
        const hash = createHash('sha256').update(pass).digest('hex');
        db.prepare("INSERT INTO Users (email, password, picture, description) VALUES (?, ?, ?, ?)")
          .run([email, hash, path, desc]);
        redisClient.HSET(email, { password: hash, picture: path, description: desc });
        redisClient.EXPIRE(email, 900);
        const sid = crypto.randomUUID();
        createSession(email, sid);
        res.setHeader('set-cookie', 'sid=' + sid);
        res.statusCode = 200;
        res.end("success");
      }
    });

  }
  else if (req.url == "/profile" && req.method == 'GET') {
    redisClient.hGet(req.headers['sid'], "email").then((email) => {
      //if (email == null) {
      if (email == undefined) {
        res.statusCode = 401;
        res.setHeader('set-cookie', 'sid=deleted; expires=Sun, 1 Jan 2000 00:00:00 UTC;');
        console.log("sid doesnt exist/ invalid session");
        res.end("sid doesnt exist");
      }
      else {
        redisClient.hGetAll(email).then((profileData) => {
          //console.log(profileData);
          //console.log(isEmpty(profileData));
          if (isEmpty(profileData)) {
            res.statusCode = 404;
            res.end("no profile data in redis");
          } else {
            res.statusCode = 200;
            //console.log("." + profileData["picture"]);
            res.write(profileData["description"] + "----");
            res.end("." + profileData["picture"]);
          }

        });
      }
    });
  }
  else if (req.url == "/checkSession" && req.method == 'GET') {
    redisClient.EXISTS(req.headers['sid'])
      .then((result) => {
        if (result) {
          res.statusCode = 200;
          res.end("success");
        } else {
          res.statusCode = 401;
          res.setHeader('set-cookie', 'sid=deleted; expires=Sun, 1 Jan 2000 00:00:00 UTC;');
          //console.log(res.getHeaders());
          res.end("sid doesnt exist");
        }
      });
  }
  else if (req.url == "/newAuction" && req.method == 'POST') {
    const form = new formidable.IncomingForm();
    let fields;
    let files;
    [fields, files] = await form.parse(req);
    //console.log(fields);
    description = fields.desc[0];
    auctionName = fields.auctionName[0];
    bid = fields.bid[0];
    date = new Date();
    date.setTime(date.getTime() + (fields.durGrp[0] * 60 * 60 * 1000 + 2 * 60 * 60 * 1000));
    date = date.toISOString().slice(0, 19).replace('T', ' ');
    redisClient.hGet(req.headers['sid'], "email").then((email) => {
      if (email == undefined) {
        res.statusCode = 401;
        res.setHeader('set-cookie', 'sid=deleted; expires=Sun, 1 Jan 2000 00:00:00 UTC;');
        console.log("sid doesnt exist/ invalid session");
        res.end("sid doesnt exist");
      }
      else {
        path = './aucImg/' + auctionName + 'auc.jpeg';
        fs.rename(files.picture[0].filepath, path, () => { });
        db.prepare("INSERT INTO Auctions (name,description, picture, owner," +
          " currentBid, endDate) VALUES (?, ?, ?, ?, ?, ?)",
          (err) => {
            if (err != null)
              console.log(err.name);
          }).run([auctionName, description, path, email, bid, date], (err) => {
            if (err != null) {
              console.log(err.code);
              if (err.code == "SQLITE_CONSTRAINT") {
                res.statusCode = 409;
                res.end("auction with the same name already exists");
              }
            }
            else {
              db.prepare("INSERT INTO fts_Auctions_table ( description, name) " +
                "SELECT  description, name FROM Auctions WHERE name='" + auctionName + "'", (err) => {
                  if (err != null)
                    console.log(err.name);
                }).run((err) => {
                  if (err != null)
                    console.log(err.name);
                });
              redisClient.HSET(auctionName, {
                picture: path, description: description,
                owner: email, currentBid: bid, endDate: date
              });
              redisClient.EXPIRE(auctionName, 900);
              redisClient.hGet(req.headers['sid'], 'email').then((email) => {
                redisClient.EXISTS(email + "allAuctions")
                  .then((result) => {
                    if (result) {
                      redisClient.SADD(email + "allAuctions", auctionName);
                      res.statusCode = 200;
                      res.end("success");
                    }
                  });
              });
              res.statusCode = 200;
              res.end();
            }
          });
      }
    });
  }
  else if (req.url == "/yourAuctions" && req.method == 'GET') {
    redisClient.EXISTS(req.headers['sid']).then((result) => {
      if (!result) {
        res.statusCode = '409';
        res.end('sid error');
        return;
      };
      redisClient.hGet(req.headers['sid'], "email").then((email) => {
        redisClient.SMEMBERS(email + "allAuctions").then((result) => {
          res.setHeader('Content-Type', 'application/json');
          //console.log(result);
          if (isEmpty(result)) {
            db.all("SELECT * FROM Auctions WHERE owner = '" + email + "' ", (err, rows) => {
              //console.log(rows);
              if (rows.length == 0) {
                res.statusCode = '200';
                res.end('[]');
                return;
              }
              array = [];
              rows.forEach((value, i) => {
                redisClient.HSET(value.name, {
                  picture: value.picture,
                  description: value.description, owner: value.owner,
                  currentBid: value.currentBid, endDate: value.endDate
                });
                redisClient.EXPIRE(value.name, 900);
                //array["auction" + i] = value.name;
                array.push(value.name);
              });
              redisClient.SADD(email + "allAuctions", array);
              redisClient.EXPIRE(email + "allAuctions", 900);
              res.end(JSON.stringify(rows));
            });
          }
          else {
            let arrayAuctions = [];
            let promises = [];

            result.forEach((val, i) => {
              promises.push(redisClient.hGetAll(val));
            });
            Promise.allSettled(promises).then((values) => {
              values.forEach((auc, i) => {
                auc.value['name'] = result[i];
                //console.log(result[x]);
                arrayAuctions.push(auc.value);
              });
            }).then(() => {
              //console.log(arrayAuctions);
              res.end(JSON.stringify(arrayAuctions));
            });
          };
        });
      });
      return;
    });
  }
  else if (req.url.split('/')[1] == "deleteAuction" && req.method == 'DELETE') {
    redisClient.EXISTS(req.headers['sid']).then((result) => {
      if (!result) {
        res.statusCode = '409';
        res.end('sid error');
        return;
      };
    });
    db.run("DELETE from Auctions WHERE name='" + req.url.split('/')[2] + "'", (result, err) => {
      if (err) throw err;
      fs.unlink('./aucImg/' + req.url.split('/')[2] + 'auc.jpeg', (err) => {
        if (err) throw err;
        //console.log('path/file.txt was deleted');
      });
      db.prepare("DELETE from fts_Auctions_table WHERE name='" + req.url.split('/')[2] + "'")
        .run((result, err) => {
          if (err) throw err;
        });
      redisClient.DEL(req.url.split('/')[2]).then(() => {
        //res.statusCode = '200';
        //res.end();
      });
    }); //problem
    // redisClient.hGet(req.headers['sid'], 'email').then((email) => {
    //   redisClient.EXISTS(email + "allAuctions")
    //     .then((result) => {
    //       if (result) {
    //         redisClient.sMembers(email + "allAuctions").then((auctions) => {
    //           auctions.forEach((val, i) => {
    //             if (val == req.url.split('/')[2]) {

    //             }
    //           });
    //           res.statusCode = 200;
    //           res.end("success");
    //         });
    //       }
    //     });
    // });
    redisClient.hGet(req.headers['sid'], 'email').then((email) => {
      redisClient.SREM(email + "allAuctions", req.url.split('/')[2]);
    });
  }
  else if (req.url.split('/')[1] == "updateAuction" && req.method == 'PUT') {
    redisClient.EXISTS(req.headers['sid']).then((result) => {
      if (!result) {
        res.statusCode = '409';
        res.end('sid error');
        return;
      };
    });
    //console.log(req.url);
    const form = new formidable.IncomingForm();
    let fields;
    let files;
    [fields, files] = await form.parse(req);
    //console.log(fields);
    newName = fields.auctionName[0];
    description = fields.desc[0];
    oldName = req.url.split('/')[2];

    fs.unlink('./aucImg/' + oldName + 'auc.jpeg', (err) => {
      if (err) throw err;
    });
    path = './aucImg/' + newName + 'auc.jpeg';
    fs.rename(files.picture[0].filepath, path, (err) => {
      if (err) throw err;
    });
    db.run("UPDATE Auctions SET name='" + newName + "', description='" + description
      + "', picture='" + path + "' WHERE name='" + oldName + "'", (result, err) => {
        if (err) throw err;
        db.run("UPDATE fts_Auctions_table SET name='" + newName + "', description='" + description
          + "' WHERE name='" + oldName + "'", (result, err) => {
            if (err) throw err;
          });
        res.statusCode = '200';
        res.end();
      });
    redisClient.hGetAll(oldName).then((result) => {
      //console.log(result);
      redisClient.del(oldName);
      redisClient.HSET(newName, {
        picture: path,
        description: description, owner: result.owner,
        currentBid: result.currentBid, endDate: result.endDate
      });
      redisClient.EXPIRE(newName, 900);
      redisClient.SREM(result.owner + "allAuctions", oldName);
      redisClient.SADD(result.owner + "allAuctions", newName);
    });
  }
  else if (req.url.includes('/search?q=') && req.method == 'GET') {
    res.setHeader('Content-Type', 'application/json');
    const query = decodeURI(req.url.replace('/search?q=', ''));
    //console.log(query);
    if (query == '') {
      res.statusCode = '404';
      res.end('[]');
      return;
    }
    redisClient.SMEMBERS("search:" + query).then((result) => {
      console.log(result);
      if (isEmpty(result)) {
        db.all("SELECT * FROM Auctions WHERE name IN "
          + "(SELECT name FROM fts_Auctions_table WHERE fts_Auctions_table MATCH '"
          + query + "' ORDER BY rank)", (err, rows) => {
            if (err) throw err;
            let setAuctions = [];
            rows.forEach((val, i) => {
              delete val['id'];
              redisClient.HSET(val.name, {
                picture: val.picture,
                description: val.description, owner: val.owner,
                currentBid: val.currentBid, endDate: val.endDate
              });
              redisClient.EXPIRE(val.name, 900);
              setAuctions.push(val.name);
            });
            if (!isEmpty(setAuctions)) {
              redisClient.SADD("search:" + query, setAuctions).then((result) => {
              });
              redisClient.EXPIRE("search:" + query, 90);
            }
            res.statusCode = '200';
            res.end(JSON.stringify(rows));
          });
      }
      else {
        let arrayAuctions = [];
        let promises = [];
        result.forEach((val, i) => {
          promises.push(redisClient.hGetAll(val));
        });
        Promise.allSettled(promises).then((values) => {
          values.forEach((auc, i) => {
            auc.value['name'] = result[i];
            //console.log(result[x]);
            arrayAuctions.push(auc.value);
          });
        }).then(() => {
          res.statusCode = '200';
          res.end(JSON.stringify(arrayAuctions));
        });
      }
    });
  }
  else if (req.url.split('/')[1] == "home" && req.method == 'GET') {
    //SELECT name FROM Auctions ORDER BY RANDOM() LIMIT 5
    db.all("SELECT * FROM Auctions ORDER BY RANDOM() LIMIT 5", (err, rows) => {
      if (err) throw err;
      rows.forEach((val, i) => {
        delete val['id'];
      })
      res.statusCode = '200';
      res.end(JSON.stringify(rows));
    });
  }
  else if (req.url.split('/')[1] == "auctions" && req.method == 'GET') {
    res.statusCode = '200';
    var name = req.url.split('/')[2];
    redisClient.zIncrBy('leaderboard', 1, name);
    redisClient.hGetAll(req.url.split('/')[2]).then((result) => {
      if (!isEmpty(result)) {
        result['name'] = req.url.split('/')[2];
        //console.log(result);
        res.end(JSON.stringify(result));
      }
      else {
        db.get("SELECT * FROM Auctions WHERE name = '" + req.url.split('/')[2] + "' ",
          (err, row) => {
            if (err) throw err;
            if (row) {
              redisClient.HSET(row.name, {
                picture: row.picture,
                description: row.description, owner: row.owner,
                currentBid: row.currentBid, endDate: row.endDate
              });
              delete row.id;
              redisClient.EXPIRE(row.name, 900);
              res.end(JSON.stringify(row));
            }
            else {
              res.statusCode = '404';
              res.end();
            }
          });
      }
    });
  }
  else if (req.url.split('?')[0] == "/bid" && req.method == 'POST') {

    let bid = req.url.split('?')[0].slice(1);
    let amount = req.url.split('?')[2].slice(7);
    let name = req.url.split('?')[1].slice(5);
    //console.log(bid, amount, name);

    redisClient.EXISTS(req.headers['sid']).then((result) => {
      if (!result) {
        res.statusCode = '409';
        res.end('sid error');
        return;
      };
    });
    redisClient.hGetAll(name).then((result) => {
      if (!isEmpty(result)) {
        if (result.currentBid < amount) {
          db.run("UPDATE Auctions SET currentBid=" + amount + " WHERE name='" + name + "'", (() => {
            redisClient.hSet(name, { currentBid: amount });
          }));
        }
      }
      else {
        db.get("SELECT * FROM Auctions WHERE name = '" + name + "' ",
          (err, row) => {
            if (err) throw err;
            if (row) {
              if (row.currentBid < amount) {
                db.run("UPDATE Auctions SET currentBid=" + amount + " WHERE name='"
                  + name + "'", (() => {
                    redisClient.HSET(row.name, {
                      picture: row.picture,
                      description: row.description, owner: row.owner,
                      currentBid: amount, endDate: row.endDate
                    });
                    redisClient.EXPIRE(row.name, 900);
                  }));
              }
              else {
                redisClient.HSET(row.name, {
                  picture: row.picture,
                  description: row.description, owner: row.owner,
                  currentBid: row.currentBid, endDate: row.endDate
                });
                redisClient.EXPIRE(row.name, 900);
              }
            }
            else {
              res.statusCode = '404';
              res.end();
            }
          });
      }
    });
  }
  else if (req.url.split('/')[1] == "top10" && req.method == 'GET') {
    redisClient.zRangeWithScores('leaderboard', 0, 9).then((result1) => {
      //console.log(result1);
      var top10set = [];
      var promises=[];
      result1.forEach((element,index) => {
       var p = redisClient.hGetAll(element['value']).then((result) => {
          if (!isEmpty(result)) {
            result['name'] = element['value'];
            result['views'] = element['score'];
            top10set.push(result);
          }
          else {
            db.get("SELECT * FROM Auctions WHERE name = '" + element['value'] + "' ",
              (err, row) => {
                if (err) throw err;
                if (row) {
                  redisClient.HSET(row.name, {
                    picture: row.picture,
                    description: row.description, owner: row.owner,
                    currentBid: row.currentBid, endDate: row.endDate
                  });
                  delete row.id;
                  redisClient.EXPIRE(row.name, 900);
                  row['views'] = element['score'];
                  top10set.push(row);
                }
              });
          }
        });
        promises.push(p);
      })
      Promise.allSettled(promises).then(() => {
        console.log(top10set);
        res.end(JSON.stringify(top10set));
      });;;
    });
  }
});


server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

function createSession(email, sid) {
  redisClient.HSET(sid, { email });
  redisClient.EXPIRE(sid, 900);
}

function isEmpty(obj) {
  for (var prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false;
    }
  }

  return true
}
