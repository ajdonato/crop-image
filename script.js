const photoFile = document.getElementById('photo-file')
let photoPreview = document.getElementById('photo-preview')
let image;
let photoName;
let vh = window.innerHeight * 0.01;

document.documentElement.style.setProperty('new-vh', `${vh}px`);

// Select & Preview image
document.getElementById('select-image')
.onclick = function() {
    photoFile.click()
}

window.addEventListener('DOMContentLoaded', () => {
    photoFile.addEventListener('change', () => {
        let file = photoFile.files.item(0)
        photoName = file.name;

        // ler um arquivo
        let reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = function(event) {
            image = new Image();
            image.src = event.target.result
            image.onload = onLoadImage
        }
    })
})

//Selection tool
const selection = document.getElementById('selection-tool')
let startX, startY, relativeStartX, relativeStartY, endX, endY, relativeEndX, relativeEndY;
let startSelection = false;
const events = {
    mouseover(){
        //mudar cursor de ponteiro para crosshair
        this.style.cursor = 'crosshair'
    },
    mousedown(){
        const {clientX, clientY, offsetX, offsetY} = event

        //console.table({
        //    'client': [clientX, clientY],
        //    "offset": [offsetX, offsetY]
        //})

        startX = clientX
        startY = clientY
        relativeStartX = offsetX
        relativeStartY = offsetY

        startSelection = true
    },
    mousemove(){
        endX = event.clientX
        endY = event.clientY

        if(startSelection) {
            selection.style.display = 'initial';
            selection.style.top = startY + 'px';
            selection.style.left = startX + 'px';

            selection.style.width = (endX - startX) + 'px';
            selection.style.height = (endY - startY) + 'px';
        }
    },
    mouseup(){
        startSelection = false

        relativeEndX = event.layerX;
        relativeEndY = event.layerY;

        //Mostrar o botão de corte
        cropButton.style.display = 'initial'
    }
}

Object.keys(events)
.forEach(eventName => {
    //    addEventListener('mouseover', events)
    photoPreview.addEventListener(eventName, events[eventName])
})

// Canvas
let canvas = document.createElement('canvas')
let ctx = canvas.getContext('2d')

function onLoadImage() {
    const {width, height} = image
    canvas.width = width;
    canvas.height = height;

    // Limpar o contexto
    ctx.clearRect(0, 0, width, height)

    // desenhar a imagem no contexto
    ctx.drawImage(image, 0, 0)

    photoPreview.src = canvas.toDataURL()
}

//Cortar imagem
const cropButton = document.getElementById('crop-image')
cropButton.onclick = () => {
    const {width: imgW, height: imgH} = image
    const {width: previewW, height: previewH} = photoPreview

    const [ widthFactor, heightFactor ] = [
        +(imgW / previewW),
        +(imgH / previewH)
    ]

    const [ SelectionWidth, selectionHeight ] = [
        +selection.style.width.replace('px', ''),
        +selection.style.height.replace('px', '')
    ]

    const [ croppedWidth, croppedHeight ] = [
        +(SelectionWidth * widthFactor),
        +(selectionHeight * heightFactor)
    ]

    const [ actualX, actualY ] = [
        +(relativeStartX * widthFactor),
        +(relativeStartY * heightFactor)
    ]

    // pegar do ctx a img cortada
    const croppedImage = ctx.getImageData(actualX, actualY, croppedWidth, croppedHeight)

    // limpar o ctx
    ctx.clearRect(0, 0,ctx.width,ctx.height)

    // ajuste de proporções
    
    image.width = canvas.width = croppedWidth;
    image.height = canvas.height = croppedHeight;

    // adicionar a imagem cortada ao ctx
    ctx.putImageData(croppedImage, 0, 0)

    // esconder a ferramenta de seleção

    selection.style.display = 'none'

    // atulizar o preview da img
    photoPreview.src = canvas.toDataURL()

    // mostrar botão de download
    downloadButton.style.display = 'initial'

}

// download
const downloadButton = document.getElementById('download')
downloadButton.onclick = function() {
    const a = document.createElement('a')
    a.download = photoName + '-croped.png';
    a.href = canvas.toDataURL();
    a.click()
}