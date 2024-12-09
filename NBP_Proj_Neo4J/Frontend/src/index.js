import _, { head } from 'lodash';
import leaflet from 'leaflet';

if (document.cookie == 'isLoggedIn=true') {

    const headerDiv = document.createElement('div');
    headerDiv.className = 'headerDiv';
    headerDiv.id = 'headerDiv';
    document.body.appendChild(headerDiv);

    const header1 = document.createElement('h1');
    header1.textContent = "NASLOV";
    headerDiv.appendChild(header1);

    const sidebarAndContentDiv = document.createElement('div');
    sidebarAndContentDiv.className = "sidebarAndContentDiv";
    document.body.appendChild(sidebarAndContentDiv);

    const sidebarDiv = document.createElement('div');
    sidebarDiv.className = "sidebarDiv";
    sidebarAndContentDiv.appendChild(sidebarDiv);

    const mainDiv = document.createElement('div');
    mainDiv.innerText = "Main";
    mainDiv.className = "mainDiv";
    mainDiv.addEventListener('click', () => {
        window.location.reload(true);
    });
    sidebarDiv.appendChild(mainDiv);

    const trucksDiv = document.createElement('div');
    trucksDiv.innerText = "Trucks";
    trucksDiv.className = "trucksDiv";
    trucksDiv.addEventListener('click', () => {
        document.getElementById('infoDiv').style.display = 'none';
        document.getElementById('graphVisDiv').style.display = 'flex';
        layerGroup.clearLayers();
        const response = fetch("http://127.0.0.1:3000/getTrucks", {
            method: "GET"
        }).then((response) => {
            console.log(response.status);
            return response.text();
        }).then((text) => {
            let nodes = JSON.parse(text);
            console.log(nodes);
            nodes.forEach((v, i) => {
                console.log(v);
                var trucksIcon = L.icon({
                    iconUrl: '../../icons/truckBlackT.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -35]
                });
                let content = '';
                Object.entries(nodes[i]._fields[1].properties).forEach((v, i) => {
                    content += "<b>" + v[0] + ': </b>' + v[1] + "<br></br>";
                });
                content += '<b>Transporting from: </b>' + nodes[i]._fields[0].properties['name'] + "<br></br>";
                content += '<b>Transporting to: </b>' + nodes[i]._fields[2].properties['name'] + "<br></br>";
                var marker1 = L.marker([nodes[i]._fields[1].properties['lat'], nodes[i]._fields[1].properties['lon']], { icon: trucksIcon }).addTo(layerGroup);
                content += '<center><button id="btn' + nodes[i]._fields[1].properties['name'] + '">Delete node</button>';
                var popup = L.popup({ content: content });
                marker1.bindPopup(popup);
                marker1.on('click', (e) => {
                    document.getElementById('btn' + nodes[i]._fields[1].properties['name']).addEventListener('click', () => {
                        deleteNode(nodes[i]._fields[1].labels[0], nodes[i]._fields[1].properties['name']);
                    });
                });
            });

        });
    });
    sidebarDiv.appendChild(trucksDiv);

    const stockDiv = document.createElement('div');
    stockDiv.innerText = "Current stock";
    stockDiv.className = "stockDiv";
    stockDiv.addEventListener('click', () => {
        var clear = document.getElementById('infoDiv');
        while (clear.firstChild) {
            clear.removeChild(clear.firstChild);
        }
        document.getElementById('infoDiv').style.display = 'flex';
        document.getElementById('graphVisDiv').style.display = 'none';
        var textCurrentStock = document.createElement("div");
        textCurrentStock.style.fontSize = '20px';
        textCurrentStock.innerText += "Current stock:";
        document.getElementById('infoDiv').append(textCurrentStock);
        //getStoresAndWarehouses
        const response = fetch("http://127.0.0.1:3000/getStoresAndWarehouses", {
            method: "GET"
        }).then((response) => {
            //console.log(response.status);
            return response.text();
        }).then((text) => {
            let nodes = JSON.parse(text);
            nodes.forEach((v, i) => {
                let stock = nodes[i]._fields[0].properties['stock'];
                //console.log(stock);
                const dataRow = document.createElement('div');
                dataRow.className = 'dataRow';
                var d1 = document.createElement('div');
                var img = document.createElement("img");
                if (nodes[i]._fields[0].labels.includes('groceryStore'))
                    img.src = '../../icons/greenCT.png';
                if (nodes[i]._fields[0].labels.includes('warehouse'))
                    img.src = '../../icons/orangeCT.png';
                img.style.height = '20px';
                img.style.width = "20px";
                d1.className = "namePropDiv";
                d1.appendChild(img);
                d1.innerHTML += nodes[i]._fields[0].properties['name'];
                dataRow.append(d1);
                document.getElementById('infoDiv').appendChild(dataRow);
                const progressDiv = document.createElement('div');
                progressDiv.className = 'progressDiv';
                var d2 = document.createElement('div');
                d2.style.width = stock + '%';
                d2.innerText += stock + '%';
                if (stock >= 75)
                    d2.style.backgroundColor = 'green';
                if (stock < 75 && stock >= 50)
                    d2.style.backgroundColor = 'greenyellow';
                if (stock < 50 && stock >= 25)
                    d2.style.backgroundColor = 'orange';
                if (stock < 25)
                    d2.style.backgroundColor = 'red';
                progressDiv.appendChild(d2);
                dataRow.appendChild(progressDiv);
                const replenishBtn = document.createElement('input');
                replenishBtn.type = 'button';
                replenishBtn.className = "replenishBtn";
                dataRow.appendChild(replenishBtn);
                replenishBtn.value = 'Replenish Stock';
                if (stock == 100)
                    replenishBtn.replaceWith(replenishBtn.cloneNode());
                if (i == nodes.length - 1)
                    dataRow.style.borderBottom = "2px solid black";
                var name = nodes[i]._fields[0].properties['name'];
                var label = nodes[i]._fields[0].labels[0];
                replenishBtn.addEventListener('click', (e) => {

                    const response = fetch("http://127.0.0.1:3000/replenishStock?name=" + name + "&label=" + label + "&stock=" + stock, {
                        method: "PUT"
                    }).then((response) => {
                        console.log(response.status);
                        if (response.status == 200)
                            document.getElementsByClassName('stockDiv')[0].dispatchEvent(new Event("click"));
                        return response.text();
                    }).then((text) => {
                    });

                });
            });

        });
    });
    sidebarDiv.appendChild(stockDiv);

    const logoutDiv = document.createElement('div');
    logoutDiv.innerText = "Logout";
    logoutDiv.className = "logoutDiv";
    logoutDiv.addEventListener('click', () => {
        document.cookie = "isLoggedIn=false";
        location.reload();
    });
    sidebarDiv.appendChild(logoutDiv);

    const contentDiv = document.createElement('div');
    contentDiv.className = "contentDiv";
    sidebarAndContentDiv.appendChild(contentDiv);

    const graphVisDiv = document.createElement('div');
    graphVisDiv.className = 'graphVisDiv';
    graphVisDiv.id = 'graphVisDiv';
    contentDiv.appendChild(graphVisDiv);

    const infoDiv = document.createElement('div');
    infoDiv.className = "infoDiv";
    infoDiv.id = 'infoDiv';
    infoDiv.style.display = 'none';
    contentDiv.appendChild(infoDiv);

    // const queryForm = document.createElement('form');
    // queryForm.className = 'queryForm';
    // document.body.appendChild(queryForm);

    // const queryDiv = document.createElement('div');
    // queryDiv.className = 'queryDiv';
    // queryForm.appendChild(queryDiv);

    // const queryInput = document.createElement('input');
    // queryInput.className = 'queryInput';
    // queryInput.value = "";
    // queryInput.type = 'text';
    // queryInput.name='queryInput';
    // queryDiv.appendChild(queryInput);

    // const queryButton = document.createElement('input');
    // queryButton.className = 'queryButton';
    // queryButton.value = "Execte Query";
    // queryButton.type = 'Button';
    // queryButton.addEventListener('click', addNode);
    // queryDiv.appendChild(queryButton);

    // const addDiv = document.createElement('div');
    // addDiv.className = 'addDiv';
    // queryForm.appendChild(addDiv);

    // const addDivRel = document.createElement('div');
    // addDivRel.className = 'addDiv';
    // queryForm.appendChild(addDivRel);

    // const deleteDiv = document.createElement('div');
    // deleteDiv.className = 'deleteDiv';
    // queryForm.appendChild(deleteDiv);

    // const updateDiv = document.createElement('div');
    // updateDiv.className = 'updateDiv';
    // queryForm.appendChild(updateDiv);

    // const addNodeName = document.createElement('input');
    // addNodeName.className = 'addNodeName';
    // addNodeName.value = "Node Name";
    // addNodeName.type = 'text';
    // addNodeName.name='addNode';
    // addDiv.appendChild(addNodeName);

    // const addNodeLabels = document.createElement('input');
    // addNodeLabels.className = 'addNodeLabels';
    // addNodeLabels.value = ":Label1:Label2...";
    // addNodeLabels.type = 'text';
    // addNodeLabels.name='addNode';
    // addDiv.appendChild(addNodeLabels);

    // const addNodeProperties = document.createElement('input');
    // addNodeProperties.className = 'addNodeProperties';
    // addNodeProperties.value = "Property1:value1;Property2:value2;...";
    // addNodeProperties.type = 'text';
    // addNodeProperties.name='addNode';
    // addDiv.appendChild(addNodeProperties);

    // const addButton = document.createElement('input');
    // addButton.className = 'addButton';
    // addButton.value = "Add Node";
    // addButton.type = 'Button';
    // addButton.addEventListener('click', addNode);
    // addDiv.appendChild(addButton);

    // const addRelName = document.createElement('input');
    // addRelName.className = 'addRelName';
    // addRelName.value = "Relationship Name";
    // addRelName.type = 'text';
    // addDivRel.appendChild(addRelName);

    // const addRelationshipProperties = document.createElement('input');
    // addRelationshipProperties.className = 'addRelationshipProperties';
    // addRelationshipProperties.value = "Property1=value1;Property2=value2;...";
    // addRelationshipProperties.type = 'text';
    // addDivRel.appendChild(addRelationshipProperties);

    // const addButtonRel = document.createElement('input');
    // addButtonRel.className = 'addButtonRel';
    // addButtonRel.value = "Add Relationship";
    // addButtonRel.type = 'Button';
    // addDivRel.appendChild(addButtonRel);

    // const deleteNodeRel = document.createElement('input');
    // deleteNodeRel.className = 'deleteNodeRel';
    // deleteNodeRel.value = "Node name";
    // deleteNodeRel.type = 'text';
    // deleteDiv.appendChild(deleteNodeRel);

    // const delBtn = document.createElement('input');
    // delBtn.className = 'delBtn';
    // delBtn.value = "Delete Relationship/Node";
    // delBtn.type = 'Button';
    // deleteDiv.appendChild(delBtn);

    var map = leaflet.map('graphVisDiv').setView([44.53842243157514, 20.78190164192338], 6);
    leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);
    document.getElementsByClassName('leaflet-attribution-flag')[0].style.width = 0;

    map.on('contextmenu', (e) => {
        map.closePopup();
        //console.log(e.latlng);
        L.popup()
            .setLatLng(e.latlng)
            .setContent('<b><center> New Node </b> <br></br> <label for=nodeName>Name:</label> <input type=text id=nodeName value="name"></input> <br></br> <label for=lat>Lat:</label> <input id=lat type=number value=' + e.latlng['lat'] + '></input> <br></br> <label for=lon>Lon:</label>  <input id=lon type=number value=' + e.latlng['lng'] + '></input> <br></br></center> Node type:<br></br> <input id=sup value="supplier" checked type=radio name=grp></input> <label for="sup">Supplier</label><br></br> <input id=whs  value="wholesaler" type=radio name=grp></input> <label for="whs">Wholesaler</label><br></br> <input id=gs  value="groceryStore" type=radio name=grp></input> <label for="gs">Grocery store</label><br></br> <input id=wh value="warehouse" type=radio name=grp></input> <label for="wh">Warehouse</label> <br></br><center> <input id="' + e.latlng['lng'] + e.latlng['lat'] + '" type=button value="Create Node" ></input>')
            .addTo(map)
            .openOn(map);
        document.getElementById("" + e.latlng['lng'] + e.latlng['lat']).addEventListener('click', () => {
            createNode(document.querySelector('input[name="grp"]:checked').value, document.getElementById('nodeName').value, document.getElementById('lat').value, document.getElementById('lon').value);
        });
    });

    var layerGroup = L.layerGroup().addTo(map);

    var greenIcon = L.icon({
        iconUrl: '../../icons/groceryStoreT.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -35]
    });
    var blueIcon = L.icon({
        iconUrl: '../../icons/factoryT.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -35]
    });
    var redIcon = L.icon({
        iconUrl: '../../icons/redT.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -35]
    });
    var orangeIcon = L.icon({
        iconUrl: '../../icons/warehouseT.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -35]
    });
    const response = fetch("http://127.0.0.1:3000/getSupplyChainNodes", {
        method: "GET"
    }).then((response) => {
        console.log(response.status);
        return response.text();
    }).then((text) => {
        let nodes = JSON.parse(text);
        nodes.forEach((v, i) => {
            //console.log(nodes[i]._fields[0]);
            let icon1 = greenIcon;
            if (nodes[i]._fields[0].labels.includes('supplier'))
                icon1 = blueIcon;
            if (nodes[i]._fields[0].labels.includes('wholesaler'))
                icon1 = redIcon;
            if (nodes[i]._fields[0].labels.includes('warehouse'))
                icon1 = orangeIcon;
            var marker1 = L.marker([nodes[i]._fields[0].properties['lat'], nodes[i]._fields[0].properties['lon']], { icon: icon1 }).addTo(layerGroup);
            let content = '';
            Object.entries(nodes[i]._fields[0].properties).forEach((v, i) => {
                if (v[0] == 'stock')
                    content += "<b>" + v[0] + ': </b>' + v[1] + "%<br></br>";
                else
                    content += "<b>" + v[0] + ': </b>' + v[1] + "<br></br>";

            });
            content += '<center><button id="btn' + nodes[i]._fields[0].properties['name'] + '">Delete node</button>';
            var popup = L.popup({ content: content });
            marker1.bindPopup(popup);
            marker1.on('click', (e) => {
                document.getElementById('btn' + nodes[i]._fields[0].properties['name']).addEventListener('click', () => {
                    deleteNode(nodes[i]._fields[0].labels[0], nodes[i]._fields[0].properties['name']);
                });
            });

        });

    });
}
else {
    const loginForm = document.createElement('form');
    loginForm.className = "loginForm";
    document.body.appendChild(loginForm);

    const userNameDiv = document.createElement('div');
    userNameDiv.className = "userNameDiv";
    loginForm.appendChild(userNameDiv);

    const userNameLabel = document.createElement('label');
    userNameLabel.htmlFor = "userNameInput";
    userNameLabel.textContent = "Username: ";
    userNameDiv.appendChild(userNameLabel);

    const userNameInput = document.createElement('input');
    userNameInput.className = 'userNameInput';
    userNameInput.id = "userNameInput";
    userNameDiv.appendChild(userNameInput);

    const passDiv = document.createElement('div');
    passDiv.className = "passDiv";
    loginForm.appendChild(passDiv);

    const passLabel = document.createElement('label');
    passLabel.htmlFor = "passInput";
    passLabel.textContent = "Password: ";
    passDiv.appendChild(passLabel);

    const passInput = document.createElement('input');
    passInput.className = 'passInput';
    passInput.id = "passInput";
    passDiv.appendChild(passInput);

    const loginButton = document.createElement('input');
    loginButton.className = "loginButton";
    loginButton.type = 'button';
    loginButton.value = "Login";
    loginButton.addEventListener('click', () => {
        document.cookie = "isLoggedIn=true";
        location.reload();
    });
    loginForm.appendChild(loginButton);
}

function addNode() {
    const formdata = new FormData(document.getElementsByClassName("queryForm")[0]);
    formdata.values().forEach((a) => {
        console.log(a);
    });
    const response = fetch("http://127.0.0.1:3000/query", {
        method: "POST",
        body: formdata
    }).then((response) => {
        console.log(response.status);
        if (response.status == 200) {
            window.location.reload(true);
        }
        return response.text();
    }).then((body) => console.log(body));
}
function deleteNode(label, name) {
    const response = fetch("http://127.0.0.1:3000/delNode?" + "label=" + label + "&name=" + name, {
        method: "DELETE"
    }).then((response) => {
        console.log(response.status);
        return response.text();
    }).then((text) => { });
}
function createNode(label, name, lat, lon) {
    const response = fetch("http://127.0.0.1:3000/createNode/?" + "label=" + label + "&name=" + name + "&lat=" + lat + "&lon=" + lon, {
        method: "POST"
    }).then((response) => {
        console.log(response.status);
        return response.text();
    }).then((text) => { });
}
