const http = require('node:http');
const { MongoClient } = require("mongodb");
const hostname = '127.0.0.1';
const port = 3000;
const { createHash } = require('crypto');
const formidable = require('formidable');
const fs = require('node:fs');
var ObjectId = require('mongodb').ObjectId;

const uri = "mongodb://127.0.0.1:27017/?directConnection=true";

const client = new MongoClient(uri, { monitorCommands: true });
//client.on('commandStarted', (event) => console.debug(event));
//client.on('commandSucceeded', (event) => console.debug(event));
//client.on('commandFailed', (event) => console.debug(event));

const fields = ['field1', 'field2'];

const server = http.createServer(async (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'sid,tsid');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE,PUT');
    //console.log(req.url.split('?'));
    var fullUrl = new URL(req.url, 'http://127.0.0.1:5500');
    if (req.method == 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
    }
    if (req.url == "/Categories" && req.method == 'GET') {
        const myDB = client.db("MyDB");
        // const result = await myDB.listCollections({ name: { $nin: ['Accounts', 'Sessions', 'TempSessions'] } }).toArray();
        // //console.log(result);
        // result.forEach((element, i) => {
        //     result[i] = element.name;
        // })
        const result = await myDB.collection("Products").distinct('category');
        //console.log(result);
        res.statusCode = 200;
        res.end(JSON.stringify(result));
    }
    if (req.url == "/signin" && req.method == 'POST') {
        req.on('data', async (body) => {
            var email = body.toString().split(" ")[0];
            var pass = body.toString().split(" ")[1];
            const myDB = client.db("MyDB");
            const myColl = myDB.collection("Accounts");
            const result = await myColl.findOne({ email: email });
            const hash = createHash('sha256').update(pass).digest('hex');
            //console.log(result);
            if (result == null) {
                res.statusCode = 401;
                res.end('Account doesnt exist.');
            } else if (hash != result.pass) {
                res.statusCode = 401;
                res.end('Wrong password.');
            } else {
                const sid = crypto.randomUUID();
                client.db("MyDB").collection("Sessions").insertOne({ sid: sid, email: email, "createdAt": new Date() });
                res.setHeader('set-cookie', ['sid=' + sid + '; SameSite=None; Secure;', ' tsid=deleted; SameSite=None; Secure; expires=Sun, 1 Jan 2000 00:00:00 UTC;']);
                res.statusCode = 200;
                res.end();
            }
        });

    }
    if (req.url == "/register" && req.method == 'POST') {
        req.on('data', async (body) => {
            var email = body.toString().split(" ")[0];
            var pass = body.toString().split(" ")[1];
            try {
                const myDB = client.db("MyDB");
                const myColl = myDB.collection("Accounts");
                const hash = createHash('sha256').update(pass).digest('hex');
                const doc = { email: email, pass: hash, description: "default", picture: "./img/default.jpeg", items: [] };
                const result = await myColl.insertOne(doc);
                //console.log(email,pass,result);
                res.statusCode = 200;
                res.end();
            } catch (error) {
                //console.log(error);
                if (error.code == 11000) {
                    res.statusCode = 409;
                    res.end();
                }
            }
        });
    }
    if (req.url == "/checkSession" && req.method == 'GET') {
        const result = await client.db("MyDB").collection("Sessions").findOne({ sid: req.headers['sid'] });
        //console.log(result);
        if (result) {
            res.statusCode = 200;
            res.end("success");
        } else {
            res.statusCode = 401;
            res.setHeader('set-cookie', 'sid=deleted; SameSite=None; Secure; expires=Sun, 1 Jan 2000 00:00:00 UTC;');
            res.end("sid doesnt exist");
        }
    }
    if (req.url == "/profile" && req.method == 'GET') {
        const result = await client.db("MyDB").collection("Sessions").findOne({ sid: req.headers['sid'] });
        //console.log(result);
        if (result == null) {
            res.statusCode = 401;
            res.end();
            return;
        }
        const data = await client.db("MyDB").collection("Accounts").findOne({ email: result.email });
        const arr = [data.description, data.picture];
        //console.log(arr);
        res.statusCode = 200;
        res.end(JSON.stringify(arr));
    }
    if (req.url == "/editProfile" && req.method == 'PUT') {
        const result = await client.db("MyDB").collection("Sessions").findOne({ sid: req.headers['sid'] });
        if (result == null) {
            res.statusCode = 401;
            res.end();
            return;
        }
        const form = new formidable.IncomingForm();
        let fields;
        let files;
        [fields, files] = await form.parse(req);
        //console.log(files);
        description = fields.newDesc[0];

        path = './img/' + result.email + '.jpeg';
        fs.rename(files.image[0].filepath, path, (err) => {
            if (err) throw err;
        });

        const r = await client.db("MyDB").collection("Accounts").updateOne(
            { email: result.email },
            {
                $set: { 'description': description, 'picture': path }
            }
        );
        //console.log(arr);
        res.statusCode = 200;
        res.end();
    }
    if (req.url == "/deleteProfile" && req.method == 'DELETE') {
        const result = await client.db("MyDB").collection("Sessions").findOne({ sid: req.headers['sid'] });
        if (result == null) {
            res.statusCode = 401;
            res.end();
            return;
        }
        const r = await client.db("MyDB").collection("Accounts").deleteOne({ email: result.email });
        res.statusCode = 200;
        res.end();
    }
    if (req.url.split('?')[0] == "/getCart" && req.method == 'GET') {
        const result = await client.db("MyDB").collection("Sessions").findOne({ sid: req.headers['sid'] });
        if (result != null) {
            const query = await client.db("MyDB").collection("Accounts").findOne({ email: result.email });
            //console.log(query.items);
            var resArray = [];
            for (element of query.items) {
                var helper = await client.db("MyDB").collection('Products').findOne({ _id: ObjectId.createFromHexString(element.item) });
                resArray.push(helper);
            };
            res.statusCode = 200;
            //console.log(JSON.stringify(resArray));
            res.end(JSON.stringify(resArray));
            return;
        }
        var ses = await client.db("MyDB").collection("TempSessions").findOne({ tsid: req.headers['tsid'] });
        if (ses != null && ses.items != undefined) {
            var resArray = [];
            for (element of ses.items) {
                var helper = await client.db("MyDB").collection('Products').findOne({ _id: ObjectId.createFromHexString(element.item) });
                resArray.push(helper);
            };
            res.statusCode = 200;
            //console.log(JSON.stringify(resArray));
            res.end(JSON.stringify(resArray));
            return;
        }
        res.statusCode = 200;
        res.end();

    }
    if (req.url.split('?')[0] == "/addToCart" && req.method == 'PUT') {
        var item = req.url.split('?')[1].split('&')[1].split('=')[1];
        var collection = req.url.split('?')[1].split('&')[2].split('=')[1];
        const result = await client.db("MyDB").collection("Sessions").findOne({ sid: req.headers['sid'] });
        const tsid = req.headers['tsid'];
        if (result == null) { //not logged in
            const res1 = await client.db("MyDB").collection("TempSessions").findOne({ tsid: req.headers['tsid'] });
            if (res1 == null) { //no tempSession
                const tsid = crypto.randomUUID();
                client.db("MyDB").collection("TempSessions").insertOne({ tsid: tsid, "createdAt": new Date(), items: [{ item, collection }] });
                res.setHeader('set-cookie', 'tsid=' + tsid + '; SameSite=None; Secure;');
                res.statusCode = 200;
                res.end();
            } else { //temp session exists
                const r = await client.db("MyDB").collection("TempSessions").updateOne(
                    { tsid: tsid },
                    {
                        $push: { items: { item, collection } }
                    }
                );
                //console.log(tsid);
            }

        } else {
            const r = await client.db("MyDB").collection("Accounts").updateOne(
                { email: result.email },
                {
                    $push: { items: { item, collection } }
                }
            );
        }
    }
    if (req.url.split('?')[0] == "/addToCartInBulk" && req.method == 'PUT') {
        var ses = await client.db("MyDB").collection("TempSessions").findOne({ tsid: req.headers['tsid'] });
        if (ses == null || ses.items === undefined || ses.items.length == 0) {
            res.statusCode = 200;
            res.end();
            return;
        }
        const result = await client.db("MyDB").collection("Sessions").findOne({ sid: req.headers['sid'] });
        if (result == null) {
            res.statusCode = 401;
            res.end();
            return;
        }
        const r = await client.db("MyDB").collection("Accounts").updateOne(
            { email: result.email },
            {
                $push: { items: { $each: ses.items } }
            }
        );
    }
    if (req.url.split('?')[0] == "/deleteFromCart" && req.method == 'DELETE') {
        var item = req.url.split('?')[1].split('&')[1].split('=')[1];
        const result = await client.db("MyDB").collection("Sessions").findOne({ sid: req.headers['sid'] });
        const tsid = req.headers['tsid'];
        if (result == null) { //not logged in
            const res1 = await client.db("MyDB").collection("TempSessions").findOne({ tsid: req.headers['tsid'] });
            if (res1 == null) { //no tempSession
                res.statusCode = 200;
                res.end();
                return;
            } else { //temp session exists
                await client.db("MyDB").collection("TempSessions").updateOne({ tsid: req.headers['tsid'], "items.item": item }, { $set: { "items.$.item": '-1' } });
                await client.db("MyDB").collection("TempSessions").updateMany({}, { $pull: { "items": { 'item': '-1' } } })
                res.statusCode = 200;
                res.end();
                return;
            }
        } else { //logged in
            await client.db("MyDB").collection("Accounts").updateOne({ email: result.email, "items.item": item }, { $set: { "items.$.item": '-1' } });
            await client.db("MyDB").collection("Accounts").updateMany({}, { $pull: { "items": { 'item': '-1' } } })
            res.statusCode = 200;
            res.end();
            return;
        }
    }
    if (req.url.split('?')[0] == "/getColData" && req.method == 'GET') {
        const categoryName = fullUrl.searchParams.get('category');
        const page = fullUrl.searchParams.get('page');
        const limitPerPage = 6;
        //var page = req.url.split('?')[1].split('&')[1].split('=')[1];
        //var categoryName = req.url.split('?')[1].split('&')[0].split('=')[1];
        //const docCount = client.db("MyDB").collection('Products').aggregate([{ $match: { category: categoryName } }, { $group: { _id: null, count: { $sum: 1 } } }]);

        //const count = await docCount.next();
        //console.log();
        const query = { category: categoryName };
        const cursor = client.db("MyDB").collection('Products').find(query).sort({ title: 1 }).limit(limitPerPage).skip((page - 1) * limitPerPage);
        var filters = [];
        for (const el of fields) {
            var result = await client.db("MyDB").collection('Products').distinct(el, query);
            //console.log(result);
            if (result.length > 0)
                filters.push({ [el]: result });
        };
        var jsonArray = [];
        //jsonArray.push(count['count']);
        for await (const doc of cursor) {
            //console.log(doc);
            jsonArray.push(doc);
        }
        await cursor.close();
        res.statusCode = 200;
        var docsAndFilters = JSON.stringify({ jsonArray, filters });
        //console.log(jsonArray);
        //console.log(filters);
        res.end(docsAndFilters);
    }
    if (req.url.split('?')[0] == "/SearchQuery" && req.method == 'GET') {
        const query = fullUrl.searchParams.get('q');
        const page = fullUrl.searchParams.get('page');
        const limitPerPage = 6;
        // const query = req.url.split('?')[1].split('&')[0].split('=')[1].replace('%20', ' ');
        // const page = req.url.split('?')[1].split('&')[1].split('=')[1];
        //console.log(query, page);
        const cursor = client.db("MyDB").collection('Products').find({ $text: { $search: query } }).sort({ title: 1 }).limit(limitPerPage).skip((page - 1) * limitPerPage);
        var jsonArray = [];
        // jsonArray.push(count['count']);

        //var filters = [];
        // for (const el of fields) {
        //     var result = await client.db("MyDB").collection('Products').distinct(el, query);
        //     //console.log(result);
        //     if (result.length > 0)
        //         filters.push({ [el]: result });
        // };
        for await (const doc of cursor) {
            //console.log(doc);
            jsonArray.push(doc);
        }
        var max = cursor.sort({ price: -1 }).next();
        console.log(max);
        var min = cursor.sort({ price: 1 }).next();
        await cursor.close();
        res.statusCode = 200;
        //var docsAndFilters = JSON.stringify({ jsonArray, filters });
        //res.end(docsAndFilters);
    }
    if (req.url.split('?')[0] == "/getColMinMaxPrice" && req.method == 'GET') {
        const cat = req.url.split('?')[1].split('=')[1];
        var max = client.db("MyDB").collection('Products').find({ category: cat }).sort({ price: -1 }).limit(1);
        var min = client.db("MyDB").collection('Products').find({ category: cat }).sort({ price: +1 }).limit(1);
        res.statusCode = 200;
        for await (const doc of max) {
            max = doc;
        }
        for await (const doc of min) {
            min = doc;
        }
        //console.log(min.price, max.price);
        res.end(JSON.stringify([min.price, max.price]));
    }
    if (req.url.split('?')[0] == "/filter" && req.method == 'GET') {
        //filter fields
        //result
        //min max price
        console.log(fullUrl.search);
        const limitPerPage = 3;
        var page = 1, query = '', price = { 'price': { '$gte': 0 } }, objects = [], max = -1, min = Number.MAX_SAFE_INTEGER, sortField = 'title', sortDir = 1, cursor, filters = [], fNeeded, docCount = 0, pages = 1;
        for ([n, v] of fullUrl.searchParams.entries()) {
            //console.log(n, v);
            if (n == 'q') {
                query = v;
            }
            else if (n == 'price') {
                price.price.$gte = Number(v);
            }
            else if (n == 'page') {
                page = v;
            }
            else if (n == 'fNeeded') {
                fNeeded = v;
            }
            else if (n == 'sort') {
                if (v == 'title') {
                    sortField = 'title';
                    sortDir = 1;
                } else if (v == 'priceAsc') {
                    sortField = 'price';
                    sortDir = 1;
                } else if (v == 'priceDesc') {
                    sortField = 'price';
                    sortDir = -1;
                }
                console.log(sortField, sortDir);
            }
            else {
                var t1 = objects.find((e) => Object.keys(e['$or'][0])[0] == n);
                //console.log(t1);
                if (t1) {
                    t1.$or.push({ [n]: v });
                    //console.log(t1);
                } else {
                    // objects.push({ [n]: v });
                    objects.push({ '$or': [{ [n]: v }] });
                }

            }
        };
        objects.push(price);
        //console.log(objects);
        if (fNeeded == '1' && query == '') {
            for (const el of fields) {
                var result = await client.db("MyDB").collection('Products').distinct(el, { $and: objects });
                //console.log(result);
                if (result.length > 0)
                    filters.push({ [el]: result });
            };
        } else if (fNeeded == '1' && query != '') {
            for (const el of fields) {
                var result = await client.db("MyDB").collection('Products').distinct(el, { $text: { $search: query }, $and: objects });
                //console.log(result);
                if (result.length > 0)
                    filters.push({ [el]: result });
            };
        }
        if (query == '') {
            cursor = client.db("MyDB").collection('Products').find({ $and: objects }).sort(sortField, sortDir).limit(limitPerPage).skip((page - 1) * limitPerPage);
            docCount = await client.db("MyDB").collection('Products').countDocuments({ $and: objects });
            max = await client.db("MyDB").collection('Products').find({ $and: objects }).sort({ "price": -1 }).limit(1).toArray();
            min = await client.db("MyDB").collection('Products').find({ $and: objects }).sort({ "price": 1 }).limit(1).toArray();
            min = min[0].price;
            max = max[0].price;
        } else {
            cursor = client.db("MyDB").collection('Products').find({ $text: { $search: query }, $and: objects }).sort(sortField, sortDir).limit(limitPerPage).skip((page - 1) * limitPerPage);
            docCount = await client.db("MyDB").collection('Products').countDocuments({ $text: { $search: query }, $and: objects });
            max = await client.db("MyDB").collection('Products').find({ $text: { $search: query }, $and: objects }).sort({ "price": -1 }).limit(1).toArray();
            min = await client.db("MyDB").collection('Products').find({ $text: { $search: query }, $and: objects }).sort({ "price": 1 }).limit(1).toArray();
            min = min[0].price;
            max = max[0].price;
        }
        var jsonArray = [];
        for await (const doc of cursor) {

            //if (doc.price > max) max = doc.price;
            //if (doc.price < min) min = doc.price;
            console.log(doc);
            jsonArray.push(doc);
        }
        //console.log(docCount);
        pages = Math.ceil(docCount / limitPerPage);
        await cursor.close();
        res.statusCode = 200;
        res.end(JSON.stringify({ min, max, jsonArray, filters, pages }));

    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});