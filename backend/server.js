const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Playlist } = require('./dataStructures');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = path.join(__dirname, 'playlists.json');
let playlists = {};

function loadData(){
  if (fs.existsSync(DATA_FILE)){
    try{
      const json = JSON.parse(fs.readFileSync(DATA_FILE));
      playlists = {};
      json.forEach(p => { playlists[p.id] = new Playlist(p); });
    }catch(e){ playlists = {}; }
  } else playlists = {};
}

function saveData(){
  const arr = Object.values(playlists).map(p => p.toSerializable());
  fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2));
}

loadData();

function makeId(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,6); }

app.get('/playlists',(req,res)=>{
  res.json(Object.values(playlists).map(p=>p.toSerializable()));
});

app.post('/playlists',(req,res)=>{
  const {name}=req.body;
  const id = makeId();
  playlists[id] = new Playlist({id,name,songs:[]});
  saveData();
  res.json(playlists[id].toSerializable());
});

app.get('/playlists/:id',(req,res)=>{
  const p=playlists[req.params.id];
  if(!p) return res.status(404).json({error:'Not found'});
  res.json(p.toSerializable());
});

app.post('/playlists/:id/songs',(req,res)=>{
  const p=playlists[req.params.id];
  if(!p) return res.status(404).json({error:'Not found'});
  const song = {id:makeId(), name:req.body.name};
  p.addSong(song);
  saveData();
  res.json({added:song, playlist:p.toSerializable()});
});

app.delete('/playlists/:id/songs/:sid',(req,res)=>{
  const p=playlists[req.params.id];
  if(!p) return res.status(404).json({error:'Not found'});
  const removed = p.removeSong(req.params.sid);
  saveData();
  res.json({removed, playlist:p.toSerializable()});
});

app.post('/playlists/:id/play',(req,res)=>{
  const p=playlists[req.params.id];
  if(!p) return res.status(404).json({error:'Not found'});
  const s=p.play(); saveData(); res.json({playing:s,playlist:p.toSerializable()});
});

app.post('/playlists/:id/next',(req,res)=>{
  const p=playlists[req.params.id];
  const s=p.next(); saveData(); res.json({movedTo:s,playlist:p.toSerializable()});
});

app.post('/playlists/:id/previous',(req,res)=>{
  const p=playlists[req.params.id];
  const s=p.previous(); saveData(); res.json({movedTo:s,playlist:p.toSerializable()});
});

app.listen(4000);
