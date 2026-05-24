
const upload =
document.getElementById("upload");

const originalCanvas =
document.getElementById("originalCanvas");

const processedCanvas =
document.getElementById("processedCanvas");

const placeholder =
document.getElementById("placeholder");

const messageBox =
document.getElementById("messageBox");

const oCtx =
originalCanvas.getContext("2d");

const pCtx =
processedCanvas.getContext("2d");

let selectedTechniques = [];

let imageLoaded = false;


/* MESSAGE */

function showMessage(text,type){

    messageBox.innerHTML = text;

    messageBox.className =
    "message " + type;

    messageBox.style.display = "block";

    setTimeout(() => {

        messageBox.style.display = "none";

    },3000);
}


/* SELECT TECHNIQUES */

function toggleTechnique(element){

    const tech =
    element.getAttribute("data-tech");

    element.classList.toggle("active");

    if(selectedTechniques.includes(tech)){

        selectedTechniques =
        selectedTechniques.filter(
            item => item !== tech
        );
    }

    else{

        selectedTechniques.push(tech);
    }
}


/* IMAGE FIT */

function drawImageFit(ctx,img,canvas){

    const canvasRatio =
    canvas.width / canvas.height;

    const imgRatio =
    img.width / img.height;

    let drawWidth;
    let drawHeight;
    let x;
    let y;

    if(imgRatio > canvasRatio){

        drawWidth = canvas.width;

        drawHeight =
        canvas.width / imgRatio;

        x = 0;

        y =
        (canvas.height - drawHeight) / 2;
    }

    else{

        drawHeight = canvas.height;

        drawWidth =
        canvas.height * imgRatio;

        x =
        (canvas.width - drawWidth) / 2;

        y = 0;
    }

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.drawImage(
        img,
        x,
        y,
        drawWidth,
        drawHeight
    );
}


/* UPLOAD IMAGE */

upload.addEventListener("change",function(e){

    const file = e.target.files[0];

    if(!file) return;

    const img = new Image();

    img.onload = function(){

        originalCanvas.width = 600;
        originalCanvas.height = 420;

        processedCanvas.width = 600;
        processedCanvas.height = 420;

        drawImageFit(
            oCtx,
            img,
            originalCanvas
        );

        processedCanvas.style.display = "none";

        placeholder.style.display = "flex";

        imageLoaded = true;

        showMessage(
            "Image uploaded successfully",
            "success"
        );
    }

    img.src =
    URL.createObjectURL(file);
});


/* ENCRYPT */

function encryptImage(){

    if(!imageLoaded){

        showMessage(
            "Upload an image first",
            "error"
        );

        return;
    }

    if(selectedTechniques.length === 0){

        showMessage(
            "Select encryption technique",
            "error"
        );

        return;
    }

    let key =
    parseInt(
        document.getElementById("key").value
    );

    if(isNaN(key)){

        showMessage(
            "Enter encryption key",
            "error"
        );

        return;
    }

    let imageData =
    oCtx.getImageData(
        0,
        0,
        originalCanvas.width,
        originalCanvas.height
    );

    let data = imageData.data;

    for(let i=0; i<data.length; i+=4){

        selectedTechniques.forEach(tech => {

            if(tech === "rgb"){

                data[i] =
                (data[i] + key) % 256;

                data[i+1] =
                (data[i+1] + key) % 256;

                data[i+2] =
                (data[i+2] + key) % 256;
            }

            else if(tech === "swap"){

                let temp = data[i];

                data[i] = data[i+2];

                data[i+2] = temp;
            }

            else if(tech === "xor"){

                data[i] ^= key;

                data[i+1] ^= key;

                data[i+2] ^= key;
            }

            else if(tech === "invert"){

                data[i] =
                255 - data[i];

                data[i+1] =
                255 - data[i+1];

                data[i+2] =
                255 - data[i+2];
            }

        });

    }

    pCtx.putImageData(imageData,0,0);

    placeholder.style.display = "none";

    processedCanvas.style.display = "block";

    showMessage(
        "Image encrypted successfully",
        "success"
    );
}


/* DECRYPT */

function decryptImage(){

    if(processedCanvas.style.display === "none"){

        showMessage(
            "No encrypted image found",
            "error"
        );

        return;
    }

    let key =
    parseInt(
        document.getElementById("key").value
    );

    let imageData =
    pCtx.getImageData(
        0,
        0,
        processedCanvas.width,
        processedCanvas.height
    );

    let data = imageData.data;

    for(let i=0; i<data.length; i+=4){

        [...selectedTechniques]
        .reverse()
        .forEach(tech => {

            if(tech === "rgb"){

                data[i] =
                (data[i] - key + 256) % 256;

                data[i+1] =
                (data[i+1] - key + 256) % 256;

                data[i+2] =
                (data[i+2] - key + 256) % 256;
            }

            else if(tech === "swap"){

                let temp = data[i];

                data[i] = data[i+2];

                data[i+2] = temp;
            }

            else if(tech === "xor"){

                data[i] ^= key;

                data[i+1] ^= key;

                data[i+2] ^= key;
            }

            else if(tech === "invert"){

                data[i] =
                255 - data[i];

                data[i+1] =
                255 - data[i+1];

                data[i+2] =
                255 - data[i+2];
            }

        });

    }

    pCtx.putImageData(imageData,0,0);

    showMessage(
        "Image decrypted successfully",
        "success"
    );
}


/* DOWNLOAD */

function downloadImage(){

    if(processedCanvas.style.display === "none"){

        showMessage(
            "No processed image found",
            "error"
        );

        return;
    }

    const link =
    document.createElement("a");

    link.download =
    "processed_image.png";

    link.href =
    processedCanvas.toDataURL();

    link.click();

    showMessage(
        "Image downloaded successfully",
        "success"
    );
}