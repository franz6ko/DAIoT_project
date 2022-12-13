const mongoose = require('mongoose');

const dispositivoSchema = mongoose.Schema({
    dispositivoId: {
        type: String,
        require: true
    },
    nombre: {
        type: String,
        require: true
    },
    value: {
        type: Number,
    },
    updated: {
        type: Number,
    },
    topic: {
        type: String,
        require: true
    },
    topicSrvResponse: {
        type: String,
        require: true
    }
});

module.exports = mongoose.model('Dispositivo', dispositivoSchema);
