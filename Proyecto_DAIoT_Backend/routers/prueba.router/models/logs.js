const mongoose = require('mongoose');

const logsSchema = mongoose.Schema({
    logId: {
        type: Number,
        require: true
    },
    ts: {
        type: Number,
        require: true,
        default: new Date().getTime()
    },
    nodoId: {
        type: String,
        require: true
    },
    value: {
        type: Number,
    },
});

module.exports = mongoose.model('Logs', logsSchema);
