
var _id=1;

//const BACKEND_URL="https://xmeme-shlok-backend.glitch.me/memes/";
const BACKEND_URL="http://localhost:8081/memes/";


//reload_screen
function reloadScreen(val){
    document.getElementById("overlay2").style.visibility="hidden";
    document.getElementById("meme_list").scrollIntoView();
    location.reload();
    alert(val);
}

//onclick_submit_button
function submitBtn(){
    const btn=document.getElementById("submitbtn").innerHTML;
    document.getElementById("overlay2").style.visibility="visible";
    if(btn ==="Submit") loadDoc();
    else updateDoc();
}

//error_message
function errorMessage(val){
    document.getElementById("errorMessage").innerHTML=val;
    document.getElementById("errorMessage").style.display="block";
    document.getElementById("overlay2").style.visibility="hidden";
}

//for_post_request
function loadDoc() {
    let name = document.getElementById("author").value;
    let caption = document.getElementById("caption").value;
    let url = document.getElementById("imgurl").value;

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 201) {
            reloadScreen("Meme Added Successfully");
      }
      //Handling Different errors
      if(this.readyState == 4 && this.responseText!= undefined && this.status == 400){
          errorMessage(JSON.parse(this.response).errors[0].msg);
      }
      if(this.readyState == 4 && this.status==503){
          alert(JSON.parse(this.response).errors[0].msg);
      }
      if(this.readyState==4 && this.status==409){
        errorMessage(JSON.parse(this.response).errors[0].msg);
      }
    };
    xhttp.open("POST", BACKEND_URL , true);
    xhttp.setRequestHeader("Content-type", "application/json");
    let val = ' {"name" : "' + name + '" , "caption":"' + caption + '" , "url":"' + url + '"}';
    //console.log(val);
    xhttp.send(val);
}


//get_request
function loadStart(){
    var xhttp = new XMLHttpRequest();
    
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        //console.log(this.responseText);
        loadData(JSON.parse(this.responseText));
      }
      //Handling Different errors
      if(this.readyState == 4 && this.status==503){
        alert(JSON.parse(this.response).errors[0].msg);
      }
      
    };
    xhttp.open("GET", BACKEND_URL , true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send();
}

function loadData(data){
    //console.log(data);
    for(let i=0;i<data.length;i++){
        loadComponents(data[i]);
    }
    //document.getElementById("meme_list").scrollIntoView();
    document.getElementById("overlay").style.visibility="hidden";
}



/* Meme card are dynamically created here*/
function loadComponents(res){
    //console.log(res);
    let card = document.createElement("div");
    card.className="card";

    //edit button
    let edit = document.createElement("a");
    edit.innerHTML="Edit";
    edit.className="edit-button";
    edit.setAttribute("id",(res.id).toString());
    edit.setAttribute("href","#meme_form");
    edit.setAttribute("onclick","editForm(this.id)");
    card.appendChild(edit);

    

    //add image
    let imgwrap =document.createElement("div");
    imgwrap.className="imgwrapper";
    let image= document.createElement("img");
    image.setAttribute("src",res.url);
    image.setAttribute("onclick","showImage(this.src)");
    imgwrap.appendChild(image)
    card.appendChild(imgwrap);


    //card_body
    let caption = document.createElement("div");
    caption.className="card-body-list";
    caption.innerHTML='" '+res.caption+' "';
    card.appendChild(caption);

    //line
    card.appendChild(document.createElement("hr"));

    //card_title
    let name = document.createElement("div");
    name.className="card-title";
    //name.innerHTML=res.name;

    
    //badge_element 
    let badge = document.createElement("span");
    badge.className="badge rounded-pill bg-secondary";
    badge.innerHTML="Author :";
    name.appendChild(badge);

    //Author Name
    let badge1 = document.createElement("span");
    badge1.innerHTML=res.name;
    name.appendChild(badge1);

    card.appendChild(name);

    let container = document.querySelector("#container");
    container.appendChild(card);
    //document.getElementById("demo").innerHTML = this.responseText;
}
//end_get_request


//on_click_edit_button
function editForm(val){
    //console.log(val);
    document.getElementById("overlay2").style.visibility="visible";

    document.getElementById("errorMessage").style.display="none";


    let url = BACKEND_URL+val;
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", url, true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send();

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          updateData(JSON.parse(this.responseText));
        }
        if(this.readyState == 4 && this.status==503){
            alert(JSON.parse(this.response).errors[0].msg);
        }
    };
}

//show_data_in_meme_form
function updateData(val){
    const {id,name,url,caption}=val;
    //console.log(name);
    document.getElementById("caption").value=caption;
    document.getElementById("imgurl").value=url;
    document.getElementById("author").value=name;
    document.getElementById("author").disabled=true;

    document.getElementById("submitbtn").innerHTML="Update";
    _id=id;

    document.getElementById("overlay2").style.visibility="hidden";
}

//patch_request
function updateDoc(){
    let caption = document.getElementById("caption").value;
    let url = document.getElementById("imgurl").value;

    var xhttp = new XMLHttpRequest();
    
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
            reloadScreen("Meme Updated Successfully");
      }
      if(this.readyState == 4 && this.responseText!= undefined && this.status == 400){
        errorMessage(JSON.parse(this.response).errors[0].msg);
      }
      if(this.readyState == 4 && this.status==503){
        alert(JSON.parse(this.response).errors[0].msg);
      }
    };
    xhttp.open("PATCH", BACKEND_URL + _id, true);
    xhttp.setRequestHeader("Content-type", "application/json");
    let val = '{"caption":"' + caption + '" , "url":"' + url + '"}';
    //console.log(val);
    xhttp.send(val);
}

//image_click
function showImage(url){
    window.open(url);
}

