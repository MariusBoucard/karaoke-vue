<template>
  <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
  <div>
    <div class="button-container"> 
      <button class="button" :class="{ active: currentTab === 1 }" @click="currentTab = 1">1</button>
          <button class="button"  :class="{ active: currentTab === 2 }" @click="currentTab =2">2</button>
    <button class="button"  :class="{ active: currentTab === 3 }"  @click="currentTab =3">3</button>

  </div>
  <div class="custom-container">
    <label class="custom-button" for="customFileInput">Load File</label>
    <input class="custom-file-input" id="customFileInput" type="file" @change="loadFile($event)">
    
    <button class="custom-button" @click="saveFile()">Save File</button>
  </div>


    <div v-if="currentTab ===1"> 

      <Tab1Component :title="title" :auteur="auteur" @changeAuteur="changeAuteur($event)" @changeTitle="changeTitle($event)" :parole="paroles" @songLoaded="newSongLoaded($event)" @newParoles="updateParoles($event)"></Tab1Component>
    </div>
    <div v-if="currentTab === 2"> 
      <Tab2Component @removeAssociation="removeAsso($event)" @updateTimeStamp="setTimeStamp()" @setAssociation="setAssociation($event)" :audioSrc="audioSrc" @newAssociation="addAssociation($event)" :timeStampLines="timeStampLines" :association="association" :lines="lines"></Tab2Component>  
    </div>
    <div  v-if="currentTab === 3"> 
      <Tab3Component @removeAssociation="removeAsso($event)" @removeChord="removeChord($event)" @updateChord="updateChord()" :chordList="chordList" @newAssociation="addAssociation($event)" @setAssociation="setAssociation($event)" :lineTime="timeStampLines" :lines="lines" :audioSrc="audioSrc" :association="association"></Tab3Component>
    </div>
  
  </div>
</template>

<script>
import Tab1Component from './components/Tab1Component.vue';
import Tab2Component from './components/Tab2Component.vue'
import { SongCore } from './utils/songCore';
import { getChansonStore } from './store/chansonStore';
import Tab3Component from './components/Tab3Component.vue';
import { UserCore } from './utils/userCore';
export default {
  name: 'App',
  components: {
    Tab1Component,
    Tab2Component,
    Tab3Component,
},
  computed: {

  },
  methods: {
    removeAsso(evt){
        this.association = this.association.filter(ass => ass !== evt)
        this.userCore.setAssociation(this.association)
    },
    setTimeStamp(){
      this.timeStampLines = this.songCore.computeTimeStampLine()
      this.saveLocal()
    },
    updateChord(){
      this.chordList = this.songCore.getChordList()
      this.saveLocal()
    },
    saveFile(){
      this.chansonStore.saveSong("/home/marius")
    },
    loadFile(evt){
      const selectedFile = evt.target.files[0]
      if(selectedFile){
        this.chansonStore.loadFile(selectedFile)
        this.$forceUpdate()
      }
    },
    newSongLoaded(evt){
      this.audioSrc = evt
      this.songCore.setSong(this.audioSrc)
      this.saveLocal()
    },
    updateParoles(evt){
      this.songCore.updateParoles(evt)
      this.paroles = evt
      this.lines = this.chansonStore.getLines()
      this.saveLocal()
    },
    saveLocal(){
      console.log('savedLocal')
      localStorage.setItem('user',JSON.stringify(this.userCore.getUser()))
      localStorage.setItem('chanson',JSON.stringify(this.songCore.getChanson()))
    },
    loadLocal(){
      console.log('loadLocal')
      const storedUserData = localStorage.getItem('user');
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        this.userCore.setUserStore(parsedUserData);
        this.association = this.userCore.getUser().association


      }
      console.log('loadLocal')
      const storedSongData = localStorage.getItem('chanson');
      if (storedSongData) {
        const parsedSongData = JSON.parse(storedSongData);
        this.songCore.setChanson(parsedSongData);
        this.lines = this.chansonStore.getLines()
        this.paroles = this.chansonStore.lyrics
        console.log(this.paroles)
        console.log("lines",this.lines)
        this.timeStampLines = this.songCore.computeTimeStampLine()
        this.chordList = this.chansonStore.getChordList()
        this.title = this.chansonStore.getTitle()
        this.auteur = this.chansonStore.getAuteur()
  }
    },
    removeChord(chord){
      this.chordList = this.chordList.filter(cho => cho !== chord)
      this.chansonStore.setChordList(this.chordList)
      this.saveLocal()
    },
    addAssociation(evt){
      this.association.push(evt)
      this.userCore.setAssociation(this.association)
      this.saveLocal()
    },
    setAssociation(evt){
      this.association = evt
      console.log(this.association)
      this.userCore.setAssociation(this.association)
      this.saveLocal()
    },
    addLineStamp(evt){
      
    },
    changeTitle(title){
      this.title = title
      this.chansonStore.setTitle(this.title)
      this.saveLocal()
    },
    changeAuteur(title){
      this.auteur = title
      this.chansonStore.setAuteur(this.auteur)
      this.saveLocal()
    }
  },
  data() {
    return {
      association : [],
      currentTab : 1,
      lines : [],
      songCore : undefined,
      paroles : '',
      chansonStore : undefined,
      audioSrc : undefined,
      userCore : new UserCore(),
      timeStampLines : [],
      chordList : [],
      title : '',
      auteur : ''
    }
  },
  created() {
    this.songCore = new SongCore()
   this.chansonStore = getChansonStore()
  },
  mounted(){
    this.loadLocal()
    this.timeStamp = this.songCore.computeTimeStampLine()
    this.paroles = this.songCore.getLyrics()
  }
}
</script>

<style >
      .custom-container {
      display: flex;
      justify-content: flex-end;
      width: 100%;
      padding: 0px;
      padding-top : 10px;
      padding-bottom: 10px;
      background-color: #e0e0e0;
    }
    
    .custom-button {
      flex-grow: 0;
      flex-shrink: 0;
      padding: 10px 20px;
      margin: 0 5px;
      text-align: center;
      background-color: #3498db;
      color: white;
      font-size: 14px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .custom-button:hover {
      background-color: #2980b9;
    }
    
    .custom-file-input {
      display: none;
      visibility: hidden;
      width: 0;
    }
  .button-container {
      display: flex;
      width: 100%;
    }
    
    .button {
      flex-grow: 1;
      padding: 15px;
      text-align: center;
      background-color: #3498db;
      color: white;
      font-size: 16px;
      border: none;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .button:hover {
      background-color: #2980b9;
    }
    .active {
  background-color: grey; /* Customize the active state background color */
  /* You can add more styles for the active state here */
}
</style>
