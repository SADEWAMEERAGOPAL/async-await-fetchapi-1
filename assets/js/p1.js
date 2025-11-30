let cl=console.log;

const blogForm=document.getElementById("blogForm");
const titlecontrol=document.getElementById("title");
const contentcontrol=document.getElementById("content");
const useridcontrol=document.getElementById("userid");
const subbtn=document.getElementById("subbtn");
const upbtn=document.getElementById("upbtn");
const postContainer=document.getElementById("postContainer");
const load=document.getElementById("loader");


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


async function makeapicall(apiurl, methodName, msgbody){
 loader(true)
    try{
       msgbody= msgbody? JSON.stringify(msgbody): null

       let res= await fetch(apiurl, {
        method: methodName,
        body: msgbody,
        headers: {
            Auth: "take from LS",
             'content-type': "application/json"
        }
    })
    
    let data=  await res.json()

    if(!res.ok){
        let err= data.error||res.statusText || "something went wrong";
        throw new Error(err)
    }
    return data
    
}finally{
   loader(false)
}

    
  
}

async function fetchAllblogs(){
    try{
   let data= await makeapicall(POST_URL, "GET", null)
   cl(data)
      let blogarr= blogObjToArr(data)
         createCards(blogarr)
    }
    catch(err){
       snackbar(err, "error")
    }
}

 fetchAllblogs()

 async function Onblogsubmit(eve){
    eve.preventDefault()
    //cl("click")

    let getblogObj={
        title: titlecontrol.value,
        body: contentcontrol.value.trim(),
        userId: useridcontrol.value
    }

    cl(getblogObj)

    

    try{
        let data= await makeapicall(POST_URL, "POST", getblogObj);
         getblogObj.id=data.name;
         let card=document.createElement('div');
         card.className=`card mt-3`;
         card.id=getblogObj.id;
         card.innerHTML=`<div class="card-header">
                <h3 class="mb-0">${getblogObj.title}</h3>
                </div>
                <div class="card-body">
                <p>${getblogObj.body}</p>
                </div>
                <div class="card-footer d-flex justify-content-between">
                    <button type="button" class="btn btn-outline-primary" onclick="Onedit(this)">edit</button>
                    <button type="button" class="btn btn-outline-danger " onclick="onremove(this)">delete</button>
                </div>`

           postContainer.append(card) 
           snackbar("new blog created successfully", 'success') 
           blogForm.reset()   
    } catch (err) {                 // ✅ sahi syntax
        snackbar(err, 'error');
    }
   
   

 }


 async function Onedit(ele){
    let eid=ele.closest(".card").id;
    cl(eid)
    localStorage.setItem("edit_id", eid);

    let edit_url=`${BASE_URL}/blogs/${eid}.json`

    try{
        let data= await makeapicall(edit_url, "GET", null)
        cl(data)

        titlecontrol.value= data.title;
        contentcontrol.value=data.body;
        useridcontrol.value=data.userId

        subbtn.classList.add('d-none')
        upbtn.classList.remove('d-none')

    }catch(err){
        snackbar(err, "error")
    }
 }

 async function OnBlogUpdate(){
    let up_id=localStorage.getItem("edit_id")
   localStorage.removeItem("edit_id")

   let getuplog={
     title: titlecontrol.value,
        body: contentcontrol.value.trim(),
        userId: useridcontrol.value,
        id: up_id
   }

   let up_url=`${BASE_URL}/blogs/${up_id}.json`

   try{
     let data=await makeapicall(up_url, "PATCH", getuplog)
     let card=document.getElementById(up_id);
     card.querySelector(".card-header h3").innerText=getuplog.title;
     card.querySelector(".card-body p").innerText=getuplog.body;

        subbtn.classList.remove('d-none')
        upbtn.classList.add('d-none')
        blogForm.reset()

        snackbar('blog updated successfully!!!', 'success')

    }catch(err){
        snackbar(err, "error")
    }
   }


   async function onremove(ele){
    let rid=ele.closest(".card").id;

    let remove_url=`${BASE_URL}/blogs/${rid}.json`
     
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
        let data=await makeapicall(remove_url, "DELETE", null)
        document.getElementById(rid).remove()
        snackbar("blog deleted successfully", 'success')
    }
}catch(err){
        snackbar(err, 'error')
    }
   }

 

blogForm.addEventListener("submit", Onblogsubmit)
 upbtn.addEventListener("click", OnBlogUpdate)

 