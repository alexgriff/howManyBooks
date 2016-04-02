
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

        book_title = $('#book_title').val();
        $('#book_title').val('');
        var pName = $('#person_name').val();
        var pHeight = $('#person_height').val();
        var pMouthSize = $('#person_mouthSize').val();
        new app.person.model.new(pName, pHeight, pMouthSize)

        //query the api with user


        app.book.adapter.getBy(book_title).then(function(book){

          app.book.controller.show.render(book);
        });


      },
      render: function(book){
        $('.shelf').prepend('<img src='+ book.img +'>')
        var shelverResponse= SHELVING.addBook(book);
        var spaceRemaining= SHELVING.spaceLeft()
        $('#spaceLeft').text(spaceRemaining);
        $('#shelverResponse').text(shelverResponse);
      }
    }
  },
  adapter: {
    getBy: (function(book_title){
       return $.ajax({
         method: "GET",
         url: "https://www.googleapis.com/books/v1/volumes?q=" + book_title
         }).then(function(response){
           var bookInfo;
           var title;
           var pageCount;
           var img;
           var book;
           
           bookInfo = response.items[0].volumeInfo;
           title = bookInfo.title;
           pageCount = bookInfo .pageCount;
           img = bookInfo.imageLinks.thumbnail;
 
           book = new app.book.model.new(title, pageCount, img);
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
        this.bookDisplacementTotal = 0;
        this.books = []
        this.spaceLeft= function(){
          return this.length - this.bookDisplacementTotal;
        }
      }

      Shelf.prototype.addBook= function(book){
        this.bookDisplacementTotal+= book.thickness();
        if(this.bookDisplacementTotal<= this.length){
          this.books.push(book);
          return "That'll fit!"
        } else{
          this.bookDisplacementTotal-= book.thickness()
          $('.remainingSpace').hide();
          return "Too Many Books!"
        }
      }

      return Shelf;
    }())
  }
}

var SHELVING= new app.shelf.model.new();

