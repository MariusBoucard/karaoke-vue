export class ChansonStore{
    constructor(){
        this.title = '',
        this.audio = '',
        this.lyrics = '',
        this.chordList = [],
        this.lyricsLineSplit = []
        this.timeStampLignes = []
    }
    setTitle(title){
        this.title = title
    }
    setAudio(audio){
        this.audio = audio
    }
    setLyrics(lyrics){
        this.lyrics = lyrics
    }
    setLyricsLineSplit(lls){
        this.lyricsLineSplit = lls
    }
    getLines(){
        return this.lyricsLineSplit
    }
    addChord(chord){
        this.chordList.push(chord)
    }
    removeAllChords(){
        this.chordList = []
    }
    addTimeStamp(timeStamp){
        this.timeStampLignes.push()
    }

}


let instance = undefined
export function getChansonStore(){
    console.log("get",instance)
    if(instance !== undefined){
        return instance
    }
    else {
        console.log("on crée")
        return instance = new ChansonStore()
    }
}