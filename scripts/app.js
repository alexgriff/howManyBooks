var app = {
}
//this shouldnt have to be a global var, but works for now
var currentShelf;

var friend;


// ON DOCUMENT READY
$(function(){
  // initialize person and shelf models
  friend= new app.person.model.new();
  friend = friend.genericPerson();
  var shelf = new app.shelf.model.new();

  // render shelf space and hide until first book
  app.shelf.controller.show.render(shelf);
  $('.shelf').hide();

  
  // fill in person defaults
  $('#person_name').val(friend.name);
  $('#person_height').val(friend.height);
  $('#person_mouthSize').val(friend.mouthSize);
  $('.personForm').hide();
  $('.importantMetrics').hide();

  // add listeners
  $('input:submit').click(function(){
    currentShelf = shelf;
    app.book.controller.show.init(event)
    
  });
  
  $('#custom_person').click(function(){
    $('.personForm').toggle();
  });

  $('body').on("click", ".book", function() {
    var bookId;
    bookId = $(this).attr("id")
    app.book.controller.show.renderBookToPerson(bookId, friend);
  })

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
        this.id = ++counter;
        app.book.model.all.push(this);
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
    }()),

    all: [],

    find: (function(id){
      return $.grep(app.book.model.all, function(book) {
        return book.id == id
      })[0];    
    })
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
        friend = new app.person.model.new(pHeight, pMouthSize, pName)

        //reset fields
        $('.error').empty();
        $('#book_title').val("");
        $('#book_author').val("");
        $('#booksToMouth').empty();
        $('#booksToMoon').empty();
        $('#booksToHeight').empty();


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
        $('.shelf').show();

        $('.shelf').prepend('<div class="book" id="'+book.id+'" style="display: inline; padding: .15em;"><img src='+ book.img +'></div>')
      },
      renderFailure: function() {
        $('.error').append("<p>Sorry, we couldn't find that book </p>")

      },
      renderFallen: function(fallenBook) {
        $('.floor').css("display", "block");
        $('.fallen').append('<div class="book" id="'+fallenBook.id+'" style="display: inline; "><img class=fallen_off src='+ fallenBook.img +'></div>');
        $('.fallen_off').rotate(45);
      },
      renderBookToPerson: function(bookId, person){
        var book;
        book = app.book.model.find(bookId);
        app.person.controller.show.render(person, book);
        $('.importantMetrics').modal({fadeDuration: 1000, fadeDelay: 0.30});
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
        
        return space;
      }

      Shelf.prototype.addBook= function(book){
        if (this.isThereRoom(book)){

          this.books.push(book);
          this.bookDisplacementTotal += book.thickness();
          app.shelf.controller.show.renderMessage("That Fits on Your Shelf!")
        } else {
          // first add the book there isnt room for

          this.books.push(book);
          this.bookDisplacementTotal += book.thickness();
          app.shelf.controller.show.renderMessage("Too Many Books!")
          
          // then subtract the book that fell off 
          // and continue to do so until there is space
          // (cant use the isThereRoom method again b/c
          // current book has already been added to displacement total)
          while (this.bookDisplacementTotal > this.length){
            var fallenBook = this.fallsOff();
            this.bookDisplacementTotal -= fallenBook.thickness();
            app.book.controller.show.renderFallen(fallenBook);
          }
        }
      }

      Shelf.prototype.isThereRoom = function(book){
        if ((this.bookDisplacementTotal + book.thickness()) > this.length) {
          return false;
        } else {
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
  // ----------
  //   MODEL
  // ----------
  model:{
    new:(function(){
      var counter = 0;
      function Person(height, mouthSize, name){
        this.height = height;
        this.mouthSize = mouthSize;
        this.name = name;
      }

      Person.prototype.booksBy = function(criteria, book) {
        var numBooks;
        if(criteria==="height"){

          numBooks= this.height / book.thickness();
        } else{

          numBooks= parseInt(this.mouthSize) /book.thickness();
        }
        return numBooks;
      };

      Person.prototype.genericPerson = function() {
        this.height = 1600;
        this.mouthSize = 50;
        this.name = "The Average Person";
        return this;
      }

      return Person;
    }())
  },

  // ----------------
  //   CONTROLLER
  // ----------------
  controller: {
    show: {
      render: function(person, book) {
        $('.importantMetrics').empty();
        var bookToMouth=  person.booksBy("mouth", book).toFixed(2);
        var bookToHeight=    person.booksBy("height", book).toFixed(2);
        $('.importantMetrics').append("<p>It would take "+bookToHeight+" copies of \""+book.title+"\" to equal "+person.name+"'s height.</p>")
        $('.importantMetrics').append("<p>You should be able to fit approximately "+bookToMouth+" copies of \""+book.title+"\" into "+person.name+"'s mouth.</p>")
      }
    }
  }
}


