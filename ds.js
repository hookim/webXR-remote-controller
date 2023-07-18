class Queue {
    #q; #max_cap; #size; #front; #end;
    constructor(MAX_SIZE){
        this.#q = new Array(MAX_SIZE);
        this.#max_cap = MAX_SIZE;
        this.#size = 0;
        this.#front = 0;
        this.#end = 0;
    }
    #idxOp(type, num){
        const MAX_CAPACITY = this.#max_cap
        switch(type){
            case '+': return (num + 1) % MAX_CAPACITY;
            case '-': return (num - 1) >= 0 ? (num - 1) % MAX_CAPACITY : MAX_CAPACITY;
        }
    }

    size(){
        return this.#size
    }
    
    isFull(){
        if(this.#max_cap === this.#size) return true
        else return false
    }

    isEmpty(){
        if(this.#size === 0) return true
        else return false
    }

    peek(){
        if(this.isEmpty()) return null
        else return this.#q[this.#front]
    }

    push(val){
        if(this.isFull()) return null
        this.#q[this.#end] = val
        this.#end = this.#idxOp('+', this.#end)
        this.#size += 1;
    }

    pop(){
        if(this.isEmpty()) return null
        this.#q[this.#front] = null
        this.#front = this.#idxOp('+', this.#front)
        this.#size -= 1;
    }
}

exports.Queue = Queue