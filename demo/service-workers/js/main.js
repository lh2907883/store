function get(url, responseType) {
    return new Promise(function(res, rej) {
        var xhr = new XMLHttpRequest();
        xhr.onloadend = function(e) {
            if (e.currentTarget.status == 200) {
                res(e.currentTarget.response);
            } else {
                rej(e.currentTarget.statusText);
            }
        }
        xhr.responseType = responseType;
        xhr.open("GET", url);
        xhr.send();
    });
}

var domImgs = document.getElementById('imgs');

function genImage(src) {
    var img = new Image();
    img.src = src;
    img.style.height = '100px';
    img.style.float = 'left';
    domImgs.appendChild(img);
}

document.getElementById('add').addEventListener('click', function() {
    get('json/data.json', 'json').then(function(data) {
        document.getElementById('updateTime').innerText = new Date(data.updateTime);
        data.list.forEach(function(item, index) {
            switch (item.type) {
                case 'img':
                    genImage(item.url);
                    break;
                case 'url':
                    get(item.url, 'blob').then(function(imgData) {
                        console.log(imgData)
                        genImage(URL.createObjectURL(imgData));
                    })
                    break;
            }
        })
    });
});