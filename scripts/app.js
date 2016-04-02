
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

        //reset fields
        $('.error').empty();
        $('#book_title').val("");
        $('#book_author').val("");


        //query the api with user input
        app.book.adapter.getBy(book_title, author).then(function(book){
          if (book) {
            app.book.controller.show.render(book);
          } else {
            app.book.controller.show.renderFailure();
          }
        });


      },
      render: function(book){
        $('.shelf').append('<img src='+ book.img +'>')
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
        this.length= 300; //millimeters;
        this.bookDisplacementTotal;
        this.books = [];
      }

      Shelf.prototype.addBook= function(book){
        this.bookDisplacementTotal+= book.thickness;
        this.books.push(book);
      }

      return Shelf;
    }())
  }
}
