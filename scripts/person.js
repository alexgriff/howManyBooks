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

          numBooks= this.height / book.thickness;
        } else{

          numBooks= parseInt(this.mouthSize) /book.thickness;
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
