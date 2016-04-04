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
        $('.importantMetrics').append("<p>A stack of "+bookToHeight+" copies of \""+book.title+"\" would be the same height as "+person.name+".</p>")
        $('.importantMetrics').append("<p>"+bookToMouth+" copies of \""+book.title+"\" would potentially fit into the mouth of "+person.name+".</p>")
      }
    },
    create: function(){
        var pName = $('#person_name').val();
        var pHeight = $('#person_height').val();
        var pMouthSize = $('#person_mouthSize').val();
        friend = new app.person.model.new(pHeight, pMouthSize, pName)
        return friend;
    }
  }
}
