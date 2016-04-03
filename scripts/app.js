var app = {
}
//this shouldnt have to be a global var, but works for now
var currentShelf;


// ON DOCUMENT READY
$(function(){
  // initialize persona nd shelf models
  var friend= app.person.model.genericPerson();
  var shelf = new app.shelf.model.new();

  // render shelf space
  app.shelf.controller.show.render(shelf);

  
  // fill in person defaults
  $('#person_name').val(friend.name);
  $('#person_height').val(friend.height);
  $('#person_mouthSize').val(friend.mouthSize);

  // add listeners
  $('input:submit').click(function(){
    currentShelf = shelf;
    app.book.controller.show.init(event)
  });
})



// =================
//      BOOK
// =================
app.book = {
  
  // ----------
  //   MODEL
  // ----------
  model: {
    new: (function(){
      var counter = 0;
      
      function Book(title, pageCount, img){
        this.title = title;
        this.pageCount = pageCount;
        this.img = img;
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

        return Math.floor(bookThickness); 
      }

      return Book;
    }())
  },
  
  // ----------------
  //   CONTROLLER
  // ----------------
  controller: {
    show: {
      init: function(event){
        event.preventDefault();
        var book_title;
        var author;

        // grab the user's book input
        book_title = $('#book_title').val();
        author = $('#book_author').val();

        // grab the user's person input
        var pName = $('#person_name').val();
        var pHeight = $('#person_height').val();
        var pMouthSize = $('#person_mouthSize').val();
        new app.person.model.new(pName, pHeight, pMouthSize)

        //reset fields
        $('.error').empty();
        $('#book_title').val("");
        $('#book_author').val("");


        //query the api with user input
        app.book.adapter.getBy(book_title, author).then(function(book){
          // if the api found a book...
          if (book) {
            // add book to the shelf
            currentShelf.addBook(book);
            // render the whole shelf with the new book
            app.shelf.controller.show.render(currentShelf);
          } else {
            // render the error message
            app.book.controller.show.renderFailure();
          }
        });


      },
      render: function(book){
        $('.shelf').prepend('<img src='+ book.img +'>')
        
        // // is there room on shelf
        // if (shelf.isThereRoom(book)) {
        //   // add book thumbnail
        //   $('.shelf').prepend('<img src='+ book.img +'>')
        //   // add book to shelf
        //   shelf.addBook(book);
        // } else {
        //   // add book thumbnail
        //   $('.shelf').prepend('<img src='+ book.img +'>')
        //   // add book to shelf
        //   shelf.addBook(book);
        //   shelf.fallsOff()
        // }
        //   // empty currentShelf info
        //   $('.shelfInfo').empty();
        //   // render shelf info
        //   app.shelf.controller.show.render(shelf);

        
      },
      renderFailure: function() {
        $('.error').append("<p>Sorry, we couldn't find that book </p>")

      },

      renderFallen: function(fallenBook) {
        $('.floor').css("display", "block");
        $('.fallen').append('<img class=fallen_off src='+ fallenBook.img +'>');
        $('.fallen_off').rotate(45);
      }
    }
  },

  // -------------
  //   ADAPTER
  // -------------
  adapter: {
    getBy: (function(book_title, author){
       return $.ajax({
         method: "GET",
         url: "https://www.googleapis.com/books/v1/volumes?q=" + book_title +"+inauthor:" + author
         }).then(function(response){
           var bookInfo;
           var title;
           var pageCount;
           var img;
           var book;
           
          if(response.items){
            bookInfo = response.items[0].volumeInfo;
            title = bookInfo.title;
            pageCount = bookInfo .pageCount;
            img = bookInfo.imageLinks.thumbnail;
  
            book = new app.book.model.new(title, pageCount, img);
          }
          
           return book;
       });
    })
  }
}

// =================
//      SHELF
// =================


app.shelf={
  // ----------
  //   MODEL
  // ----------
  model:{
    new:(function(){
      var counter= 0;
      function Shelf(){
        this.length= 300; //millimeters;
        this.bookDisplacementTotal = 0;
        this.books = []
      }

      // Prototypes
      Shelf.prototype.remainingSpace = function(){
        var space;
        space = this.length - this.bookDisplacementTotal;
        
        if (space > 0){
          return space;
        } else {
          return 0;
        }
      }

      Shelf.prototype.addBook= function(book){
        if (this.isThereRoom(book)){
          this.books.push(book);
          this.bookDisplacementTotal+= book.thickness();
        } else {
          this.books.push(book);
          this.bookDisplacementTotal+= book.thickness();
          var fallenBook = this.fallsOff();
          app.book.controller.show.renderFallen(fallenBook);
        }
      }

      Shelf.prototype.isThereRoom = function(book){
        if ((this.bookDisplacementTotal + book.thickness()) > this.length) {
          app.shelf.controller.show.renderMessage("Too Many Books!")
          return false;
        } else {
          app.shelf.controller.show.renderMessage("That Fits on Your Shelf!")
          return true;
        }
      }

      Shelf.prototype.fallsOff = function(){
        //remove first book
        return this.books.splice(0, 1)[0];
      }

      return Shelf;
    }())
  },


  // ----------------
  //   CONTROLLER
  // ----------------
  controller: {
    show: {
      render: function(shelf){
        // clear out what's there
        $('.shelfInfo').empty();
        $('.shelf').empty();
        $('.shelfContents ul').empty();

        // update spaceinfo
        $('.shelfInfo').append('<p>Your book shelf has '+ shelf.remainingSpace() +' millimeters of free space</p>')

        // render each book on shelf and add info
        for(var i = 0; i < shelf.books.length; i ++){
          var book;
          book = shelf.books[i];
          app.book.controller.show.render(book);
          $('.shelfContents ul').append('<li>' + book.title + " - " + book.pageCount + ' pages</li>')
        }
        
      },
      renderMessage: function(msg){
        $('.shelverResponse').empty();
        $('.shelverResponse').append(msg);
      }
    }

  }

}

// =================
//      PERSON
// =================
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

