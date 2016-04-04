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
  $('.person').hide();
  $('.personForm').hide();
  $('#person_mouthSize').val(friend.mouthSize);
  $('.importantMetrics').hide();

  // add listeners
  $('input:submit').click(function(){
    currentShelf = shelf;
    app.book.controller.show.init(event)
    
  });

  $('#book_title').keyup(function(){
    title = $('#book_title').val();
    author = $('#book_author').val();
    app.search.new(title, author)
  })
  
  $('#custom_person').click(function(){
    $('.personForm').toggle();
  });

  $('body').on("click", ".book", function() {
    var bookId;
    bookId = $(this).attr("id")
    app.book.controller.show.renderBookToPerson(bookId, friend);
  })

})
