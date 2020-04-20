//offline data - auto sync data between indexeddb and firestore
db.enablePersistence().catch((err) => {
  if (err.code == "failed-precondition") {
    //probably multple tabs open at once
    console.log("persistence failed");
  } else if (err.code == "unimplemented") {
    // lack of browser support
    console.log("persistence is not available");
  }
});

// real-time listner
// onSnapshot: whenever there is a change in the db, snapshot will be sent to the app
db.collection("recipes").onSnapshot((snapshot) => {
  // console.log(snapshot.docChanges());
  snapshot.docChanges().forEach((change) => {
    // console.log(change, change.doc.data(), change.doc.id);
    if (change.type === "added") {
      // add the doc data to the web page
      renderRecipe(change.doc.data(), change.doc.id);
    }
    if (change.type === "removed") {
      // remove the doc data from the web page
      removeRecipe(change.doc.id);
    }
  });
});


const form = document.querySelector('form');

form.addEventListener('submit', evt =>{
  evt.preventDefault();

  const recipe = {
    title: form.title.value,
    ingredients: form.ingredients.value
  };

  db.collection('recipes').add(recipe).catch(err=>{
    console.log(err);
    
  });

  form.title.value = '';
  form.ingredients.value = '';

})

// delete a recipe
const recipeContainer = document.querySelector('.recipes');
recipeContainer.addEventListener('click', evt =>{
  // console.log(evt);
  if (evt.target.tagName === 'I'){
    const id = evt.target.getAttribute('data-id');
    db.collection('recipes').doc(id).delete();
  }
  
});

