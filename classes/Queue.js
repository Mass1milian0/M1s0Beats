//add event sender
const EventEmitter = require('events');
class Queue extends EventEmitter {
    constructor(){
        super();
        this.queue = [];
    }
    // add to the end of the queue
    enqueue(item){
        this.queue.push(item);
        // emit an event to notify that the queue has been updated
        this.emit('updated', this.queue);
    }
    // remove from the front of the queue or at a specific position
    dequeue(pos = 0){
        if(this.queue.length){
            if(pos > 0){
                this.queue.splice(pos, 1);
                this.emit('updated',this.queue);
            }else{
                this.queue.shift();
                this.emit('updated', this.queue);
            }
        }
    }
    // check the front of the queue
    peek(){
        if(this.queue.length){
            return this.queue[0];
        }
    }
    // check the size of the queue
    size(){
        return this.queue.length;
    }
    // gets the queue
    getQueue(){
        return this.queue;
    }
    clearQueue(){
        this.queue = [];
        this.emit('updated', this.queue);
    }
}
module.exports = Queue;