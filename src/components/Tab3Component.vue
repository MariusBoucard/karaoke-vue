<!-- Record chord component -->
<template>
    <div>
        <div>
            <div class="custom-container">
                <!-- {{ this.currentTime }} -->
                <audio class="" :src="audioSrc" ref="audioPlayer" controls @timeupdate="updateCurrentTime">
                    <source src="audioSrc" type="audio/mpeg">
                </audio>
                <!-- Button for recording lines -->
                <button class="button" :class="{ active: recording }" @click="recordChord()">Recording</button>
            </div>

            <div class="chordContainers">
                <div v-for="chord in diffChords" >
                    <div class="chordWrapp">
                        <chordDisplay v-if="chord.accord" :chord=chord.accord></chordDisplay>
                    </div>

                </div>
            </div>
            <div class="column-container">
                <div class="column2">
                    <ul>
                        <li v-for="line in linesNickel">
                            <div class="chords-container">
                                <div class="chord" @contextmenu.stop="event => handleContextMenu(event, chord)"
                                    v-for="chord in getChordLine(line)" :style="getChordStyle(chord)">{{ chord.chord }}
                                </div>
                            </div>
                            <div class="text">{{ line.text }}</div>
                        </li>
                    </ul>
                </div>
                <div class="column2">
                    <chordsComponent @removeAssociation="removeAsso($event)" @setAssociation="setAsso($event)" @newAssociation="passAsso($event)"
                        :association="association"></chordsComponent>
                        <div style="width: 100%; text-align: center;padding-top: 60px;">
                            <button class="button" @click="convertTablatureCore()">exporter la partition</button>

                        </div>

                </div>
            </div>

            <!-- Lecteur -->

            <!-- Liste des paroles -->

        </div>
        <div>



        </div>
    </div>
</template>

<script>
import { SongCore } from '@/utils/songCore';
import { getChansonStore } from '../store/chansonStore'
import chordsComponent from '../widget/chordsComponent.vue'
import chordDisplay from '@/widget/chordDisplay.vue';
import { convertTablature } from '../core/convert-tab'
export default {
    components: {
        chordsComponent,
        chordDisplay

    },
    data() {
        return {
            recording: false,
            songCore: new SongCore(),
            chansonStore: undefined,
            currentTime: 0,

        }
    },
    props: {
        association: { required: true, type: [Object] },
        audioSrc: { required: true },
        lines: { required: true, type: [Object] },
        lineTime: { required: true, type: [Object] },
        chordList: { required: true, type: [Object] }
    },
    mounted() {
        this.audioPlayer = this.$refs.audioPlayer; // Assign the audio player reference on mount
        this.chansonStore = getChansonStore()
    },
    computed: {
        diffChords() {
            const unik = this.chordList.reduce((result, chordObj) => {
                if (!result.some(item => item.chord === chordObj.chord)) {
                    result.push(chordObj.chord);
                }
                return result;
            }, []);
            console.log(this.association)
            let yolo = []
            this.association.forEach(asso => {
                if (unik.includes(asso.chord)) {
                    yolo.push(asso)
                }
            })

            return yolo
        },
        playingIndex() {
            return 'dada'
        },
        linesNickel() {
            // Create a map to store objects from the first array by their id
            const map = new Map();
            console.log(this.lines)
            this.lines.forEach(obj => {
                map.set(obj.index, obj);
            });

            // Merge objects from the second array with corresponding objects from the map
            const mergedArray = this.lineTime.map(obj2 => {
                const obj1 = map.get(obj2.lineId);
                if (obj1) {
                    // Merge attributes from obj1 and obj2
                    return { ...obj1, ...obj2 };
                }
                return obj2; // If there's no corresponding obj1, just keep obj2
            });
            //Add the missing chord lines
            this.lines.forEach(obj1 => {
                if (!mergedArray.find(ob => ob.index === obj1.index)) {
                    mergedArray.push(obj1);
                }
            });


            return mergedArray;

        }
    },
    methods: {
        convertTablatureCore(){
            console.log(this.linesNickel)
            //Recuperer le timestamp de debut de fin de chacunes des lignes en plus, puis rajouter dedans leurs accords, avec leur temps
            //rajout titre et auteur chanson
            let linebien = this.linesNickel
            convertTablature({
                title : this.chansonStore.getTitle(),
                lineNickel : this.linesNickel,
                lineTime : this.lineTime,
                chordList :this.chordList
            },"fafa")
        },
        removeAsso(evt){
            this.$emit('removeAssociation',evt)
        },
        getChordStyle(chord) {
            const positionPercentage = ((chord.time - chord.debDiv) / (chord.finDiv - chord.debDiv)) * 100;
            const marginLeft = positionPercentage + '%';
            return {
                marginLeft: marginLeft
            }
        },
        //Fonction pour remove un accord
        handleContextMenu(event, chord) {
            this.$emit('removeChord', chord)
        },
        recordChord() {
            if (this.recording) {
                this.recording = false
                document.removeEventListener('keydown', this.addNewChord);
            }
            else {
                this.recording = true
                document.addEventListener('keydown', this.addNewChord);
            }
        },
        updateCurrentTime() {
            this.currentTime = this.$refs.audioPlayer.currentTime
            //recuperation du current time and renvoi le tableau des lignes qui vont bien
        },
        addNewChord(keyStroke) {
            //Itere sur les keystrokes qu'on a
            console.log(keyStroke)
            console.log(this.association)
            const asso = this.association.find(asso => asso.touche === keyStroke.keyCode)
            if (asso) {
                console.log(asso)
                this.songCore.addChord({ chord: asso.chord, time: this.currentTime })
                this.$emit('updateChord')
                //  this.chordList = this.songCore.getChordList()
                //this.lineTime = this.songCore.computeTimeStampLine()
            }

        },
        passAsso(evt) {
            this.$emit('newAssociation', evt)
        },
        setAsso(evt) {
            this.$emit('setAssociation', evt)
        },
        getChordLine(line) {
            // this.lineTime = this.songCore.computeTimeStampLine()
            console.log('caca', this.lineTime)
            const timeLine = this.lineTime.find(li => line.index === li.lineId)
            console.log(timeLine)
            if (timeLine) {
                const filteredChords = this.chordList.filter(chord => chord.time > timeLine.lineDeb && chord.time < timeLine.lineFin);
                filteredChords.forEach(cho => {
                    cho.debDiv = timeLine.lineDeb;
                    cho.finDiv = timeLine.lineFin;

                })
                return filteredChords
            }

        }
    }
}
</script>
<style scoped>
.chordContainers {
    display: flex; /* Use flexbox to align horizontally */
    height: 300px;
    width: 100%;
    background-color: #333;
}
.chordWrapp {
    width:300px;
    height:200px
}

