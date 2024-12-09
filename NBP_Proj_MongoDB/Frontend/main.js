document.title = 'Web Shop';
document.body.onload = checkSession();

var params = new URLSearchParams();
params.append('page', 1);

var header = document.createElement('header');
document.body.appendChild(header);

var h1 = document.createElement('h1');
h1.textContent = 'Web Shop';
header.appendChild(h1);

var nav = document.createElement('nav');
nav.className = 'searchNav';
header.appendChild(nav);

var search = document.createElement('input');
search.type = 'search';
search.className = 'search';
search.placeholder = 'Search!';
nav.appendChild(search);

var searchBtn = document.createElement('input');
searchBtn.type = 'button';
searchBtn.value = "Search";
searchBtn.addEventListener('click', (evt) => {
    var div = document.getElementsByClassName('contentDiv')[0];
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
    var divFilterArr = document.getElementsByClassName('filterDiv');
    while (divFilterArr[0]) {
        document.getElementsByClassName('sidebar')[0].removeChild(divFilterArr[0]);
    };
    params = new URLSearchParams('');
    document.getElementsByClassName('sortList')[0].selectedIndex = 0;
    params.set('sort', 'title');
    params.set('q', search.value);
    params.set('page', '1');
    params.set('fNeeded', '1');
    console.log(params.get('q'));
    fetch("http://127.0.0.1:3000/filter?" + params, {
        method: 'GET'
    }).then((response) => {
        return response.text();
    }).then((body) => {
        var array = JSON.parse(body);
        array.filters.forEach(element => {
            createFilters(document.getElementsByClassName('sidebar')[0], Object.keys(element)[0], element[Object.keys(element)]);
        });
        array.jsonArray.forEach(element => {
            createItemBox(document.getElementsByClassName('contentDiv')[0], element.img, element.title, element.price, true, false, element._id, evt.target.innerText);
        });
        const input = document.getElementsByClassName('inputFilter')[0];
        const output = document.getElementsByClassName('output')[0];
        output.value = "Price >= " + array.min;
        input.style.visibility = 'visible';
        output.style.visibility = 'visible';
        input.min = array.min;
        input.max = array.max;
        input.value = array.min;
        paginationGen(array.pages);
    });

});
nav.appendChild(searchBtn);

var mainDiv = document.createElement('div');
mainDiv.className = 'mainDiv';
document.body.appendChild(mainDiv);

var sidebar = document.createElement('nav');
sidebar.className = 'sidebar';
mainDiv.appendChild(sidebar);

var contentDiv = document.createElement('div');
contentDiv.className = 'contentDiv';
mainDiv.appendChild(contentDiv);

var ul = document.createElement('ul');
ul.className = 'sidebarUl';
sidebar.appendChild(ul);

var currentCategory = '';

fetch("http://127.0.0.1:3000/Categories", {
    method: 'GET'
}).then((response) => {
    //console.log(response.status);
    return response.text();
}).then((text) => {
    let res = JSON.parse(text);
    //console.log(res);
    res.forEach(element => {
        var li = document.createElement('li');
        li.className = 'sidebarLi';
        li.textContent = element;
        li.addEventListener('click', getColData);
        ul.appendChild(li);
    });
    const inputFilter = document.createElement('input');
    inputFilter.type = 'range';
    inputFilter.className = 'inputFilter';
    sidebar.appendChild(inputFilter);
    inputFilter.step = 1;
    inputFilter.style.visibility = 'hidden';
    const output = document.createElement('output');
    sidebar.appendChild(output);
    output.className = 'output';
    output.value = "Price >= " + inputFilter.value;
    output.style.visibility = 'hidden';
    inputFilter.oninput = function () {
        output.value = "Price >= " + inputFilter.value;
    }
    inputFilter.addEventListener('input', (evt) => {
        //console.log(inputFilter.value);
        params.set('fNeeded', '0');
        params.set('price', inputFilter.value);
        const response = fetch("http://127.0.0.1:3000/filter?" + params, {
            method: "GET",
            credentials: "include"
        }).then((response) => {
            return response.text();
        }).then((body) => {
            var div = document.getElementsByClassName('contentDiv')[0];
            while (div.firstChild) {
                div.removeChild(div.firstChild);
            }
            var array = JSON.parse(body);
            array.jsonArray.forEach(element => {
                createItemBox(document.getElementsByClassName('contentDiv')[0], element.img, element.title, element.price, true, false, element._id, evt.target.innerText);
            });
            paginationGen(array.pages);
        });
    });
});

