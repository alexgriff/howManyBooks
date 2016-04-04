app.shelf={
  // ----------
  //   MODEL
  // ----------
  model:{
    new:(function(){
      var counter= 0;
      function Shelf(){
        this.length= 200; //millimeters;
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
          this.bookDisplacementTotal += book.thickness;
          app.shelf.controller.show.renderMessage("That Fits on Your Shelf!")
        } else {
          // first add the book there isnt room for

          this.books.push(book);
          this.bookDisplacementTotal += book.thickness;
          app.shelf.controller.show.renderMessage("Too Many Books!")
          
          // then subtract the book that fell off 
          // and continue to do so until there is space
          // (cant use the isThereRoom method again b/c
          // current book has already been added to displacement total)
          while (this.bookDisplacementTotal > this.length){
            var fallenBook = this.fallsOff();
            this.bookDisplacementTotal -= fallenBook.thickness;
            app.book.controller.show.renderFallen(fallenBook);
          }
        }
      }

      Shelf.prototype.isThereRoom = function(book){
        if ((this.bookDisplacementTotal + book.thickness) > this.length) {
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
        $('.shelfInfo').append('<p>Your book shelf has <strong>'+ shelf.remainingSpace() +'</strong> millimeters of free space</p>')

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