.column-container {
    display: flex;
    padding: 0px;
    width: 100%;
}
.chordContainer {
  display: flex; /* Use flexbox to align horizontally */
  flex-wrap: nowrap; /* Prevent wrapping of elements to new lines */
  gap: 10px; /* Add spacing between chordDisplay components */
}

/* Style the chordDisplay component */
.chordDisplay {
  width: 200px;
  height: 200px;
  /* Add more styles as needed */
}

.column2 {
    flex-grow: 1;
    background-color: #e0e0e0;
    /* Grey background color */
    margin: 0 10px;
    /* Add some spacing between columns */
    width: 50%;
}

.custom-container {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0px;
}

.button {
    padding: 10px 20px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

audio {
    flex-grow: 1;
    /* Allow the audio element to take remaining space */
}

ul {
    list-style: none;
    padding: 0;
}

li {
    display: flex;
    flex-direction: column;
    /* Arrange chord and text in a column */
    align-items: flex-start;
    /* Align items to the start of the list item */
    margin-bottom: 10px;
    margin-left: 10px
        /* Add spacing between list items */
}

.chords-container {
    display: flex;
    /* Display chord elements side by side */
}

.chord {
    font-size: 14px;
    color: #333;
    padding-right: 10px;
    /* Add spacing between chords and text */
}

.text {
    font-size: 14px;
    color: #666;
    align-self: flex-start
        /* Align text to the bottom of the list item */
}

.chord-container {
    display: flex;
    align-items: center;
    background-color: #ccc;
    padding: 5px;
    border-radius: 5px;
    margin-right: 10px;
}

.chord {
    font-size: 14px;
    margin: 0 5px;
}

.active {
    background-color: grey;
    /* Customize the active state background color */
    /* You can add more styles for the active state here */
}

.text {
    font-size: 16px;
    color: #333;
}</style>