
Wikipedia files are located at:
`https://en.wikipedia.org/wiki/[fileurl]`


Get images from a page (example with "Albert Einstein"):
`https://en.wikipedia.org/w/api.php?action=query&titles=Albert%20Einstein&format=json&prop=images`
* note that can substitute %20 with space.

`https://en.wikipedia.org/w/api.php?action=query&titles=List_of_dog_breeds&format=json&prop=iwlinks`
//iwlinks = inter-wiki links


https://en.wikipedia.org/w/api.php?action=parse&page=List_of_dog_breeds&format=json
https://en.wikipedia.org/w/api.php?action=parse&page=List_of_dog_breeds&format=json&prop=links
https://en.wikipedia.org/w/api.php?action=parse&page=List_of_dog_breeds&format=json&section=1

got dog breeds json with this query:
https://en.wikipedia.org/w/api.php?action=parse&page=List_of_dog_breeds&format=json&section=1&prop=links

sections:
1 "A–C"
2 "D-K"
3 "L-R"
4 "S-Z"
