
app.search= {
    new: (function(book_title, author){
      $('.unstyledResults').empty();
      app.book.model.all = [];
      
      $.ajax({
         method: "GET",
         url: "https://www.googleapis.com/books/v1/volumes?q=" + book_title,
         data: {limit: 5, order: 'desc'}, 
         }).then(function(response){
          if(response.items){
            var i= 0
            while (i < 5){
              var bookInfo = response.items[i].volumeInfo;
              var title = bookInfo.title;
              var pageCount = bookInfo .pageCount;
              if(bookInfo.imageLinks){
              var img = bookInfo.imageLinks.thumbnail;
              } else{
                img= "http://www.51allout.co.uk/wp-content/uploads/2012/02/Image-not-found.gif"
              }
              book = new app.book.model.new(title, pageCount, img);
              ++i
            }

          app.search.render(app.book.model.all)
         }
       })
    }),
    render:(function(books){
      $('.unstyledResults').empty();
      for(var i in books){
        $('.unstyledResults').prepend('<div class="book" id="'+books[i].id+'" style="display: inline; padding: .15em;"><img src='+ books[i].img +'></div>')
      
      }
  })

}