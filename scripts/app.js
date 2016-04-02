var app = {
}
var currentShelf;

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




app.book = {
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
  controller: {
    show: {
      init: function(event){
        event.preventDefault();
        var book_title;
        var author;

        book_title = $('#book_title').val();
        author = $('#book_author').val();

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
          if (book) {
            app.book.controller.show.render(book, currentShelf);
          } else {
            app.book.controller.show.renderFailure();
          }
        });


      },
      render: function(book, shelf){
        // is there room on shelf
        if (shelf.isThereRoom(book)) {
          // add book thumbnail
          $('.shelf').prepend('<img src='+ book.img +'>')
          // add book to shelf
          shelf.addBook(book);
        } else {
          // add book thumbnail
          $('.shelf').prepend('<img src='+ book.img +'>')
          // add book to shelf
          shelf.addBook(book);
          debugger;
        }
          // empty currentShelf info
          $('.shelfInfo').empty();
          // render shelf info
          app.shelf.controller.show.render(shelf);

        
      },
      renderFailure: function() {
        $('.error').append("<p>Sorry, we couldn't find that book </p>")

      }
    }
  },
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


app.shelf={
  model:{
    new:(function(){
      var counter= 0;
      function Shelf(){
        this.length= 500; //millimeters;
        this.bookDisplacementTotal = 0;
        this.books = []
        this.spaceLeft= function(){
          return this.length - this.bookDisplacementTotal;
        }
      }

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
        this.books.push(book);
      }

      Shelf.prototype.isThereRoom = function(book){
        this.bookDisplacementTotal+= book.thickness();

        if (this.bookDisplacementTotal > this.length) {
          app.shelf.controller.show.renderMessage("Too Many Books!")
          return false;
        } else {
          app.shelf.controller.show.renderMessage("That Fits on Your Shelf!")
          return true;
        }
      }

      Shelf.prototype.fallsOff = function(){
        //remove first books
        this.books.splice(0, 1);
      }

      return Shelf;
    }())
  },

  controller: {
    show: {
      render: function(shelf){
        $('.shelfInfo').append('<p>Your shelf has '+ shelf.remainingSpace() +'mm of remaining space</p>')

      },
      renderMessage: function(msg){
        $('.shelverResponse').empty();
        $('.shelverResponse').append(msg);
      }
    }

  }

}

