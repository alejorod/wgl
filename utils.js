function loadImg() {}
function loadSrc(path) {
    return fetch(path).then(r => r.text());
}
function loop() {}