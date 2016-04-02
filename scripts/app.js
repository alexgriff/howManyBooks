
$(function(){
  var friend= app.person.model.genericPerson()
  $('#person_name').val(friend.name);
  $('#person_height').val(friend.height);
  $('#person_mouthSize').val(friend.mouthSize);
  $('input:submit').click(app.book.controller.show.init);
})

app = {
}


app.book = {
  model: {
    new: (function(){
      var counter = 0;
      
      function Book(title, pageCount){
        this.title = title;
        this.pageCount = pageCount;
      }

      Book.prototype.thickness = function(){
        // 0.1mm
        var pageWidth = 0.1
        // adapted from http://www.bookmobile.com/art-book-printing/calculating-spine-width-and-book-weight-before-your-book-is-printed/
        // converted to mm
        var coverWidth= 0.39624;
        var pageThickness;
        var bookThickness;

        pageThickness = this.pageCount * pageWidth;
        bookThickness = pageThickness + coverWidth;

        return bookThickness; 
      }

      return Book;
    }())
  },
  controller: {
    show: {
      init: function(event){
        event.preventDefault;
        var book_title;

        book_title = $('#book_title').val();

        //query the api with user
        app.book.adapter.getBy(book_title).then(function(){
          debugger;
        });

      },
      render: function(book){
        $('.shelf').append(book)
      }
    }
  },
  adapter: {
    getBy: function(book_title){
     return $.ajax({
        "url":  "https://www.googleapis.com/books/v1/volumes?q=" + book_title,
        "method": "GET",
      }).done(function(response){
        return response;
      });
    }
  }
  // adapter: {
  //   getBy: (function(book_title){
  //     $.ajax({
  //       "url":  "https://www.googleapis.com/books/v1/volumes?q=" + book_title,
  //       "method": "GET",
  //     }).done(function(response){
  //       debugger;
  //     });
  //   })
  // } 
}


 // $.ajax({
//     "url":  "https://www.googleapis.com/books/v1/volumes?q=power+broker",
//     "method": "GET",
//   }).done(function(e){
//     debugger;
//   });


// app.picture = {
//   model: {
//     new: (function(){
//       var counter = 0;
//        function Picture(state, favs, image, date){
//         this.state = state;
//         this.favs = favs;
//         this.image = image;
//         this.date = date;
//       }

//       return Picture;
//     }())
//   },
//   controller: {
//     show: {
//       init: function(event){
//         event.preventDefault();
//         // get the user input -> params
//         var state_name; 
        
//         state_name = $('#state_name').val()
        
//         // hit my api, given a state name, get back place_id
//         var promise = app.state.model.getPlaceId(state_name).then(function(place_id){
//           // given that place_id as param, hit api again, to get pictures in that state/place
//           app.picture.adapter.getBy(place_id).then(function(picture){
//             console.log(picture);
//             // app.picture.controller.show.render(picture)
//           })
//         })

//         // given that place_id as param, hit api again, to get pictures in that state/place

//         // var promise = app.state.adapter.getBy(state_name).then(function(whatever){
//         //   app.picture.adapter
//         //   app.picture.controller.show.render(whatever)
//         // })
        
//         // render out the display of that artist object
        
//       }, 
//       render: function(picture){
//         $('.images').append('<p>Montagna</p>')
//       }
//     }
//   },
//   adapter: {
//     //given flickr place_id, get the flickr photo_id
//     getBy: (function(place_id){
//       debugger;
//       return $.ajax({
//       method: "GET",
//       url: "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=5b4b928bd0103e7da3364d23b0f3e5be&place_id="+ place_id +"&format=json&nojsoncallback=1",
//       }).then(function(data){
//         //grab photo_id
//         debugger;
//         var photo_id; 
//         photo_id= data.photos.photo[0].id;

//         return photo_id;
//     }).then(function(photo_id){
//       //given a photo_id return the info of the photo
//       debugger;
//       return $.ajax({
//         method: "GET",
//         url: "https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=5b4b928bd0103e7da3364d23b0f3e5be&photo_id="+ photo_id +"&format=json&nojsoncallback=1",
//       }).then(function(data){
//         //given the photo info, grab the url
//         debugger;
//         var url;
//         url = data.photo.urls.url[0]._content
//         return url;
//       }).then(function(data){
//         //finally, fiven the url, get the embed html
//         debugger;
//       })
//     })
//   })
    


//       // return $.ajax({
//       // method: "GET",
//       // url: "https://api.spotify.com/v1/search?query=" + name + "&type=artist",
//       // }).then(function(data){
//       //   var artist_data; 
//       //   var artist;
//       //   artist_data= data.artists.items[0];
//       //   artist = new app.artist.model.new(artist_data.name, artist_data.popularity, artist_data.images[0])
        
//       //   return artist;
//       // var state = "Montagna";
//       // return state;
//       // })
//     }
//   }


// // TO DO: this method: state.model.getPlaceId
// app.state = {
//   model: {
//     getPlaceId: (function(stateName){
//       // //given a name, hit the api, return a place_id
//       // // debugger;
//       // return state_string
//       return $.ajax({
//       method: "GET",
//       url: "https://api.flickr.com/services/rest/?method=flickr.places.find&api_key=5b4b928bd0103e7da3364d23b0f3e5be&query="+ stateName +"+state&format=json&nojsoncallback=1",
//       }).then(function(data){
//         var place_id = data.places.place[0].place_id;
//         //new app.model.states.new(place_id)
//         return place_id;
//     })
//   })
// }
// }