const cartDiv = document.createElement('div');
cartDiv.className = 'cartDiv';
document.body.appendChild(cartDiv);

const cartImg = document.createElement('img');
cartImg.src = 'iconCart.png';
cartImg.style.width = '25px';
cartImg.style.height = '25px';
cartImg.className = 'cartImg';
cartImg.addEventListener('click', showCart);
cartDiv.appendChild(cartImg);

const logInDiv = document.createElement('div');
logInDiv.className = 'logInDiv';
document.body.appendChild(logInDiv);

const logOutDiv = document.createElement('div');
logOutDiv.className = 'logOutDiv';
logOutDiv.textContent += 'Logout';
document.getElementsByClassName('logInDiv')[0].appendChild(logOutDiv);
logOutDiv.style.visibility = "hidden";
logOutDiv.addEventListener('click', logout);

const logInImg = document.createElement('img');
logInImg.src = 'iconPerson.png';
logInImg.style.width = '25px';
logInImg.className = 'logInImg';
logInImg.style.height = '25px';
logInImg.addEventListener('click', loginPage);
logInDiv.appendChild(logInImg);

const paginationDiv = document.createElement('div');
paginationDiv.className = 'paginationDiv';
document.body.appendChild(paginationDiv);

const pagNav = document.createElement('nav');
pagNav.className = 'pagNav';
paginationDiv.appendChild(pagNav);

const ulPag = document.createElement('ul');
ulPag.className = 'ulPag';
pagNav.appendChild(ulPag);

const sortDiv = document.createElement('div');
sortDiv.className = 'sortDiv';
document.body.appendChild(sortDiv);

const sortLabel = document.createElement('label');
sortLabel.htmlFor = 'sort';
sortLabel.textContent = 'Sort by: ';
sortDiv.appendChild(sortLabel);

const sortList = document.createElement('select');
sortList.className = 'sortList';
sortList.id = 'sort';
sortList.addEventListener('input', (evt) => {
    params.set('sort', evt.target.options[evt.target.selectedIndex].value);
    //console.log(evt.target.options[evt.target.selectedIndex].value);
    params.set('fNeeded', '1');
    const response = fetch("http://127.0.0.1:3000/filter?" + params, {
        method: "GET",
        credentials: "include"
    }).then((response) => {
        return response.text();
    }).then((body) => {
        //console.log(body);
        var div = document.getElementsByClassName('contentDiv')[0];
        while (div.firstChild) {
            div.removeChild(div.firstChild);
        }
        var divFilterArr = document.getElementsByClassName('filterDiv');
        while (divFilterArr[0]) {
            document.getElementsByClassName('sidebar')[0].removeChild(divFilterArr[0]);
        };
        // var array = JSON.parse(body);
        // array.jsonArray.forEach(element => {
        //     createItemBox(document.getElementsByClassName('contentDiv')[0], element.img, element.title, element.price, true, false, element._id);
        // });

        var array = JSON.parse(body);
        array.filters.forEach(element => {
            createFilters(document.getElementsByClassName('sidebar')[0], Object.keys(element)[0], element[Object.keys(element)]);
        });
        array.jsonArray.forEach(element => {
            createItemBox(document.getElementsByClassName('contentDiv')[0], element.img, element.title, element.price, true, false, element._id, evt.target.innerText);
        });
        const input = document.getElementsByClassName('inputFilter')[0];
        const output = document.getElementsByClassName('output')[0];
        output.value = "Price >= " + array.min;
        input.style.visibility = 'visible';
        output.style.visibility = 'visible';
        input.min = array.min;
        input.max = array.max;
        input.value = array.min;
        paginationGen(array.pages);
    });
});
sortDiv.appendChild(sortList);

const sortOptionName = document.createElement('option');
sortOptionName.value = 'title';
sortOptionName.text = 'Name';
sortList.appendChild(sortOptionName);
params.set('sort', 'title');

