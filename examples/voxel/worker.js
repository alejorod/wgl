importScripts('utils.js');
importScripts('noise.js');
importScripts('terrain.js');

self.onmessage = function (msg) {
    switch (msg.data.cmd) {
        case 'generate':
                sendChunk(msg.data.coords);
            break;
        default:
            break;
    }
}

function sendChunk({x, y, z}) {
    const chunk = generateChunk(x, y, z);

    if (!chunk.isEmpty()) {
        self.postMessage({buffers: chunk.generateVAOData()});
    }
}