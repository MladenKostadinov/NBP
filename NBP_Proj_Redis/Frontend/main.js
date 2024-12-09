document.body.onload = drawUI([drawHome,drawMostPopularAuctions, drawSignIn, drawRegister],
    ["Home","Top auctions", "Sign in", "Register"]);
document.body.onload = checkSession();

function drawUI(navOptionFunctions, navOptions) {
    clearEverything();
    const headerDiv = document.createElement("div");
    headerDiv.className = "headerDiv";
    document.body.append(headerDiv);

    const header = document.createElement("h1");
    header.className = "mainH";

    const title = document.createTextNode("Aukcija");
    header.appendChild(title);
    headerDiv.append(header);

    const hiddenDiv = document.createElement("div");
    hiddenDiv.className = "hiddenDiv";
    header.append(hiddenDiv);

    const notifications = document.createElement("input");
    notifications.type = "button";
    notifications.value = "Notifications";
    notifications.className = "notifications";
    notifications.addEventListener(
        "mouseenter",
        (event) => {

            notificationDiv.style.background = 'red';
            notificationDiv.style.display = " block";

        })

    hiddenDiv.append(notifications);

    const notificationDiv = document.createElement("div");
    notificationDiv.className = "notificationDiv";
    notificationDiv.style.display = " none";
    hiddenDiv.append(notificationDiv);
    hiddenDiv.addEventListener(
        "mouseleave",
        (event) => {
            notificationDiv.style.display = " none";
            //notificationDiv.style.visibility = 'hidden';
        })

    const searchDiv = document.createElement("div");
    searchDiv.className = "searchDiv";
    document.body.append(searchDiv);

    const searchBar = document.createElement("input");
    searchBar.type = "text";
    searchBar.name = "searchBar";
    searchBar.className = "searchBar";
    searchDiv.appendChild(searchBar);

    const searchButton = document.createElement("input");
    searchButton.type = "button";
    searchButton.value = "Search";
    searchButton.addEventListener('click', drawSearchResults);
    searchDiv.appendChild(searchButton);

    const navBar = document.createElement("div");
    navBar.className = "nav";
    document.body.append(navBar);


    const navList = document.createElement("ul");
    navList.className = "navList";
    navBar.appendChild(navList);


    navOptions.forEach((element, index) => {
        const navOpt = document.createElement("li");
        navOpt.appendChild(document.createTextNode(element));
        navOpt.addEventListener('click', navOptionFunctions[index], false);
        navList.appendChild(navOpt);
    })

    const contentDiv = document.createElement("div");
    contentDiv.className = "contentDiv";
    document.body.append(contentDiv);

    drawHome();

}
function clearUI() {
    // document.getElementsByClassName("popularAuctions")[0].style.display = " none";
    // document.getElementsByClassName("newAuctions")[0].style.display = " none";
    document.getElementsByClassName("contentDiv")[0].innerHTML = "";
}
function clearEverything() {
    document.body.innerHTML = '';
}
function drawHome() {
    clearUI();
    // const popularAuctions = document.createElement("div");
    // popularAuctions.className = "popularAuctions";
    // document.getElementsByClassName("contentDiv")[0].append(popularAuctions);

    // const newAuctions = document.createElement("div");
    // newAuctions.className = "newAuctions";
    // document.getElementsByClassName("contentDiv")[0].append(newAuctions);
    drawHomeSearchResults();
}
function drawSignIn() {
    clearUI();

    const formSignIn = document.createElement("form");
    formSignIn.className = "formSignIn";
    formSignIn.method = "post";
    //formSignIn.enctype="multipart/form-data";
    document.getElementsByClassName("contentDiv")[0].append(formSignIn);

    const emailDiv = document.createElement("div");
    emailDiv.className = "emailDiv";
    document.getElementsByClassName("formSignIn")[0].append(emailDiv);

    const emailLab = document.createElement("label");
    emailLab.htmlFor = "email";
    emailLab.className = "emailLab";
    emailLab.textContent = "Email:";
    emailDiv.append(emailLab);

    const emailSig = document.createElement("input");
    emailSig.className = "emailSig";
    emailSig.name = "email";
    emailSig.id = "email";
    emailSig.type = "email";
    emailSig.autocomplete = "on";
    emailSig.required = "true";
    emailDiv.append(emailSig);

    const passDiv = document.createElement("div");
    passDiv.className = "passDiv";
    document.getElementsByClassName("formSignIn")[0].append(passDiv);

    const passLab = document.createElement("label");
    passLab.className = "passLab";
    passLab.htmlFor = "passID";
    passLab.textContent = "Password:";
    passDiv.append(passLab);

    const passSig = document.createElement("input");
    passSig.id = "passID";
    passSig.className = "passSig";
    passSig.name = "pass";
    passSig.type = "password";
    passSig.required = "true";
    passDiv.append(passSig);

    const signInButton = document.createElement("input");
    signInButton.type = "button";//"submit";
    signInButton.value = "Sign In";
    signInButton.className = "buttonSig";
    signInButton.addEventListener("click", helperSignIn);
    document.getElementsByClassName("formSignIn")[0].appendChild(signInButton);
}
function drawRegister() {
    clearUI();

    drawSignIn();
    document.getElementsByClassName("buttonSig")[0].value = "Register";
    document.getElementsByClassName("buttonSig")[0].removeEventListener("click", helperSignIn);
    document.getElementsByClassName("buttonSig")[0].addEventListener("click", helperRegister);

    const pictureDiv = document.createElement("div");
    pictureDiv.className = "pictureDiv";
    document.getElementsByClassName("formSignIn")[0].append(pictureDiv);

    const pictureLab = document.createElement("label");
    pictureLab.className = "pictureLab";
    pictureLab.htmlFor = "pictureInputID";
    pictureLab.textContent = "Picture:";
    pictureDiv.append(pictureLab);

    const pictureInput = document.createElement("input");
    pictureInput.id = "pictureInputID";
    pictureInput.className = "pictureInput";
    pictureInput.name = "picture";
    pictureInput.accept = "image/png, image/gif, image/jpeg";
    pictureInput.type = "file";
    pictureInput.required = "true";
    pictureDiv.append(pictureInput);

    const descriptionDiv = document.createElement("div");
    descriptionDiv.className = "descriptionDiv";
    document.getElementsByClassName("formSignIn")[0].append(descriptionDiv);

    const descriptionLab = document.createElement("label");
    descriptionLab.className = "descLab";
    descriptionLab.htmlFor = "descInputID";
    descriptionLab.textContent = "Description:";
    descriptionDiv.append(descriptionLab);

    const descriptionInput = document.createElement("input");
    descriptionInput.id = "descInputID";
    descriptionInput.className = "descInput";
    descriptionInput.name = "desc";
    descriptionInput.type = "text";
    descriptionInput.maxLength = "254";
    descriptionInput.required = "true";
    descriptionDiv.append(descriptionInput);

    document.getElementsByClassName("formSignIn")[0].append(document.getElementsByClassName("buttonSig")[0]);


}
function drawProfile(stream) {
    clearUI();
    const profileDiv = document.createElement("div");
    profileDiv.className = "profileDiv";
    document.getElementsByClassName("contentDiv")[0].append(profileDiv);
    const image = document.createElement("img");
    const descriptionProfile = document.createElement("div");

    descriptionProfile.style.height = '75px';
    descriptionProfile.style.width = '250px';
    let imgPath;
    const reader = stream.getReader();
    reader.read().then(function readData({ value, done }) {
        if (done) {

            return;
        }
        imgPath = value;
        //console.log(value);
        return reader.read().then(readData);
    }).then(() => {
        //console.log(imgPath);
        let str = new TextDecoder().decode(imgPath);
        str = str.split("----");
        //console.log(str);
        descriptionProfile.textContent = str[0];
        image.src = str[1];
        image.width = "75";
        image.height = "75";
        image.alt = "Profile Picture";
        profileDiv.append(image);
        profileDiv.append(descriptionProfile);
    });
}
function drawNewAuction() {
    drawRegister();
    const auctionDiv = document.createElement("div");
    auctionDiv.className = "auctionDiv";
    document.getElementsByClassName("formSignIn")[0].append(auctionDiv);

    const auctionLab = document.createElement("label");
    auctionLab.className = "auctionLab";
    auctionLab.htmlFor = "auctionInputID";
    auctionLab.textContent = "Auction Title:";
    auctionDiv.append(auctionLab);

    const auctionInput = document.createElement("input");
    auctionInput.id = "auctionInputID";
    auctionInput.className = "auctionInput";
    auctionInput.name = "auctionName";
    auctionInput.type = "text";
    auctionInput.maxLength = "50";
    auctionInput.required = "true";
    auctionDiv.append(auctionInput);

    document.getElementsByClassName("buttonSig")[0].value = "Create";
    document.getElementsByClassName("emailDiv")[0].style.display = "none";
    document.getElementsByClassName("passDiv")[0].style.display = "none";

    document.getElementsByClassName("buttonSig")[0].removeEventListener("click", helperRegister);
    document.getElementsByClassName("buttonSig")[0].addEventListener("click", helperNewAuction);

    const durationDiv = document.createElement("div");
    durationDiv.className = 'durationDiv';
    document.getElementsByClassName("formSignIn")[0].append(durationDiv);
    const durationLab = document.createElement("label");
    durationLab.textContent = "Duration: ";
    durationDiv.append(durationLab);

    const duration8hLab = document.createElement("label");
    duration8hLab.textContent = "8h";
    durationDiv.append(duration8hLab);

    const duration12hLab = document.createElement("label");
    duration12hLab.textContent = "12h";
    durationDiv.append(duration12hLab);

    const duration24hLab = document.createElement("label");
    duration24hLab.textContent = "24h";
    durationDiv.append(duration24hLab);

    const input8h = document.createElement("input");
    input8h.type = 'radio';
    input8h.name = 'durGrp';
    input8h.value = '8';
    input8h.checked = 'true';
    duration8hLab.append(input8h);
    const input12h = document.createElement("input");
    input12h.type = 'radio';
    input12h.name = 'durGrp';
    input12h.value = '12';
    duration12hLab.append(input12h);
    const input24h = document.createElement("input");
    input24h.type = 'radio';
    input24h.name = 'durGrp';
    input24h.value = '24';
    duration24hLab.append(input24h);

    const startBidDiv = document.createElement("div");
    startBidDiv.className = 'startBidDiv';
    const bidLab = document.createElement("label");
    bidLab.textContent = "Starting bid: ";
    startBidDiv.append(bidLab);

    document.getElementsByClassName("formSignIn")[0].append(startBidDiv);
    const inputStartBid = document.createElement("input");
    inputStartBid.value = 0;
    inputStartBid.name = 'bid';
    inputStartBid.type = 'number';
    inputStartBid.className = 'inputStartBid';
    startBidDiv.append(inputStartBid);

    document.getElementsByClassName("formSignIn")[0].append(document.getElementsByClassName("buttonSig")[0]);

}
function drawYourAuctions() {
    clearUI();
    var auctions;
    yourAuctions().then(function (json) {
        auctions = JSON.parse(json);
        console.log(auctions);
        auctions.forEach((value, i) => {
            console.log(value.picture);
            const auctionDiv = document.createElement("div");
            auctionDiv.className = "auctionDiv" + i;
            auctionDiv.style.display = 'flex';
            auctionDiv.style.justifyContent = 'space-evenly';
            auctionDiv.style.margin = '2px';
            auctionDiv.style.border = '1px solid black';
            auctionDiv.style.padding = '2px';
            document.getElementsByClassName("contentDiv")[0].append(auctionDiv);
            const nameDescriptionDiv = document.createElement("div");
            nameDescriptionDiv.className = "nameDescriptionDiv" + i;

            const image = document.createElement("img");
            const descriptionDiv = document.createElement("div");
            descriptionDiv.className = "descriptionDiv" + i;
            const titleDiv = document.createElement("div");
            titleDiv.className = "titleDiv" + i;
            titleDiv.innerHTML = value.name;
            titleDiv.style.textAlign = 'center';
            auctionDiv.append(image);
            auctionDiv.append(nameDescriptionDiv);
            nameDescriptionDiv.append(titleDiv);
            nameDescriptionDiv.append(descriptionDiv);
            descriptionDiv.style.height = '75px';
            descriptionDiv.style.width = '250px';
            descriptionDiv.innerHTML = value.description;
            image.src = '.' + value.picture;
            image.width = '75';
            //image.height =  ;
            image.alt = "auction" + i + "Picture";
            const editDeleteDiv = document.createElement("div");
            editDeleteDiv.className = "auctionDivEditDelete" + i;
            editDeleteDiv.style.display = 'flex';
            editDeleteDiv.style.flexDirection = 'column';
            editDeleteDiv.style.justifyContent = 'space-evenly';
            auctionDiv.append(editDeleteDiv);
            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editDeleteDiv.append(editButton);
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.type = 'button';
            editDeleteDiv.append(deleteButton);
            deleteButton.className = "auctionDivDelete" + i;
            deleteButton.name = value.name;
            editButton.name = value.name;
            deleteButton.addEventListener('click', deleteAuction);
            editButton.addEventListener('click', drawEditAuction);

            const bidTimeDiv = document.createElement("div");
            bidTimeDiv.className = 'bidTimeDiv';
            nameDescriptionDiv.appendChild(bidTimeDiv);
            const labelBid = document.createElement("label");
            bidTimeDiv.appendChild(labelBid);
            labelBid.textContent = "current bid: " + value.currentBid;
            const labelTime = document.createElement("label");
            bidTimeDiv.appendChild(labelTime);
            let date1 = new Date(value.endDate);
            let date2 = new Date(Date.now());
            let d = date1 - date2;
            labelTime.textContent = "Time left: " + msToHMS(d);
        })
        //
    });

}
function drawEditAuction(event) {
    drawNewAuction();
    document.getElementsByClassName("durationDiv")[0].remove();
    document.getElementsByClassName("startBidDiv")[0].remove();

    document.getElementsByClassName("buttonSig")[0].name = event.currentTarget.name;
    document.getElementsByClassName("buttonSig")[0].value = "Edit";
    document.getElementsByClassName("buttonSig")[0].removeEventListener("click", helperNewAuction);
    document.getElementsByClassName("buttonSig")[0].addEventListener("click", editAuctionHelper);
}
function drawSearchResults() {
    clearUI();
    var auctions;
    search().then(function (json) {
        auctions = JSON.parse(json);
        console.log(auctions);
        auctions.forEach((value, i) => {
            console.log(value.picture);
            const auctionDiv = document.createElement("div");
            auctionDiv.className = "auctionDiv" + i;
            auctionDiv.style.display = 'flex';
            auctionDiv.style.justifyContent = 'space-evenly';
            auctionDiv.style.margin = '2px';
            auctionDiv.style.border = '1px solid black';
            auctionDiv.style.padding = '2px';
            document.getElementsByClassName("contentDiv")[0].append(auctionDiv);
            const nameDescriptionDiv = document.createElement("div");
            nameDescriptionDiv.className = "nameDescriptionDiv" + i;

            const image = document.createElement("img");
            image.title = value.name;
            const descriptionDiv = document.createElement("div");
            descriptionDiv.className = "descriptionDiv" + i;
            const titleDiv = document.createElement("div");
            titleDiv.className = "titleDiv" + i;
            titleDiv.innerHTML = value.name;
            titleDiv.style.textAlign = 'center';
            auctionDiv.append(image);
            auctionDiv.append(nameDescriptionDiv);
            nameDescriptionDiv.append(titleDiv);
            nameDescriptionDiv.append(descriptionDiv);
            descriptionDiv.style.height = '75px';
            descriptionDiv.style.width = '250px';
            descriptionDiv.innerHTML = value.description;
            image.src = '.' + value.picture;
            image.width = '75';
            //image.height =  ;
            image.alt = "auction" + i + "Picture";
            image.addEventListener('click', auctionPage);
            titleDiv.addEventListener('click', auctionPage);

            const bidTimeDiv = document.createElement("div");
            bidTimeDiv.className = 'bidTimeDiv';
            nameDescriptionDiv.appendChild(bidTimeDiv);
            const labelBid = document.createElement("label");
            bidTimeDiv.appendChild(labelBid);
            labelBid.textContent = "current bid: " + value.currentBid;
            const labelTime = document.createElement("label");
            bidTimeDiv.appendChild(labelTime);
            let date1 = new Date(value.endDate);
            let date2 = new Date(Date.now());
            let d = date1 - date2;
            labelTime.textContent = "Time left: " + msToHMS(d);
        })
        //
    });
}
function drawHomeSearchResults() {
    clearUI();
    var auctions;
    homeAuctions().then(function (json) {
        auctions = JSON.parse(json);
        //console.log(auctions);
        auctions.forEach((value, i) => {
            const auctionDiv = document.createElement("div");
            auctionDiv.className = "auctionDiv" + i;
            auctionDiv.style.display = 'flex';
            auctionDiv.style.justifyContent = 'space-evenly';
            auctionDiv.style.margin = '2px';
            auctionDiv.style.border = '1px solid black';
            auctionDiv.style.padding = '2px';
            document.getElementsByClassName("contentDiv")[0].append(auctionDiv);
            const nameDescriptionDiv = document.createElement("div");
            nameDescriptionDiv.className = "nameDescriptionDiv" + i;

            const image = document.createElement("img");
            image.title = value.name;
            const descriptionDiv = document.createElement("div");
            descriptionDiv.className = "descriptionDiv" + i;
            const titleDiv = document.createElement("div");
            titleDiv.className = "titleDiv" + i;
            titleDiv.innerHTML = value.name;
            titleDiv.style.textAlign = 'center';
            auctionDiv.append(image);
            auctionDiv.append(nameDescriptionDiv);
            nameDescriptionDiv.append(titleDiv);
            nameDescriptionDiv.append(descriptionDiv);
            descriptionDiv.style.height = '75px';
            descriptionDiv.style.width = '250px';
            descriptionDiv.innerHTML = value.description;
            image.src = '.' + value.picture;
            image.width = '75';
            //image.height =  ;
            image.alt = "auction" + i + "Picture";
            image.addEventListener('click', auctionPage);
            titleDiv.addEventListener('click', auctionPage);

            const bidTimeDiv = document.createElement("div");
            bidTimeDiv.className = 'bidTimeDiv';
            nameDescriptionDiv.appendChild(bidTimeDiv);
            const labelBid = document.createElement("label");
            bidTimeDiv.appendChild(labelBid);
            labelBid.textContent = "current bid: " + value.currentBid;
            const labelTime = document.createElement("label");
            bidTimeDiv.appendChild(labelTime);
            let date1 = new Date(value.endDate);
            let date2 = new Date(Date.now());
            let d = date1 - date2;
            labelTime.textContent = "Time left: " + msToHMS(d);
        })
        //
    });
}
function drawMostPopularAuctions(){
    clearUI();
    document.getElementsByClassName('contentDiv')[0].innerHTML+="<center> Top 10 Auctions </center>";
    var top10;
    Top10Auctions().then(function (json) {
        top10 = JSON.parse(json);
        //console.log(auctions);
        top10.slice().reverse().forEach((value, i) => {
            const auctionDiv = document.createElement("div");
            auctionDiv.className = "auctionDiv" + i;
            auctionDiv.style.display = 'flex';
            auctionDiv.style.justifyContent = 'space-evenly';
            auctionDiv.style.margin = '2px';
            auctionDiv.style.border = '1px solid black';
            auctionDiv.style.padding = '2px';
            document.getElementsByClassName("contentDiv")[0].append(auctionDiv);
            const nameDescriptionDiv = document.createElement("div");
            nameDescriptionDiv.className = "nameDescriptionDiv" + i;

            const image = document.createElement("img");
            image.title = value.name;
            const descriptionDiv = document.createElement("div");
            descriptionDiv.className = "descriptionDiv" + i;
            const titleDiv = document.createElement("div");
            titleDiv.className = "titleDiv" + i;
            titleDiv.innerHTML = value.name;
            titleDiv.style.textAlign = 'center';
            auctionDiv.append(image);
            auctionDiv.append(nameDescriptionDiv);
            nameDescriptionDiv.append(titleDiv);
            nameDescriptionDiv.append(descriptionDiv);
            descriptionDiv.style.height = '75px';
            descriptionDiv.style.width = '250px';
            descriptionDiv.innerHTML = value.description;
            image.src = '.' + value.picture;
            image.width = '75';
            //image.height =  ;
            image.alt = "auction" + i + "Picture";
            image.addEventListener('click', auctionPage);
            titleDiv.addEventListener('click', auctionPage);

            const bidTimeDiv = document.createElement("div");
            bidTimeDiv.className = 'bidTimeDiv';
            nameDescriptionDiv.appendChild(bidTimeDiv);
            const labelBid = document.createElement("label");
            bidTimeDiv.appendChild(labelBid);
            labelBid.textContent = "current bid: " + value.currentBid;
            const labelTime = document.createElement("label");
            bidTimeDiv.appendChild(labelTime);
            let date1 = new Date(value.endDate);
            let date2 = new Date(Date.now());
            let d = date1 - date2;
            labelTime.textContent = "Time left: " + msToHMS(d);
            const par = document.createElement('p');
            par.textContent='number of views: '+value.views;
            auctionDiv.appendChild(par);
            //auctionDiv.innerHTML+='<p>  number of views: '+value.views+' </p>';
        })
        //
    });
}
function auctionPage() {
    
    clearUI();
    let aucName, auction;
    if (this.title) aucName = this.title;
    if (this.innerHTML) aucName = this.innerHTML;
    getAuction(aucName).then(function (json) {
        auction = JSON.parse(json);
        //console.log(auction);
        const auctionDiv = document.createElement("div");
        auctionDiv.className = "auctionDiv";
        auctionDiv.style.display = 'flex';
        auctionDiv.style.justifyContent = 'space-evenly';
        auctionDiv.style.margin = '2px';
        auctionDiv.style.border = '1px solid black';
        auctionDiv.style.padding = '2px';
        document.getElementsByClassName("contentDiv")[0].append(auctionDiv);
        const nameDescriptionDiv = document.createElement("div");
        nameDescriptionDiv.className = "nameDescriptionDiv";

        const image = document.createElement("img");
        const descriptionDiv = document.createElement("div");
        descriptionDiv.className = "descriptionDiv";
        const titleDiv = document.createElement("div");
        titleDiv.className = "titleDiv";
        titleDiv.innerHTML = auction.name;
        titleDiv.style.textAlign = 'center';
        auctionDiv.append(image);
        auctionDiv.append(nameDescriptionDiv);
        nameDescriptionDiv.append(titleDiv);
        nameDescriptionDiv.append(descriptionDiv);
        descriptionDiv.style.height = '75px';
        descriptionDiv.style.width = '250px';
        descriptionDiv.style.display = 'block';
        descriptionDiv.innerHTML = auction.description;
        image.src = '.' + auction.picture;
        image.width = '75';
        //image.height =  ;
        image.alt = "auction Picture";
        const bidDiv = document.createElement("div");
        bidDiv.style.display = 'flex';
        bidDiv.style.justifyContent = 'space-evenly';
        nameDescriptionDiv.appendChild(bidDiv);
        const bidInput = document.createElement("input");
        bidInput.className = 'bidInput';
        const bidButton = document.createElement("input");
        bidButton.addEventListener('click', bid);
        bidButton.type = 'button';
        bidButton.value = 'Bid';
        bidInput.type = 'number';
        bidInput.value = Number(auction.currentBid) + 1;
        bidInput.style.width = '25%';
        bidInput.min = Number(auction.currentBid) + 1;
        bidDiv.appendChild(bidInput);
        bidDiv.appendChild(bidButton);
        const bidTimeDiv = document.createElement("div");
        bidTimeDiv.className = 'bidTimeDiv';
        nameDescriptionDiv.appendChild(bidTimeDiv);
        const labelBid = document.createElement("label");
        bidTimeDiv.appendChild(labelBid);
        labelBid.textContent = "current bid: " + auction.currentBid;
        const labelTime = document.createElement("label");
        bidTimeDiv.appendChild(labelTime);
        let date1 = new Date(auction.endDate);
        let date2 = new Date(Date.now());
        let d = date1 - date2;
        labelTime.textContent = "Time left: " + msToHMS(d);
        const cookieSid = document.cookie
            .split("; ")
            .find((row) => row.startsWith("sid="))
            ?.split("=")[1];
        console.log("sessionID: " + cookieSid);
        const response = fetch("http://127.0.0.1:3000/checkSession", {
            method: "GET",
            headers: {
                "sid": cookieSid
            },
            credentials: "include"
        }).then((response) => {
            if (response.status == 200) {

            } else {
                bidDiv.innerHTML = "";
            }
        });
    });
}
function signin() {
    //console.log("singin function");
    const email = document.getElementsByClassName("emailSig")[0].value;
    const pass = document.getElementsByClassName("passSig")[0].value;
    const response = fetch("http://127.0.0.1:3000/signin", {
        method: "POST",
        body: email + " " + pass,
        credentials: "include"
    }).then((response) => {
        console.log(response.status);
        if (response.status == 200) {
            successfulLogin();
            //console.log("cookie: " + document.cookie);
        }
        return response.text();
    }).then((body) => console.log(body));
}
function register() {
    //console.log("reg function");
    //const email = document.getElementsByClassName("emailSig")[0].value;
    //const pass = document.getElementsByClassName("passSig")[0].value;
    const formdata = new FormData(document.getElementsByClassName("formSignIn")[0]);
    // formdata.values().forEach((a) => {
    //     console.log(a);
    // })


    const response = fetch("http://127.0.0.1:3000/register", {
        method: "POST",
        //headers: { "Content-Type": "multipart/form-data; boundary=--abc--" },
        //headers: { "Content-Type": "text/plain" },
        body: formdata,
        credentials: "include"
    }).then((response) => {
        console.log(response.status);
        if (response.status == 200) {
            successfulLogin();
        }
        return response.text();
    }).then((body) => console.log(body));
}
function checkSession() {
    const cookieSid = document.cookie
        .split("; ")
        .find((row) => row.startsWith("sid="))
        ?.split("=")[1];
    console.log("sessionID: " + cookieSid);
    const response = fetch("http://127.0.0.1:3000/checkSession", {
        method: "GET",
        headers: {
            "sid": cookieSid
        },
        credentials: "include"
    }).then((response) => {
        console.log(response.status);
        if (response.status == 200) {

            successfulLogin();
            return true;
        } else {
            clearEverything();
            drawUI([drawHome,drawMostPopularAuctions, drawSignIn, drawRegister],
                ["Home", "Top auctions","Sign in", "Register"]);
            return false;
        }
    }).then((body) => console.log(body));
    return response;
}
function successfulLogin() {
    clearEverything();
    drawUI([drawHome,drawMostPopularAuctions, drawNewAuction, drawYourAuctions, profile, Logout], ["Home","Top auctions", "New Auction", "Your Auctions", "Profile", "Logout"]);

}
function helperSignIn() {
    document.getElementsByClassName("passSig")[0].reportValidity();
    document.getElementsByClassName("emailSig")[0].reportValidity();

    if (document.getElementsByClassName("passSig")[0].validity.valid && document.getElementsByClassName("emailSig")[0].validity.valid) {
        signin();
    }
}
function Logout() {
    document.cookie = 'sid' + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.reload(true);
}
function profile() {
    const sid = document.cookie
        .split("; ")
        .find((row) => row.startsWith("sid="))
        ?.split("=")[1];

    const response = fetch("http://127.0.0.1:3000/profile", {
        method: "GET",
        headers: {
            "sid": sid
        },
        credentials: "include"
    }).then((response) => {
        console.log(response.status);
        //console.log(response.body);
        if (response.status == 200) {
            //console.log(response.body);
            drawProfile(response.body);
        } else if (response.status == 401) {
            window.location.reload(true);
        }
        //return response.text();
    });
}
function helperRegister() {
    document.getElementsByClassName("passSig")[0].reportValidity();
    document.getElementsByClassName("emailSig")[0].reportValidity();
    if (document.getElementsByClassName("passSig")[0].validity.valid && document.getElementsByClassName("emailSig")[0].validity.valid) {
        register();
    }
}
function helperNewAuction() {
    document.getElementsByClassName("pictureInput")[0].reportValidity();
    document.getElementsByClassName("descInput")[0].reportValidity();
    if (document.getElementsByClassName("pictureInput")[0].validity.valid && document.getElementsByClassName("descInput")[0].validity.valid) {
        newAuction();
    }
}
function newAuction() {
    const formdata = new FormData(document.getElementsByClassName("formSignIn")[0]);
    formdata.values().forEach((a) => {
        console.log(a);
    })
    const sid = document.cookie
        .split("; ")
        .find((row) => row.startsWith("sid="))
        ?.split("=")[1];
    //formdata.append("sid", sid);
    formdata.delete("email");
    formdata.delete("pass");
    const response = fetch("http://127.0.0.1:3000/newAuction", {
        method: "POST",
        //headers: { "Content-Type": "multipart/form-data; boundary=--abc--" },
        //headers: { "Content-Type": "text/plain" },
        headers: {
            "sid": sid
        },
        body: formdata,
        credentials: "include"
    }).then((response) => {
        console.log(response.status);
        if (response.status == 200) {
            window.location.reload(true);
        }
        return response.text();
    }).then((body) => console.log(body));
}
function yourAuctions() {
    const cookieSid = document.cookie
        .split("; ")
        .find((row) => row.startsWith("sid="))
        ?.split("=")[1];
    const response = fetch("http://127.0.0.1:3000/yourAuctions", {
        method: "GET",
        headers: {
            "sid": cookieSid
        },
        credentials: "include"
    }).then((response) => {
        console.log(response.status);
        if (response.status == 200) {

        }
        return response.text();
    }).then((body) => {
        //console.log(body);
        return body;
    });

    return response;
}
function Top10Auctions() {
    const response = fetch("http://127.0.0.1:3000/top10", {
        method: "GET",
    }).then((response) => {
        console.log(response.status);
        if (response.status == 200) {

        }
        return response.text();
    }).then((body) => {
        //console.log(body);
        return body;
    });

    return response;
}
function deleteAuction(event) {
    const sid = document.cookie
        .split("; ")
        .find((row) => row.startsWith("sid="))
        ?.split("=")[1];
    const response = fetch("http://127.0.0.1:3000/deleteAuction/" + event.currentTarget.name, {
        method: "DELETE",
        //headers: { "Content-Type": "multipart/form-data; boundary=--abc--" },
        //headers: { "Content-Type": "text/plain" },
        headers: {
            "sid": sid
        },
        credentials: "include"
    }).then((response) => {
        console.log(response.status);
        if (response.status == 200) {

        }
        return response.text();
    }).then((body) => console.log(body));
}
function editAuction(event) {
    let aucName = event.currentTarget.name;
    const sid = document.cookie
        .split("; ")
        .find((row) => row.startsWith("sid="))
        ?.split("=")[1];
    const formdata = new FormData(document.getElementsByClassName("formSignIn")[0]);
    formdata.delete("email");
    formdata.delete("pass");
    const response = fetch("http://127.0.0.1:3000/updateAuction/" + aucName, {
        method: "PUT",
        body: formdata,
        headers: {
            "sid": sid
        },
        //headers: { "Content-Type": "multipart/form-data; boundary=--abc--" },
        //headers: { "Content-Type": "text/plain" },
        credentials: "include"
    }).then((response) => {
        console.log(response.status);
        if (response.status == 200) {

        }
        return response.text();
    }).then((body) => console.log(body));

}
function editAuctionHelper(event) {
    document.getElementsByClassName("pictureInput")[0].reportValidity();
    document.getElementsByClassName("descInput")[0].reportValidity();
    document.getElementsByClassName("auctionInput")[0].reportValidity();
    if (document.getElementsByClassName("pictureInput")[0].validity.valid
        && document.getElementsByClassName("descInput")[0].validity.valid
        && document.getElementsByClassName("auctionInput")[0].validity.valid) {
        editAuction(event);
    }
}
function search() {
    const query = document.getElementsByClassName("searchBar")[0].value;
    //console.log(query);

    const response = fetch("http://127.0.0.1:3000/search?q=" + query, {
        method: "GET",
        credentials: "include"
    }).then((response) => {
        console.log(response.status);
        if (response.status == 200) {

        }
        return response.text();
    }).then((body) => {
        //console.log(body);
        return body;
    });
    return response;
}
function homeAuctions() {
    const response = fetch("http://127.0.0.1:3000/home", {
        method: "GET",
        credentials: "include"
    }).then((response) => {
        console.log(response.status);
        clearUI();
        if (response.status == 200) {

        }
        return response.text();
    }).then((body) => {
        //console.log(body);
        return body;
    });
    return response;
}
function getAuction(aucName) {
    const response = fetch("http://127.0.0.1:3000/auctions/" + aucName, {
        method: "GET",
        credentials: "include"
    }).then((response) => {
        console.log(response.status);
        if (response.status == 200) {

        }
        return response.text();
    }).then((body) => {
        //console.log(body);
        return body;
    });
    return response;
}
function msToHMS(ms) {
    // 1- Convert to seconds:
    let seconds = ms / 1000;
    // 2- Extract hours:
    const hours = parseInt(seconds / 3600); // 3,600 seconds in 1 hour
    seconds = seconds % 3600; // seconds remaining after extracting hours
    // 3- Extract minutes:
    const minutes = parseInt(seconds / 60); // 60 seconds in 1 minute
    // 4- Keep only seconds not extracted to minutes:
    seconds = seconds % 60;
    return (hours + ":" + minutes + ":" + Math.round(seconds));
}
function bid() {
    const cookieSid = document.cookie
        .split("; ")
        .find((row) => row.startsWith("sid="))
        ?.split("=")[1];
    const amount = document.getElementsByClassName("bidInput")[0].value;
    const itemName = document.getElementsByClassName("titleDiv")[0].innerHTML;
    const response = fetch("http://127.0.0.1:3000/bid?name=" + itemName + "?amount=" + amount, {
        method: "POST",
        headers: {
            "sid": cookieSid
        },
        credentials: "include"
    }).then((response) => {
        console.log(response.status);
        if (response.status == 200) {

        }
        return response.text();
    }).then((body) => {
        //console.log(body);
        return body;
    });
    return response;
}