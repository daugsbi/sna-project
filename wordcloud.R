# Import Libraries
library(data.table)
library(plotrix)
library(tm)
library(wordcloud)
library(RColorBrewer)

# Function to create a Wordcloud
# Inspired from here http://onertipaday.blogspot.ch/2011/07/word-cloud-in-r.html
# http://cran.r-project.org/web/packages/tm/tm.pdf

createWordcloud <- function(data, title="Title"){
  corpus <- Corpus(DataframeSource(data.frame(as.character(data))))

  # Specify TermDocumentMatrix
   tdm <- TermDocumentMatrix(corpus, control = list(removePunctuation = TRUE, removeNumbers = FALSE, tolower = TRUE,
	stopwords = c(title, 'amp', 'gtgt', stopwords("english"), stopwords("german") ) ))

  #Convert as matrix
  m = as.matrix(tdm)

  #Get word counts in decreasing order
  word_freqs = sort(rowSums(m), decreasing=TRUE)

  #Create data frame with words and their frequencies
  dm = data.frame(word=names(word_freqs), freq=word_freqs)

  #Plot wordcloud and save
  png(paste("WordCloud", title, ".png"), width=1600, height=1500, units='px', res=250)
  wordcloud(dm$word, dm$freq, random.order=FALSE, max.words=100, min.freq=2, colors=brewer.pal(8, "Dark2"))
  dev.off()

  return(dm)
}