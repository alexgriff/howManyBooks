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
        $('.importantMetrics').toggle()
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