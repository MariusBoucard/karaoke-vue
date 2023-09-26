/**
 * Gueule du tabObject : {
 * title : '',
 * lines : '',
 * chords : '',
 * associations : ''
 * }
 * @param {*} tabObject 
 * @param {*} path 
 */
export function convertTablature(tabObject,path){
    // Step 1: Create the content for the file
    

    const tabData = tabObject.lineNickel.map( line => {
        return {
           chords : getChordLine(line,tabObject.lineTime,tabObject.chordList),
           text : line.text
        }
    }
    )
    /**
     * Mise en page de tabData Stage :
     * On a : un array avec chacunes des lignes et accords avec
     * chaque objet de l array : { text : 'mange tes morts', chords : [ {chord : "Am", time : 3.11, debDiv : 1,10 , finDiv :9.19 }]}
     */
    let stringgg = ""


    const teubData = tabData.map( line => {return createLine(line)}) 
    stringgg += tabObject.title+"\n\n"
    teubData.forEach(line => stringgg += line+"\n")
    
    // Step 2: Create a Blob
    const blob = new Blob([stringgg], { type: "text/plain" });

    // Step 3: Create an object URL
    const objectURL = URL.createObjectURL(blob);
    // Step 4: Create an anchor element
    const a = document.createElement("a");
    a.href = objectURL;
    a.download = tabObject.title+" Tablature"+".txt"; // Set the desired filename

    // Step 5: Click the anchor element
    a.click();

    // Clean up the object URL after the download
    URL.revokeObjectURL(objectURL);
}
function createLine(line){
    let lenLine = 50
    if(line.text !== undefined){
        lenLine = line.text.length
        lenLine+=(lenLine/2)
    } else {
        line.text = ""
    }
    if(lenLine < 15){
        lenLine = 50
    }
    if(line.chords === undefined){
        line.chords = []
    }
    let chordLine = ""
    if(line.chords.length > 0 ){
        let duree = line.chords[0].finDiv - line.chords[0].debDiv
        // fais les espace bien pour chaques accords
        line.chords.sort((a,b) => a.time - b.time)
        console.log("chords sorted",line)
        line.chords.forEach(chord => {
            // calcul de la position en fonction de comment la ligne est rempli
            let posi = Math.floor(((chord.time-chord.debDiv) / duree)* lenLine)
            console.log(posi)
            let po = posi - chordLine.length
            if(po<0){
                chordLine+=' '+chord.chord
            } else {
                const spaces = " ".repeat(posi - chordLine.length)
                chordLine+=spaces+chord.chord

            }
        })
        console.log(chordLine)
        
    }
    return chordLine +"\n"+line.text

}

function getChordLine(line,lineTime,chordList) {
    // this.lineTime = this.songCore.computeTimeStampLine()
    console.log('caca', lineTime)
    const timeLine = lineTime.find(li => line.index === li.lineId)
    console.log(timeLine)
    if (timeLine) {
        const filteredChords = chordList.filter(chord => chord.time > timeLine.lineDeb && chord.time < timeLine.lineFin);
        filteredChords.forEach(cho => {
            cho.debDiv = timeLine.lineDeb;
            cho.finDiv = timeLine.lineFin;

        })
        return filteredChords
    }

}