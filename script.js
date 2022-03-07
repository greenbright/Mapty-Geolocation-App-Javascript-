'use strict';


const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
// making it a global variable makes u access all the properties of the element
//let map, mapEvent -------------------not  need again;

class workOut{
    date = new Date();
    id = (Date.now() + '').slice(-10);
    clicks = 0;

  constructor(coords, distance,duration ){

    this.coords = coords;
    this.distance = distance;
    this.duration = duration;

  }
  _setDescription(){

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 
'June', 'July', 'August', 'September', 'October', 'November', 'December'];
 
 // this is the line of code i dont understand
this.description = `${this.type[0].toUpperCase()} ${this.type.slice(1)} on 
${months[this.date.getMonth()]}  ${this.date.getDate()}`;
  }
  click(){
    this.clicks++;
  }
}

class Running extends workOut{
    type = "running"
constructor(coords, distance,duration,cadence){
    super(coords,distance, duration);
    this.cadence = cadence;
    this. calcPace();
    this._setDescription();
}

calcPace(){
    this.pace = this.duration/this.distance;
    return this.pace
}

}



class Cycling extends workOut{
    type = "cycling"
constructor(coords, distance,duration,elevationGain){
    super(coords,distance, duration);
    this.elevationGain = elevationGain;
    this. calcSpeed()
    this._setDescription();
}

calcSpeed(){
    this.speed = this.distance/this.duration;
    return this.speed
}

}

 
const run1 = new Running([39, -12], 5.2, 24, 178);
const cycling1 = new Cycling([39, -12], 27, 95, 523);
console.log(run1, cycling1);

//////////////////////////////////////////////////////////
// APPLICATION ARCHITECTURE
class App{
    #map;
    #mapEvent;
    #mapZoomLevel = 13;
    #workouts = [];

    constructor(){
    //Get users position
    this._getPosition();

    //get data from localstorage
    this._getLocalStorage();

    //Attach event handler
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveTopopup.bind(this))
    }

    _getPosition(){

   if(navigator.geolocation)
   navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function(){
    alert(' could not get the current location');
   }
   );

    }
    // End of _getPosition--------------------

    _loadMap(position){
          
    console.log(position)
    const {latitude} = position.coords;
    const {longitude} = position.coords;
    console.log(`https://www.google.ng/maps/@${latitude},${longitude}`);
    const coords = [latitude, longitude];
      
      console.log(this);
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
     }).addTo(this.#map);

  
      this.#map.on('click', this._showForm.bind(this));



       this.#workouts.forEach(work=> {
        this._renderWorkOutMarer(work); 
       });
       
    }
    
 // End of _loadMap------------------------
    _showForm(mapE){
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();

    }
    
    _hideForm(){
        // empty the input
        inputDistance.value = inputDuration.value = inputCadence.value= inputElevation.value ='';
        // put the hidden class back on
        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(()=> form.style.display='grid',1000)
    }
     _toggleElevationField(){
         inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
         inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
     }



     _newWorkout(e){
        const validInputs = (...inputs)=> inputs.every(inp=>Number.isFinite(inp));
        const allPositive = (...inputs)=> inputs.every(inp=> inp> 0);
        e.preventDefault();

        // Get data from form
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const{lat, lng} = this.#mapEvent.latlng;
        let workout;
       
      console.log(lat,lng);

        // If workout is running,create cycling object

        if(type === 'running'){
            const cadence = +inputCadence.value;
             // Check if data is valid
             if(
             //!Number.isFinite(distance )||
              //!Number.isFinite(duration)||
               //!Number.isFinite(cadence))
               !validInputs(distance, duration, cadence) ||
               !allPositive(distance,duration,cadence)
               )
                return alert('you need to put a positive number')
            workout = new Running([lat, lng], distance,duration, cadence);

            
        }


        // If workout is cycling, create cycing object
         if(type === 'cycling'){
            const elevation = +inputElevation.value;

            if(
             //!Number.isFinite(distance )||
              //!Number.isFinite(duration)||
               //!Number.isFinite(cadence))
               !validInputs(distance, duration, elevation)|| 
               !allPositive(distance,duration)
               )
                return alert('you need to put a positive number')
            workout = new Cycling([lat, lng], distance,duration, elevation);

            
        }
       
        // Add  new object  to work array
           this.#workouts.push(workout );
           console.log(workout)


        //Render workout on map as maker
       this._renderWorkOutMarer(workout)


       
      
        // Render workout on list
        this. _renderWorkout(workout)

       // Hide form + CLEAR ALL FEILDS
       this._hideForm();
    //ON CLICKING THE MAP POP MAKER OUT
        

        // setlocalstorage
        this._setLocalStorage();


     }   
     _renderWorkOutMarer(workout){

 // POPUP A MAKER USING LEAFLET DOCUMENTATION
        L.marker(workout.coords)
        .addTo(this.#map)
       .bindPopup(L.popup({
        maxwidth:260,
        minwidth:200,
        autoClose:false,
        closeOnClick:false,
        className:`${workout.type}-popup `,
       })
       )
       .setPopupContent(`${workout.type ==='running'?'🏃‍': '🚴‍'} ${workout.description}`)
       .openPopup();

     } 
     _renderWorkout(workout){
        // Doing some DOM MANIPULATION
        let html =  
        `<li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type ==='running'?'🏃‍': '🚴‍'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>`

   if(workout.type ==='running')
    html +=
            `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
            </div>
           <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;  

        if(workout.type==='cycling')
            html += `
              <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li> 
 
            `;
     
  form.insertAdjacentHTML('afterend', html);
   }

   _moveTopopup(e){
    const workoutEl = e.target.closest('.workout');
    console.log(workoutEl)
    if(!workoutEl) return 

 const workout = this.#workouts.find(work => work.id === workoutEl.dataset.id);
  console.log(workout)

  this.#map.setView(workout.coords,this.#mapZoomLevel,{
    animate: true,
    pan:{
        duration:1
    },
  });
  //using public interface
  // workout.click();


   }

_setLocalStorage(){
    // setting all the worksouts into localstorage
    localStorage.setItem('workouts',JSON.stringify(this.#workouts))
}
  _getLocalStorage(){
    const data = JSON.parse(localStorage.getItem('workouts'));
    console.log(data);
    if(!data) return

        this.#workouts = data;
       this.#workouts.forEach(work=> {
        this._renderWorkout(work); 
       });
  }

  reset(){
    localStorage.removeItem('workouts');
    location.reload();
  }
}
// End of class App------------------------------------

  

  const app = new App();
  //app.reset();
  console.log(app);

