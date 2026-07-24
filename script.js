// ==========================================
// CONFIGURACIÓN
// ==========================================

const SCRIPT_URL = 
"https://script.google.com/macros/s/AKfycbyiUmFnuxfErdk0YDXEjm5nJrIRGG1AtrkV-h143gwrp6npuJTic36L4G1Sg0hZuHEC/exec";


const TOKEN = "FelixSandra2026";


// Límites

const MAX_FILES = 3;

const MAX_IMAGE_SIZE = 15 * 1024 * 1024; //15 MB

const MAX_VIDEO_SIZE = 50 * 1024 * 1024; //50 MB



// ==========================================
// ELEMENTOS
// ==========================================

const fileInput = document.getElementById("fileInput");

const dropArea = document.getElementById("dropArea");

const fileList = document.getElementById("fileList");

const uploadButton = document.getElementById("uploadButton");

const status = document.getElementById("status");

const progressBar = document.getElementById("progressBar");



let selectedFiles = [];




// ==========================================
// ABRIR SELECTOR
// ==========================================

dropArea.addEventListener("click",()=>{

    fileInput.click();

});



fileInput.addEventListener(
    "change",
    ()=>{

        addFiles(fileInput.files);

    }
);





// ==========================================
// DRAG & DROP
// ==========================================


dropArea.addEventListener(
"dragover",
(e)=>{

    e.preventDefault();

    dropArea.classList.add("active");

});


dropArea.addEventListener(
"dragleave",
()=>{

    dropArea.classList.remove("active");

});



dropArea.addEventListener(
"drop",
(e)=>{

    e.preventDefault();

    dropArea.classList.remove("active");

    addFiles(e.dataTransfer.files);

});






// ==========================================
// AGREGAR ARCHIVOS
// ==========================================


function addFiles(files){


    const incoming = Array.from(files);


    if(selectedFiles.length + incoming.length > MAX_FILES){

        showError(
            "Solo puedes subir máximo 3 archivos por envío."
        );

        return;

    }



    for(const file of incoming){


        if(!validateFile(file)){

            continue;

        }


        selectedFiles.push(file);


    }



    renderFiles();


}





// ==========================================
// VALIDAR
// ==========================================


function validateFile(file){


    if(file.type.startsWith("image")){


        if(file.size > MAX_IMAGE_SIZE){

            showError(
            `${file.name} supera los 15 MB`
            );

            return false;

        }


    }



    else if(file.type.startsWith("video")){


        if(file.size > MAX_VIDEO_SIZE){

            showError(
            `${file.name} supera los 50 MB`
            );

            return false;

        }


    }


    else{


        showError(
        "Tipo de archivo no permitido."
        );


        return false;

    }



    return true;


}






// ==========================================
// MOSTRAR ARCHIVOS
// ==========================================


function renderFiles(){


    fileList.innerHTML="";


    selectedFiles.forEach((file,index)=>{


        const div=document.createElement("div");


        div.className="file-item";


        div.innerHTML=`

        ${file.type.startsWith("image")?"📷":"🎥"}

        ${file.name}

        `;


        fileList.appendChild(div);


    });



    uploadButton.disabled =
        selectedFiles.length===0;


}






// ==========================================
// SUBIR
// ==========================================


uploadButton.addEventListener(
"click",
uploadFiles
);




async function uploadFiles(){


    uploadButton.disabled=true;


    status.innerHTML="";


    progressBar.style.width="0%";



    let completed=0;



    try{


        for(let file of selectedFiles){



            status.innerHTML=
            `Preparando ${file.name}...`;



            let base64;



            if(file.type.startsWith("image")){


                base64 =
                await compressImage(file);


            }
            else{


                base64 =
                await convertBase64(file);


            }




            const payload={


                token:TOKEN,


                fileName:
                Date.now()+"_"+file.name,


                mimeType:
                file.type,


                base64:
                base64.split(",")[1]

            };




            status.innerHTML=
            `Subiendo ${file.name}...`;




            const response =
            await fetch(
                SCRIPT_URL,
                {

                    method:"POST",

                    headers:{
                        "Content-Type":
                        "text/plain"
                    },

                    body:
                    JSON.stringify(payload)

                }
            );



            const result =
            await response.json();



            if(result.status!=="success"){

                throw new Error(
                    result.message
                );

            }



            completed++;



            progressBar.style.width =
            ((completed/selectedFiles.length)*100)
            +"%";



        }



        showSuccess(
        "🎉 ¡Tus recuerdos fueron guardados!"
        );



        selectedFiles=[];

        fileInput.value="";

        renderFiles();



    }

    catch(error){


        showError(
        error.message
        );


    }



    uploadButton.disabled=false;


}







// ==========================================
// COMPRIMIR IMAGEN
// ==========================================


function compressImage(file){


return new Promise((resolve)=>{


const reader=new FileReader();



reader.onload=e=>{


const img=new Image();



img.onload=()=>{


const canvas=document.createElement("canvas");


let width=img.width;

let height=img.height;



const maxWidth=1920;



if(width>maxWidth){


height =
height*(maxWidth/width);


width=maxWidth;


}



canvas.width=width;

canvas.height=height;



const ctx=
canvas.getContext("2d");


ctx.drawImage(
img,
0,
0,
width,
height
);



resolve(
canvas.toDataURL(
"image/jpeg",
0.8
)
);



};


img.src=e.target.result;


};



reader.readAsDataURL(file);



});


}






// ==========================================
// BASE64 NORMAL
// ==========================================


function convertBase64(file){


return new Promise((resolve,reject)=>{


const reader=new FileReader();


reader.onload=()=>resolve(
reader.result
);


reader.onerror=reject;


reader.readAsDataURL(file);


});


}





// ==========================================
// MENSAJES
// ==========================================


function showSuccess(message){

status.className="success";

status.innerHTML=message;

}



function showError(message){

status.className="error";

status.innerHTML=message;

}
