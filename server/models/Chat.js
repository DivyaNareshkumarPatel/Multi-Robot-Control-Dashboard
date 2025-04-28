const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatbotUser', required: true },
    messages: [{
        text: { type: String, required: true },
        sender: { type: String, enum: ['user', 'bot'], required: true },
        timestamp: { type: Date, default: Date.now },
        fileUrl: { type: String, required: false }
    }]
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
