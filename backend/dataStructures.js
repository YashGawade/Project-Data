// Implements DoublyLinkedList nodes and Playlist class with Stack history and Queue future
const fs = require('fs');

class Node {
  constructor(song) {
    this.song = song;
    this.next = null;
    this.prev = null;
  }
}

class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  append(song) {
    const node = new Node(song);
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      this.tail.next = node;
      node.prev = this.tail;
      this.tail = node;
    }
    this.length++;
    return node;
  }

  removeById(id) {
    let cur = this.head;
    while (cur) {
      if (cur.song.id === id) {
        if (cur.prev) cur.prev.next = cur.next; else this.head = cur.next;
        if (cur.next) cur.next.prev = cur.prev; else this.tail = cur.prev;
        this.length--;
        return cur.song;
      }
      cur = cur.next;
    }
    return null;
  }

  toArray() {
    const arr = [];
    let cur = this.head;
    while (cur) {
      arr.push(cur.song);
      cur = cur.next;
    }
    return arr;
  }

  findById(id) {
    let cur = this.head;
    while (cur) {
      if (cur.song.id === id) return cur;
      cur = cur.next;
    }
    return null;
  }
}

class Stack {
  constructor() { this._ = []; }
  push(x) { this._.push(x); }
  pop() { return this._.pop(); }
  peek() { return this._[this._.length-1]; }
  isEmpty() { return this._.length === 0; }
  clear(){ this._ = []; }
}

class Queue {
  constructor() { this._ = []; }
  enqueue(x) { this._.push(x); }
  dequeue() { return this._.shift(); }
  peek() { return this._[0]; }
  isEmpty() { return this._.length === 0; }
  toArray(){ return [...this._]; }
  clear(){ this._ = []; }
}

class Playlist {
  constructor({ id, name, songs = [] }) {
    this.id = id;
    this.name = name;
    this.list = new DoublyLinkedList();
    songs.forEach(s => this.list.append(s));
    this.current = this.list.head;
    this.history = new Stack();
    this.future = new Queue();
    this.isPlaying = false;
  }

  addSong(song) {
    const node = this.list.append(song);
    if (this.current && this.current !== this.list.tail) {
      this.future.clear();
      let cur = this.current.next;
      while (cur) { this.future.enqueue(cur.song); cur = cur.next; }
    }
    return node;
  }

  removeSong(songId) {
    const removed = this.list.removeById(songId);
    if (this.current && this.current.song.id === songId) {
      this.current = this.current ? this.current.next || this.current.prev : null;
      this.future.clear();
      let cur = this.current ? this.current.next : null;
      while (cur) { this.future.enqueue(cur.song); cur = cur.next; }
    }
    return removed;
  }

  play() {
    if (!this.current) return null;
    this.isPlaying = true;
    return this.current.song;
  }

  next() {
    if (!this.current) return null;
    this.history.push(this.current.song);
    if (this.current.next) {
      this.current = this.current.next;
      this.future.clear();
      let cur = this.current.next;
      while (cur) { this.future.enqueue(cur.song); cur = cur.next; }
      return this.current.song;
    }
    return null;
  }

  previous() {
    if (this.history.isEmpty()) return null;
    const prevSong = this.history.pop();
    const node = this.list.findById(prevSong.id);
    if (node) {
      if (this.current) this.future._.unshift(this.current.song);
      this.current = node;
      this.future.clear();
      let cur = this.current.next;
      while (cur) { this.future.enqueue(cur.song); cur = cur.next; }
      return this.current.song;
    }
    return null;
  }

  toSerializable() {
    return {
      id: this.id,
      name: this.name,
      songs: this.list.toArray(),
      current: this.current ? this.current.song.id : null,
      isPlaying: this.isPlaying
    };
  }
}

module.exports = { Playlist, DoublyLinkedList, Stack, Queue };
