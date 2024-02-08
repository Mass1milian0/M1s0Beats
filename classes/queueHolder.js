const eventEmitter = require('events');
class queue extends eventEmitter {
    constructor() {
        super();
        this.queue = [];
    }
    enqueue(element) {
        this.queue.push(element);
        this.emit('queueElementAdded',this.queue);
    }
    dequeue() {
        if (this.isEmpty())
            return "Underflow";
        return this.queue.shift();
    }
    queueSkip() {
        this.emit('queueSkip',this.queue);
    }
    isEmpty() {
        return this.queue.length == 0;
    }
    peek() {
        if (this.isEmpty())
            return "No elements in Queue";
        return this.queue[0];
    }
    getQueue() {
        return this.queue;
    }
    queueClear(emitDisconnect = false) {
        this.queue = [];
        if(emitDisconnect) this.emit('queueDisconnect');
    }
}

module.exports = queue;