const sortOptionPriceAscending = document.createElement('option');
sortOptionPriceAscending.value = 'priceAsc';
sortOptionPriceAscending.text = 'Price ascending';
sortList.appendChild(sortOptionPriceAscending);

const sortOptionPriceDescending = document.createElement('option');
sortOptionPriceDescending.value = 'priceDesc';
sortOptionPriceDescending.text = 'Price descending';
sortList.appendChild(sortOptionPriceDescending);


function showCart() {
    var div = document.getElementsByClassName('contentDiv')[0];
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
    const sid = document.cookie
        .split("; ")
        .find((row) => row.startsWith("sid="))
        ?.split("=")[1];
    const tsid = document.cookie
        .split("; ")
        .find((row) => row.startsWith("tsid="))
        ?.split("=")[1];
    const response = fetch("http://127.0.0.1:3000/getCart", {
        method: "GET",
        headers: {
            "sid": sid,
            "tsid": tsid
        },
        credentials: "include"
    }).then((response) => {
        return response.text();
    }).then((body) => {
        if (body.length == 0) return;
        //console.log(body);
        var array = JSON.parse(body);
        //console.log(array);
        array.forEach(element => {
            console.log(element);
            createItemBox(document.getElementsByClassName('contentDiv')[0], element.img, element.title, element.price, false, true, element._id, element.collection);
        });
    });

}
function loginPage() {
    var div = document.getElementsByClassName('contentDiv')[0];
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
    const divLoginHelp = document.createElement('div');
    divLoginHelp.className = 'divLoginHelp';
    div.appendChild(divLoginHelp);
    div = divLoginHelp;
    //divLoginHelp.style.display = 'flex';
    //divLoginHelp.style.flexDirection = 'column';
    const labelLogin = document.createElement('label');
    labelLogin.className = 'labelLogin';
    div.appendChild(labelLogin);
    labelLogin.textContent = 'Login:';
    const emailBox = document.createElement('input');
    emailBox.className = 'emailBox';
    div.appendChild(emailBox);
    const passBox = document.createElement('input');
    passBox.type = 'password';
    passBox.className = 'passBox';
    div.appendChild(passBox);
    const loginBtn = document.createElement('button');
    div.appendChild(loginBtn);
    loginBtn.className = 'loginBtn';
    loginBtn.textContent = 'Login';
    loginBtn.tsid = document.cookie
        .split("; ")
        .find((row) => row.startsWith("tsid="))
        ?.split("=")[1];
    loginBtn.addEventListener('click', (evt) => {
        const email = document.getElementsByClassName("emailBox")[0].value;
        const pass = document.getElementsByClassName("passBox")[0].value;
        const tsid = evt.currentTarget.tsid;
        //const sid = evt.currentTarget.sid;
        const response = fetch("http://127.0.0.1:3000/signin", {
            method: "POST",
            body: email + " " + pass,
            credentials: "include"
        }).then((response) => {
            console.log(response.status);
            if (response.status == 200) {
                var div = document.getElementsByClassName('contentDiv')[0];
                while (div.firstChild) {
                    div.removeChild(div.firstChild);
                }
                var profile = document.getElementsByClassName('logInImg')[0];
                profile.removeEventListener('click', loginPage);
                profile.addEventListener('click', showProfile);
                document.getElementsByClassName('logOutDiv')[0].style.visibility = 'visible';
                const sid = document.cookie
                    .split("; ")
                    .find((row) => row.startsWith("sid="))
                    ?.split("=")[1];
                console.log(tsid, sid);
                const response = fetch("http://127.0.0.1:3000/addToCartInBulk", {
                    method: "PUT",
                    headers: {
                        "sid": sid,
                        "tsid": tsid
                    },
                    credentials: "include"
                });
            }
            //return response.text();
        });
    });
    const labelReg = document.createElement('label');
    labelReg.textContent = 'Click to register!';
    labelReg.style.paddingTop = '10px';
    labelReg.addEventListener('click', registerPage);
    div.appendChild(labelReg);
}
function registerPage() {
    var div = document.getElementsByClassName('contentDiv')[0];
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
    const divLoginHelp = document.createElement('div');
    divLoginHelp.className = 'divLoginHelp';
    div.appendChild(divLoginHelp);
    div = divLoginHelp;
    const labelRegister = document.createElement('label');
    labelRegister.className = 'labelRegister';
    div.appendChild(labelRegister);
    labelRegister.textContent = 'Register:';
    const emailBox = document.createElement('input');
    emailBox.className = 'emailBoxReg';
    div.appendChild(emailBox);
    const passBox = document.createElement('input');
    passBox.type = 'password';
    passBox.className = 'passBoxReg';
    div.appendChild(passBox);
    const registerBtn = document.createElement('button');
    div.appendChild(registerBtn);
    registerBtn.className = 'registerBtn';
    registerBtn.textContent = 'Register';
    registerBtn.addEventListener('click', () => {
        const email = document.getElementsByClassName("emailBoxReg")[0].value;
        const pass = document.getElementsByClassName("passBoxReg")[0].value;
        const response = fetch("http://127.0.0.1:3000/register", {
            method: "POST",
            body: email + " " + pass,
            credentials: "include"
        }).then((response) => {
            console.log(response.status);
            if (response.status == 200) {
                var div = document.getElementsByClassName('contentDiv')[0];
                while (div.firstChild) {
                    div.removeChild(div.firstChild);
                }
            }
            return response.text();
        });
    });
}
function createItemBox(parentDiv, img, title, price, addToCart = true, removeFromCart = false, itemId, collection = '') {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'itemDiv';
    itemDiv.id = itemId;
    itemDiv.col = collection;
    parentDiv.appendChild(itemDiv);
    const itemBoxImg = document.createElement('img');
    itemDiv.appendChild(itemBoxImg);
    const itemBoxTitle = document.createElement('label');
    const itemBoxPrice = document.createElement('label');
    itemDiv.appendChild(itemBoxTitle);
    itemDiv.appendChild(itemBoxPrice);
    itemBoxTitle.textContent = "Item: " + title;
    itemBoxPrice.textContent = "Price: " + price + '$';
    itemBoxImg.src = img.substring(1);
    itemBoxImg.style.width = '50px';
    itemBoxImg.style.height = '50px';
    itemBoxTitle.className = 'itemBoxTitle';
    itemBoxPrice.className = 'itemBoxPrice';
    itemBoxImg.className = 'itemBoxImg';
    if (addToCart) {
        const itemAddToCartBtn = document.createElement('input');
        itemAddToCartBtn.value = 'Add to cart';
        itemAddToCartBtn.type = 'button';
        itemDiv.appendChild(itemAddToCartBtn);
        itemAddToCartBtn.className = 'itemAddToCartBtn';
        itemAddToCartBtn.addEventListener('click', () => {
            const sid = document.cookie
                .split("; ")
                .find((row) => row.startsWith("sid="))
                ?.split("=")[1];
            const tsid = document.cookie
                .split("; ")
                .find((row) => row.startsWith("tsid="))
                ?.split("=")[1];
            const response = fetch("http://127.0.0.1:3000/addToCart?&item=" + itemDiv.id + '&collection=' + itemDiv.col, {
                method: "PUT",
                headers: {
                    "sid": sid,
                    "tsid": tsid
                },
                credentials: "include"
            });
        });
    }
    if (removeFromCart) {
        const removeFromCartBtn = document.createElement('input');
        itemDiv.appendChild(removeFromCartBtn);
        removeFromCartBtn.type = 'button';
        removeFromCartBtn.value = 'Remove from cart';
        removeFromCartBtn.addEventListener('click', (event) => {
            const sid = document.cookie
                .split("; ")
                .find((row) => row.startsWith("sid="))
                ?.split("=")[1];
            const tsid = document.cookie
                .split("; ")
                .find((row) => row.startsWith("tsid="))
                ?.split("=")[1];
            const response = fetch("http://127.0.0.1:3000/deleteFromCart?&item=" + itemDiv.id, {
                method: "DELETE",
                headers: {
                    "sid": sid,
                    "tsid": tsid
                },
                credentials: "include"
            }).then((result) => {
                if (result.status = 200) {
                    document.getElementsByClassName('contentDiv')[0].removeChild(event.target.parentElement);
                }
            });
        });
    }
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
            var profile = document.getElementsByClassName('logInImg')[0];
            profile.removeEventListener('click', loginPage);
            profile.addEventListener('click', showProfile);
            document.getElementsByClassName('logOutDiv')[0].style.visibility = 'visible';
        } else {
            //document.getElementsByClassName('logOutDiv')[0].style.visibility = 'hidden';
        }
    });
}
function showProfile() {
    var div = document.getElementsByClassName('contentDiv')[0];
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
    var resStatus = 401;
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
        //console.log(response.status);
        //console.log(response.body);
        if (response.status == 200) {
            resStatus = 200;

        } else if (response.status == 401) {
            // window.location.reload(true);
        }
        return response.text();
    }).then((body) => {
        //console.log(resStatus);
        if (resStatus == 200) {
            drawProfile(body);
        }
    });
}
function drawProfile(data) {
    const parsed = JSON.parse(data);
    //console.log(parsed[0],parsed[1]);
    const profileDiv = document.getElementsByClassName("contentDiv")[0];
    const tDiv = document.createElement('div');
    tDiv.style.textAlign = 'center';
    tDiv.textContent += 'Profile';
    tDiv.style.display = 'flex';
    tDiv.style.flexDirection = 'column';
    profileDiv.appendChild(tDiv);
    const innerDiv = document.createElement('div');
    tDiv.appendChild(innerDiv);
    innerDiv.style.display = 'flex';
    innerDiv.style.flexDirection = 'row';
    innerDiv.style.textAlign = 'start';
    const image = document.createElement("img");
    const descriptionProfile = document.createElement("div");
    descriptionProfile.style.height = '75px';
    descriptionProfile.style.width = '250px';
    descriptionProfile.textContent = parsed[0];
    descriptionProfile.style.border = '1px solid black';

    image.src = parsed[1].substring(1);
    image.width = "75";
    image.height = "75";
    image.style.border = '1px solid black';
    //image.alt = "Profile Picture";
    innerDiv.append(image);
    innerDiv.append(descriptionProfile);
    const editBtn = document.createElement('input');
    editBtn.type = 'Button';
    editBtn.className = 'editBtn';
    editBtn.value = 'Edit profile';
    tDiv.appendChild(editBtn);
    editBtn.addEventListener('click', editProfile);
    const removeBtn = document.createElement('input');
    removeBtn.type = 'Button';
    removeBtn.className = 'removeBtn';
    removeBtn.value = 'Delete profile';
    tDiv.appendChild(removeBtn);
    removeBtn.addEventListener('click', deleteProfile);
}
function logout() {
    document.cookie = 'sid' + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.reload(true);
}
function editProfile() {
    var div = document.getElementsByClassName('contentDiv')[0];
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
    const titleD = document.createElement('div');
    titleD.innerText += 'Edit profile:';
    div.appendChild(titleD);
    const editForm = document.createElement('form');
    editForm.className = 'editForm';
    editForm.method = 'put';
    div.append(editForm);
    //const editDiv = document.createElement('div');
    //editForm.appendChild(editDiv);
    editForm.style.display = 'flex';
    editForm.style.flexDirection = 'column';
    const imgSelect = document.createElement('input');
    imgSelect.type = 'file';
    imgSelect.name = 'image';
    imgSelect.className = "imgSelect";
    editForm.appendChild(imgSelect);
    const newDesc = document.createElement('input');
    newDesc.type = 'text';
    newDesc.name = 'newDesc';
    newDesc.className = 'newDesc';
    editForm.appendChild(newDesc);
    const saveBtn = document.createElement('input');
    saveBtn.type = 'button';
    saveBtn.value = 'Save';
    saveBtn.style.width = 'fit-content';
    editForm.appendChild(saveBtn);
    saveBtn.addEventListener('click', saveEdit);
}
function saveEdit() {
    const sid = document.cookie
        .split("; ")
        .find((row) => row.startsWith("sid="))
        ?.split("=")[1];
    var fromdata = new FormData(document.getElementsByClassName('editForm')[0]);
    fromdata.entries().forEach(element => {
        console.log(element);
    });
    const response = fetch("http://127.0.0.1:3000/editProfile", {
        method: "PUT",
        headers: {
            "sid": sid
        },
        body: fromdata,
        credentials: "include"
    }).then((response) => {
        //console.log(response.status);
        //console.log(response.body);
        if (response.status == 200) {

        } else if (response.status == 401) {
            // window.location.reload(true);
        }
        return response.text();
    }).then((body) => {
        //console.log(resStatus);
    });
}
function deleteProfile() {
    const sid = document.cookie
        .split("; ")
        .find((row) => row.startsWith("sid="))
        ?.split("=")[1];

    const response = fetch("http://127.0.0.1:3000/deleteProfile", {
        method: "DELETE",
        headers: {
            "sid": sid
        },
        credentials: "include"
    }).then((response) => {
        //console.log(response.status);
        //console.log(response.body);
        if (response.status == 200) {
            logout();
        } else if (response.status == 401) {
            // window.location.reload(true);
        }
        return response.text();
    });
}
function getColData(event) {
    currentCategory = event.target.innerText;
    var div = document.getElementsByClassName('contentDiv')[0];
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
    var divFilterArr = document.getElementsByClassName('filterDiv');
    while (divFilterArr[0]) {
        document.getElementsByClassName('sidebar')[0].removeChild(divFilterArr[0]);
    };
    params = new URLSearchParams('');
    params.set('sort', 'title');
    document.getElementsByClassName('sortList')[0].selectedIndex = 0;
    params.set('fNeeded', '1');
    params.set('page', '1');
    params.set('category', event.target.innerText);
    const response = fetch("http://127.0.0.1:3000/filter?" + params, {
        method: "GET",
        credentials: "include"
    }).then((response) => {
        return response.text();
    }).then((body) => {
        //console.log(body);
        var array = JSON.parse(body);
        //console.log(array.filters);
        array.filters.forEach(element => {
            createFilters(document.getElementsByClassName('sidebar')[0], Object.keys(element)[0], element[Object.keys(element)]);
        });
        array.jsonArray.forEach(element => {
            //console.log(element);
            createItemBox(document.getElementsByClassName('contentDiv')[0], element.img, element.title, element.price, true, false, element._id, event.target.innerText);
        });
        const input = document.getElementsByClassName('inputFilter')[0];
        const output = document.getElementsByClassName('output')[0];
        output.value = "Price >= " + array.min;
        input.style.visibility = 'visible';
        output.style.visibility = 'visible';
        input.min = array.min;
        input.max = array.max;
        input.value = array.min;
        paginationGen(array.pages);
    });
}
function createFilters(parent, filterName, arrayOfValues) {
    //console.log(parent, filterName, arrayOfValues);
    const filterDiv = document.createElement('div');
    filterDiv.className = 'filterDiv';
    parent.appendChild(filterDiv);
    const fieldName = document.createElement('label');
    fieldName.textContent = filterName;
    filterDiv.appendChild(fieldName);
    filterDiv.style.display = 'flex';
    filterDiv.style.flexDirection = 'column';
    filterDiv.style.borderTop = '1px solid black';
    filterDiv.style.marginTop = '3px';
    filterDiv.style.paddingLeft = '10%'
    arrayOfValues.forEach((el) => {
        const checkBox = document.createElement('input');
        checkBox.type = 'checkbox';
        checkBox.value = el;
        checkBox.addEventListener('input', (evt) => {
            var div = document.getElementsByClassName('contentDiv')[0];
            while (div.firstChild) {
                div.removeChild(div.firstChild);
            }
            if (evt.target.checked) {
                params.append(filterName, el);
            } else {
                params.delete(filterName, el);
            }
            fetch("http://127.0.0.1:3000/filter?" + params, {
                method: 'GET'
            }).then((response) => {
                return response.text();
            }).then((body) => {
                var array = JSON.parse(body);
                array.jsonArray.forEach(element => {
                    createItemBox(document.getElementsByClassName('contentDiv')[0], element.img, element.title, element.price, true, false, element._id, evt.target.innerText);
                });
                paginationGen(array.pages);
            });
        });
        const cbLabel = document.createElement('label');
        cbLabel.appendChild(checkBox);
        const span = document.createElement('span');
        span.textContent = el;
        cbLabel.appendChild(span);
        filterDiv.appendChild(cbLabel);
    });
}
function paginationGen(pageNum) {
    var div = document.getElementsByClassName('ulPag')[0];
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
    var currentPage = Number(params.get('page'));
    var ul = document.getElementsByClassName('ulPag')[0];
    const li = document.createElement('li');
    ul.appendChild(li);
    const a = document.createElement('a');
    a.addEventListener('click', () => {
        currentPage = Number(document.querySelector('[aria-current="page"]').textContent);
        if (currentPage - 1 <= 0) return;
        document.querySelector('[aria-current="page"]').ariaCurrent = 'false';
        a.ariaCurrent = 'page';
        params.set('page', currentPage - 1);
        const response = fetch("http://127.0.0.1:3000/filter?" + params, {
            method: "GET",
            credentials: "include"
        }).then((response) => {
            return response.text();
        }).then((body) => {
            //console.log(body);
            var div = document.getElementsByClassName('contentDiv')[0];
            while (div.firstChild) {
                div.removeChild(div.firstChild);
            }
            var array = JSON.parse(body);
            array.jsonArray.forEach(element => {
                //console.log(element);
                createItemBox(document.getElementsByClassName('contentDiv')[0], element.img, element.title, element.price, true, false, element._id);
            });
            paginationGen(array.pages);
        });
    });
    //a.href = '';
    li.appendChild(a);
    const span = document.createElement('span');
    span.ariaHidden = 'true';
    //span.className = 'visuallyhidden';
    span.innerHTML = '&laquo;';
    a.appendChild(span);
    var start = 0, end = 0;
    if (currentPage <= 2) {
        start = 1;
    } else {
        start = currentPage - 2;
    }
    if (currentPage == pageNum) {
        end = currentPage;
    } else if (currentPage + 1 == pageNum) {
        end = currentPage + 1;
    }
    else {
        end = currentPage + 2;
    }
    for (start; start <= end; start++) {
        const li1 = document.createElement('li');
        ul.appendChild(li1);
        const a1 = document.createElement('a');
        //a1.href = '';
        li1.appendChild(a1);
        const span1 = document.createElement('span');
        a1.appendChild(span1);
        a1.addEventListener('click', () => {
            currentPage = Number(a1.textContent);
            document.querySelector('[aria-current="page"]').ariaCurrent = 'false';
            a1.ariaCurrent = 'page';
            params.set('page', currentPage);
            const response = fetch("http://127.0.0.1:3000/filter?" + params, {
                method: "GET",
                credentials: "include"
            }).then((response) => {
                return response.text();
            }).then((body) => {
                //console.log(body);
                var div = document.getElementsByClassName('contentDiv')[0];
                while (div.firstChild) {
                    div.removeChild(div.firstChild);
                }
                var array = JSON.parse(body);
                array.jsonArray.forEach(element => {
                    //console.log(element);
                    createItemBox(document.getElementsByClassName('contentDiv')[0], element.img, element.title, element.price, true, false, element._id);
                });
                paginationGen(array.pages);
            });
        });
        span1.className = 'visuallyhidden';
        if (currentPage == start) {
            a1.ariaCurrent = 'page';
        }
        a1.innerHTML += start;
    }
    const li2 = document.createElement('li');
    ul.appendChild(li2);
    const a2 = document.createElement('a');
    a2.addEventListener('click', () => {
        currentPage = Number(document.querySelector('[aria-current="page"]').textContent);
        if (currentPage >= pageNum) return;
        document.querySelector('[aria-current="page"]').ariaCurrent = 'false';
        a2.ariaCurrent = 'page';
        params.set('page', currentPage + 1);
        const response = fetch("http://127.0.0.1:3000/filter?" + params, {
            method: "GET",
            credentials: "include"
        }).then((response) => {
            return response.text();
        }).then((body) => {
            //console.log(body);
            var div = document.getElementsByClassName('contentDiv')[0];
            while (div.firstChild) {
                div.removeChild(div.firstChild);
            }
            var array = JSON.parse(body);
            array.jsonArray.forEach(element => {
                //console.log(element);
                createItemBox(document.getElementsByClassName('contentDiv')[0], element.img, element.title, element.price, true, false, element._id);
            });
            paginationGen(array.pages);
        });
    });
    //a.href = '';
    li2.appendChild(a2);
    const span2 = document.createElement('span');
    span2.ariaHidden = 'true';
    //span.className = 'visuallyhidden';
    span2.innerHTML = '&raquo;';
    a2.appendChild(span2);
}