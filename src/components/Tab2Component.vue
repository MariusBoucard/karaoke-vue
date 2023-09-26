<template>
    <div>
        <div class="custom-container">
            <!-- {{ this.currentTime }} -->
            <audio class="custom-audio-style" :src="audioSrc" ref="audioPlayers" controls @timeupdate="updateCurrentTime">
                <source src="audioSrc" type="audio/mpeg">
            </audio>
            <!-- Button for recording lines -->
            <button class="custom-input-style" :class="{ active : recording }" @click="changeRecording()">record de line</button>
        </div>
        
        <div>
            <!-- <div  class="horizontal-line">
            <div style="width:1000px;height: 500px;" v-for="chord in association">
                <ChordDisplay v-if="chord.accord" :chord=chord.accord></ChordDisplay>
            </div>
            
        </div> -->
        </div>
        <div class="container" id="app">
            <div class="column">
                <ul>
                    <li v-for="line in lines" :key="line" class="list-item">
                        <span @contextmenu="event => removeTimeStamp(event, getTimeStampDebut(line.index))" class="timestamp-left">{{ getTimeStampDebut(line.index) }}</span>
                        <span  @contextmenu="event => removeTimeStamp(event, getTimeStampFin(line.index))" class="timestamp-right">{{ getTimeStampFin(line.index) }}</span>
                        <div class="text">{{ line.text }}</div>
                    </li>
                </ul>
            </div>
            <div class="column">
                <div style="height : 40vh">
                    <ul class="list">
                    <li v-for="(line, index) in lineToDisplay" :key="line" class="list-item2"
                            :class="{ 'main-item': index === 2 }"                    >
                            {{ line.text }}
                            <div v-if="index === 2" class="overlay"></div> <!-- Overlay for the middle element -->
                        </li>
                    </ul>

                </div>
                <div>
                    <chordsComponent @removeAssociation="removeAsso($event)" @setAssociation="setAsso($event)" @newAssociation="passAsso($event)" :association="association"></chordsComponent>

                </div>
            </div>
            
        </div>

       

            <!-- <ul>
            <li v-for="time in timeStampLines" :key="time"> {{ time }}</li>
        </ul> -->
        </div>

</template>
<script>
import { SongCore } from '@/utils/songCore';
import chordsComponent from '../widget/chordsComponent.vue'
import { getChansonStore } from '@/store/chansonStore';
import ChordDisplay from '@/widget/chordDisplay.vue';
export default {
    components: {
        chordsComponent,
        ChordDisplay
    },
    props: {
        association: { required: true, type: [Object] },
        lines: { required: true, type: [Object] },
        audioSrc: { required: true },
        timeStampLines: { required: true, type: [Object] }
    },
    mounted() {
        this.audioPlayer = this.$refs.audioPlayers; // Assign the audio player reference on mount
        this.songStore = getChansonStore()

    },
    created() {

    },
    computed: {
        lineToDisplay() {
            var retur = []
            var currentLine = this.timeStampLines.find(line => line.lineDeb < this.currentTime && line.lineFin > this.currentTime)
            if (!currentLine) {
                return
            }
            console.log(currentLine)
            console.log(currentLine.lineId)

            const linesCopy = [...this.lines]
            linesCopy.forEach(li => {
                if (li.index > currentLine.lineId - 3 && li.index < currentLine.lineId + 3) {
                    console.log("fart")
                    retur.push(li)
                }
            }
            )
            console.log(retur)
            return retur
        }
    },
    data() {
        return {
            recording: false,
            songCore: new SongCore(),
            //  timeStampLines : [],
            currentTime: 0
        }
    },
    methods: {
        passAsso(evt) {
            this.$emit('newAssociation', evt)
        },
        setAsso(evt){
            this.$emit('setAssociation',evt)
        },
        removeAsso(evt){
            this.$emit('removeAssociation',evt)
        },
        /**
        * CurrentLine
        */
        updateCurrentTime() {
            this.currentTime = this.audioPlayer.currentTime
            //recuperation du current time and renvoi le tableau des lignes qui vont bien

        },
        getTimeStampDebut(lineIndex) {

            const line = this.timeStampLines.find(lin => lin.lineId === lineIndex)
            if (line) {
                return line.lineDeb
            }
        },
        getTimeStampFin(lineIndex) {
            const line = this.timeStampLines.find(lin => lin.lineId === lineIndex)
            if (line) {
                return line.lineFin
            }
        },
        changeRecording() {
            this.recording = !this.recording
            if (this.recording) {
                document.addEventListener('keydown', this.addTimeStamp);
            } else {
                document.removeEventListener('keydown', this.addTimeStamp);
            }
        },
        removeTimeStamp(event,time){
            event.preventDefault

            this.songCore.removeTimeStamp(time)

            this.$emit('updateTimeStamp')

        },
        addTimeStamp(event) {
            console.log(event.keyCode)
            if (event.keyCode === 32) {
                console.log('c passe')
                this.songCore.addTimeStamp(this.currentTime)
                this.$emit('updateTimeStamp')
                // this.timeStampLines = this.songCore.computeTimeStampLine()
                this.$forceUpdate()
            }
        },

    }
}
</script>
<style scoped>
.container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    /* Initial layout with two columns taking equal width */
    gap: 10px;
    max-width: 100%;
    /* Prevent content overflow */
}

.column {
    padding: 20px;
    background-color: #e0e0e0;
    border-radius: 5px;
}

.third-column {
    /* display: none; */
    /* Start with the third column hidden */
}

/* When the third column is visible, override its display property */
.container.third-column-visible .third-column {
    display: block;
}

.custom-input-style {
    flex-grow: 1;
    flex-shrink: 1;
    padding: 10px;
    margin: 0 5px;
    background-color: #3498db;
    color: white;
    font-size: 14px;
    border: none;
    border-radius: 5px;
}

.custom-container {
    display: flex;
    width: 100%;
    padding: 0px;
    background-color: #e0e0e0;
}


.custom-audio-style {
    flex-grow: 1;
    flex-shrink: 1;
    margin: 0 5px;
}

.timestamp-left,
.timestamp-right {
    font-size: 12px;
    color: #999;
}

.list-item {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 5px 0;
    border-bottom: 1px solid #ccc;
}

.text {
    font-size: 14px;
    color: #333;
    text-align: center;
    /* Align the text in the middle */
}


.timestamp-left {
    margin-right: auto;
    padding-left: 10px;
}

.timestamp-right {
    margin-left: auto;
}

.list {
      list-style-type: none;
      padding: 0;
      margin: 0;
    }

    .list-item2 {
      position: relative;
      padding: 10px;
      background-color: #e0e0e0;
      border-radius: 5px;
      margin-bottom: 5px;
      text-align: center;
    }

    .main-item {
      background-color: #3498db;
      color: white;
      font-weight: bold;
      z-index: 2; /* Bring to the front */
    }

    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.1);
      z-index: 1; /* Behind the main item */
      pointer-events: none; /* Allow interaction with main item */
      border-radius: 5px;
    }
    .active {
  background-color: grey; /* Customize the active state background color */
  /* You can add more styles for the active state here */
}
</style>