app.person={
  model:{
    new:(function(){
      var counter = 0;
      function Person(height, mouthSize, name){
        this.height = (height * 1000);
        this.mouthSize = mouthSize;
        this.name = name;
      }

      Person.prototype.booksByHeight = function(criteria, book) {
        var numBooks;
        var person=this;
        if(criteria===height){
          numBooks= person.height / book.thickness;
        } else{
          numBooks= person.mouthSize /book.thickness;
        }
        return numBooks;
      };

      return Person;
    }()),
    genericPerson:(function(){
      var friend = new app.person.model.new(1.6, 50, "The Average Person");
      return friend;
    })
  }
}

// // app.artist.adapter.getBy("paul simon") -> {name: 'paul simon', }
// // Artist.find_by(name: 'paul simon')
// // -> [<artist @name="paul simon">]

// // artist.adapter.spotify = 
// // artist.adapter.lastFm = 



// // $(function(){ // on document ready,
// //   $('input:submit').on('click', function(event){ //attach a listener to my submit, such that on click
// //     var artist_name 
// //     $('.images').empty();
// //     event.preventDefault(); // we prevent default
// //     artist_name = $('#artist_name').val() // we get the artist name
// //     $('#artist_name').val(''); 
    
// //     $.ajax({
// //       method: "POST",
// //       url: "https://api.spotify.com/v1/search?query=" + artist_name + "&type=artist",

// //     }).done(function(data){
// //       data.artists.items[0].images.forEach(function(element){
// //         var url = element.url;
// //         $('.images').append('<img src="' +  url + '" >');
// //       })
// //     })
// //   })
// // })

// // https://api.spotify.com/v1/search?query=tania&type=artist
// // https://www.reddit.com/r/funny.json
// // https://api.spotify.com/v1/search?query=paul%20simon&type=artist









// function attempt() {
//   // $.getJSON("https://www.googleapis.com/books/v1/volumes/zyTCAlFPjgYC", function (response) {
//   //   debugger;
//   // })

//   // https://www.googleapis.com/books/v1/volumes/zyTCAlFPjgYC?key=yourAPIKey
//   $.ajax({
//     "url":  "https://www.googleapis.com/books/v1/volumes?q=power+broker",
//     "method": "GET",
//   }).done(function(e){
//     debugger;
//   });

// }

// // $.getJSON(googleAPI, function (response) {

// // GET https://www.googleapis.com/books/v1/volumes?q=flowers+inauthor:keyes&key=yourAPIKey
// // AIzaSyDxCYo47qztxtxs_iTnAGtX-uYjM1Xn958 













// // 
// // Attach a listener, such that on click event, we do the following
// // artist_name = Grab the value from the input text
// // Make the request
//   // http://api.jquery.com/jquery.ajax/
//   // modify this request for the parameters we need
// //   $.ajax({
// //   method: "POST",
// //   url: "some.php",
// //   data: { type: "artist", query: "Paul Simn" }
// // })


// // Do something on the callback
// //   .done(function( msg ) {
// //     alert( "Data Saved: " + msg ); // somehow append the images
// //   });
// // app = {
// //   // listController = new ListC0ntroller
// //   // listController.init()
// // };

// // function addListeners(){
// //   $('body').on("submit", function(event) {
// //     event.preventDefault();
    
// //     var state_name = $('#state_name').val();
// //     $('#state_name').val("");


// //   })
// // }


// // $(function(){ // on document ready,
  
  
// //   (function(){
// //     $('body').on("submit", function(event) {
// //       event.preventDefault();
    
// //       var state_name = $('#state_name').val();
// //       $('#state_name').val("");
      
// //       StatesController.find(state_name);

// //     })


// //   }())

    
// //     // var picturesController = new app.picturesController.new();
// //     // (function(){
// //     //   $('#state_name').on("submit", )//do something)
// //     // })

// //   })

  
//   // $('input:submit').on('click', function(event){ //attach a listener to my submit, such that on click
//   //   var state_name 
//   //   $('.images').empty();
//   //   event.preventDefault(); // we prevent default
//   //   state_name = $('#state_name').val() // we get the artist name
//   //   $('#state_name').val(''); 
//   //   $.ajax({
//   //     type: "GET",
//   //     dataType: "jsonp",
//   //     cache: false,
//   //     url: "https://api.instagram.com/v1/tags/"+ state_name +"/media/recent?access_token=370648620.4f46f98.9ed4716de0184a9299b595e52ba248c0&scope=public_content"
//   //   }).done(function(data){
//   //    console.log(data)
//   //     })
//   //   })
//   // })

// // https://api.spotify.com/v1/search?query=tania&type=artist
// // https://www.reddit.com/r/funny.json
// // https://api.spotify.com/v1/search?query=paul%20simon&type=artist


function test(book_title){
  $.ajax({
    "url":  "https://www.googleapis.com/books/v1/volumes?q=" + book_title,
    "method": "GET",
  }).done(function(response){
    debugger;
  });
}




