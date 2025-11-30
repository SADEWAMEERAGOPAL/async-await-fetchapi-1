let cl=console.log;

const blogForm=document.getElementById("blogForm");
const titlec=document.getElementById("title");
const contentc=document.getElementById("content");
const useridc=document.getElementById("userid");
const load=document.getElementById("loader");
const postContainer=document.getElementById("postContainer");
const subbtn=document.getElementById("subbtn");
const upbtn=document.getElementById("upbtn");



let BASE_URL=`https://blogs-task-default-rtdb.firebaseio.com`

let POST_URL=`${BASE_URL}/blogs.json`



function blogObjToArr(obj) {

    let arr = [];
    for (const key in obj) {
        obj[key].id = key
        arr.push(obj[key])
    }
    return arr
}

function snackbar(title, icon){
    Swal.fire({
        title,
        icon,
        timer: 2500
    })
}



function loader(flag) {
    if (flag) {
        load.classList.remove("d-none");
    } else {
        load.classList.add("d-none");
    }
}

//_________________________templating________________//
function createCards(arr){
    let result=arr.map(post=>{
        return `<div class="card mt-3" id="${post.id}">
                <div class="card-header">
                <h3 class="mb-0">${post.title}</h3>
                </div>
                <div class="card-body">
                <p>${post.body}</p>
                </div>
                <div class="card-footer d-flex justify-content-between">
                    <button type="button" class="btn btn-outline-primary" onclick="Onedit(this)">edit</button>
                    <button type="button" class="btn btn-outline-danger " onclick="onremove(this)">delete</button>
                </div>
            </div>
      `
    }).join('')
  postContainer.innerHTML=result;  
}




async function Makeapicall(apiurl, methodName, msgBody){
    loader(true)
    try{
     msgBody=msgBody? JSON.stringify(msgBody):null;
     let res= await fetch(apiurl, {
        method: methodName,
        body: msgBody,
        headers: {
            Auth: "take from LS",
            "Content-type": "application/json",
        }
     })

     let data= await res.json()

     if(!res.ok){
        let err= data.error||res.statusText|| "something went wrong";
        throw new Error(err);
     }

     return data
    }finally{
       loader(false)
    }    
}


//______________fetchAllBlogs____________________//
async function fetchallBlogs(){
    try{
        let data= await Makeapicall(POST_URL, "GET", null)
        let blogArr= blogObjToArr(data)
        createCards(blogArr)
    }catch(err){
        cl(err)
    }
}
 fetchallBlogs()



 //_________delete__________//
 const onremove = async(ele)=>{
    try{
 let result= await Swal.fire({
  title: "Are you sure?",
  text: "You  to  be delete  this blog",
  showCancelButton: true,
  confirmButtonColor: "#3085d6",
  cancelButtonColor: "#d33",
  confirmButtonText: "delete"
})
  if (result.isConfirmed) {
    let rid= ele.closest('.card').id;
    let r_url= `${BASE_URL}/blogs/${rid}.json`

    let res=await Makeapicall(r_url, "DELETE", null)
    document.getElementById(rid).remove();
    snackbar("blog deleted successfully!!!", 'success')
    }
   }catch(err){
        snackbar(err, 'error')
    }
}
 

 //_________edit__________//
const Onedit=async(ele)=>{
    let eid= ele.closest('.card').id;
    localStorage.setItem("edit_id", eid)

    let edit_url=`${BASE_URL}/blogs/${eid}.json`

    try{
        let res=await Makeapicall(edit_url, "GET", null)
        titlec.value=res.title;
        contentc.value=res.body;
        useridc.value=res.userid;

    subbtn.classList.add("d-none");
    upbtn.classList.remove("d-none")
    }catch(err){
        snackbar(err, 'error')
    }
}
 
 //_________update__________//
const  Onupdateblog=async()=>{
    let uid=localStorage.getItem("edit_id");

    let up_obj={
        title: titlec.value,
        body: contentc.value,
        userid: useridc.value
    }

    let up_url=`${BASE_URL}/blogs/${uid}.json`;

    try{
        let res=await Makeapicall(up_url, "PATCH", up_obj)
        let card=document.getElementById(uid);
        card.querySelector(".card-header h3").innerText=up_obj.title;
        card.querySelector(".card-body p").innerText=up_obj.body;

        subbtn.classList.remove('d-none')
        upbtn.classList.add('d-none')
        blogForm.reset()

        snackbar('blog updated successfully!!!', 'success')
    }catch(err){
        snackbar(err, 'error')
    }


}
 //________________submitblog__________________//
async function onsubmitBlog(eve){
    eve.preventDefault()

    let getblog={
        title: titlec.value,
        body: contentc.value,
        userid: useridc.value
    }
    cl(getblog)


    try{
   let data= await Makeapicall(POST_URL, "POST", getblog)
   getblog.id=data.name;
   let card=document.createElement('div')
   card.className=`card mt-3`;
   card.id= getblog.id;
   card.innerHTML=`<div class="card-header">
                <h3 class="mb-0">${getblog.title}</h3>
                </div>
                <div class="card-body">
                <p>${getblog.body}</p>
                </div>
                <div class="card-footer d-flex justify-content-between">
                    <button type="button" class="btn btn-outline-primary" onclick="Onedit(this)">edit</button>
                    <button type="button" class="btn btn-outline-danger " onclick="onremove(this)">delete</button>
                </div>`

     postContainer.append(card);
     blogForm.reset();
     snackbar("new blog created successfully", 'success')

    }catch(err){
        snackbar(err, 'error')
    }
}


blogForm.addEventListener("submit", onsubmitBlog)
upbtn.addEventListener("click", Onupdateblog)
